/* eslint-disable drizzle/enforce-delete-with-where */
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const createSession = mutation({
  args: {
    userId: v.id("users"),
    expiresAt: v.number(),
    createdAt: v.number(),
    ipAddress: v.string(),
    updatedAt: v.number(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("session", {
      userId: args.userId,
      expiresAt: args.expiresAt,
      createdAt: args.createdAt,
      ipAddress: args.ipAddress,
      updatedAt: args.updatedAt,
      sessionId: args.sessionId,
    });

    return ctx.db.get(sessionId);
  },
});

export const updateSession = mutation({
  args: {
    sessionId: v.id("session"),
    updatedAt: v.number(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      updatedAt: args.updatedAt,
      expiresAt: args.expiresAt,
    });

    return ctx.db.get(args.sessionId);
  },
});

export const deleteSession = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("session")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    await ctx.db.delete(session._id);
    return args.sessionId;
  },
});

export const getSessionBySessionId = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const data = await ctx.db
      .query("session")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    return data;
  },
});
