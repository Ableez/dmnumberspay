/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import "server-only";

import { env } from "#/env";
import { DfnsApiClient } from "@dfns/sdk";
import { AsymmetricKeySigner } from "@dfns/sdk-keysigner";

const signer = new AsymmetricKeySigner({
  privateKey: env.DFNS_PRIVATE_KEY,
  credId: env.DFNS_CRED_ID,
});

const dfnsClient = new DfnsApiClient({
  orgId: env.DFNS_ORG_ID,
  authToken: env.DFNS_AUTH_TOKEN,
  signer,
});

export const createDFNSWallet = async (phoneNumber: string) => {
  try {
    const walletId = await dfnsClient.wallets.createWallet({
      body: {
        network: "StellarTestnet",
        externalId: phoneNumber,
        name: phoneNumber,
      },
    });

    if (walletId.address) {
      try {
        const response = await fetch(
          `https://friendbot.stellar.org?addr=${encodeURIComponent(walletId.address)}`,
        );

        const respJson = (await response.json()) as { status: string };

        console.log("FUNDING WALLET WITH FRIENDBOT RESPONSE", respJson);
      } catch (error) {
        console.error("ERROR FUNDING WALLET WITH FRIENDBOT", error);
      }
    }

    return walletId;
  } catch (error) {
    console.error("DFNS ERROR CREATING WALLET", error);
  }
};
