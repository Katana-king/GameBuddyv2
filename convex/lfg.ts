import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listLFGPosts = query({
  args: {
    gameId: v.optional(v.id("games")),
    region: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    let query = ctx.db.query("lfgPosts").withIndex("by_active", (q) => q.eq("isActive", true));

    if (args.gameId) {
      query = ctx.db.query("lfgPosts").withIndex("by_game", (q) => q.eq("gameId", args.gameId!));
      query = query.filter((q) => q.eq(q.field("isActive"), true));
    }

    if (args.region) {
      if (!args.gameId) {
        query = ctx.db.query("lfgPosts").withIndex("by_region", (q) => q.eq("region", args.region!));
        query = query.filter((q) => q.eq(q.field("isActive"), true));
      } else {
        query = query.filter((q) => q.eq(q.field("region"), args.region!));
      }
    }

    const posts = await query.order("desc").take(limit);

    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", post.authorId))
          .unique();

        const game = await ctx.db.get(post.gameId);

        return {
          ...post,
          author,
          game,
        };
      })
    );

    return postsWithDetails;
  },
});

export const createLFGPost = mutation({
  args: {
    gameId: v.id("games"),
    title: v.string(),
    description: v.string(),
    skillLevel: v.string(),
    playersNeeded: v.number(),
    scheduledTime: v.optional(v.number()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile not found");

    return await ctx.db.insert("lfgPosts", {
      authorId: userId,
      gameId: args.gameId,
      title: args.title,
      description: args.description,
      skillLevel: args.skillLevel,
      region: profile.region,
      playersNeeded: args.playersNeeded,
      scheduledTime: args.scheduledTime,
      isActive: true,
      tags: args.tags,
    });
  },
});

export const updateLFGPost = mutation({
  args: {
    postId: v.id("lfgPosts"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    skillLevel: v.optional(v.string()),
    playersNeeded: v.optional(v.number()),
    scheduledTime: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post || post.authorId !== userId) {
      throw new Error("Post not found or unauthorized");
    }

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.skillLevel !== undefined) updates.skillLevel = args.skillLevel;
    if (args.playersNeeded !== undefined) updates.playersNeeded = args.playersNeeded;
    if (args.scheduledTime !== undefined) updates.scheduledTime = args.scheduledTime;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.postId, updates);
    return args.postId;
  },
});

export const deleteLFGPost = mutation({
  args: {
    postId: v.id("lfgPosts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post || post.authorId !== userId) {
      throw new Error("Post not found or unauthorized");
    }

    await ctx.db.delete(args.postId);
  },
});

export const getMyLFGPosts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const posts = await ctx.db
      .query("lfgPosts")
      .filter((q) => q.eq(q.field("authorId"), userId))
      .order("desc")
      .collect();

    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const game = await ctx.db.get(post.gameId);
        return {
          ...post,
          game,
        };
      })
    );

    return postsWithDetails;
  },
});
