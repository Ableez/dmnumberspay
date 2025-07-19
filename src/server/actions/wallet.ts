"use server";

import {
  Contract,
  Soroban,
  Networks,
  xdr,
  Keypair,
  TransactionBuilder,
  Account,
  Operation,
  BASE_FEE,
} from "stellar-sdk";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import { api } from "#/convex/_generated/api";
import type { Doc } from "#/convex/_generated/dataModel";

import { Contract } from "#/lib/pkgs";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Soroban RPC configuration
const NETWORK_PASSPHRASE = Networks.TESTNET;
const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";
const DEPLOYER_ADDRESS =
  "CDC7IDQECIZVKYTLMJMZLKV6RLLWNLCPPN6EPNB3VTTIOGQCAXC6FEAA";
const WALLET_CONTRACT_ID =
  "CAHLJLXXRDZIGGXSRD62B6QOINV4AZ4N4LG6ZQDEKLJ3FBYHAE2UGCHW";
const SERVER_SECRET =
  "SBO62ZAYZACF6QIV2JMNXZK464VLD3L3U27SKGZEEI7FPUFRUU6MYQ4M";
const SERVER_PUBLIC =
  "GDFJCVRORBDYXK43CPZVCDTNJYWGUPLAH7T7NFSQE6JGV3XUYUAD6UPV";

// Initialize Soroban RPC client
const sorobanRPC = new Soroban.Server(SOROBAN_RPC_URL, {
  allowHttp: SOROBAN_RPC_URL.startsWith("http://"),
});

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

/**
 * Creates a challenge transaction for the client to sign
 * Similar to SEP-10 auth but customized for our wallet contract
 */
export async function createAuthChallenge(
  userPublicKey: string,
): Promise<string> {
  const serverKeypair = Keypair.fromSecret(SERVER_SECRET);
  const account = new Account(serverKeypair.publicKey(), "-1");
  const now = Math.floor(Date.now() / 1000);

  // Generate a random challenge value
  const randomValue = Buffer.from(
    Math.random().toString(36).substring(2, 15),
    "utf8",
  ).toString("base64");

  // Build a challenge transaction
  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
    timebounds: {
      minTime: now,
      maxTime: now + 300, // 5 minute expiration
    },
  })
    .addOperation(
      Operation.manageData({
        name: "auth_challenge",
        value: randomValue,
        source: userPublicKey,
      }),
    )
    .build();

  // Sign with server keypair
  transaction.sign(serverKeypair);

  // Return the XDR as a base64 string
  return transaction.toXDR();
}

/**
 * Verifies a signed challenge transaction
 */
export async function verifyAuthChallenge(
  signedChallenge: string,
  userPublicKey: string,
): Promise<boolean> {
  try {
    const transaction = TransactionBuilder.fromXDR(
      signedChallenge,
      NETWORK_PASSPHRASE,
    );

    // Verify server signature
    if (!verifySignature(transaction, SERVER_PUBLIC)) {
      return false;
    }

    // Verify user signature
    if (!verifySignature(transaction, userPublicKey)) {
      return false;
    }

    // Verify transaction structure and other properties
    // (would add more checks similar to SEP-10 readChallengeTx)

    return true;
  } catch (error) {
    console.error("Challenge verification error:", error);
    return false;
  }
}

/**
 * Checks if a transaction was signed by the given account
 */
function verifySignature(transaction: any, publicKey: string): boolean {
  const hashedSignatureBase = transaction.hash();
  const keypair = Keypair.fromPublicKey(publicKey);

  for (const signature of transaction.signatures) {
    if (!signature.hint().equals(keypair.signatureHint())) {
      continue;
    }

    if (keypair.verify(hashedSignatureBase, signature.signature())) {
      return true;
    }
  }

  return false;
}

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
        // Check wallet status on Stellar network using proper Soroban interaction
        console.log(
          `[AUTH] Checking wallet status on Stellar network for address: ${activeWallet.address}`,
        );

        try {
          // Initialize wallet contract properly
          const walletContract = new Contract(activeWallet.address);

          // Create a proper transaction to call the contract
          const checkWalletTypeOp = walletContract.call("get_wallet_type");

          // Simulate the transaction using Soroban RPC
          const simulation =
            await sorobanRPC.simulateTransaction(checkWalletTypeOp);

          if (simulation.status === "SUCCESS") {
            // Successfully verified the wallet is active
            const walletType = decodeWalletType(simulation.result);
            console.log(`[AUTH] Wallet verified active, type: ${walletType}`);

            // Set auth cookie/session
            await setUserSession(existingUser);

            return {
              success: true,
              message: "Login successful",
              userId: existingUser._id,
              isNewUser: false,
              hasWallet: true,
              walletAddress: activeWallet.address,
              walletStatus: "active",
              walletType: walletType.toLowerCase() as any,
            };
          } else {
            console.log(
              `[AUTH] Wallet contract call failed: ${simulation.error}`,
            );

            // Still set the session but return inactive status
            await setUserSession(existingUser);

            return {
              success: true,
              message: "Wallet found but not active on network",
              userId: existingUser._id,
              isNewUser: false,
              hasWallet: true,
              walletAddress: activeWallet.address,
              walletStatus: "not_active_on_network",
              walletType: "unknown",
            };
          }
        } catch (error) {
          console.error(`[AUTH] Error checking wallet: ${error}`);

          // Set auth cookie/session despite error
          await setUserSession(existingUser);

          return {
            success: true,
            message: "Wallet found but not active on network",
            userId: existingUser._id,
            isNewUser: false,
            hasWallet: true,
            walletAddress: activeWallet.address,
            walletStatus: "not_active_on_network",
            walletType: "unknown",
          };
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

        return {
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
      }
    } else {
      // User doesn't exist - register new user
      console.log(
        `[AUTH] Creating new user with phone: ${formattedPhone}, country: ${countryCode}`,
      );
      const userId = await convex.mutation(api.funcs.users.createUser, {
        name: "", // Will be updated later in profile
        phoneNumber: formattedPhone,
        countryCode,
      });
      console.log(`[AUTH] New user created with ID: ${userId}`);

      // Set auth cookie/session
      const newUser = await convex.query(api.funcs.users.getUser, {
        userId,
      });

      console.log(`[AUTH] Setting user session for new user ID: ${userId}`);
      await setUserSession(newUser);

      // Return redirect URL instead of using redirect()
      console.log(`[AUTH] New user needs to be redirected to onboarding flow`);

      return {
        success: true,
        message: "New user registered",
        userId,
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

/**
 * Properly decodes wallet type from XDR result
 */
function decodeWalletType(xdrResult: string): string {
  try {
    // Parse the XDR to ScVal
    const scVal = xdr.ScVal.fromXDR(Buffer.from(xdrResult, "base64"));

    // Handle enum type results
    if (scVal.switch().name === "enumVal") {
      const enumVal = scVal.enumVal();
      const enumValue = enumVal.value();

      switch (enumValue) {
        case 0:
          return "Standard";
        case 1:
          return "SavingsOnly";
        case 2:
          return "StableCoinsOnly";
        case 3:
          return "Custom";
        default:
          return "Unknown";
      }
    }

    // For other types, try to extract string representation
    return "Unknown";
  } catch (error) {
    console.error("Error decoding wallet type:", error);
    return "Unknown";
  }
}

// Helper to set user session
async function setUserSession(userData: any): Promise<void> {
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
