"use client";

import React, { useState, useMemo } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

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
    amount:3000,
    locale: "en-US",
    name: "Tether",
  },
  {
    code: "USDC",
    symbol: "＄",
    amount:3000,
    locale: "en-US",
    name: "USD Coin",
  },
  { code: "DAI", symbol: "◈", amount: 500.0, locale: "en-US", name: "Dai" },
  {
    code: "BUSD",
    symbol: "฿",
    amount:3000,
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
    <div className="flex h-[40dvh] w-full flex-col items-center justify-center gap-6 p-4">
      <div className="flex flex-col items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="min-w-[120px] bg-white/10 text-lg font-semibold text-white"
              aria-label="Select stablecoin"
            >
              {selectedBalance?.code ?? DEFAULT_CURRENCY}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="min-w-[120px]">
            {stableCoinBalances.map((balance) => (
              <DropdownMenuItem
                key={balance.code}
                onSelect={() => setSelectedCurrency(balance.code)}
                className={`${
                  balance.code === selectedCurrency
                    ? "bg-white/10 font-bold"
                    : ""
                } flex place-items-center items-center justify-between`}
                aria-selected={balance.code === selectedCurrency}
              >
                <div className="flex place-items-center items-center justify-between align-middle">
                  <span className="mr-2">{balance.symbol}</span>
                  {balance.code}
                </div>
                <span className="ml-2 text-xs text-white/60">
                  {balance.name}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {selectedBalance && (
          <>
            <h4 className="mt-2 text-center text-5xl font-black">
              {selectedBalance.symbol}
              {selectedBalance.amount.toLocaleString(selectedBalance.locale, {
                style: "decimal",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              <span className="ml-2 text-lg font-semibold text-white/60">
                {selectedBalance.code}
              </span>
            </h4>
            <div className="text-center text-sm font-semibold text-green-400">
              {nairaEquivalent !== null
                ? `₦${nairaEquivalent.toLocaleString("en-NG", {
                    style: "decimal",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} NGN`
                : "--"}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShowBalance;
