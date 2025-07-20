import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listGames = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("games")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    }
    return await ctx.db.query("games").collect();
  },
});

export const getGameCategories = query({
  args: {},
  handler: async (ctx) => {
    const games = await ctx.db.query("games").collect();
    const categories = [...new Set(games.map(game => game.category))];
    return categories.sort();
  },
});

export const createGame = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if game already exists
    const existingGame = await ctx.db
      .query("games")
      .filter((q) => q.eq(q.field("name"), args.name))
      .unique();

    if (existingGame) {
      return existingGame._id;
    }

    return await ctx.db.insert("games", {
      name: args.name,
      category: args.category,
      icon: args.icon,
    });
  },
});

// Seed some popular games
export const seedGames = mutation({
  args: {},
  handler: async (ctx) => {
    const games = [
      { name: "Counter-Strike 2", category: "FPS" },
      { name: "Valorant", category: "FPS" },
      { name: "Apex Legends", category: "Battle Royale" },
      { name: "Fortnite", category: "Battle Royale" },
      { name: "League of Legends", category: "MOBA" },
      { name: "Dota 2", category: "MOBA" },
      { name: "Overwatch 2", category: "FPS" },
      { name: "Rocket League", category: "Sports" },
      { name: "World of Warcraft", category: "MMO" },
      { name: "Destiny 2", category: "FPS" },
      { name: "Call of Duty: Warzone", category: "Battle Royale" },
      { name: "Rainbow Six Siege", category: "FPS" },
      { name: "Minecraft", category: "Sandbox" },
      { name: "Among Us", category: "Social" },
      { name: "Fall Guys", category: "Party" },
    ];

    for (const game of games) {
      const existing = await ctx.db
        .query("games")
        .filter((q) => q.eq(q.field("name"), game.name))
        .unique();

      if (!existing) {
        await ctx.db.insert("games", game);
      }
    }
  },
});
