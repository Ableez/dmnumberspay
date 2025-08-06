/* eslint-disable drizzle/enforce-delete-with-where */
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Create a new passkey
export const createPasskey = mutation({
  args: {
    userId: v.id("users"),
    walletId: v.id("wallets"),
    passkeyId: v.string(),
    publicKey: v.string(),
    credentialId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify user and wallet exist
    const user = await ctx.db.get(args.userId);
    const wallet = await ctx.db.get(args.walletId);

    if (!user || !wallet) {
      throw new Error("User or wallet not found");
    }

    const passkeyId = await ctx.db.insert("passkeys", {
      userId: args.userId,
      walletId: args.walletId,
      passkeyId: args.passkeyId,
      publicKey: args.publicKey,
      credentialId: args.credentialId,
      createdAt: Date.now(),
    });

    return passkeyId;
  },
});

// Get passkey by ID
export const getPasskey = query({
  args: { passkeyId: v.id("passkeys") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.passkeyId);
  },
});

// Get passkeys by user
export const getPasskeysByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("passkeys")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Get passkeys by wallet
export const getPasskeysByWallet = query({
  args: { walletId: v.id("wallets") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("passkeys")
      .withIndex("by_wallet", (q) => q.eq("walletId", args.walletId))
      .collect();
  },
});

// Delete passkey
export const deletePasskey = mutation({
  args: { passkeyId: v.id("passkeys") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.passkeyId);
    return args.passkeyId;
  },
});
