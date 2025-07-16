"use client";

import { Button } from "#/components/ui/button";
import { createAuthChallenge } from "#/server/actions/wallet";
import React, { useState } from "react";
import { Loader2 } from "lucide-react";

type Props = {
  phoneNumber: string;
};

const CreateWalletBtn = ({ phoneNumber }: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const generatePasskey = async () => {
    try {
      setIsLoading(true);

      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error("WebAuthn is not supported in this browser");
      }

      // Generate a random user ID
      const userId = crypto.randomUUID();
      const encodedUserId = btoa(userId);

      // Create PublicKey credential options
      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions =
        {
          challenge: Uint8Array.from(
            Array.from(crypto.getRandomValues(new Uint8Array(32))).map(
              (byte) => byte,
            ),
          ),
          rp: {
            name: "NumbersPay",
            id: window.location.hostname,
          },
          user: {
            id: Uint8Array.from(userId, (c) => c.charCodeAt(0)),
            name: phoneNumber,
            displayName: `User ${phoneNumber.slice(0, 3)}****${phoneNumber.slice(-4)}`,
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 }, // ES256
            { type: "public-key", alg: -257 }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            residentKey: "required",
          },
          timeout: 60000,
          attestation: "direct",
        };

      // Create the credential
      const credential = (await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      })) as PublicKeyCredential;

      // Get the attestation response
      const response = credential.response as AuthenticatorAttestationResponse;

      // Convert ArrayBuffer to Base64
      const publicKeyBase64 = btoa(
        String.fromCharCode(
          ...new Uint8Array(response.getPublicKey() ?? new ArrayBuffer(0)),
        ),
      );

      const passkeyId = btoa(
        String.fromCharCode(...new Uint8Array(credential.rawId)),
      );

      // Register the wallet with the generated passkey
      // await registerNewUserWallet({
      //   passkeyId,
      //   publicKey: publicKeyBase64,
      //   userId: encodedUserId,
      // });
      await createAuthChallenge(publicKeyBase64);
    } catch (error) {
      console.error("Failed to create passkey:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={() => void generatePasskey()}
      className="mb-3 w-full bg-indigo-500! py-3 text-white!"
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating secure wallet...
        </span>
      ) : (
        `Continue with ${phoneNumber.slice(0, 3)}****${phoneNumber.slice(-4)}`
      )}
    </Button>
  );
};

export default CreateWalletBtn;
