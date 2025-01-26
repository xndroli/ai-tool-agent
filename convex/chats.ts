// Chat related queries and mutations

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createChat = mutation({
    args: { 
        title: v.string(), 
    },
    handler: async (ctx, args) => {
        // Check if user is authenticated
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        };
        // If user authenticated, create a new chat (send to chats table)
        const chat = await ctx.db.insert("chats", {
            title: args.title,
            userId: identity.subject, // user ID based off their token
            createdAt: Date.now(),
        });
        // Return the new chat
        return chat;
    },
});

export const deleteChat = mutation({
    args: {
        id: v.id("chats"),
    },
    handler: async (ctx, args) => {
        // Check if user is authenticated
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        };
        // Check if user owns the chat
        const chat = await ctx.db.get(args.id);
        if (!chat || chat.userId !== identity.subject) {
            throw new Error("Unauthorized");
        };
        // Delete all messages in the chat (from messages table)
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_chat_id", (q) => q.eq("chatId", args.id))
            .collect();
        // Loop through and delete each message in the chat
        for (const message of messages) {
            await ctx.db.delete(message._id);
        }
        // Delete the chat (from chats table)
        await ctx.db.delete(args.id);
    },
});

export const listChats = query({
    handler: async (ctx) => {
        // Check if user is authenticated
        const identity = await ctx.auth.getUserIdentity();
        // console.log(identity);
        if (!identity) {
            throw new Error("Unauthenticated");
        };
        // Get all chats for the user
        const chats = await ctx.db
            .query("chats")
            .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
            .order("desc") // sort by createdAt
            .collect();
        // Return the chats
        return chats;
    },
});
