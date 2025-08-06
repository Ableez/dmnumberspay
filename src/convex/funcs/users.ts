/* eslint-disable drizzle/enforce-delete-with-where */
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Create a new user
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      phoneNumber: args.phoneNumber,
      createdAt: now,
      updatedAt: now,
    });
    return ctx.db.get(userId);
  },
});

// Get user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Get user by phone number
export const getUserByPhone = query({
  args: { phoneNumber: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .collect();
    return users[0];
  },
});

// Update user
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    countryCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    const existingUser = await ctx.db.get(userId);
    if (!existingUser) {
      throw new Error("User not found");
    }

    await ctx.db.patch(userId, {
      ...updates,
      updatedAt: Date.now(),
    });
    return userId;
  },
});

// Delete user
export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.userId);
    return args.userId;
  },
});
