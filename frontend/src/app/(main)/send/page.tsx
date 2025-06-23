"use client";

import React, { useState, useMemo } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { IconArrowsExchange, IconSwitchVertical } from "@tabler/icons-react";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "#/components/ui/drawer";

type StableCoinCode = "USDT" | "USDC" | "DAI" | "BUSD";

type StableCoin = {
  code: StableCoinCode;
  symbol: string;
  name: string;
  locale: string;
  minSend: number;
  maxSend: number;
};

const STABLE_COINS: ReadonlyArray<StableCoin> = [
  {
    code: "USDT",
    symbol: "₮",
    name: "Tether",
    locale: "en-US",
    minSend: 1,
    maxSend: 10000,
  },
  {
    code: "USDC",
    symbol: "＄",
    name: "USD Coin",
    locale: "en-US",
    minSend: 1,
    maxSend: 10000,
  },
  {
    code: "DAI",
    symbol: "◈",
    name: "Dai",
    locale: "en-US",
    minSend: 1,
    maxSend: 10000,
  },
  {
    code: "BUSD",
    symbol: "฿",
    name: "Binance USD",
    locale: "en-US",
    minSend: 1,
    maxSend: 10000,
  },
];

const NAIRA_CONVERSION_RATES: Record<StableCoinCode, number> = {
  USDT: 1480,
  USDC: 1475,
  DAI: 1460,
  BUSD: 1450,
};

// Add conversion rates for other currencies
const CURRENCY_RATES = {
  USD: 1.0,
  EUR: 0.85,
  GBP: 0.73,
  NGN: 1480,
};

type CurrencyCode = "USD" | "EUR" | "GBP" | "NGN";

type Currency = {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
};

