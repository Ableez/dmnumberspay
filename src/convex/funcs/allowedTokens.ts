import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";

// Add allowed token
export const addAllowedToken = mutation({
  args: {
    walletId: v.id("wallets"),
    tokenAddress: v.string(),
    isAllowed: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Verify wallet exists
    const wallet = await ctx.db.get(args.walletId);
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    // Check if this token is already defined
    const existingTokens = await ctx.db
      .query("allowedTokens")
      .withIndex("by_wallet", (q) => q.eq("walletId", args.walletId))
      .filter((q) => q.eq(q.field("tokenAddress"), args.tokenAddress))
      .collect();

    if (existingTokens.length > 0 && existingTokens[0]?._id) {
      // Update existing record
      const tokenId = existingTokens[0]._id;
      await ctx.db.patch(tokenId, {
        isAllowed: args.isAllowed,
      });
      return tokenId;
    }

    // Create new record
    const tokenId = await ctx.db.insert("allowedTokens", {
      walletId: args.walletId,
      tokenAddress: args.tokenAddress,
      isAllowed: args.isAllowed,
      createdAt: Date.now(),
    });

    return tokenId;
  },
});

// Get allowed tokens for wallet
export const getAllowedTokens = query({
  args: { walletId: v.id("wallets") },
  handler: async (ctx, args) => {
    const tokens = await ctx.db
      .query("allowedTokens")
      .withIndex("by_wallet", (q) => q.eq("walletId", args.walletId))
      .filter((q) => q.eq(q.field("isAllowed"), true))
      .collect();
    
    return tokens;
  },
});

// Check if token is allowed
export const isTokenAllowed = query({
  args: {
    walletId: v.id("wallets"),
    tokenAddress: v.string(),
  },
  handler: async (ctx, args) => {
    // First, get the wallet to check its type
    const wallet = await ctx.db.get(args.walletId);
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    // Standard and SavingsOnly allow all tokens by default
    if (
      wallet.walletType === "Standard" ||
      wallet.walletType === "SavingsOnly"
    ) {
      return true;
    }

    // For StableCoinsOnly, implement a stable coin check here
    if (wallet.walletType === "StableCoinsOnly") {
      // You would have a list of stable coins to check against
      const stableCoins = ["address1", "address2"]; // Replace with actual addresses
      return stableCoins.includes(args.tokenAddress);
    }

    // For Custom type, check the allowedTokens table
    const tokens = await ctx.db
      .query("allowedTokens")
      .withIndex("by_wallet", (q) => q.eq("walletId", args.walletId))
      .filter((q) =>
        q.and(
          q.eq(q.field("tokenAddress"), args.tokenAddress),
          q.eq(q.field("isAllowed"), true),
        ),
      )
      .collect();

    return tokens.length > 0;
  },
});

// Update token status
export const updateTokenStatus = mutation({
  args: {
    id: v.id("allowedTokens"),
    isAllowed: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isAllowed: args.isAllowed,
    });
    return args.id;
  },
});

// Delete token
export const deleteAllowedToken = mutation({
  args: { id: v.id("allowedTokens") },
  handler: async (ctx, args) => {
    const tokenExists = await ctx.db.get(args.id);
    if (!tokenExists) {
      throw new Error("Token not found");
    }
    await ctx.db.delete(args.id);
    return args.id;
  },
});
