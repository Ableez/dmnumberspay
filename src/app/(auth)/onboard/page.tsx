import React from "react";
import { Button } from "#/components/ui/button";
import { cookies } from "next/headers";
import type { Doc } from "#/convex/_generated/dataModel";
import CreateWalletBtn from "./create-wallet-btn";
import { redirect } from "next/navigation";

type WalletFeature = {
  icon: string;
  title: string;
  description: string;
};
const features: WalletFeature[] = [
  {
    icon: "🔄",
    title: "Seamless setup",
    description: "Create a wallet using just your phone number6",
  },
  {
    icon: "🔒",
    title: "Enhanced security",
    description: "Your wallet is secured by your passkey, and a 6-digit PIN.",
  },
  {
    icon: "❤️",
    title: "Easy recovery",
    description:
      "Recover access to your wallet with your Google or Apple account and a 4-digit PIN",
  },
];

const OnboardPage = async () => {
  const cookieStore = (await cookies()).get("user_session");
  const userData = cookieStore?.value
    ? (JSON.parse(cookieStore?.value) as Doc<"users">)
    : null;
  console.log("userData", userData);

  if (!userData) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-white">
      <div className="flex w-full max-w-md flex-col items-center">
        <div className="relative mb-4 h-24 w-44 rounded-3xl bg-white/5 p-8"></div>

        <h1 className="mb-1 text-4xl font-bold">Add a Wallet</h1>
        <p className="mb-6 text-base text-neutral-400">
          Login or Import an existing wallet
        </p>

        <div className="mb-6 grid w-full space-y-4 py-5">
          {features.map((feature, index) => (
            <div
              key={index}
              className="grid w-full grid-cols-5 items-start gap-8 py-2 pr-4"
            >
              <div className="col-span-1 flex place-items-center justify-center py-2 align-middle text-3xl">
                {feature.icon}
              </div>
              <div className={"col-span-4"}>
                <h3 className="text-lg font-medium">{feature.title}</h3>
                <p className="pr-3 font-medium text-neutral-400">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <CreateWalletBtn phoneNumber={"+919876543210"} />
        <Button variant={"ghost"} className="w-full text-base text-indigo-400">
          I already have a wallet
        </Button>
      </div>
    </div>
  );
};

export default OnboardPage;
