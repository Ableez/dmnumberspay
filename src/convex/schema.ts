import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    phoneNumber: v.string(),
    countryCode: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_phone", ["phoneNumber"]),

  wallets: defineTable({
    userId: v.id("users"),
    balance: v.number(),
    address: v.string(),
    isActive: v.boolean(),
    walletType: v.union(
      v.literal("Standard"),
      v.literal("SavingsOnly"),
      v.literal("StableCoinsOnly"),
      v.literal("Custom"),
    ),
    isPrimary: v.boolean(),
    dailyLimit: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_address", ["address"]),

  transactions: defineTable({
    fromWalletId: v.id("wallets"),
    toWalletId: v.optional(v.id("wallets")),
    toAddress: v.string(),
    fromAddress: v.string(),
    tokenAddress: v.string(),
    amount: v.number(),
    txHash: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_from_wallet", ["fromWalletId"])
    .index("by_to_address", ["toAddress"]),

  passkeys: defineTable({
    userId: v.id("users"),
    walletId: v.id("wallets"),
    passkeyId: v.string(),
    publicKey: v.string(), // Base64 encoded
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_wallet", ["walletId"]),

  allowedTokens: defineTable({
    walletId: v.id("wallets"),
    tokenAddress: v.string(),
    isAllowed: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_wallet", ["walletId"])
    .index("by_token", ["tokenAddress"]),
});
