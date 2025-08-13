"use server";

import { xdr } from "@stellar/stellar-sdk";
import { revalidatePath } from "next/cache";
import { ConvexHttpClient } from "convex/browser";
import { api } from "#/convex/_generated/api";
import type { Doc, Id } from "#/convex/_generated/dataModel";
import { createSession, deleteSession } from "#/lib/auth/session";
import { createWallet } from "./wallet-actions";
import { createCustodialWallet } from "./create-wallet-exp";
import { fetchMutation } from "convex/nextjs";
import { privyClient } from "#/lib/privy-client";
import { Test_POLICY_ID } from "#/lib/CONSTANTS/privy-policies";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type AuthResult = {
  success: boolean;
  redirectUrl: string;
  message?: string;
};

/**
 * Updates a user's information in the database.
 *
 * This server action updates user information for a user identified either by:
 * - A direct userId
 * - A phone number that is looked up in the database
 *
 * @param params - Either an object containing a userId or an object containing a phoneNumber
 * @param data - Object containing the user fields to update
 * @returns AuthResult object with success status, redirect URL, and optional message
 * @throws Error if user update fails or if the user is not found
 */
export const updateUser = async (
  params: { phoneNumber: string } | { userId: string },
  data: Partial<{
    name?: string;
    email?: string;
    countryCode?: string;
    createdAt?: number;
    updatedAt?: number;
  }>,
): Promise<AuthResult> => {
  try {
    let userId: Id<"users">;

    if ("userId" in params) {
      userId = params.userId as Id<"users">;
    } else {
      // Format the phone number for consistency
      const formattedPhone = params.phoneNumber;

      // Check if user exists in Convex
      const existingUser = await convex.query(api.funcs.users.getUserByPhone, {
        phoneNumber: formattedPhone,
      });

      if (!existingUser) {
        return {
          success: false,
          redirectUrl: "/sign-in",
          message: "User not found",
        };
      }

      userId = existingUser._id;
    }

    await convex.mutation(api.funcs.users.updateUser, {
      userId,
      ...data,
    });

    revalidatePath("/");

    return {
      success: true,
      redirectUrl: "/dashboard",
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      redirectUrl: "/sign-in",
      message: error instanceof Error ? error.message : "Update failed",
    };
  }
};

/**
 * Authenticates a user by creating a session.
 *
 * This server action creates an authenticated session for a user identified either by:
 * - A direct userId
 * - A phone number that is looked up in the database
 *
 * After successful authentication, it revalidates the root path to refresh
 * any server components that depend on the authentication state.
 *
 * @param params - Either an object containing a userId or an object containing a phoneNumber
 * @throws Error if user authentication fails or if the user is not found
 */
export async function authenticateUser(
  params: { userId: string } | { phoneNumber: string },
) {
  try {
    let userId: string;
    if ("userId" in params) {
      userId = params.userId;
    } else {
      // Format the phone number for consistency
      const formattedPhone = formatPhoneNumber(params.phoneNumber);

      // Check if user exists in Convex
      const existingUser = await convex.query(api.funcs.users.getUserByPhone, {
        phoneNumber: formattedPhone,
      });

      if (existingUser) {
        userId = existingUser._id;
      } else {
        throw new Error("User not found");
      }
    }

    await createSession(userId);
    revalidatePath("/");
  } catch (error) {
    console.error("Error authenticating user:", error);
    throw new Error("Authentication failed");
  }
}

export const logout = async () => {
  await deleteSession();
  revalidatePath("/");
};
// Helper to format phone number
function formatPhoneNumber(phone?: string): string {
  if (!phone) {
    // Generate a random 11-digit phone number if none provided
    return Array.from({ length: 11 }, () =>
      Math.floor(Math.random() * 10),
    ).join("");
  }
  // Remove non-digit characters
  const formatted = phone.replace(/\D/g, "");
  return formatted;
}

export const createUserInDB = async (phoneNumber?: string) => {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // First check if user already exists
    const existingUser = await convex.query(api.funcs.users.getUserByPhone, {
      phoneNumber: formattedPhone,
    });

    if (existingUser) {
      return existingUser;
    }

    // Generate a random username and email for new user
    const randomId = crypto.randomUUID().slice(0, 8);
    const username = `user_${randomId}`;
    const email = `${randomId}@example.com`;

    // Create the new user with formatted phone number
    const newUser = await convex.mutation(api.funcs.users.createUser, {
      name: username,
      email,
      phoneNumber: formattedPhone,
    });

    return newUser;
  } catch (error) {
    console.error("Error creating user in DB:", error);
    throw new Error("Failed to create or retrieve user");
  }
};
/**
 * @deprecated This function uses the old wallet creation flow and should not be used.
 * Use the new wallet creation flow with Privy - createPrivyWalletForUser() instead.
 */
export const createWalletForUser = async (
  userId: string,
  passkeyBase64: string,
  passkeyCredentialId: string,
) => {
  try {
    const passkeySignature = Buffer.from(passkeyBase64, "base64");

    const wallet = await createCustodialWallet(
      userId,
      passkeySignature.buffer,
      passkeyCredentialId,
    );

    if (!wallet.publicKey) {
      throw new Error("Failed to create wallet");
    }

    return wallet;
  } catch (error) {
    console.error("Error creating wallet:", error);
    throw new Error("Failed to create wallet");
  }
};

// export const createPrivyUser = async ({
//   convexUserId,
//   email,
//   phoneNumber,
//   username,
// }: {
//   convexUserId: string;
//   email: string;
//   username: string;
//   phoneNumber: string;
// }) => {
//   try {
//     await privyClient.importUser({
//       linkedAccounts: [
//         {
//           type: "email",
//           address: "batman@privy.io",
//         },
//       ],
//       wallets: [{ chainType: "ethereum", policyIds: [Test_POLICY_ID] }],
//       customMetadata: {
//         convexUserId,
//         email,
//         username,
//         phoneNumber,
//       },
//     });
//   } catch (error) {
//     console.error("ERROR CREATING PRIVY USER: ", error);

//     throw new Error("Failed to create or retrieve user");
//   }
// };

export const createPrivyWalletForUser = async () => {
  try {
  } catch (error) {
    console.error("ERROR CREATING PRIVY WALLET: ", error);
  }
};
