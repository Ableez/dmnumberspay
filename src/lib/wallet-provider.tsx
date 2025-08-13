"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { arbitrum } from "viem/chains";
import { env } from "#/env";

export default function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivyProvider
      appId={env.NEXT_PUBLIC_PRIVY_APP_ID}
      clientId={env.NEXT_PUBLIC_PRIVY_CLIENT_ID}
      config={{
        defaultChain: arbitrum,
        supportedChains: [arbitrum],
        loginMethods: ["passkey", "email"],
        embeddedWallets: {
          createOnLogin: "all-users",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
