"use client";

import { Button } from "#/components/ui/button";
import {
  authenticateUser,
  createUserInDB,
} from "#/server/actions/user-actions";
import { useState } from "react";
import { toast } from "sonner";
import {
  startRegistration,
  type PublicKeyCredentialCreationOptionsJSON,
  type RegistrationCredential,
} from "@simplewebauthn/browser";
import { useRouter } from "next/navigation";
import { IconLoader } from "@tabler/icons-react";
import { useCreateWallet, type Wallet } from "@privy-io/react-auth";

type Stage =
  | "creating_passkey"
  | "creating_user_data"
  | "creating_wallet"
  | "wallet_created"
  | "prepping_onboard"
  | "idle";

export function CreateWalletButton({
  setStage,
}: {
  setStage: (s: Stage) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { createWallet: createPrivyWallet } = useCreateWallet({
    onSuccess: (wallet) => {
      console.log("CREATED PRIVATE WALLET", wallet);
    },
    onError: (error) => {
      console.error("ERROR CREATING PRIVATE WALLET", error);
    },
  });

  const generatePasskey = async (): Promise<{
    signature: Buffer<ArrayBuffer>;
    credentialId: string;
  } | null> => {
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const options = {
        challenge: Buffer.from(challenge).toString("base64"),
        rp: {
          name: "NBS Wallet",
        },
        user: {
          id: Buffer.from(crypto.randomUUID()).toString("base64"),
          name: "wallet-user",
          displayName: "Wallet User",
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 }, // RS256
        ],
        timeout: 60000,
        attestation: "direct",
      };

      const credential = await startRegistration({
        optionsJSON:
          options as unknown as PublicKeyCredentialCreationOptionsJSON,
      });

      const credentialId = credential.id;
      const signature = Buffer.from(
        (credential as unknown as RegistrationCredential).response
          .attestationObject,
      );

      return {
        signature,
        credentialId,
      };
    } catch (error) {
      return null;
    }
  };

  return (
    <Button
      className="relative w-full"
      variant={"primary"}
      onClick={async () => {
        setStage("creating_wallet");
        setIsLoading(true);
        try {
          setStage("creating_user_data");
          const newUser = await createUserInDB();

          const passkey = await generatePasskey();
          setStage("creating_passkey");
          if (!passkey) {
            throw new Error("Failed to generate passkey");
          }

          if (!newUser?._id) {
            throw new Error("User ID is undefined");
          }

          const signatureBuffer = Buffer.from(passkey.signature);

          console.log("SIGNATURE BUFFER", signatureBuffer);

          setStage("creating_wallet");

          // DEPRECATED Stellar wallets
          // await createWalletForUser(
          //   newUser._id,
          //   signatureBuffer.toString("base64"),
          //   passkey.credentialId,
          // );

          

          const newWallet = await createPrivyWallet();

          console.log("NEW WALLET", newWallet);

          // await authenticateUser({ userId: newUser._id });
          setStage("idle");

          // setTimeout(() => {
          //   router.push("/onboard");
          // }, 1300);

          // setStage("wallet_created");
          toast.success("Wallet created successfully");
        } catch (error) {
          toast.error("Error creating wallet");
        } finally {
          setIsLoading(false);
        }
      }}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <span className="loading loading-dots loading-sm">
            <IconLoader className="animate-spin" size={20} />
          </span>
        </span>
      ) : (
        "Create a new wallet"
      )}
    </Button>
  );
}
