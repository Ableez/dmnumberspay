import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Create a new notification
export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.string(),
    channels: v.array(v.string()),
    recurring: v.optional(v.boolean()),
    intervalMs: v.optional(v.number()),
    metadata: v.optional(
      v.object({
        transactionId: v.optional(v.id("transactions")),
        walletId: v.optional(v.id("wallets")),
        amount: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Calculate next delivery if recurring
    const nextDelivery =
      args.recurring && args.intervalMs ? now + args.intervalMs : undefined;

    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      title: args.title,
      message: args.message,
      type: args.type,
      channels: args.channels,
      status: "unread",
      recurring: args.recurring ?? false,
      intervalMs: args.intervalMs,
      nextDelivery,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    });

    return notificationId;
  },
});

// Get notifications for a user
export const getUserNotifications = query({
  args: {
    userId: v.string(),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("notifications")),
  },
  handler: async (ctx, args) => {
    if (args.userId === "SKIP") {
      return null;
    }

    let query = ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    return await query
      .order("desc")
      .paginate({ numItems: args.limit ?? 20, cursor: args.cursor ?? null });
  },
});

// Mark notification as read
export const markNotificationAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    await ctx.db.patch(args.notificationId, {
      status: "read",
      updatedAt: Date.now(),
    });

    return args.notificationId;
  },
});

// Mark all user's notifications as read
export const markAllNotificationsAsRead = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", args.userId).eq("status", "unread"),
      )
      .collect();

    const now = Date.now();

    await Promise.all(
      notifications.map((notification) =>
        ctx.db.patch(notification._id, {
          status: "read",
          updatedAt: now,
        }),
      ),
    );

    return notifications.length;
  },
});

// Delete notification
export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId);
    return args.notificationId;
  },
});

// Save notification preferences
export const saveNotificationPreferences = mutation({
  args: {
    userId: v.id("users"),
    enabledChannels: v.array(v.string()),
    disabledTypes: v.array(v.string()),
    pushSubscription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existingPrefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existingPrefs) {
      await ctx.db.patch(existingPrefs._id, {
        enabledChannels: args.enabledChannels,
        disabledTypes: args.disabledTypes,
        pushSubscription: args.pushSubscription,
        updatedAt: now,
      });
      return existingPrefs._id;
    } else {
      return await ctx.db.insert("notificationPreferences", {
        userId: args.userId,
        enabledChannels: args.enabledChannels,
        disabledTypes: args.disabledTypes,
        pushSubscription: args.pushSubscription,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Get user's notification preferences
export const getNotificationPreferences = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});
