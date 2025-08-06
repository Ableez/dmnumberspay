import "server-only";

import {
  AccountKeypair,
  Keypair,
  StellarConfiguration,
  Wallet,
} from "@stellar/typescript-wallet-sdk";
import { Asset, Operation } from "@stellar/stellar-sdk";
import crypto from "crypto";
import { fetchMutation } from "convex/nextjs";
import { api } from "#/convex/_generated/api";
import type { Id } from "#/convex/_generated/dataModel";

interface EncryptedWalletData {
  encryptedPrivateKey: string;
  publicKey: string;
  salt: string;
  iv: string;
  userId: string;
  createdAt: Date;
}

interface PasskeyCredential {
  credentialId: string;
  publicKey: string;
  userId: string;
}

function deriveEncryptionKey(
  passkeySignature: ArrayBuffer,
  salt: Buffer,
): Buffer {
  return crypto.pbkdf2Sync(
    Buffer.from(passkeySignature),
    salt,
    100000,
    32,
    "sha256",
  );
}

function encryptPrivateKey(
  privateKey: string,
  encryptionKey: Buffer,
): { encrypted: string; iv: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
  cipher.setAAD(Buffer.from("nbs-wallet-v1"));

  let encrypted = cipher.update(privateKey, "utf8", "base64");
  encrypted += cipher.final("base64");

  const tag = cipher.getAuthTag();
  const finalEncrypted = encrypted + ":" + tag.toString("base64");

  return {
    encrypted: finalEncrypted,
    iv: iv.toString("base64"),
  };
}