const CURRENCIES: ReadonlyArray<Currency> = [
  { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US" },
  { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE" },
  { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", locale: "en-NG" },
];

const SEND_FEE_PERCENT = 0.5; // 0.5% fee

type ReceiverType = "tag" | "account";

type SendFormState = {
  receiver: string;
  asset: StableCoinCode;
  amount: string;
};

const initialFormState: SendFormState = {
  receiver: "",
  asset: "USDT",
  amount: "",
};

const MOCK_BALANCES: Record<StableCoinCode, number> = {
  USDT: 1234.56,
  USDC: 789.01,
  DAI: 456.78,
  BUSD: 321.09,
};

// Mock users array
type MockUser = {
  id: string;
  tag: string;
  phone: string;
  name: string;
  avatar: string; // url or emoji
};

const MOCK_USERS: MockUser[] = [
  {
    id: "1",
    tag: "@alice",
    phone: "9012345678",
    name: "Alice Johnson",
    avatar: "🧑",
  },
  {
    id: "2",
    tag: "@bob",
    phone: "9087654321",
    name: "Bob Smith",
    avatar: "🧑",
  },
  {
    id: "3",
    tag: "@carol",
    phone: "9076543210",
    name: "Carol Lee",
    avatar: "🧑",
  },
  {
    id: "4",
    tag: "@daniel",
    phone: "9055555555",
    name: "Daniel Kim",
    avatar: "🧑",
  },
];

const SendMoney: React.FC = () => {
  const [form, setForm] = useState<SendFormState>(initialFormState);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [receiverType, setReceiverType] = useState<ReceiverType>("account");
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("USD");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inputMode, setInputMode] = useState<"crypto" | "fiat">("crypto");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const selectedCoin = useMemo<StableCoin>(() => {
    const found = STABLE_COINS.find((c) => c.code === form.asset);
    if (!found) throw new Error("Invalid asset code");
    return found;
  }, [form.asset]);

  const amountNum = useMemo<number>(() => {
    const n = Number(form.amount);
    return isNaN(n) ? 0 : n;
  }, [form.amount]);

  const fee = useMemo<number>(() => {
    return amountNum > 0 ? (amountNum * SEND_FEE_PERCENT) / 100 : 0;
  }, [amountNum]);

  const totalDeducted = useMemo<number>(() => {
    return amountNum + fee;
  }, [amountNum, fee]);

  const nairaValue = useMemo<number>(() => {
    return amountNum * NAIRA_CONVERSION_RATES[selectedCoin.code];
  }, [amountNum, selectedCoin.code]);

  const selectedCurrencyData = useMemo<Currency>(() => {
    const found = CURRENCIES.find((c) => c.code === selectedCurrency);
    if (!found) throw new Error("Invalid currency code");
    return found;
  }, [selectedCurrency]);

  const convertedAmount = useMemo<number>(() => {
    if (amountNum <= 0) return 0;

    // For stablecoins, they're pegged to USD, so we convert from USD to target currency
    const usdAmount = amountNum;

    switch (selectedCurrency) {
      case "USD":
        return usdAmount;
      case "EUR":
        return usdAmount * CURRENCY_RATES.EUR;
      case "GBP":
        return usdAmount * CURRENCY_RATES.GBP;
      case "NGN":
        return usdAmount * CURRENCY_RATES.NGN;
      default:
        return usdAmount;
    }
  }, [amountNum, selectedCurrency]);

  // Calculate the value to show in the input based on the mode
  const inputValue = useMemo(() => {
    if (inputMode === "crypto") {
      return form.amount;
    } else {
      // Convert crypto amount to fiat for display
      if (!form.amount) return "";
      const crypto = Number(form.amount);
      if (isNaN(crypto)) return "";
      switch (selectedCurrency) {
        case "USD":
          return crypto ? (crypto * CURRENCY_RATES.USD).toString() : "";
        case "EUR":
          return crypto ? (crypto * CURRENCY_RATES.EUR).toString() : "";
        case "GBP":
          return crypto ? (crypto * CURRENCY_RATES.GBP).toString() : "";
        case "NGN":
          return crypto ? (crypto * CURRENCY_RATES.NGN).toString() : "";
        default:
          return "";
      }
    }
  }, [form.amount, inputMode, selectedCurrency]);

  // Filter users based on input
  const userSuggestions = useMemo(() => {
    const input = form.receiver.trim().toLowerCase();
    if (!input) return [];
    if (receiverType === "tag") {
      return MOCK_USERS.filter((u) => u.tag.toLowerCase().startsWith(input));
    } else {
      return MOCK_USERS.filter((u) =>
        u.phone.startsWith(input.replace(/\D/g, "")),
      );
    }
  }, [form.receiver, receiverType]);

  // selectedUser is now derived from input value
  const selectedUser = useMemo(() => {
    if (!form.receiver) return null;
    if (receiverType === "tag") {
      return MOCK_USERS.find(
        (u) => u.tag.toLowerCase() === form.receiver.trim().toLowerCase(),
      );
    } else {
      return MOCK_USERS.find(
        (u) => u.phone === form.receiver.replace(/\D/g, ""),
      );
    }
  }, [form.receiver, receiverType]);

  // Handler for input change
  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (inputMode === "crypto") {
      setForm((prev) => ({
        ...prev,
        amount: value,
      }));
    } else {
      // Convert fiat value to crypto and store as crypto in form.amount
      const fiat = Number(value);
      if (isNaN(fiat)) {
        setForm((prev) => ({
          ...prev,
          amount: "",
        }));
        return;
      }
      let crypto = fiat;
      switch (selectedCurrency) {
        case "USD":
          crypto = fiat / CURRENCY_RATES.USD;
          break;
        case "EUR":
          crypto = fiat / CURRENCY_RATES.EUR;
          break;
        case "GBP":
          crypto = fiat / CURRENCY_RATES.GBP;
          break;
        case "NGN":
          crypto = fiat / CURRENCY_RATES.NGN;
          break;
      }
      setForm((prev) => ({
        ...prev,
        amount: crypto ? crypto.toString() : "",
      }));
    }
  };

  // Handler for switch button
  const handleSwitchInputMode = () => {
    setInputMode((prev) => (prev === "crypto" ? "fiat" : "crypto"));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAssetChange = (value: StableCoinCode) => {
    setForm((prev) => ({
      ...prev,
      asset: value,
    }));
  };

  const handleReceiverTypeSwitch = () => {
    setReceiverType((prev) => (prev === "tag" ? "account" : "tag"));
    setForm((prev) => ({
      ...prev,
      receiver: "",
    }));
  };

  const handleReceiverInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    setShowSuggestions(true);
  };

  // Use onMouseDown for suggestion click to avoid blur race
  const handleSuggestionClick = (user: MockUser) => {
    setForm((prev) => ({
      ...prev,
      receiver: receiverType === "tag" ? user.tag : user.phone,
    }));
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    // Add send logic here
  };

  const receiverLabel =
    receiverType === "tag" ? "Receiver Tag" : "Receiver Account Number";
  const receiverPlaceholder =
    receiverType === "tag" ? "@username" : "90 1234 5678";
  const receiverInputType = receiverType === "tag" ? "text" : "tel";
  const receiverMinLength = receiverType === "tag" ? 3 : 8;
  const receiverMaxLength = receiverType === "tag" ? 32 : 20;
  const receiverAutoComplete = receiverType === "tag" ? "off" : "off";

  // Calculate responsive font size based on amount length
  const getAmountFontSize = (amount: string): string => {
    const length = amount.length;
    if (length <= 6) return "text-6xl";
    if (length <= 8) return "text-5xl";
    if (length <= 10) return "text-4xl";
    if (length <= 12) return "text-3xl";
    return "text-2xl";
  };

  const amountDisplay =
    amountNum > 0
      ? `${selectedCoin.symbol}${amountNum.toLocaleString(selectedCoin.locale, {
          style: "decimal",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} ${selectedCoin.code}`
      : `0.00 ${selectedCoin.code}`;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#111] via-black to-black px-4 py-8 pt-32">
      <div className="w-full">
        <form
          className="flex flex-col gap-5"
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          {/* Asset Selection Drawer at Top */}
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger asChild>
              <Button
                variant={"faded"}
                className="mx-auto flex w-fit place-items-center items-center gap-2 rounded-full bg-white/10 py-3 text-lg font-bold text-white shadow transition-all hover:bg-white/20"
              >
                <span className="text-2xl">{selectedCoin.symbol}</span>
                <span>{selectedCoin.code}</span>
                <span className="text-xs text-white/60">
                  {selectedCoin.locale}
                </span>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="p-2 pb-16">
                <DrawerTitle className="mb-8 p-4 text-center text-3xl font-black text-white">
                  Select Asset
                </DrawerTitle>
                <div className="flex flex-col gap-2">
                  {STABLE_COINS.map((coin) => (
                    <Button
                      variant={"faded"}
                      key={coin.code}
                      className={`flex h-16 items-center justify-between rounded-full px-4 transition ${
                        form.asset === coin.code
                          ? "bg-[#4C17BF] text-white hover:bg-[#4C17BF] hover:opacity-90"
                          : "bg-white/5 text-white hover:bg-white/20"
                      }`}
                      onClick={() => {
                        handleAssetChange(coin.code);
                        setDrawerOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 place-items-center justify-center rounded-full bg-white/5 align-middle text-xl">
                          {coin.symbol}
                        </span>
                        <span className="text-lg font-bold">{coin.code}</span>
                        <span className="text-xs text-white/60">
                          {coin.name}
                        </span>
                      </div>
                      <div className="p-1 text-right">
                        <div className="text-xs text-white/50">Balance</div>
                        <div className="font-mono text-sm font-bold">
                          {MOCK_BALANCES[coin.code].toLocaleString(
                            coin.locale,
                            {
                              style: "decimal",
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}{" "}
                          {coin.code}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Responsive Amount Input */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative flex w-full items-center justify-center">
              <input
                id="amount"
                name="amount"
                type="number"
                min={selectedCoin.minSend}
                max={selectedCoin.maxSend}
                step="0.01"
                required
                placeholder={
                  inputMode === "crypto"
                    ? `0.00 ${selectedCoin.code}`
                    : `0.00 ${selectedCurrency}`
                }
                className={`m-8 w-fit overflow-clip bg-transparent! text-center font-black focus:outline-none ${getAmountFontSize(form.amount)} [appearance:textfield] border-none text-white placeholder:text-white/30 focus:border-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                value={inputMode === "crypto" ? form.amount : inputValue}
                onChange={handleAmountInputChange}
                inputMode="decimal"
                style={{
                  scrollbarWidth: "none",
                  scrollbarColor: "transparent",
                }}
                onWheel={(e) => {
                  (e.target as HTMLInputElement).blur();
                  e.preventDefault();
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-[50px] text-lg font-medium text-white/70">
                {inputMode === "crypto" ? selectedCoin.code : selectedCurrency}
              </span>
              <Button
                type="button"
                variant="faded"
                onClick={handleSwitchInputMode}
                aria-label="Switch input mode"
                className="relative w-24 overflow-hidden p-0 pr-4"
              >
                <span
                  className={`flex aspect-square h-10 w-10 place-items-center items-center justify-center rounded-full bg-white/10 text-2xl transition-all duration-300 ${inputMode === "crypto" ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"} absolute top-1/2 left-0 -translate-y-1/2`}
                  style={{ zIndex: inputMode === "crypto" ? 2 : 1 }}
                >
                  {selectedCoin.symbol}
                </span>
                <span
                  className={`flex aspect-square h-10 w-10 place-items-center items-center justify-center rounded-full bg-white/10 text-2xl transition-all duration-300 ${inputMode === "crypto" ? "translate-x-10 opacity-0" : "translate-x-0 opacity-100"} absolute top-1/2 left-0 -translate-y-1/2`}
                  style={{ zIndex: inputMode === "crypto" ? 1 : 2 }}
                >
                  {selectedCurrencyData.symbol}
                </span>
                <span
                  className={` ${getAmountFontSize(form.amount)} pointer-events-none ml-12 p-1 text-xl font-bold text-white/80 transition-all duration-300 select-none`}
                >
                  {inputMode === "crypto"
                    ? selectedCurrencyData.symbol
                    : selectedCoin.symbol}
                </span>
              </Button>
            </div>
            {/* Show the equivalent value below */}
            <div className="text-sm text-white/60">
              {inputMode === "crypto"
                ? `${selectedCurrencyData.symbol}${convertedAmount.toLocaleString(
                    selectedCurrencyData.locale,
                    {
                      style: "decimal",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    },
                  )} ${selectedCurrency}`
                : `${selectedCoin.symbol}${amountNum.toLocaleString(
                    selectedCoin.locale,
                    {
                      style: "decimal",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    },
                  )} ${selectedCoin.code}`}
            </div>
          </div>

          {/* Receiver Input with Currency Display */}
          <div className="flex flex-col gap-2">
            <div className="flex place-items-center justify-between rounded-3xl bg-white/5 p-2 align-middle text-white">
              <div className="flex items-center gap-2">
                <Select
                  value={selectedCurrency}
                  onValueChange={(c) => setSelectedCurrency(c)}
                >
                  <SelectTrigger className="h-8 rounded-full border-none bg-white/20 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="pr-4 text-right">
                <div className="text-lg font-bold text-green-400">
                  {amountNum > 0
                    ? `${selectedCurrencyData.symbol}${convertedAmount.toLocaleString(
                        selectedCurrencyData.locale,
                        {
                          style: "decimal",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}`
                    : `${selectedCurrencyData.symbol}0.00`}
                </div>
                <div className="text-xs text-white/60">
                  {amountNum > 0
                    ? `${selectedCoin.symbol}${amountNum.toLocaleString(
                        selectedCoin.locale,
                        {
                          style: "decimal",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )} ${selectedCoin.code}`
                    : `${selectedCoin.symbol}0.00 ${selectedCoin.code}`}
                </div>
              </div>
            </div>
            <div className="relative">
              <div
                className={
                  "absolute top-1/2 left-1/2 z-[45] mx-auto flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center justify-center rounded-full border-4 border-black bg-neutral-900 align-middle text-xs font-black"
                }
              >
                TO
              </div>
            </div>
            <div className="relative">
              <Input
                id="receiver"
                name="receiver"
                type={receiverInputType}
                required
                minLength={receiverMinLength}
                maxLength={receiverMaxLength}
                autoComplete={receiverAutoComplete}
                placeholder={receiverPlaceholder}
                className="h-12 w-full bg-transparent p-4 text-xl text-white placeholder:text-white/50 focus:outline-none"
                value={form.receiver}
                onChange={handleReceiverInput}
                inputMode={receiverType === "tag" ? "text" : "numeric"}
                pattern={receiverType === "tag" ? undefined : "[0-9]*"}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setShowSuggestions(false)}
                autoCorrect="off"
                spellCheck={false}
              />
              {showSuggestions && userSuggestions.length > 0 && (
                <div className="absolute top-full right-0 left-0 z-10 mt-1 rounded-lg bg-black/90 shadow-lg">
                  {userSuggestions.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className="hover:bg-primary/80 flex w-full items-center gap-3 px-4 py-2 text-left text-white"
                      onMouseDown={() => handleSuggestionClick(user)}
                    >
                      <span className="text-2xl">{user.avatar}</span>
                      <span className="font-bold">{user.name}</span>
                      <span className="text-xs text-white/60">
                        {receiverType === "tag" ? user.tag : user.phone}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedUser && (
              <>
                <div className="mt-4 mb-1 text-center text-base font-semibold text-white/80">
                  Send{" "}
                  <span className="font-bold text-white">
                    {form.amount || "0.00"} {selectedCoin.code}
                  </span>{" "}
                  to
                </div>
                <div className="animate-in fade-in zoom-in-95 flex items-center gap-3 rounded-lg bg-white/10 p-3 text-white transition-all">
                  <span className="text-3xl">{selectedUser.avatar}</span>
                  <div>
                    <div className="font-bold">{selectedUser.name}</div>
                    <div className="text-xs text-white/60">
                      {selectedUser.tag} &middot; {selectedUser.phone}
                    </div>
                  </div>
                </div>
              </>
            )}
            <div className="flex items-center justify-end">
              <Button
                type="button"
                variant="ghost"
                className="flex items-center gap-1 justify-self-end px-2 py-1 text-xs text-white"
                onClick={handleReceiverTypeSwitch}
                aria-label={`Switch to ${receiverType === "tag" ? "Account" : "Tag"}`}
                tabIndex={0}
              >
                <IconArrowsExchange size={18} />
                {receiverType === "tag" ? "Use Account" : "Use Tag"}
              </Button>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="flex flex-col gap-1 rounded-lg bg-black/30 p-3">
            <span className="text-xs text-white/60">
              ≈ ₦
              {amountNum > 0
                ? nairaValue.toLocaleString("en-NG", {
                    style: "decimal",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "--"}{" "}
              NGN
            </span>
            <span className="mt-2 text-xs text-yellow-300">
              <b>Note:</b> A {SEND_FEE_PERCENT}% fee applies. You will be
              charged a total of{" "}
              <span className="font-semibold text-white">
                {totalDeducted > 0
                  ? `${selectedCoin.symbol}${totalDeducted.toLocaleString(
                      selectedCoin.locale,
                      {
                        style: "decimal",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )} ${selectedCoin.code}`
                  : "--"}
              </span>
              .
            </span>
          </div>

          <Button
            type="submit"
            className="bg-primary w-full text-lg font-semibold"
            disabled={
              !form.receiver ||
              amountNum < selectedCoin.minSend ||
              amountNum > selectedCoin.maxSend
            }
          >
            Send
          </Button>
          {submitted && (
            <div className="mt-2 text-center font-semibold text-green-400">
              Transaction submitted! (Demo)
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SendMoney;
