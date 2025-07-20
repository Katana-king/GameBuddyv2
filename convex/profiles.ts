import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) return null;

    // Get user's games
    const userGames = await ctx.db
      .query("userGames")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const gamesWithDetails = await Promise.all(
      userGames.map(async (userGame) => {
        const game = await ctx.db.get(userGame.gameId);
        return {
          ...userGame,
          game,
        };
      })
    );

    // Get availability
    const availability = await ctx.db
      .query("availability")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return {
      ...profile,
      games: gamesWithDetails,
      availability,
    };
  },
});

export const createProfile = mutation({
  args: {
    displayName: v.string(),
    bio: v.optional(v.string()),
    region: v.string(),
    communicationStyle: v.string(),
    discordTag: v.optional(v.string()),
    steamId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) {
      throw new Error("Profile already exists");
    }

    return await ctx.db.insert("profiles", {
      userId,
      displayName: args.displayName,
      bio: args.bio,
      region: args.region,
      communicationStyle: args.communicationStyle,
      discordTag: args.discordTag,
      steamId: args.steamId,
      isVerified: false,
      createdAt: Date.now(),
    });
  },
});

export const updateProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    region: v.optional(v.string()),
    communicationStyle: v.optional(v.string()),
    discordTag: v.optional(v.string()),
    steamId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile not found");

    const updates: any = {};
    if (args.displayName !== undefined) updates.displayName = args.displayName;
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.region !== undefined) updates.region = args.region;
    if (args.communicationStyle !== undefined) updates.communicationStyle = args.communicationStyle;
    if (args.discordTag !== undefined) updates.discordTag = args.discordTag;
    if (args.steamId !== undefined) updates.steamId = args.steamId;

    await ctx.db.patch(profile._id, updates);
    return profile._id;
  },
});

export const addUserGame = mutation({
  args: {
    gameId: v.id("games"),
    skillLevel: v.string(),
    hoursPlayed: v.optional(v.number()),
    preferredRole: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user already has this game
    const existingUserGame = await ctx.db
      .query("userGames")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("gameId"), args.gameId))
      .unique();

    if (existingUserGame) {
      // Update existing
      await ctx.db.patch(existingUserGame._id, {
        skillLevel: args.skillLevel,
        hoursPlayed: args.hoursPlayed,
        preferredRole: args.preferredRole,
        isActive: true,
      });
      return existingUserGame._id;
    } else {
      // Create new
      return await ctx.db.insert("userGames", {
        userId,
        gameId: args.gameId,
        skillLevel: args.skillLevel,
        hoursPlayed: args.hoursPlayed,
        preferredRole: args.preferredRole,
        isActive: true,
      });
    }
  },
});

export const removeUserGame = mutation({
  args: {
    userGameId: v.id("userGames"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const userGame = await ctx.db.get(args.userGameId);
    if (!userGame || userGame.userId !== userId) {
      throw new Error("User game not found or unauthorized");
    }

    await ctx.db.delete(args.userGameId);
  },
});

export const setAvailability = mutation({
  args: {
    schedule: v.array(v.object({
      dayOfWeek: v.number(),
      startTime: v.string(),
      endTime: v.string(),
      timezone: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Delete existing availability
    const existingAvailability = await ctx.db
      .query("availability")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const availability of existingAvailability) {
      await ctx.db.delete(availability._id);
    }

    // Insert new availability
    for (const slot of args.schedule) {
      await ctx.db.insert("availability", {
        userId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        timezone: slot.timezone,
      });
    }
  },
});
