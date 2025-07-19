"use client";

import { Button } from "#/components/ui/button";
import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import base64url from "base64url";
import { getPublicKeys } from "#/lib/webauthn";
import { handleDeploy } from "#/lib/deploy";
import { Keypair } from "stellar-sdk";

type Props = {
  phoneNumber: string;
  nextStep: () => void;
};

const CreateWalletBtn = ({ phoneNumber, nextStep }: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [step, setStep] = useState(0);
  const [bundlerKey] = useState(() =>
    Keypair.fromSecret(
      "SBO62ZAYZACF6QIV2JMNXZK464VLD3L3U27SKGZEEI7FPUFRUU6MYQ4M",
    ),
  );

  const [isLoadingSign, setIsLoadingSign] = useState(false);

  const onRegister = async (type?: "signin") => {
    // if (!type && step > 0) {
    //   setIsLoading(true);
    //   try {
    //     // Move to next step if already registered
    //     step++;
    //   } finally {
    //     setIsLoading(false);
    //   }
    //   return;
    // }

    console.log("Starting onRegister function", { type, phoneNumber });
    setIsLoading(true);
    try {
      if (type === "signin") {
        console.log("Signin flow initiated");
        alert("SIGNIN");
        // Sign in with existing passkey
        console.log("Checking platform authenticator availability");
        const signRes =
          await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        console.log("Platform authenticator available:", signRes);

        if (!signRes) {
          console.error("WebAuthn not supported on this device");
          throw new Error("WebAuthn is not supported on this device");
        }

        console.log("Requesting credential from navigator");
        const credential = (await navigator.credentials.get({
          publicKey: {
            challenge: new Uint8Array(base64url.toBuffer("createchallenge")),
            userVerification: "discouraged",
          } as PublicKeyCredentialRequestOptions,
        })) as PublicKeyCredential;
        console.log("Credential received:", credential.id);

        const credentialId = credential.id;
        localStorage.setItem("sp:id", credentialId);
        console.log("Credential ID saved to localStorage", { credentialId });

        // Get contract salt from credential ID
        console.log("Extracting public keys from credential");
        const { contractSalt } = await getPublicKeys({
          id: credentialId,
          response: {
            attestationObject: base64url.encode(
              Buffer.from(
                (credential.response as AuthenticatorAttestationResponse)
                  .attestationObject,
              ),
            ),
          },
        });
        console.log("Contract salt extracted:", contractSalt);

        console.log("Deploying contract with bundler key and salt");
        const deployeeAddress = await handleDeploy(bundlerKey, contractSalt);
        console.log("DEPLOYEE ADDRESS", deployeeAddress);
        localStorage.setItem("sp:deployee", deployeeAddress);
        console.log("Deployee address saved to localStorage", {
          deployeeAddress,
        });
      } else {
        console.log("Register flow initiated");
        alert("REGISTER");
        // Register new passkey
        console.log("Checking platform authenticator availability");
        const supported =
          await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        console.log("Platform authenticator available:", supported);

        if (!supported) {
          console.error("WebAuthn not supported on this device");
          throw new Error("WebAuthn is not supported on this device");
        }

        console.log("Creating new credential");
        const credential = (await navigator.credentials.create({
          publicKey: {
            challenge: new Uint8Array(base64url.toBuffer("createchallenge")),
            rp: {
              name: "NumberpayWallet",
            },
            user: {
              id: new Uint8Array(base64url.toBuffer("ableez")),
              name: "Numberspay Wallet",
              displayName: "Numberspay Wallet",
            },
            authenticatorSelection: {
              requireResidentKey: false,
              residentKey: "discouraged",
              userVerification: "discouraged",
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            attestation: "none",
          } as PublicKeyCredentialCreationOptions,
        })) as PublicKeyCredential;
        console.log("Credential created:", credential.id);

        const credentialId = credential.id;
        localStorage.setItem("sp:id", credentialId);
        console.log("Credential ID saved to localStorage", { credentialId });

        // Get public key and contract salt from credential
        console.log("Extracting public keys and salt from credential");
        const { contractSalt, publicKey } = await getPublicKeys({
          id: credentialId,
          response: {
            attestationObject: base64url.encode(
              Buffer.from(
                (credential.response as AuthenticatorAttestationResponse)
                  .attestationObject,
              ),
            ),
          },
        });
        console.log("Extracted data:", {
          contractSaltExists: !!contractSalt,
          publicKeyExists: !!publicKey,
        });

        if (!publicKey) {
          console.error("Failed to extract public key from credential");
          throw new Error("Failed to extract public key from credential");
        }

        console.log(
          "Deploying contract with bundler key, salt, and public key",
        );
        const deployeeAddress = await handleDeploy(
          bundlerKey,
          contractSalt,
          publicKey,
        );
        console.log("Deployment successful, address:", deployeeAddress);
        localStorage.setItem("sp:deployee", deployeeAddress);
        console.log("Deployee address saved to localStorage", {
          deployeeAddress,
        });
      }

      console.log("Registration/signin completed successfully");
      // Move to next step after successful registration/signin
      // step++;
    } catch (error) {
      console.error("Error in onRegister:", error);
      console.log("Stringified error:", JSON.stringify(error));
    } finally {
      console.log("Finishing onRegister function, setting isLoading to false");
      setIsLoading(false);
    }
  };
  // const onSign = async () => {
  //   try {
  //     setIsLoadingSign(true);

  //     const { authTxn, authHash, lastLedger } = await handleVoteBuild(
  //       bundlerKey,
  //       localStorage.getItem("sp:deployee") || "",
  //       choice === "chicken",
  //     );

  //     const signRes = await navigator.credentials.get({
  //       publicKey: {
  //         challenge: base64url.toBuffer(authHash),
  //         rpId: window.Capacitor?.isNativePlatform?.()
  //           ? "passkey.sorobanbyexample.org"
  //           : undefined,
  //         allowCredentials: localStorage.hasOwnProperty("sp:id")
  //           ? [
  //               {
  //                 id: base64url.toBuffer(localStorage.getItem("sp:id") || ""),
  //                 type: "public-key",
  //               },
  //             ]
  //           : undefined,
  //         userVerification: "discouraged",
  //       },
  //     });

  //     await handleVoteSend(bundlerKey, authTxn, lastLedger, signRes);
  //     await onVotes();
  //     setStep((prevStep) => prevStep + 1);
  //   } catch (error) {
  //     console.error(error);
  //     alert(JSON.stringify(error));
  //   } finally {
  //     setIsLoadingSign(false);
  //   }
  // };

  return (
    <Button
      // onClick={async () => void (await onRegister())}
      onClick={() => nextStep()}
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
