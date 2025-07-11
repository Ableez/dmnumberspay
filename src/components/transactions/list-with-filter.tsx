"use client";

import React, { useMemo, useState } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";
import {
  IconArrowRight,
  IconChartFunnelFilled,
  IconCheck,
  IconPlus,
  IconX,
} from "@tabler/icons-react";

interface Transaction {
  id: number;
  name: string;
  symbol: string;
  amount: string;
  value: string;
  type: "incoming" | "outgoing";
  from: {
    username: string;
    accountNumber: string;
    method: string;
  };
  date: string;
  icon: string;
}

interface FilterState {
  type: "all" | "incoming" | "outgoing";
  currency: string[];
  dateRange: "all" | "today" | "week" | "month";
  amountRange: {
    min: number;
    max: number;
  };
}

const ListWithFilter = () => {
  const [filterState, setFilterState] = useState<FilterState>({
    type: "all",
    currency: [],
    dateRange: "all",
    amountRange: { min: 0, max: 1000 },
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const transactionData: Transaction[] = useMemo(
    () => [
      {
        id: 1,
        name: "Bitcoin",
        symbol: "BTC",
        amount: "0.005 BTC",
        value: "$320.45",
        type: "incoming",
        from: {
          username: "Sarah Chen",
          accountNumber: "+1 (555) 123-4567",
          method: "transfer",
        },
        date: "Jun 12",
        icon: "₿",
      },
      {
        id: 2,
        name: "Ethereum",
        symbol: "ETH",
        amount: "0.1 ETH",
        value: "$230.78",
        type: "outgoing",
        from: {
          username: "Binance Exchange",
          accountNumber: "withdrawal",
          method: "exchange",
        },
        date: "Jun 10",
        icon: "Ξ",
      },
      {
        id: 3,
        name: "Tether",
        symbol: "USDT",
        amount: "100 USDT",
        value: "$100.00",
        type: "incoming",
        from: {
          username: "Michael Wong",
          accountNumber: "+1 (555) 987-6543",
          method: "payment",
        },
        date: "Jun 8",
        icon: "₮",
      },
    ],
    [],
  );

  const availableCurrencies = Array.from(
    new Set(transactionData.map((t) => t.symbol)),
  );

  const filteredTransactions = useMemo(() => {
    return transactionData.filter((transaction) => {
      // Filter by type
      if (filterState.type !== "all" && transaction.type !== filterState.type) {
        return false;
      }

      // Filter by currency
      if (
        filterState.currency.length > 0 &&
        !filterState.currency.includes(transaction.symbol)
      ) {
        return false;
      }

      // Filter by amount (extract numeric value from transaction.value)
      const numericValue = parseFloat(transaction.value.replace(/[$,]/g, ""));
      if (
        numericValue < filterState.amountRange.min ||
        numericValue > filterState.amountRange.max
      ) {
        return false;
      }

      return true;
    });
  }, [transactionData, filterState]);

  const resetFilters = () => {
    setFilterState({
      type: "all",
      currency: [],
      dateRange: "all",
      amountRange: { min: 0, max: 1000 },
    });
  };

  const toggleCurrency = (currency: string) => {
    setFilterState((prev) => ({
      ...prev,
      currency: prev.currency.includes(currency)
        ? prev.currency.filter((c) => c !== currency)
        : [...prev.currency, currency],
    }));
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterState.type !== "all") count++;
    if (filterState.currency.length > 0) count++;
    if (filterState.dateRange !== "all") count++;
    if (filterState.amountRange.min > 0 || filterState.amountRange.max < 1000)
      count++;
    return count;
  }, [filterState]);

  return (
    <div>
      <div className="space-y-1.5">
        <div className={"mb-2 flex items-center justify-end"}>
          <Drawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DrawerTrigger asChild>
              <button
                className={
                  "relative flex items-center justify-center gap-2 rounded-xl bg-indigo-200/5 p-2 px-4 align-middle text-indigo-600"
                }
              >
                <IconChartFunnelFilled size={16} />
                <h4>Filter</h4>
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <div className={"h-[80vh] space-y-6 overflow-y-scroll p-6"}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-xl font-bold text-white">
                    Filter Transactions
                  </h3>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    <IconX size={24} />
                  </button>
                </div>

                {/* Transaction Type Filter */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-white">
                    Transaction Type
                  </h4>
                  <div className="flex gap-2">
                    {["all", "incoming", "outgoing"].map((type) => (
                      <button
                        key={type}
                        onClick={() =>
                          setFilterState((prev) => ({
                            ...prev,
                            type: type as FilterState["type"],
                          }))
                        }
                        className={`rounded-lg px-4 py-2 capitalize transition-all ${
                          filterState.type === type
                            ? "bg-indigo-600 text-white"
                            : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Currency Filter */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-white">
                    Currencies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {availableCurrencies.map((currency) => (
                      <button
                        key={currency}
                        onClick={() => toggleCurrency(currency)}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
                          filterState.currency.includes(currency)
                            ? "bg-indigo-600 text-white"
                            : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {filterState.currency.includes(currency) && (
                          <IconCheck size={16} />
                        )}
                        {currency}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Range Filter */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-white">
                    Amount Range
                  </h4>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="mb-1 block text-sm text-gray-400">
                          Min Amount ($)
                        </label>
                        <input
                          type="number"
                          value={filterState.amountRange.min}
                          onChange={(e) =>
                            setFilterState((prev) => ({
                              ...prev,
                              amountRange: {
                                ...prev.amountRange,
                                min: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
                          placeholder="0"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1 block text-sm text-gray-400">
                          Max Amount ($)
                        </label>
                        <input
                          type="number"
                          value={filterState.amountRange.max}
                          onChange={(e) =>
                            setFilterState((prev) => ({
                              ...prev,
                              amountRange: {
                                ...prev.amountRange,
                                max: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
                          placeholder="1000"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-white">
                    Date Range
                  </h4>
                  <div className="flex gap-2">
                    {["all", "today", "week", "month"].map((range) => (
                      <button
                        key={range}
                        onClick={() =>
                          setFilterState((prev) => ({
                            ...prev,
                            dateRange: range as FilterState["dateRange"],
                          }))
                        }
                        className={`rounded-lg px-4 py-2 capitalize transition-all ${
                          filterState.dateRange === range
                            ? "bg-indigo-600 text-white"
                            : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 border-t border-white/10 pt-4">
                  <button
                    onClick={resetFilters}
                    className="flex-1 rounded-lg bg-white/5 px-4 py-3 text-gray-400 transition-all hover:bg-white/10 hover:text-white"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1 rounded-lg bg-indigo-600 px-4 py-3 text-white transition-all hover:bg-indigo-700"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
        {filteredTransactions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-lg text-gray-400">
              No transactions match your filters
            </p>
            <button
              onClick={resetFilters}
              className="mt-2 text-indigo-400 underline hover:text-indigo-300"
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredTransactions.map((asset) => (
            <div
              key={asset.id}
              className="flex items-center justify-between rounded-xl border-b-2 border-transparent bg-white/5 p-3 px-4 transition-all duration-500 ease-in-out active:border-neutral-400/20 active:bg-white/20"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600/30 text-sm">
                  {asset.icon}
                </div>
                <div>
                  <p className="font-semibold text-white">{asset.amount}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">
                      {asset.from.username || asset.from.method}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <p
                    className={`${asset.type === "incoming" ? "text-green-400" : "text-red-400"} text-sm font-semibold`}
                  >
                    {asset.value}
                  </p>
                  <p
                    className={`${asset.type === "incoming" ? "text-green-400" : "text-red-400"} font-semibold`}
                  >
                    {asset.type === "incoming" ? (
                      <IconPlus size={14} />
                    ) : (
                      <IconArrowRight size={14} />
                    )}
                  </p>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <span className="text-xs text-gray-500">{asset.date}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListWithFilter;
