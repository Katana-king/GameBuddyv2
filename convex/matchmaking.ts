import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const findMatches = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const limit = args.limit || 10;

    // Get current user's profile and games
    const userProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!userProfile) return [];

    const userGames = await ctx.db
      .query("userGames")
      .withIndex("by_user_active", (q) => q.eq("userId", userId).eq("isActive", true))
      .collect();

    const userGameIds = userGames.map(ug => ug.gameId);

    // Find other users in the same region with mutual games
    const otherProfiles = await ctx.db
      .query("profiles")
      .withIndex("by_region", (q) => q.eq("region", userProfile.region))
      .filter((q) => q.neq(q.field("userId"), userId))
      .take(50); // Get more to filter and score

    const matches = [];

    for (const profile of otherProfiles) {
      // Get their games
      const theirGames = await ctx.db
        .query("userGames")
        .withIndex("by_user_active", (q) => q.eq("userId", profile.userId).eq("isActive", true))
        .collect();

      const theirGameIds = theirGames.map(ug => ug.gameId);
      const mutualGameIds = userGameIds.filter(gameId => theirGameIds.includes(gameId));

      if (mutualGameIds.length > 0) {
        // Calculate compatibility score
        let score = 0;

        // Mutual games (40% of score)
        score += (mutualGameIds.length / Math.max(userGameIds.length, theirGameIds.length)) * 40;

        // Communication style match (30% of score)
        if (userProfile.communicationStyle === profile.communicationStyle) {
          score += 30;
        } else {
          score += 15; // Partial points for different but compatible styles
        }

        // Region match (20% of score) - already filtered by region
        score += 20;

        // Verification bonus (10% of score)
        if (profile.isVerified) {
          score += 10;
        }

        // Get mutual games with details
        const mutualGamesWithDetails = await Promise.all(
          mutualGameIds.map(async (gameId) => {
            const game = await ctx.db.get(gameId);
            const userGame = userGames.find(ug => ug.gameId === gameId);
            const theirGame = theirGames.find(ug => ug.gameId === gameId);
            return {
              game,
              userSkill: userGame?.skillLevel,
              theirSkill: theirGame?.skillLevel,
              userRole: userGame?.preferredRole,
              theirRole: theirGame?.preferredRole,
            };
          })
        );

        matches.push({
          profile,
          compatibilityScore: Math.round(score),
          mutualGames: mutualGamesWithDetails,
        });
      }
    }

    // Sort by compatibility score and return top matches
    return matches
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, limit);
  },
});

export const createMatch = mutation({
  args: {
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if match already exists
    const existingMatch = await ctx.db
      .query("matches")
      .filter((q) => 
        q.or(
          q.and(q.eq(q.field("userId1"), userId), q.eq(q.field("userId2"), args.targetUserId)),
          q.and(q.eq(q.field("userId1"), args.targetUserId), q.eq(q.field("userId2"), userId))
        )
      )
      .unique();

    if (existingMatch) {
      return existingMatch._id;
    }

    // Get mutual games for the match
    const userGames = await ctx.db
      .query("userGames")
      .withIndex("by_user_active", (q) => q.eq("userId", userId).eq("isActive", true))
      .collect();

    const targetGames = await ctx.db
      .query("userGames")
      .withIndex("by_user_active", (q) => q.eq("userId", args.targetUserId).eq("isActive", true))
      .collect();

    const userGameIds = userGames.map(ug => ug.gameId);
    const targetGameIds = targetGames.map(ug => ug.gameId);
    const mutualGameIds = userGameIds.filter(gameId => targetGameIds.includes(gameId));

    // Calculate compatibility score (simplified version)
    const compatibilityScore = Math.min(100, (mutualGameIds.length / Math.max(userGameIds.length, targetGameIds.length)) * 100);

    return await ctx.db.insert("matches", {
      userId1: userId,
      userId2: args.targetUserId,
      compatibilityScore: Math.round(compatibilityScore),
      mutualGames: mutualGameIds,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const respondToMatch = mutation({
  args: {
    matchId: v.id("matches"),
    response: v.string(), // "accepted" or "declined"
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("Match not found");

    // Only the target user (userId2) can respond
    if (match.userId2 !== userId) {
      throw new Error("Unauthorized to respond to this match");
    }

    await ctx.db.patch(args.matchId, {
      status: args.response,
    });

    return args.matchId;
  },
});

export const getMyMatches = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const matches = await ctx.db
      .query("matches")
      .filter((q) => 
        q.or(
          q.eq(q.field("userId1"), userId),
          q.eq(q.field("userId2"), userId)
        )
      )
      .collect();

    const matchesWithProfiles = await Promise.all(
      matches.map(async (match) => {
        const otherUserId = match.userId1 === userId ? match.userId2 : match.userId1;
        const otherProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", otherUserId))
          .unique();

        // Get mutual games with details
        const mutualGamesWithDetails = await Promise.all(
          match.mutualGames.map(async (gameId) => {
            const game = await ctx.db.get(gameId);
            return game;
          })
        );

        return {
          ...match,
          otherProfile,
          mutualGamesWithDetails,
          isInitiator: match.userId1 === userId,
        };
      })
    );

    return matchesWithProfiles.sort((a, b) => b.createdAt - a.createdAt);
  },
});
