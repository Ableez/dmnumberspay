"use server";

import { Contract, Soroban, Networks, xdr } from "stellar-sdk";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import { api } from "#/convex/_generated/api";
import type { Doc } from "#/convex/_generated/dataModel";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Soroban RPC configuration
const NETWORK_PASSPHRASE = Networks.TESTNET;
const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";
const DEPLOYER_ADDRESS =
  "CDC7IDQECIZVKYTLMJMZLKV6RLLWNLCPPN6EPNB3VTTIOGQCAXC6FEAA";
const WALLET_CONTRACT_ID =
  "CAHLJLXXRDZIGGXSRD62B6QOINV4AZ4N4LG6ZQDEKLJ3FBYHAE2UGCHW";

type AuthResult = {
  success: boolean;
  message: string;
  userId: string | null;
  isNewUser: boolean;
  hasWallet: boolean;
  walletAddress: string | null;
  walletStatus:
    | "not_active_on_network"
    | "not_found"
    | "active"
    | "blocked"
    | "suspended";
  walletType:
    | "standard"
    | "savings_only"
    | "stable_coins_only"
    | "custom"
    | "unknown";
  redirectUrl?: string;
};

export async function authenticateUser(
  phoneNumber: string,
  countryCode: string,
): Promise<AuthResult> {
  console.log(
    `[AUTH] Starting authentication for phone: ${phoneNumber}, country: ${countryCode}`,
  );
  try {
    // Format the phone number for consistency
    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log(`[AUTH] Formatted phone number: ${formattedPhone}`);

    // Check if user exists in Convex
    console.log(
      `[AUTH] Querying Convex for user with phone: ${formattedPhone}`,
    );
    const existingUser = await convex.query(api.funcs.users.getUserByPhone, {
      phoneNumber: formattedPhone,
    });
    console.log(
      `[AUTH] User query result:`,
      existingUser
        ? `Found user with ID: ${existingUser._id}`
        : "User not found",
    );

    if (existingUser) {
      // User exists - check if they have an active wallet
      console.log(`[AUTH] Checking wallets for user ID: ${existingUser._id}`);
      const wallets = await convex.query(api.funcs.wallet.getWalletsByUser, {
        userId: existingUser._id,
      });
      console.log(`[AUTH] Found ${wallets.length} wallets for user`);

      const activeWallet = wallets.find((wallet) => wallet.isActive);
      console.log(
        `[AUTH] Active wallet:`,
        activeWallet
          ? `Found at address: ${activeWallet.address}`
          : "No active wallet found",
      );

      if (activeWallet) {
        // Check wallet status on Stellar network
        console.log(
          `[AUTH] Checking wallet status on Stellar network for address: ${activeWallet.address}`,
        );
        const walletStatus:
          | "not_active_on_network"
          | "not_found"
          | "active"
          | "blocked"
          | "suspended" = "not_active_on_network";
        console.log(`[AUTH] Wallet status: ${walletStatus}`);

        if (walletStatus === "not_active_on_network") {
          // Set auth cookie/session
          console.log(
            `[AUTH] Setting user session for ID: ${existingUser._id}`,
          );
          await setUserSession(existingUser);

          const result: AuthResult = {
            success: true,
            message: "Wallet found but not active on network",
            userId: existingUser._id,
            isNewUser: false,
            walletAddress: activeWallet.address,
            hasWallet: true,
            walletStatus: "not_active_on_network",
            walletType: "unknown",
          };
          console.log(`[AUTH] Authentication successful:`, result);
          return result;
        } else {
          const result: AuthResult = {
            success: false,
            message: "Wallet found but not active on network",
            userId: existingUser._id,
            isNewUser: false,
            hasWallet: true,
            walletAddress: activeWallet.address,
            walletStatus: "not_active_on_network",
            walletType: "unknown",
          };
          console.log(`[AUTH] Authentication failed:`, result);
          return result;
        }
      } else {
        // Set auth cookie/session for user without wallet
        console.log(
          `[AUTH] Setting user session for ID: ${existingUser._id} (no wallet)`,
        );
        await setUserSession(existingUser);

        // Return redirect URL instead of using redirect()
        console.log(
          `[AUTH] User needs to be redirected to onboarding flow (no wallet)`,
        );

        const result: AuthResult = {
          success: true,
          message: "User found but no active wallet",
          userId: existingUser._id,
          isNewUser: false,
          hasWallet: false,
          walletAddress: null,
          walletStatus: "not_found",
          walletType: "unknown",
          redirectUrl: "/onboard",
        };
        console.log(`[AUTH] Authentication successful with redirect:`, result);
        return result;
      }
    } else {
      // User doesn't exist - register new user
      console.log(
        `[AUTH] Creating new user with phone: ${formattedPhone}, country: ${countryCode}`,
      );
      const userData = await convex.mutation(api.funcs.users.createUser, {
        name: "", // Will be updated later in profile
        phoneNumber: formattedPhone,
        countryCode,
      });

      if (!userData) {
        throw new Error("Failed to create account, please try again");
      }
      console.log(`[AUTH] New user created with ID: ${userData._id}`);

      // Set auth cookie/session
      console.log(
        `[AUTH] Setting user session for new user ID: ${userData._id}`,
      );
      await setUserSession(userData);

      // Return redirect URL instead of using redirect()
      console.log(`[AUTH] New user needs to be redirected to onboarding flow`);

      return {
        success: true,
        message: "New user registered",
        userId: userData._id,
        isNewUser: true,
        hasWallet: false,
        walletAddress: null,
        walletStatus: "not_found",
        walletType: "unknown",
        redirectUrl: "/onboard",
      };
    }
  } catch (error) {
    console.error("[AUTH] Authentication error:", error);
    return {
      success: false,
      message: "Authentication failed",
      userId: null,
      isNewUser: false,
      hasWallet: false,
      walletAddress: null,
      walletStatus: "not_found",
      walletType: "unknown",
    };
  }
}

