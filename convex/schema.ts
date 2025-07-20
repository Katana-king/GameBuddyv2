import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // User profiles with gaming preferences
  profiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    bio: v.optional(v.string()),
    region: v.string(), // "NA-East", "EU-West", "Asia", etc.
    communicationStyle: v.string(), // "Casual", "Competitive", "Friendly"
    discordTag: v.optional(v.string()),
    steamId: v.optional(v.string()),
    isVerified: v.optional(v.boolean()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_region", ["region"]),

  // Games that users play
  games: defineTable({
    name: v.string(),
    category: v.string(), // "FPS", "MOBA", "Battle Royale", "MMO", etc.
    icon: v.optional(v.string()),
  }).index("by_category", ["category"]),

  // User's game preferences and skill levels
  userGames: defineTable({
    userId: v.id("users"),
    gameId: v.id("games"),
    skillLevel: v.string(), // "Beginner", "Intermediate", "Advanced", "Pro"
    hoursPlayed: v.optional(v.number()),
    preferredRole: v.optional(v.string()), // "Support", "DPS", "Tank", etc.
    isActive: v.boolean(), // Currently playing this game
  }).index("by_user", ["userId"]).index("by_game", ["gameId"]).index("by_user_active", ["userId", "isActive"]),

  // User availability schedule
  availability: defineTable({
    userId: v.id("users"),
    dayOfWeek: v.number(), // 0-6 (Sunday-Saturday)
    startTime: v.string(), // "18:00"
    endTime: v.string(), // "23:00"
    timezone: v.string(), // "UTC-5", "UTC+1", etc.
  }).index("by_user", ["userId"]),

  // Looking for Group posts
  lfgPosts: defineTable({
    authorId: v.id("users"),
    gameId: v.id("games"),
    title: v.string(),
    description: v.string(),
    skillLevel: v.string(),
    region: v.string(),
    playersNeeded: v.number(),
    scheduledTime: v.optional(v.number()), // timestamp
    isActive: v.boolean(),
    tags: v.array(v.string()), // ["competitive", "ranked", "casual"]
  }).index("by_game", ["gameId"]).index("by_active", ["isActive"]).index("by_region", ["region"]),

  // Match suggestions and connections
  matches: defineTable({
    userId1: v.id("users"),
    userId2: v.id("users"),
    compatibilityScore: v.number(), // 0-100
    mutualGames: v.array(v.id("games")),
    status: v.string(), // "pending", "accepted", "declined"
    createdAt: v.number(),
  }).index("by_user1", ["userId1"]).index("by_user2", ["userId2"]).index("by_status", ["status"]),

  // Messages between matched users
  messages: defineTable({
    matchId: v.id("matches"),
    senderId: v.id("users"),
    content: v.string(),
    timestamp: v.number(),
  }).index("by_match", ["matchId"]).index("by_timestamp", ["timestamp"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
