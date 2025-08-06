import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    phoneNumber: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_phone", ["phoneNumber"]),

  wallets: defineTable({
    userId: v.optional(v.id("users")),
    walletAddress: v.string(),
    walletBalance: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    dailyLimit: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_number", ["phoneNumber"])
    .index("by_wallet_address", ["walletAddress"]),

  passkeys: defineTable({
    userId: v.id("users"),
    walletId: v.id("wallets"),
    passkeyId: v.string(),
    publicKey: v.string(), // Base64 encoded
    credentialId: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_wallet", ["walletId"]),

  transactions: defineTable({
    // Wallet references
    fromWalletId: v.optional(v.id("wallets")),
    toWalletId: v.optional(v.id("wallets")),

    // Addresses
    toAddress: v.string(),
    fromAddress: v.optional(v.string()),

    // DFNS tracking
    dfnsTransferId: v.optional(v.string()),
    txHash: v.optional(v.string()),

    // Transaction details
    tokenAddress: v.string(),
    amount: v.number(),
    network: v.string(),
    blockNumber: v.optional(v.number()),

    // Status tracking
    status: v.string(), // "PENDING", "CONFIRMED", "FAILED"
    requestedAt: v.optional(v.number()),
    confirmedAt: v.optional(v.number()),
    failedAt: v.optional(v.number()),
    failureReason: v.optional(v.string()),

    // Direction and metadata
    direction: v.optional(v.union(v.literal("In"), v.literal("Out"))),
    decimals: v.number(),
    fee: v.optional(v.number()),
    blockchainFee: v.optional(v.number()),

    // Metadata
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

    // Timestamp
    timestamp: v.optional(v.number()),
  })
    .index("by_from_wallet", ["fromWalletId"])
    .index("by_to_address", ["toAddress"])
    .index("by_tx_hash", ["txHash"])
    .index("by_dfns_transfer_id", ["dfnsTransferId"])
    .index("by_status", ["status"]),

  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.string(), // "transaction", "security", "marketing", etc.
    channels: v.array(v.string()), // ["push", "email", "sms"]
    status: v.string(), // "unread", "read", "archived"
    recurring: v.optional(v.boolean()),
    intervalMs: v.optional(v.number()), // Interval in milliseconds if recurring
    nextDelivery: v.optional(v.number()), // Timestamp for next delivery
    metadata: v.optional(
      v.object({
        transactionId: v.optional(v.id("transactions")),
        walletId: v.optional(v.id("wallets")),
        amount: v.optional(v.number()),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_next_delivery", ["nextDelivery"])
    .index("by_type", ["type"]),

  notificationPreferences: defineTable({
    userId: v.id("users"),
    enabledChannels: v.array(v.string()), // ["push", "email", "sms"]
    disabledTypes: v.array(v.string()), // Types user has opted out of
    pushSubscription: v.optional(v.string()), // Stringified push subscription
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  allowedTokens: defineTable({
    walletId: v.id("wallets"),
    tokenAddress: v.string(),
    isAllowed: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_wallet", ["walletId"])
    .index("by_token", ["tokenAddress"]),

  session: defineTable({
    userId: v.id("users"),
    expiresAt: v.number(),
    createdAt: v.number(),
    ipAddress: v.string(),
    updatedAt: v.number(),
    sessionId: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_session_id", ["sessionId"]),
});
