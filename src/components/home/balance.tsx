"use client";

import React, { useState, useMemo } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { IconCaretDown, IconWallet } from "@tabler/icons-react";

type StableCoinCode = "USDT" | "USDC" | "DAI" | "BUSD";

type StableCoinBalance = {
  code: StableCoinCode;
  symbol: string;
  amount: number;
  locale: string;
  name: string;
};

const stableCoinBalances: ReadonlyArray<StableCoinBalance> = [
  {
    code: "USDT",
    symbol: "₮",
    amount: 1250.75,
    locale: "en-US",
    name: "Tether",
  },
  {
    code: "USDC",
    symbol: "＄",
    amount: 985.50,
    locale: "en-US",
    name: "USD Coin",
  },
  { code: "DAI", symbol: "◈", amount: 325.25, locale: "en-US", name: "Dai" },
  {
    code: "BUSD",
    symbol: "฿",
    amount: 750.80,
    locale: "en-US",
    name: "Binance USD",
  },
];

const DEFAULT_CURRENCY: StableCoinCode = "USDT";

// Mock conversion rates as of June 2024 (approximate, for demo purposes)
const NAIRA_CONVERSION_RATES: Record<StableCoinCode, number> = {
  USDT: 1480,
  USDC: 1475,
  DAI: 1460,
  BUSD: 1450,
};

const convertToNaira = (code: StableCoinCode, amount: number): number => {
  const rate = NAIRA_CONVERSION_RATES[code];
  return amount * rate;
};

const ShowBalance: React.FC = () => {
  const [selectedCurrency, setSelectedCurrency] =
    useState<StableCoinCode>(DEFAULT_CURRENCY);

  const selectedBalance = useMemo<StableCoinBalance | undefined>(
    () => stableCoinBalances.find((b) => b.code === selectedCurrency),
    [selectedCurrency],
  );

  const nairaEquivalent = useMemo<number | null>(() => {
    if (!selectedBalance) return null;
    return convertToNaira(selectedBalance.code, selectedBalance.amount);
  }, [selectedBalance]);

  return (
    <div className="flex h-[40dvh] w-full flex-col items-center justify-center rounded-xl bg-gradient-to-b from-[#410D8C] via-[#410D8C66] to-transparent shadow-lg p-6">
      <div className="flex flex-col items-center gap-3">
        {selectedBalance && (
          <h4 className="text-center text-4xl font-bold text-white">
            {selectedBalance.symbol}
            {selectedBalance.amount.toLocaleString(selectedBalance.locale, {
              style: "decimal",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h4>
        )}
        
        <div className="text-center text-sm text-green-400 mb-3 font-semibold">
          {nairaEquivalent !== null
            ? `₦${nairaEquivalent.toLocaleString("en-NG", {
                style: "decimal",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} NGN`
            : "--"}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="min-w-[140px] flex items-center justify-between bg-white/5 border-white/10 text-white hover:bg-white/10"
              aria-label="Select stablecoin"
            >
              <span className="flex items-center">
                <span className="mr-2">{selectedBalance?.symbol}</span>
                {selectedBalance?.code}
              </span>
              <IconCaretDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="min-w-[180px] bg-slate-800 border-slate-700">
            {stableCoinBalances.map((balance) => (
              <DropdownMenuItem
                key={balance.code}
                onSelect={() => setSelectedCurrency(balance.code)}
                className={`${
                  balance.code === selectedCurrency
                    ? "bg-white/10 font-medium"
                    : ""
                } flex items-center justify-between py-2 cursor-pointer hover:bg-white/5`}
                aria-selected={balance.code === selectedCurrency}
              >
                <div className="flex items-center">
                  <span className="mr-2 text-lg">{balance.symbol}</span>
                  <span>{balance.code}</span>
                </div>
                <span className="text-xs text-white/60">
                  {balance.amount.toLocaleString(balance.locale, {
                    style: "decimal",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ShowBalance;
