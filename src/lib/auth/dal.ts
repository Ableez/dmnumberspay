import "server-only";

import { cookies } from "next/headers";
import { decrypt } from "./session";
import { cache } from "react";
import { redirect } from "next/navigation";
import { env } from "#/env";
import { ConvexHttpClient } from "convex/browser";
import { api } from "#/convex/_generated/api";
import type { Id } from "#/convex/_generated/dataModel";

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.userId };
});

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  try {
    const data = await convex.query(api.funcs.users.getUser, {
      userId: session.userId as Id<"users">,
    });

    if (!data) {
      console.log("No user found");
      return null;
    }

    return data;
  } catch (error) {
    console.error("DAL: Failed to fetch user", error);
    return null;
  }
});
