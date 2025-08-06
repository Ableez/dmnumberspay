"use server";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies, headers } from "next/headers";

import { api } from "#/convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import type { Id } from "#/convex/_generated/dataModel";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

// Session duration in days
const SESSION_DURATION_DAYS = 0.2;

export async function encrypt(payload: JWTPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });

    return payload;
  } catch (error) {
    console.log("Failed to verify session", error);
    return null;
  }
}

export async function createSession(userId: string) {
  console.log(`Creating session for user: ${userId}`);

  // Calculate expiration time
  const expiresAt = new Date(
    Date.now() + Math.ceil(SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000),
  );
  const sessionId = crypto.randomUUID();

  try {
    // 1. Get user data to include in session
    const userData = await fetchQuery(api.funcs.users.getUser, {
      userId: userId as Id<"users">,
    });
    const userWallet = await fetchQuery(api.funcs.wallet.getWalletsByUser, {
      userId: userId as Id<"users">,
    });

    if (!userData) {
      console.error("Failed to fetch user data for session creation");
      throw new Error("User not found");
    }

    // 2. Create a session in the database
    await fetchMutation(api.funcs.session.createSession, {
      userId: userId as Id<"users">,
      expiresAt: expiresAt.getTime(),
      createdAt: Date.now(),
      ipAddress: (await headers()).get("x-forwarded-for") ?? "unknown",
      updatedAt: Date.now(),
      sessionId,
    });

    // 3. Create payload with all necessary user info
    const sessionPayload = {
      userId,
      username: userData?.name || "",
      email: userData?.email || "",
      phoneNumber: userData?.phoneNumber || "",
      sessionId,
      walletAddress: userWallet[0]?.walletAddress ?? null,
      walletBalance: userWallet[0]?.walletBalance ?? null,
      walletId: userWallet[0]?._id ?? null,
    };

    // 4. Encrypt the session payload
    const encryptedSession = await encrypt(sessionPayload);

    // 5. Store the session in cookies
    const cookieStore = await cookies();
    cookieStore.set("session", encryptedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      sameSite: "lax",
      path: "/",
    });

    console.log(`Session created successfully for user: ${userId}`);
    return sessionId;
  } catch (error) {
    console.error("Failed to create session:", error);
    throw error;
  }
}

export async function deleteSession() {
  console.log("Deleting session");

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (sessionCookie) {
    const payload = await decrypt(sessionCookie);

    if (payload?.sessionId) {
      try {
        // Find the session in the database
        const sessionRecord = await fetchQuery(
          api.funcs.session.getSessionBySessionId,
          {
            sessionId: payload.sessionId as string,
          },
        );

        if (sessionRecord) {
          // Delete the session from the database
          await fetchMutation(api.funcs.session.deleteSession, {
            sessionId: sessionRecord._id as Id<"session">,
          });
        }
      } catch (error) {
        console.error("Error deleting session from database:", error);
      }
    }
  }

  // Always delete the cookie regardless of database operation success
  cookieStore.delete("session");
  console.log("Session deleted");
}

export async function updateSession() {
  const sessionCookie = (await cookies()).get("session")?.value;
  if (!sessionCookie) return null;

  const payload = await decrypt(sessionCookie);
  if (!payload) return null;

  console.log("Updating session");

  try {
    // Set new expiration time
    const expires = new Date(
      Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
    );

    // Update the session in the database if sessionId is available
    if (payload.sessionId) {
      const sessionRecord = await fetchQuery(
        api.funcs.session.getSessionBySessionId,
        {
          sessionId: payload.sessionId as Id<"session">,
        },
      );

      if (sessionRecord) {
        await fetchMutation(api.funcs.session.updateSession, {
          sessionId: sessionRecord._id as Id<"session">,
          updatedAt: Date.now(),
          expiresAt: expires.getTime(),
        });
      }
    }

    // Refresh cookie expiration
    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expires,
      sameSite: "lax",
      path: "/",
    });

    console.log("Session updated successfully");
    return payload;
  } catch (error) {
    console.error("Failed to update session:", error);
    return null;
  }
}

export async function getSession() {
  const sessionCookie = (await cookies()).get("session")?.value;
  if (!sessionCookie) return null;

  const payload = await decrypt(sessionCookie);
  if (!payload) return null;

  // Optionally verify the session is still valid in the database
  if (payload.sessionId) {
    try {
      const sessionRecord = await fetchQuery(
        api.funcs.session.getSessionBySessionId,
        {
          sessionId: payload.sessionId as Id<"session">,
        },
      );

      if ((sessionRecord?.expiresAt ?? 0) < Date.now()) {
        // Session is expired or inactive
        await deleteSession();
        return null;
      }
    } catch (error) {
      console.error("Error verifying session in database:", error);
    }
  }

  return payload;
}