function decryptPrivateKey(
  encryptedData: string,
  encryptionKey: Buffer,
  iv: string,
): string {
  const [encrypted, tagStr] = encryptedData.split(":");
  if (!encrypted || !tagStr) {
    throw new Error("Invalid encrypted data");
  }

  const tag = Buffer.from(tagStr, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey, iv);
  decipher.setAAD(Buffer.from("nbs-wallet-v1"));
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

export const createCustodialWallet = async (
  userId: string,
  passkeySignature: ArrayBuffer,
  passkeyCredentialId: string,
): Promise<{ success: boolean; message: string; publicKey: string | null }> => {
  try {
    const stellarWallet = new Wallet({
      stellarConfiguration: StellarConfiguration.TestNet(),
    });
    const stellarClient = stellarWallet.stellar();

    const accountManager = stellarClient.account();
    const userKeypairData = accountManager.createKeypair();
    const userKeypair = new AccountKeypair(userKeypairData.keypair);

    const salt = crypto.randomBytes(32);
    const encryptionKey = deriveEncryptionKey(passkeySignature, salt);
    const { encrypted, iv } = encryptPrivateKey(
      userKeypair.keypair.secret(),
      encryptionKey,
    );

    if (!process.env.SOURCE_KEYPAIR_SECRET) {
      throw new Error("Missing funding account secret");
    }

    const fundingKeypair = new AccountKeypair(
      Keypair.fromSecret(process.env.SOURCE_KEYPAIR_SECRET),
    );

    const transactionBuilder = await stellarClient.transaction({
      sourceAddress: fundingKeypair,
    });

    const fundingTransaction = transactionBuilder
      .addOperation(
        Operation.createAccount({
          destination: userKeypair.publicKey,
          startingBalance: "100",
          source: fundingKeypair.publicKey,
        }),
      )
      .build();

    fundingTransaction.sign(fundingKeypair.keypair);
    await stellarClient.submitTransaction(fundingTransaction);

    const walletData: EncryptedWalletData = {
      encryptedPrivateKey: encrypted,
      publicKey: userKeypair.publicKey,
      salt: salt.toString("base64"),
      iv,
      userId,
      createdAt: new Date(),
    };

    console.log("walletData", walletData);

    const createdWalletId = await fetchMutation(api.funcs.wallet.createWallet, {
      userId: userId as Id<"users">,
      walletAddress: userKeypair.publicKey,
    });

    const passkeyData: PasskeyCredential = {
      credentialId: passkeyCredentialId,
      publicKey: userKeypair.publicKey,
      userId,
    };

    await fetchMutation(api.funcs.passkeys.createPasskey, {
      userId: userId as Id<"users">,
      walletId: createdWalletId as Id<"wallets">,
      passkeyId: passkeyCredentialId,
      publicKey: userKeypair.publicKey,
      credentialId: passkeyCredentialId,
    });

    console.log("passkeyData", passkeyData);

    return {
      success: true,
      message: "Custodial wallet created with passkey recovery",
      publicKey: userKeypair.publicKey,
    };
  } catch (error) {
    console.error("[createCustodialWallet] Error:", error);
    return {
      success: false,
      message: "Error creating custodial wallet",
      publicKey: null,
    };
  }
};

export const recoverWalletAccess = async (
  userId: string,
  passkeySignature: ArrayBuffer,
  credentialId: string,
): Promise<{ success: boolean; keypair?: AccountKeypair }> => {
  try {
    const walletData = {} as EncryptedWalletData;

    if (!walletData) {
      throw new Error("Wallet not found");
    }

    const salt = Buffer.from(walletData.salt, "base64");
    const encryptionKey = deriveEncryptionKey(passkeySignature, salt);
    const privateKey = decryptPrivateKey(
      walletData.encryptedPrivateKey,
      encryptionKey,
      walletData.iv,
    );

    const keypair = Keypair.fromSecret(privateKey);
    const accountKeypair = new AccountKeypair(keypair);

    return {
      success: true,
      keypair: accountKeypair,
    };
  } catch (error) {
    console.error("[recoverWalletAccess] Error:", error);
    return { success: false };
  }
};

export const performTransaction = async (
  userId: string,
  passkeySignature: ArrayBuffer,
  credentialId: string,
  destinationAddress: string,
  amount: string,
  asset: { code: string; address: string; issuer?: string },
  memo?: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    const recovery = await recoverWalletAccess(
      userId,
      passkeySignature,
      credentialId,
    );

    if (!recovery.success || !recovery.keypair) {
      return { success: false, message: "Failed to recover wallet access" };
    }

    const stellarWallet = new Wallet({
      stellarConfiguration: StellarConfiguration.TestNet(),
    });
    const stellarClient = stellarWallet.stellar();

    const transactionBuilder = await stellarClient.transaction({
      sourceAddress: recovery.keypair,
    });

    const transaction = transactionBuilder
      .addOperation(
        Operation.payment({
          destination: destinationAddress,
          asset: new Asset(asset.code),
          amount,
          source: recovery.keypair.publicKey,
        }),
      )
      .build();

    transaction.sign(recovery.keypair.keypair);
    await stellarClient.submitTransaction(transaction);

    return {
      success: true,
      message: "Transaction completed successfully",
    };
  } catch (error) {
    console.error("[performTransaction] Error:", error);
    return {
      success: false,
      message: "Transaction failed",
    };
  }
};

export const rotatePasskey = async (
  userId: string,
  oldPasskeySignature: ArrayBuffer,
  oldCredentialId: string,
  newPasskeySignature: ArrayBuffer,
  newCredentialId: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    const recovery = await recoverWalletAccess(
      userId,
      oldPasskeySignature,
      oldCredentialId,
    );

    if (!recovery.success || !recovery.keypair) {
      return { success: false, message: "Failed to verify old passkey" };
    }

    const salt = crypto.randomBytes(32);
    const encryptionKey = deriveEncryptionKey(newPasskeySignature, salt);
    const { encrypted, iv } = encryptPrivateKey(
      recovery.keypair.keypair.secret(),
      encryptionKey,
    );

    return {
      success: true,
      message: "Passkey rotated successfully",
    };
  } catch (error) {
    console.error("[rotatePasskey] Error:", error);
    return {
      success: false,
      message: "Failed to rotate passkey",
    };
  }
};
