"use server";

import { env } from "#/env";
import { Client, Contract, networks } from "numberspay_uwallet";
import { TransactionBuilder } from "stellar-sdk";

interface PasskeyCredential {
  id: string;
  publicKey: string;
  createdAt: number;
}

const deployWalletContract = async () => {
  const {
    NEXT_PUBLIC_WALLET_WASM_HASH,
    NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE,
    NEXT_PUBLIC_STELLAR_RPC_URL,
  } = env;

  if (
    !NEXT_PUBLIC_WALLET_WASM_HASH ||
    !NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ||
    !NEXT_PUBLIC_STELLAR_RPC_URL
  ) {
    throw new Error("Missing environment variables");
  }

  try {
    const contract = await Client.deploy({
      networkPassphrase: NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE,
      wasmHash: Buffer.from(NEXT_PUBLIC_WALLET_WASM_HASH),
      rpcUrl: NEXT_PUBLIC_STELLAR_RPC_URL,
    });

    console.log("CONTRACT RESULT", contract);

    return contract;
  } catch (error) {
    console.error("Error deploying contract:", error);
    return null;
  }
};

const initializeWallet = async (
  contractAddress: string,
  passkey: PasskeyCredential,
  dailyLimit?: number,
) => {
  const client = new Client({
    contractId: contractAddress,
    networkPassphrase: env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE,
    rpcUrl: env.NEXT_PUBLIC_STELLAR_RPC_URL,
  });

  if (!dailyLimit || dailyLimit < 0 || !passkey.id || !passkey.publicKey) {
    throw new Error("Invalid parameters");
  }

  const ctx = await client.initialize({
    daily_limit: BigInt(dailyLimit),
    passkey_id: Buffer.from(passkey.id),
    public_key: Buffer.from(passkey.publicKey),
  });

  console.log("\nCTX: ", ctx);

  return ctx.toJSON();
};
export const registerUser = async (formData: FormData) => {
  // Extract data from form
  const phoneNumber = formData.get("phone") as string;
  const passkeyId = formData.get("passkeyId") as string;
  const publicKey = formData.get("publicKey") as string;

  if (!passkeyId || !publicKey) {
    throw new Error("Missing passkey credentials");
  }

  // Generate a unique user ID
  const userId = crypto.randomUUID();

  // Use the passkey from the client
  const passkey: PasskeyCredential = {
    id: passkeyId,
    publicKey: publicKey,
    createdAt: Date.now(),
  };

  // Set default daily limit
  const dailyLimit = 1000; // Default daily limit

  const contractAddress =
    "CD3Z5C3PAF4IUYTKYYI2CB6VGQARX4B244EL7KWIRK5CHR6ODG55WDGA";

  const called = await contract.call(
    "deploy",
    passkey.i,
    passkey.publicKey,
    dailyLimit,
  );

  console.log("\nCALLED", called);

  console.log("CONTRACT ADDRESS", contractAddress);

  const initializeResult = await initializeWallet(
    contractAddress,
    passkey,
    dailyLimit,
  );

  console.log("INITIALIZE RESULT", initializeResult);

  return {
    id: userId,
    phoneNumber,
    walletAddress: contractAddress,
    passkeyId: passkey.id,
    createdAt: new Date(),
  };
};
