"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";
import { api } from "#/convex/_generated/api";
import type { Id } from "#/convex/_generated/dataModel";
import type { Doc } from "#/convex/_generated/dataModel";
import { logout } from "#/server/actions/user-actions";

type WalletContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: Id<"users"> | null;
  userWallets: Doc<"wallets">[] | null;
  logout: () => Promise<void>;
};

const defaultContext: WalletContextType = {
  isAuthenticated: false,
  isLoading: true,
  userId: null,
  userWallets: null,
  logout: logout,
};

export const WalletContext = createContext<WalletContextType>(defaultContext);

export const useWallet = () => useContext(WalletContext);

type WalletProviderProps = {
  children: ReactNode;
};

type SessionReturnType = {
  user: Doc<"users"> | null;
  session: {
    isAuth: boolean;
    userId: Id<"users">;
  } | null;
};

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [userWallets, setUserWallets] = useState<Doc<"wallets">[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    const verifySession = async () => {
      try {
        // Check for session cookie
        const response = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const sessionData = (await response.json()) as SessionReturnType;

        if (sessionData.session?.userId) {
          setUserId(sessionData.session?.userId);
          setIsAuthenticated(true);

          // Fetch user wallets
          const wallets = await convex.query(
            api.funcs.wallet.getWalletsByUser,
            {
              userId: sessionData.session?.userId,
            },
          );

          setUserWallets(wallets || []);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Failed to verify session:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    void verifySession();
  }, []);

  const value = {
    isAuthenticated,
    isLoading,
    userId,
    userWallets,
    logout,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export default WalletProvider;
