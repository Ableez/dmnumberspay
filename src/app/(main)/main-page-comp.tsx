"use client";

import React, { useState } from "react";
import ShowBalance from "#/components/home/balance";
import QuickActions from "#/components/home/quick-actions";
import ListWithFilter from "#/components/transactions/list-with-filter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { api } from "#/convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react";
import { Skeleton } from "#/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { IconAlertCircle, IconRefresh, IconWallet } from "@tabler/icons-react";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import { type Id } from "#/convex/_generated/dataModel";

interface WalletBalance {
  walletId: string;
  address: string;
  balances: {
    asset_type: string;
    balance: string;
  }[];
}

const HomeClientComp = () => {
  const router = useRouter();
  const [selectedWalletId, setSelectedWalletId] =
    useState<Id<"wallets"> | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get user ID from session
  const userProfile = useQuery(api.funcs.session.getSessionBySessionId, {
    sessionId:
      typeof window !== "undefined"
        ? (localStorage.getItem("sessionId") ?? "")
        : "",
  });

  const userId = userProfile?.userId;

  // Fetch wallets from Convex
  const wallets = useQuery(
    api.funcs.wallet.getWalletsByUser,
    userId ? { userId } : "skip",
  );

  // Fetch transactions for the selected wallet
  const transactions = useQuery(
    api.funcs.transactions.getTransactionsByWallet,
    selectedWalletId ? { walletId: selectedWalletId, limit: 15 } : "skip",
  );

  // Get notifications for the wallet
  const notifications = useQuery(
    api.funcs.notifications.getUserNotifications,
    userId ? { userId, limit: 3 } : "skip",
  );

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh delay (in a real app this would trigger data refresh)
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // Format wallet data for the balance component
  const formatWalletData = (): WalletBalance[] => {
    if (!wallets) return [];

    return wallets.map((wallet) => ({
      walletId: wallet._id,
      address: wallet.walletAddress,
      balances: [
        {
          asset_type: "native",
          balance: wallet.walletBalance ?? "0",
        },
      ],
    }));
  };

  // Select first wallet by default
  React.useEffect(() => {
    if (wallets && wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0]!._id);
    }
  }, [wallets, selectedWalletId]);

  // Auth redirect
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [authLoading, isAuthenticated, router]);

  // Handle authentication state
  if (authLoading) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    return null;
  }

  // Format wallet balance data
  const walletBalances = formatWalletData();

  const hasRecentNotifications =
    notifications?.page.length && notifications.page.length > 0;

  return (
    <div className="min-h-screen pb-32">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-9 w-9 rounded-full"
        >
          <IconRefresh
            size={20}
            className={cn("text-white/70", refreshing && "animate-spin")}
          />
        </Button>
      </div>

      {/* Balance section */}
      {wallets ? (
        wallets.length > 0 ? (
          <ShowBalance walletBalances={walletBalances} />
        ) : (
          <div className="m-4 flex flex-col items-center justify-center rounded-xl bg-slate-800/20 p-8">
            <IconWallet size={48} className="mb-3 text-white/40" />
            <h3 className="mb-1 text-lg font-semibold">No Wallets Found</h3>
            <p className="mb-4 text-center text-sm text-white/60">
              You don't have any wallets connected yet.
            </p>
            <Button onClick={() => router.push("/add")}>Add Wallet</Button>
          </div>
        )
      ) : (
        <div className="flex animate-pulse flex-col items-center gap-3 p-6">
          <Skeleton className="h-14 w-3/4 rounded-lg bg-slate-700/30" />
          <Skeleton className="h-8 w-2/5 rounded-lg bg-slate-700/30" />
          <Skeleton className="h-6 w-1/2 rounded-lg bg-slate-700/30" />
        </div>
      )}

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent notifications */}
      {hasRecentNotifications && (
        <div className="my-4 px-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Notifications</h2>
            <Button
              variant="link"
              className="text-sm text-blue-400"
              onClick={() => router.push("/notifications")}
            >
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {notifications?.page.slice(0, 3).map((notification) => (
              <div
                key={notification._id}
                className="flex cursor-pointer items-start gap-3 rounded-lg bg-slate-800/30 p-3 transition-colors hover:bg-slate-800/50"
                onClick={() => router.push("/notifications")}
              >
                <div className="mt-1 rounded-full bg-slate-700 p-2">
                  <IconAlertCircle size={16} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">{notification.title}</h3>
                  <p className="line-clamp-2 text-xs text-white/70">
                    {notification.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions section */}
      <div className="my-4 w-full px-4">
        <Tabs defaultValue="crypto" className="w-full">
          <TabsList className="mb-2 flex w-fit items-center justify-start !bg-transparent">
            <TabsTrigger
              value="crypto"
              className="w-full pb-2.5 font-medium text-white/50 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:pb-2 data-[state=active]:text-white data-[state=inactive]:hover:text-white/80"
            >
              Crypto
            </TabsTrigger>
            <TabsTrigger
              value="nfts"
              className="w-full pb-2.5 font-medium text-white/50 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:pb-2 data-[state=active]:text-white data-[state=inactive]:hover:text-white/80"
            >
              NFTs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crypto">
            {selectedWalletId ? (
              transactions ? (
                transactions.page.length > 0 ? (
                  <ListWithFilter
                    transactions={formatTransactionsForUI(transactions.page)}
                    isRealTransactions={true}
                  />
                ) : (
                  <EmptyTransactions />
                )
              ) : (
                <TransactionsLoading />
              )
            ) : (
              <div className="flex h-32 items-center justify-center text-white/60">
                No wallet selected
              </div>
            )}

            {transactions?.continueCursor && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    /* Implement pagination */
                  }}
                >
                  Load More
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="nfts">
            <div className="flex h-32 items-center justify-center text-white/60">
              No NFTs found
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Helper components
const LoadingState = () => (
  <div className="flex min-h-screen flex-col gap-6 p-4">
    <Skeleton className="mx-auto h-14 w-3/4 rounded-lg bg-slate-700/30" />
    <Skeleton className="mx-auto h-8 w-1/2 rounded-lg bg-slate-700/30" />

    <div className="mt-6 grid grid-cols-4 gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg bg-slate-700/30" />
      ))}
    </div>

    <div className="mt-6 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg bg-slate-700/30" />
      ))}
    </div>
  </div>
);

