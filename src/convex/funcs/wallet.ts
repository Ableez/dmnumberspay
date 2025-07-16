import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Create a new wallet
export const createWallet = mutation({
  args: {
    userId: v.id("users"),
    address: v.string(),
    balance: v.number(),
    walletType: v.union(
      v.literal("Standard"),
      v.literal("SavingsOnly"),
      v.literal("StableCoinsOnly"),
      v.literal("Custom"),
    ),
    isPrimary: v.boolean(),
    dailyLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();

    // If this is primary, update other wallets to non-primary
    if (args.isPrimary) {
      const userWallets = await ctx.db
        .query("wallets")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();

      for (const wallet of userWallets) {
        if (wallet.isPrimary) {
          await ctx.db.patch(wallet._id, { isPrimary: false, updatedAt: now });
        }
      }
    }

    const walletId = await ctx.db.insert("wallets", {
      userId: args.userId,
      address: args.address,
      balance: args.balance,
      isActive: true,
      walletType: args.walletType,
      isPrimary: args.isPrimary,
      dailyLimit: args.dailyLimit,
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
  args: { address: v.string() },
  handler: async (ctx, args) => {
    const wallets = await ctx.db
      .query("wallets")
      .withIndex("by_address", (q) => q.eq("address", args.address))
      .collect();
    return wallets[0];
  },
});

// Get primary wallet for user
export const getPrimaryWallet = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const wallets = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isPrimary"), true))
      .collect();
    return wallets[0];
  },
});

// Update wallet
export const updateWallet = mutation({
  args: {
    walletId: v.id("wallets"),
    balance: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    isPrimary: v.optional(v.boolean()),
    dailyLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { walletId, ...updates } = args;
    const wallet = await ctx.db.get(walletId);
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const now = Date.now();

    // If setting this as primary, update other wallets
    if (updates.isPrimary) {
      const userWallets = await ctx.db
        .query("wallets")
        .withIndex("by_user", (q) => q.eq("userId", wallet.userId))
        .collect();

      for (const otherWallet of userWallets) {
        if (otherWallet._id !== walletId && otherWallet.isPrimary) {
          await ctx.db.patch(otherWallet._id, {
            isPrimary: false,
            updatedAt: now,
          });
        }
      }
    }

    await ctx.db.patch(walletId, {
      ...updates,
      updatedAt: now,
    });

    return walletId;
  },
});

// Delete wallet
export const deleteWallet = mutation({
  args: { walletId: v.id("wallets") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.walletId);
    return args.walletId;
  },
});
