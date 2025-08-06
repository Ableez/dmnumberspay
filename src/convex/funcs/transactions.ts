import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Create or update a transaction
export const createOrUpdateTransaction = mutation({
  args: {
    // Required for new transactions
    dfnsTransferId: v.optional(v.string()),
    fromWalletId: v.optional(v.id("wallets")),
    toWalletId: v.optional(v.id("wallets")),
    toAddress: v.optional(v.string()),
    fromAddress: v.optional(v.string()),
    tokenAddress: v.optional(v.string()),
    amount: v.optional(v.number()),
    network: v.optional(v.string()),
    status: v.optional(v.string()),
    decimals: v.optional(v.number()),

    // Optional fields
    txHash: v.optional(v.string()),
    blockNumber: v.optional(v.number()),
    direction: v.optional(v.union(v.literal("In"), v.literal("Out"))),
    fee: v.optional(v.number()),
    blockchainFee: v.optional(v.number()),
    assetMetadata: v.optional(
      v.object({
        asset: v.object({
          symbol: v.string(),
          decimals: v.number(),
        }),
        fee: v.optional(
          v.object({
            symbol: v.string(),
            decimals: v.number(),
          }),
        ),
      }),
    ),

    // Timestamps
    requestedAt: v.optional(v.number()),
    confirmedAt: v.optional(v.number()),
    failedAt: v.optional(v.number()),
    failureReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // First, try to find an existing transaction by DFNS transfer ID
    let existingTransaction;
    if (args.dfnsTransferId) {
      const transactions = await ctx.db
        .query("transactions")
        .withIndex("by_dfns_transfer_id", (q) =>
          q.eq("dfnsTransferId", args.dfnsTransferId),
        )
        .collect();

      if (transactions.length > 0) {
        existingTransaction = transactions[0];
      }
    }
    // Or by txHash if available
    else if (args.txHash) {
      const transactions = await ctx.db
        .query("transactions")
        .withIndex("by_tx_hash", (q) => q.eq("txHash", args.txHash))
        .collect();

      if (transactions.length > 0) {
        existingTransaction = transactions[0];
      }
    }

    // If we found an existing transaction, update it
    if (existingTransaction) {
      type TransactionUpdate = Partial<typeof existingTransaction>;
      const updates: TransactionUpdate = {};

      // Only update fields that are provided
      Object.entries(args).forEach(([key, value]) => {
        if (value !== undefined && key !== "dfnsTransferId") {
          (updates as Record<string, unknown>)[key] = value;
        }
      });

      // Always update status if provided
      if (args.status) {
        updates.status = args.status;
      }

      // Add timestamps based on status
      if (args.status === "CONFIRMED" && !updates.confirmedAt) {
        updates.confirmedAt = Date.now();
      } else if (args.status === "FAILED" && !updates.failedAt) {
        updates.failedAt = Date.now();
      }

      await ctx.db.patch(existingTransaction._id, updates);
      return existingTransaction._id;
    }
    // Create a new transaction
    else {
      if (
        !args.toAddress &&
        !args.tokenAddress &&
        !args.amount &&
        !args.network &&
        !args.decimals
      ) {
        throw new Error("Required fields missing for new transaction");
      }

      // Create a new transaction with required fields
      const newTransaction = {
        // Required fields
        toAddress: args.toAddress!,
        tokenAddress: args.tokenAddress!,
        amount: args.amount!,
        network: args.network!,
        decimals: args.decimals!,
        status: args.status ?? "PENDING",
        
        // Optional fields
        fromWalletId: args.fromWalletId,
        toWalletId: args.toWalletId,
        fromAddress: args.fromAddress,
        dfnsTransferId: args.dfnsTransferId,
        txHash: args.txHash,
        blockNumber: args.blockNumber,
        requestedAt: args.requestedAt,
        confirmedAt: args.confirmedAt,
        failedAt: args.failedAt,
        failureReason: args.failureReason,
        direction: args.direction,
        fee: args.fee,
        blockchainFee: args.blockchainFee,
        assetMetadata: args.assetMetadata,
        timestamp: Date.now(),
      };

      return await ctx.db.insert("transactions", newTransaction);
    }
  },
});

// Get transaction by DFNS transfer ID
export const getTransactionByDfnsTransferId = query({
  args: { dfnsTransferId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_dfns_transfer_id", (q) =>
        q.eq("dfnsTransferId", args.dfnsTransferId),
      )
      .first();
  },
});

// Get transaction by txHash
export const getTransactionByTxHash = query({
  args: { txHash: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_tx_hash", (q) => q.eq("txHash", args.txHash))
      .first();
  },
});

// Get transactions by wallet ID
export const getTransactionsByWallet = query({
  args: {
    walletId: v.id("wallets"),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("transactions")),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("transactions")
      .withIndex("by_from_wallet", (q) => q.eq("fromWalletId", args.walletId));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    return await query
      .order("desc")
      .paginate({ numItems: args.limit ?? 10, cursor: args.cursor ?? null });
  },
});

// Get pending transactions
export const getPendingTransactions = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_status", (q) => q.eq("status", "PENDING"))
      .collect();
  },
});