const EmptyTransactions = () => (
  <div className="flex flex-col items-center justify-center py-10">
    <div className="mb-3 rounded-full bg-slate-800/30 p-4">
      <IconWallet size={24} className="text-white/40" />
    </div>
    <h3 className="mb-1 text-base font-medium">No Transactions Yet</h3>
    <p className="mb-4 max-w-xs text-center text-sm text-white/60">
      Start using your wallet to see transaction history here
    </p>
  </div>
);

const TransactionsLoading = () => (
  <div className="space-y-3">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex animate-pulse items-center gap-3 p-3">
        <Skeleton className="h-10 w-10 rounded-full bg-slate-700/30" />
        <div className="flex-1">
          <Skeleton className="mb-2 h-4 w-1/2 rounded-lg bg-slate-700/30" />
          <Skeleton className="h-3 w-3/4 rounded-lg bg-slate-700/30" />
        </div>
        <Skeleton className="h-6 w-20 rounded-lg bg-slate-700/30" />
      </div>
    ))}
  </div>
);

// Helper function to format transactions for the UI component
function formatTransactionsForUI(transactions: any[]): any[] {
  return transactions.map((tx) => ({
    id: tx._id,
    hash: tx.txHash || tx._id,
    created_at: tx.timestamp || tx.createdAt || Date.now(),
    amount: tx.amount,
    source_account: tx.fromAddress || "",
    fee_charged: tx.fee || "0",
    successful: tx.status === "CONFIRMED",
    ledger: 0, // Default value
    memo: tx.memo || "",
    signatures: [],
    // Add any other required fields
  }));
}

export default HomeClientComp;
