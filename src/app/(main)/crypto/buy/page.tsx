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
import {
  IconArrowsExchange,
  IconSwitchVertical,
  IconCheck,
  IconShare,
  IconHome,
  IconRotate,
  IconCaretUpDownFilled,
} from "@tabler/icons-react";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "#/components/ui/drawer";

type CoinCode = "BTC" | "ETH" | "USDT" | "USDC" | "DAI" | "BUSD";
type StableCoinCode = "USDT" | "USDC" | "DAI" | "BUSD";
type CryptoCoinCode = "BTC" | "ETH";

type Coin = {
  code: CoinCode;
  symbol: string;
  name: string;
  locale: string;
  minSend: number;
  maxSend: number;
};

const COINS: ReadonlyArray<Coin> = [
  {
    code: "BTC",
    symbol: "₿",
    name: "Bitcoin",
    locale: "en-US",
    minSend: 0.00001,
    maxSend: 10,
  },
  {
    code: "ETH",
    symbol: "Ξ",
    name: "Ethereum",
    locale: "en-US",
    minSend: 0.001,
    maxSend: 500,
  },
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

// Update conversion rates to include BTC and ETH (example rates)
const NAIRA_CONVERSION_RATES: Record<CoinCode, number> = {
  BTC: 90000000,
  ETH: 4500000,
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
  asset: CoinCode;
  amount: string;
};

const initialFormState: SendFormState = {
  receiver: "",
  asset: "BTC", // BTC is now the default
  amount: "",
};

const MOCK_BALANCES: Record<CoinCode, number> = {
  BTC: 0.12345678,
  ETH: 1.2345,
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

const BuyCrypto: React.FC = () => {
  const [form, setForm] = useState<SendFormState>(initialFormState);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [receiverType, setReceiverType] = useState<ReceiverType>("account");
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("NGN");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currencyDrawerOpen, setCurrencyDrawerOpen] = useState(false);
  const [inputMode, setInputMode] = useState<"crypto" | "fiat">("fiat");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const selectedCoin = useMemo<Coin>(() => {
    const found = COINS.find((c) => c.code === form.asset);
    if (!found) throw new Error("Invalid asset code");
    return found;
  }, [form.asset]);

  const selectedCurrencyData = useMemo<Currency>(() => {
    const found = CURRENCIES.find((c) => c.code === selectedCurrency);
    if (!found) throw new Error("Invalid currency code");
    return found;
  }, [selectedCurrency]);

  // Calculate the actual crypto amount for conversions
  const actualCryptoAmount = useMemo<number>(() => {
    const inputValue = parseFloat(form.amount);
    if (isNaN(inputValue) || inputValue <= 0) return 0;

    if (inputMode === "crypto") {
      return inputValue;
    } else {
      // Convert fiat to crypto for calculations
      const fiatValue = inputValue;
      let usdAmount = fiatValue;

      switch (selectedCurrency) {
        case "EUR":
          usdAmount = fiatValue / CURRENCY_RATES.EUR;
          break;
        case "GBP":
          usdAmount = fiatValue / CURRENCY_RATES.GBP;
          break;
        case "NGN":
          usdAmount = fiatValue / CURRENCY_RATES.NGN;
          break;
        default:
          usdAmount = fiatValue;
      }

      let cryptoAmount = usdAmount;
      if (form.asset === "BTC") {
        cryptoAmount = usdAmount / 90000;
      } else if (form.asset === "ETH") {
        cryptoAmount = usdAmount / 3000;
      }

      return cryptoAmount;
    }
  }, [form.amount, inputMode, selectedCurrency, form.asset]);

  // Use actualCryptoAmount for all calculations
  const amountNum = actualCryptoAmount;

  const fee = useMemo<number>(() => {
    return amountNum > 0 ? (amountNum * SEND_FEE_PERCENT) / 100 : 0;
  }, [amountNum]);

  const totalDeducted = useMemo<number>(() => {
    return amountNum + fee;
  }, [amountNum, fee]);

  const nairaValue = useMemo<number>(() => {
    return amountNum * NAIRA_CONVERSION_RATES[selectedCoin.code];
  }, [amountNum, selectedCoin.code]);

  const convertedAmount = useMemo<number>(() => {
    if (amountNum <= 0) return 0;

    // For crypto to fiat conversion, we need to use the appropriate rates
    let usdAmount = 0;

    // Convert crypto to USD first, then to target currency
    if (form.asset === "BTC") {
      usdAmount = amountNum * 90000; // BTC to USD rate
    } else if (form.asset === "ETH") {
      usdAmount = amountNum * 3000; // ETH to USD rate
    } else {
      // Stablecoins are pegged to USD
      usdAmount = amountNum;
    }

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
  }, [amountNum, selectedCurrency, form.asset]);

  // Simplified amount input handler - keep input value as typed
  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty value
    if (!value) {
      setForm((prev) => ({
        ...prev,
        amount: "",
      }));
      return;
    }

    // Validate numeric input with decimals
    const numericRegex = /^[0-9]*\.?[0-9]*$/;
    if (!numericRegex.test(value)) {
      return;
    }

    // Always store the exact value typed, regardless of mode
    setForm((prev) => ({
      ...prev,
      amount: value,
    }));
  };

  // Simplified font size calculation
  const getAmountFontSize = (amount: string): string => {
    const length = amount.length;
    if (length === 0) return "text-6xl";
    if (length <= 4) return "text-7xl";
    if (length <= 6) return "text-6xl";
    if (length <= 8) return "text-5xl";
    if (length <= 10) return "text-4xl";
    if (length <= 12) return "text-3xl";
    return "text-2xl";
  };

  // Fixed input mode switch
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

  const handleAssetChange = (value: CoinCode) => {
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

  // Enhanced submit handler with loading state
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSubmitted(true);
    setTimeout(() => {
      setShowSuccess(true);
      setIsLoading(false);
    }, 600);
  };

  const receiverLabel =
    receiverType === "tag" ? "Receiver Tag" : "Receiver Account Number";
  const receiverPlaceholder =
    receiverType === "tag" ? "@username" : "90 1234 5678";
  const receiverInputType = receiverType === "tag" ? "text" : "tel";
  const receiverMinLength = receiverType === "tag" ? 3 : 8;
  const receiverMaxLength = receiverType === "tag" ? 32 : 20;
  const receiverAutoComplete = receiverType === "tag" ? "off" : "off";

  // Simple input width calculation
  const getInputWidth = (value: string): string => {
    const length = value.length || 1;
    return `${Math.max(length * 0.6, 2)}ch`;
  };

  const amountDisplay =
    amountNum > 0
      ? `${selectedCoin.symbol}${amountNum.toLocaleString(selectedCoin.locale, {
          style: "decimal",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} ${selectedCoin.code}`
      : `0.00 ${selectedCoin.code}`;

  // Success animation and options
  if (showSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#111] via-black to-black px-4 py-8">
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
            <span className="animate-bounce rounded-full bg-green-500/20 p-6">
              <IconCheck size={64} className="animate-pulse text-green-400" />
            </span>
          </div>
          <div className="animate-fade-in text-2xl font-bold text-green-300">
            Purchased!
          </div>
          <div className="text-center text-white/80">
            You have purchased{" "}
            <span className="font-bold text-white">
              {form.amount || "0.00"} {selectedCoin.code}
            </span>{" "}
            for{" "}
            <span className="font-bold text-white">
              {selectedCurrencyData.symbol}
              {convertedAmount.toLocaleString(selectedCurrencyData.locale, {
                style: "decimal",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              {selectedCurrency}
            </span>
          </div>
          <div className="mt-4 flex gap-4">
            <Button
              className="bg-primary flex items-center gap-2"
              onClick={() => {
                // redirect to home
                window.location.href = "/";
              }}
            >
              <IconHome size={20} />
              Home
            </Button>
            <Button
              className="flex items-center gap-2"
              variant="outline"
              onClick={() => {
                // share logic (copy to clipboard)
                const shareText = `I just purchased ${form.amount || "0.00"} ${selectedCoin.code} on DMNumbersPay!`;
                if (navigator.share) {
                  void navigator.share({
                    title: "Purchased Crypto",
                    text: shareText,
                    url: window.location.origin,
                  });
                } else {
                  void navigator.clipboard.writeText(shareText);
                  alert("Share text copied to clipboard!");
                }
              }}
            >
              <IconShare size={20} />
              Share
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#111] via-black to-black px-4 py-8 pt-20">
      <div className="mx-auto w-full max-w-md">
        <form
          className="flex flex-col gap-6"
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          {/* Fixed Amount Input - No UI Shifting */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex w-full items-center justify-center">
              <div className="flex min-w-[200px] items-center justify-center">
                <input
                  id="amount"
                  name="amount"
                  type="text"
                  inputMode="decimal"
                  required
                  placeholder="0"
                  className={`text-primary placeholder:text-primary/50 border-none bg-transparent text-center font-black focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${getAmountFontSize(form.amount)}`}
                  value={form.amount}
                  onChange={handleAmountInputChange}
                  style={{
                    minWidth: "3rem",
                  }}
                  onWheel={(e) => {
                    (e.target as HTMLInputElement).blur();
                    e.preventDefault();
                  }}
                />

                <span
                  className={`text-primary/70 ml-2 font-medium ${getAmountFontSize(form.amount)}`}
                >
                  {inputMode === "crypto"
                    ? selectedCoin.symbol
                    : selectedCurrencyData.symbol}
                </span>
              </div>
            </div>

            {/* Simple Mode Switch Button */}
            <Button
              type="button"
              variant="ghost"
              onClick={handleSwitchInputMode}
              className="h-10 w-10 rounded-full bg-white/10 p-0 hover:bg-white/20"
            >
              <IconCaretUpDownFilled size={20} className="text-white/70" />
            </Button>

            {/* Simple Equivalent Value Display */}
            <div className="text-center">
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
                        maximumFractionDigits: 8,
                      },
                    )} ${selectedCoin.code}`}
              </div>
            </div>
          </div>

          {/* Enhanced Selection Section */}
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <h4 className="px-4 text-sm font-bold text-white/40">Buy</h4>
              {/* Asset Selection Drawer */}
              <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button
                    variant="faded"
                    className="hover] mx-auto flex h-16 w-full items-center justify-between gap-3 rounded-full border border-transparent bg-white/5 py-4 text-lg font-bold text-white shadow transition-all hover:border-gray-200/20 hover:bg-white/20"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl">
                        {selectedCoin.symbol}
                      </span>
                      <div className="text-left">
                        <div className="font-bold">{selectedCoin.code}</div>
                        <div className="text-xs text-white/60">
                          {selectedCoin.name}
                        </div>
                      </div>
                    </div>
                    <IconCaretUpDownFilled size={20} />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="p-4 pb-16">
                    <DrawerTitle className="mb-8 text-center text-3xl font-black text-white">
                      Select Asset
                    </DrawerTitle>
                    <div className="flex flex-col gap-3">
                      {COINS.map((coin) => (
                        <Button
                          variant="faded"
                          key={coin.code}
                          className={`flex h-16 items-center justify-between rounded-full px-4 transition-all ${
                            form.asset === coin.code
                              ? "bg-[#4C17BF] text-white hover:bg-[#4C17BF] hover:opacity-90"
                              : "bg-white/5 text-white hover:bg-white/20"
                          }`}
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              asset: coin.code,
                            }));
                            setDrawerOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl">
                              {coin.symbol}
                            </span>
                            <div className="text-left">
                              <div className="font-bold">{coin.name}</div>
                              <div className="text-xs text-white/60">
                                {coin.code}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-white/50">Balance</div>
                            <div className="font-mono text-sm font-bold">
                              {MOCK_BALANCES[coin.code].toLocaleString(
                                coin.locale,
                                {
                                  style: "decimal",
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 8,
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
            </div>

            <div className="space-y-2">
              <h4 className="px-4 text-sm font-bold text-white/40">Using</h4>
              {/* Currency Selection Drawer */}
              <Drawer
                open={currencyDrawerOpen}
                onOpenChange={setCurrencyDrawerOpen}
              >
                <DrawerTrigger asChild>
                  <Button
                    variant="faded"
                    className="hover] mx-auto flex h-16 w-full items-center justify-between gap-3 rounded-full border border-transparent bg-white/5 py-4 text-lg font-bold text-white shadow transition-all hover:border-gray-200/20 hover:bg-white/20"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl">
                        {selectedCurrencyData.symbol}
                      </span>
                      <div className="text-left">
                        <div className="font-bold">{selectedCurrency}</div>
                        <div className="text-xs text-white/60">
                          {selectedCurrencyData.name}
                        </div>
                      </div>
                    </div>
                    <IconCaretUpDownFilled size={20} />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="p-4 pb-16">
                    <DrawerTitle className="mb-8 text-center text-3xl font-black text-white">
                      Select Currency
                    </DrawerTitle>
                    <div className="flex flex-col gap-3">
                      {CURRENCIES.map((currency) => (
                        <Button
                          variant="faded"
                          key={currency.code}
                          className={`flex h-16 items-center justify-between rounded-full px-4 transition-all ${
                            selectedCurrency === currency.code
                              ? "bg-[#4C17BF] text-white hover:bg-[#4C17BF] hover:opacity-90"
                              : "bg-white/5 text-white hover:bg-white/20"
                          }`}
                          onClick={() => {
                            setSelectedCurrency(currency.code);
                            setCurrencyDrawerOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl">
                              {currency.symbol}
                            </span>
                            <div className="text-left">
                              <div className="font-bold">{currency.name}</div>
                              <div className="text-xs text-white/60">
                                {currency.code}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-white/50">Rate</div>
                            <div className="font-mono text-sm font-bold">
                              1 USD = {CURRENCY_RATES[currency.code]}{" "}
                              {currency.code}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>

          {/* Enhanced Transaction Summary */}
          <div className="space-y-4">
            <div className="rounded-lg bg-black/30 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-white/60">Total Cost</span>
                <span className="text-lg font-bold text-green-400">
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
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>You'&apos;ll receive</span>
                <span>
                  {amountNum > 0
                    ? `${selectedCoin.symbol}${amountNum.toLocaleString(
                        selectedCoin.locale,
                        {
                          style: "decimal",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 8,
                        },
                      )} ${selectedCoin.code}`
                    : `${selectedCoin.symbol}0.00 ${selectedCoin.code}`}
                </span>
              </div>
            </div>

            {/* Enhanced Fee Information */}
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
              <div className="flex items-start gap-2">
                <span className="text-sm text-yellow-400">ℹ️</span>
                <div className="text-xs text-yellow-300">
                  <div className="mb-1 font-semibold">Transaction Details:</div>
                  <div>• Network fee: {SEND_FEE_PERCENT}%</div>
                  <div>• Processing time: ~2-5 minutes</div>
                  <div>• Exchange rate locked for 30 seconds</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Submit Button */}
          <Button
            type="submit"
            className="bg-primary hover] h-14 w-full rounded-full text-lg font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
            disabled={
              !form.amount ||
              amountNum < selectedCoin.minSend ||
              amountNum > selectedCoin.maxSend ||
              isLoading
            }
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Processing...
              </div>
            ) : (
              `Buy ${selectedCoin.code}`
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default BuyCrypto;