// // Helper function to check wallet status on Stellar
// async function checkWalletOnStellar(address: string): Promise<{
//   isActive: boolean;
//   walletType?: string;
//   message?: string;
// }> {
//   try {
//     // Initialize Soroban RPC client
//     const walletContract = new Contract(WALLET_CONTRACT_ID);

//     // Prepare and simulate get_wallet_type transaction
//     const walletTypeOperation = walletContract.call("get_wallet_type");

//     // const walletTypeSimulation =
//     //   await sorobanRPC.simulateTransaction(walletTypeOperation);

//     // if (walletTypeSimulation.status !== "SUCCESS") {
//     //   return {
//     //     isActive: false,
//     //     message: `Contract call failed: ${walletTypeSimulation.error || "Unknown error"}`,
//     //   };
//     // }

//     // Parse wallet type from result
//     const walletType = parseWalletType(walletTypeOperation.toXDR());

//     // Prepare and simulate get_owner transaction
//     const ownerOperation = contract.call("get_owner");
//     const ownerSimulation =
//       await sorobanRPC.simulateTransaction(ownerOperation);

//     if (ownerSimulation.status !== "SUCCESS") {
//       return {
//         isActive: false,
//         message: `Failed to verify owner: ${ownerSimulation.error || "Unknown error"}`,
//       };
//     }

//     // All checks passed - wallet is active
//     return {
//       isActive: true,
//       walletType,
//     };
//   } catch (error) {
//     console.error("Stellar wallet check error:", error);

//     // Determine specific error message
//     let message = "Failed to verify wallet on Stellar network";
//     if (error instanceof Error) {
//       message = error.message;
//     }

//     return {
//       isActive: false,
//       message,
//     };
//   }
// }

// Helper function to parse wallet type from contract result
function parseWalletType(result: Buffer): string {
  console.log(`[PARSE] Parsing wallet type from XDR result`);
  try {
    // Parse the XDR result to extract enum value
    // The exact access path depends on the contract's return structure
    const scVal = xdr.ScVal.fromXDR(result);
    console.log(`[PARSE] ScVal switch type:`, scVal.switch().name);

    // Attempt to extract enum discriminant
    // This may need adjustment based on actual return format
    // if (scVal.switch().name === "enumVal") {
    //   const enumVal = scVal.enumVal();
    //   const enumValue = enumVal.value();
    //   console.log(`[PARSE] Enum value:`, enumValue);

    //   switch (enumVal.value()) {
    //     case 0:
    //       console.log(`[PARSE] Wallet type: Standard`);
    //       return "Standard";
    //     case 1:
    //       console.log(`[PARSE] Wallet type: SavingsOnly`);
    //       return "SavingsOnly";
    //     case 2:
    //       console.log(`[PARSE] Wallet type: StableCoinsOnly`);
    //       return "StableCoinsOnly";
    //     case 3:
    //       console.log(`[PARSE] Wallet type: Custom`);
    //       return "Custom";
    //     default:
    //       console.log(`[PARSE] Wallet type: Unknown (value: ${enumValue})`);
    //       return "Unknown";
    //   }
    // }

    console.log(`[PARSE] Could not determine wallet type, returning Unknown`);
    return "Unknown";
  } catch (error) {
    console.error("[PARSE] Error parsing wallet type:", error);
    return "Unknown";
  }
}

// Helper to set user session
async function setUserSession(userData: Doc<"users">): Promise<void> {
  console.log(`[SESSION] Setting user session for ID: ${userData._id}`);
  // Set secure HTTP only cookie
  try {
    const cookistore = await cookies();
    cookistore.set("user_session", JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 30, //30 minutes
      path: "/",
    });
    console.log(
      `[SESSION] Cookie set successfully with maxAge: ${60 * 30} seconds`,
    );

    // Revalidate the path to update UI
    console.log(`[SESSION] Revalidating path: /`);
    revalidatePath("/");
    console.log(`[SESSION] User session set successfully`);
  } catch (error) {
    console.error(`[SESSION] Error setting user session:`, error);
    throw error;
  }
}

// Helper to format phone number
function formatPhoneNumber(phone: string): string {
  console.log(`[FORMAT] Formatting phone number: ${phone}`);
  // Remove non-digit characters
  const formatted = phone.replace(/\D/g, "");
  console.log(`[FORMAT] Formatted phone number: ${formatted}`);
  return formatted;
}
