"use server";

import { env } from "#/env";
import { ConvexHttpClient } from "convex/browser";
import { createDFNSWallet } from "./server-only/wallet";
import { api } from "#/convex/_generated/api";

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

/**
 * Creates a new wallet for a user using DFNS and saves it to the database.
 * @param phoneNumber - The user's phone number to associate with the wallet
 */
export const createWallet = async (phoneNumber: string): Promise<void> => {
  try {
    const existingWallet = await convex.query(
      api.funcs.wallet.getWalletByPhoneNumer,
      {
        phoneNumber,
      },
    );

    if (existingWallet) {
      console.log("Wallet already exists for this phone number");
      return;
    }

    const wallet = await createDFNSWallet(phoneNumber);

    if (!wallet) {
      throw new Error("Failed to create wallet.");
    }

    try {
      await saveNewWallet({
        phoneNumber,
        externalWalletId: wallet.id,
        walletAddress: wallet.address ?? "NO_ADRESS",
      });
    } catch (error) {
      console.error("ERROR SAVING WALLET TO DB: ", error);
    }
  } catch (error) {
    console.error("Error registering new user", error);
  }
};

/**
 * Saves a new wallet to the database using Convex.
 * @param data - Object containing wallet data (phoneNumber, externalWalletId, walletAddress)
 * @returns An object containing success status and a message
 */
export const saveNewWallet = async (data: {
  phoneNumber: string;
  externalWalletId: string;
  walletAddress: string;
}) => {
  try {
    await convex.mutation(api.funcs.wallet.createWallet, data);

    return {
      success: true,
      message: "Wallet created successfully",
    };
  } catch (error) {
    console.error("Error registering new user", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
