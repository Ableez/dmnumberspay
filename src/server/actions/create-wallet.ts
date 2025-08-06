"use server";

import {
  AccountKeypair,
  Keypair,
  StellarConfiguration,
  Wallet,
} from "@stellar/typescript-wallet-sdk";
import { Operation } from "@stellar/stellar-sdk";

/**
 * Creates a new Stellar wallet and funds it with initial balance
 * @param phoneNumber - The user's phone number to associate with the wallet
 * @returns Success or error message
 */
export const createWallet = async (): Promise<string> => {
  try {
    // Initialize Stellar wallet SDK with TestNet configuration
    const stellarWallet = new Wallet({
      stellarConfiguration: StellarConfiguration.TestNet(),
    });
    const stellarClient = stellarWallet.stellar();

    // Generate new user keypair
    const accountManager = stellarClient.account();
    const userKeypairData = accountManager.createKeypair();
    const userKeypair = new AccountKeypair(userKeypairData.keypair);

    // Get funding account keypair from environment
    const fundingKeypair = new AccountKeypair(
      Keypair.fromSecret(process.env.SOURCE_KEYPAIR_SECRET!),
    );

    // Create and build transaction to fund the new account
    const transactionBuilder = await stellarClient.transaction({
      sourceAddress: fundingKeypair,
    });

    const fundingTransaction = transactionBuilder
      .addOperation(
        Operation.createAccount({
          destination: userKeypair.publicKey,
          startingBalance: "100", // Initial balance in XLM
          source: fundingKeypair.publicKey,
        }),
      )
      .build();

    // Sign and submit the transaction
    const transactionSignature = fundingKeypair.keypair
      .sign(fundingTransaction.hash())
      .toString("base64");

    fundingTransaction.addSignature(
      fundingKeypair.publicKey,
      transactionSignature,
    );

    await stellarClient.submitTransaction(fundingTransaction);

    // TODO: Save wallet information to database with phoneNumber

    return "Wallet created successfully";
  } catch (error) {
    console.error("[createWallet] Error creating Stellar wallet:", error);
    return "Error creating wallet";
  }
};
