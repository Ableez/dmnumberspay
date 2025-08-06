"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { IconCaretDown } from "@tabler/icons-react";
import { toast } from "sonner";

interface WalletBalanceData {
  walletId: string;
  address: string;
  balances: {
    asset_type: string;
    balance: string;
  }[];
}

interface ShowBalanceProps {
  walletBalances: WalletBalanceData[];
}

const COIN_SYMBOLS: Record<string, string> = {
  native: "✹",
  USDT: "₮",
  USDC: "＄",
};

// Helper function to truncate wallet address
const truncateAddress = (address: string): string => {
  if (!address) return "";
  return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
};

// Helper function to format numbers with commas
const formatNumberWithCommas = (value: number | string): string => {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(typeof value === 'string' ? parseFloat(value) : value);
};

const ShowBalance: React.FC<ShowBalanceProps> = ({ walletBalances }) => {
  const [selectedWalletIndex, setSelectedWalletIndex] = useState(0);

  // Check if we have any wallets with balances
  if (!walletBalances || walletBalances.length === 0) {
    return (
      <div className="flex w-full flex-col items-center justify-center rounded-xl p-6 shadow-lg">
        <div className="text-white">No wallet balances available</div>
      </div>
    );
  }

  const selectedWallet =
    walletBalances[selectedWalletIndex] ?? walletBalances[0]!;
  const nativeBalance =
    selectedWallet.balances?.find((b) => b.asset_type === "native")?.balance ??
    "0";

  // Get truncated address
  const truncatedAddress = truncateAddress(selectedWallet.address);
  
  // Format the XLM balance
  const formattedXLM = formatNumberWithCommas(nativeBalance);
  
  // Calculate and format the NGN equivalent
  const ngnValue = parseFloat(nativeBalance) * 1480 * 0.11;
  const formattedNGN = formatNumberWithCommas(ngnValue);

  return (
    <div className="flex w-full flex-col items-center justify-center p-6 shadow-lg">
      <div className="flex flex-col items-center gap-3">
        <h4 className="text-center text-4xl font-bold text-white flex items-start gap-1">
          {COIN_SYMBOLS.native} {formattedXLM} <span className={"text-sm"}>XLM</span>
        </h4>

        <div className="mb-3 text-center text-sm font-semibold text-green-400">
          ₦{formattedNGN} NGN
        </div>

        <button
          onClick={() => {
            void navigator.clipboard.writeText(selectedWallet.address);
            toast.success("Copied to clipboard");
          }}
          className="mb-2 cursor-pointer rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/70 duration-300 ease-in-out hover:bg-white/20"
        >
          {truncatedAddress}
        </button>

        {walletBalances.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex min-w-[140px] items-center justify-between border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <span>{truncatedAddress}</span>
                <IconCaretDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              className="min-w-[180px] border-slate-700 bg-slate-800"
            >
              {walletBalances.map((wallet, index) => (
                <DropdownMenuItem
                  key={wallet.walletId}
                  onSelect={() => setSelectedWalletIndex(index)}
                  className={`${
                    index === selectedWalletIndex
                      ? "bg-white/10 font-medium"
                      : ""
                  } flex cursor-pointer items-center justify-between py-2 hover:bg-white/5`}
                >
                  <div className="flex items-center">
                    <span>{truncateAddress(wallet.address)}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default ShowBalance;