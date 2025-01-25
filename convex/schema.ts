import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    chats: defineTable({
        title: v.string(),
        userId: v.string(),
        createdAt: v.number(),
    }).index("by_user_id", ["userId"]), // optimized query for chats by user

    messages: defineTable({
        chatId: v.id("chats"), // reference to chat id table (relation)
        content: v.string(),
        role: v.union(v.literal("user"), v.literal("assistant")),
        createdAt: v.number(),
    }).index("by_chat_id", ["chatId"]),
});