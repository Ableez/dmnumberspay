/* eslint-disable drizzle/enforce-delete-with-where */
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Create a new wallet
export const createWallet = mutation({
  args: {
    userId: v.optional(v.id("users")),
    walletAddress: v.string(),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.userId) {
      const user = await ctx.db.get(args.userId);
      if (!user) {
        throw new Error("User not found");
      }
    }

    const now = Date.now();

    const walletId = await ctx.db.insert("wallets", {
      userId: args.userId,
      walletAddress: args.walletAddress,
      phoneNumber: args.phoneNumber,
      createdAt: now,
      updatedAt: now,
    });

    return walletId;
  },
});

// Get wallet by ID
export const getWallet = query({
  args: { walletId: v.id("wallets") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.walletId);
  },
});

// Get wallets by user ID
export const getWalletsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Get wallet by address
export const getWalletByAddress = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    const wallets = await ctx.db
      .query("wallets")
      .withIndex("by_wallet_address", (q) =>
        q.eq("walletAddress", args.walletAddress),
      )
      .collect();
    return wallets[0];
  },
});

export const getWalletByPhoneNumer = query({
  args: { phoneNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("wallets")
      .withIndex("by_number", (q) => q.eq("phoneNumber", args.phoneNumber))
      .first();
  },
});
