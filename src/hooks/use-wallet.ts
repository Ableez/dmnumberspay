import { useContext, useCallback, useState } from "react";

import { api } from "#/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { WalletContext } from "#/lib/wallet-provider";
import type { Id, Doc } from "#/convex/_generated/dataModel";

type WalletDetails = {
  balance: number;
  address: string;
  walletType: string;
};

type TransactionHistory = {
  pending: Doc<"transactions">[];
  completed: Doc<"transactions">[];
};

export function useWallet() {
  // Get base wallet context
  const context = useContext(WalletContext);

  // Add local state for wallet operations
  const [activeWalletId, setActiveWalletId] = useState<Id<"wallets"> | null>(
    null,
  );
  const [isTransacting, setIsTransacting] = useState(false);

  // Add Convex mutations
  const createWallet = useMutation(api.funcs.wallet.createWallet);
  const updateWallet = useMutation(api.funcs.wallet.updateWallet);
  //   const transferFunds = useMutation(api.funcs.wallet.transferFunds);

  // Fetch active wallet data if an ID is set
  const activeWallet = useQuery(
    api.funcs.wallet.getWallet,
    activeWalletId ? { walletId: activeWalletId } : "skip",
  );

  // Fetch transaction history for active wallet
  const transactions = useQuery(
    api.funcs.transactions.getTransactionsByWallet,
    activeWalletId ? { walletId: activeWalletId } : "skip",
  );

  // Find and set primary wallet as active
  const selectPrimaryWallet = useCallback(() => {
    if (!context.userWallets) return;

    const primaryWallet = context.userWallets.find(
      (wallet) => wallet.isPrimary,
    );
    if (primaryWallet) {
      setActiveWalletId(primaryWallet._id);
      return primaryWallet;
    }

    // If no primary wallet, use the first one
    if (context.userWallets.length > 0) {
      setActiveWalletId(context.userWallets[0]._id);
      return context.userWallets[0];
    }

    return null;
  }, [context.userWallets]);

  // Select a specific wallet by ID
  const selectWallet = useCallback((walletId: Id<"wallets">) => {
    setActiveWalletId(walletId);
  }, []);

  // Create a new wallet
  const createNewWallet = useCallback(
    async (walletType: string) => {
      if (!context.userId) return null;

      try {
        const newWalletId = await createWallet({
          userId: context.userId,
          walletType,
          isPrimary: context.userWallets?.length === 0, // Make primary if first wallet
        });

        return newWalletId;
      } catch (error) {
        console.error("Failed to create wallet:", error);
        return null;
      }
    },
    [context.userId, context.userWallets, createWallet],
  );

  // Send funds to another wallet
  const sendFunds = useCallback(
    async (
      toAddress: string,
      amount: number,
      tokenAddress: string = "native",
    ) => {
      if (!activeWalletId) return false;

      try {
        setIsTransacting(true);

        await transferFunds({
          fromWalletId: activeWalletId,
          toAddress,
          amount,
          tokenAddress,
        });

        return true;
      } catch (error) {
        console.error("Transfer failed:", error);
        return false;
      } finally {
        setIsTransacting(false);
      }
    },
    [activeWalletId],
  );

  // Get transaction history organized by status
  const getTransactionHistory = useCallback((): TransactionHistory => {
    if (!transactions) {
      return { pending: [], completed: [] };
    }

    return {
      pending: transactions.filter((tx) => !tx.txHash),
      completed: transactions.filter((tx) => !!tx.txHash),
    };
  }, [transactions]);

  // Get formatted wallet details
  const getWalletDetails = useCallback((): WalletDetails | null => {
    if (!activeWallet) return null;

    return {
      balance: activeWallet.balance,
      address: activeWallet.address,
      walletType: activeWallet.walletType,
    };
  }, [activeWallet]);

  // Make a wallet the primary one
  const makePrimary = useCallback(
    async (walletId: Id<"wallets">) => {
      if (!context.userWallets) return false;

      try {
        // Update current primary to not primary
        const currentPrimary = context.userWallets.find((w) => w.isPrimary);
        if (currentPrimary) {
          await updateWallet({
            walletId: currentPrimary._id,
            isPrimary: false,
          });
        }

        // Set new primary
        await updateWallet({
          walletId,
          isPrimary: true,
        });

        return true;
      } catch (error) {
        console.error("Failed to update primary wallet:", error);
        return false;
      }
    },
    [context.userWallets, updateWallet],
  );

  return {
    // Original context
    ...context,

    // Extended functionality
    activeWalletId,
    activeWallet,
    isTransacting,

    // Methods
    selectPrimaryWallet,
    selectWallet,
    createNewWallet,
    sendFunds,
    getTransactionHistory,
    getWalletDetails,
    makePrimary,
  };
}
