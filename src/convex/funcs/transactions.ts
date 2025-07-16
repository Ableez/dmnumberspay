import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Create a new transaction
export const createTransaction = mutation({
  args: {
    fromWalletId: v.id("wallets"),
    toWalletId: v.optional(v.id("wallets")),
    toAddress: v.string(),
    fromAddress: v.string(),
    tokenAddress: v.string(),
    amount: v.number(),
    txHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify the wallet exists
    const wallet = await ctx.db.get(args.fromWalletId);
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const txId = await ctx.db.insert("transactions", {
      fromWalletId: args.fromWalletId,
      toWalletId: args.toWalletId,
      toAddress: args.toAddress,
      fromAddress: args.fromAddress,
      tokenAddress: args.tokenAddress,
      amount: args.amount,
      txHash: args.txHash,
      timestamp: Date.now(),
    });

    // Update wallet balance (simplified)
    await ctx.db.patch(args.fromWalletId, {
      balance: wallet.balance - args.amount,
      updatedAt: Date.now(),
    });

    return txId;
  },
});

// Get transaction by ID
export const getTransaction = query({
  args: { transactionId: v.id("transactions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.transactionId);
  },
});

// Get transactions by wallet
export const getTransactionsByWallet = query({
  args: { walletId: v.id("wallets") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_from_wallet", (q) => q.eq("fromWalletId", args.walletId))
      .order("desc")
      .collect();
  },
});

// Get transactions by destination address
export const getTransactionsByToAddress = query({
  args: { toAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_to_address", (q) => q.eq("toAddress", args.toAddress))
      .order("desc")
      .collect();
  },
});

// Update transaction (typically only for txHash updates)
export const updateTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
    txHash: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.transactionId, {
      txHash: args.txHash,
    });
    return args.transactionId;
  },
});

// Delete transaction (rarely used)
export const deleteTransaction = mutation({
  args: { transactionId: v.id("transactions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.transactionId);
    return args.transactionId;
  },
});
