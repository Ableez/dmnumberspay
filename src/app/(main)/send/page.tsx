"use client";

import {
  IconBackspace,
  IconCheck,
  IconChevronLeft,
  IconSearch,
  IconSwitchVertical,
  IconUser,
  IconX,
  IconShare,
  IconCurrencyDollar,
  IconCurrencyNaira,
  IconCoin,
} from "@tabler/icons-react";
import Image from "next/image";
import { useState, useCallback, useRef, useEffect } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "#/components/ui/drawer";
import { useRouter } from "next/navigation";

// Updated Token type with exchange rates
type Token = {
  id: string;
  name: string;
  symbol: string;
  balance: string;
  icon: string;
  exchangeRates: {
    usdToToken: number; // How many tokens per USD
    ngnToToken: number; // How many tokens per NGN
  };
};

type Contact = {
  id: string;
  name: string;
  accountNumber: string;
  recent: boolean;
  avatar?: string;
};

type Currency = "USD" | "NGN" | "TOKEN";

// Updated mock tokens with exchange rates
const mockTokens: Token[] = [
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    balance: "0.004738",
    icon: "https://github.com/ethereum.png",
    exchangeRates: {
      usdToToken: 0.000034,
      ngnToToken: 0.00000002125, // 0.000034 / 1600
    },
  },
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    balance: "0.00012",
    icon: "https://github.com/bitcoin.png",
    exchangeRates: {
      usdToToken: 0.000018,
      ngnToToken: 0.00000001125, // 0.000018 / 1600
    },
  },
  {
    id: "usdt",
    name: "Tether",
    symbol: "USDT",
    balance: "125.45",
    icon: "https://github.com/tether.png",
    exchangeRates: {
      usdToToken: 1, // 1:1 with USD
      ngnToToken: 0.000625, // 1/1600
    },
  },
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    balance: "1.35",
    icon: "https://github.com/solana.png",
    exchangeRates: {
      usdToToken: 0.0083,
      ngnToToken: 0.00000519, // 0.0083 / 1600
    },
  },
  {
    id: "matic",
    name: "Polygon",
    symbol: "MATIC",
    balance: "45.78",
    icon: "https://github.com/polygon.png",
    exchangeRates: {
      usdToToken: 0.134,
      ngnToToken: 0.0000838, // 0.134 / 1600
    },
  },
];

const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Alex Smith",
    accountNumber: "09071957815",
    recent: true,
    avatar: "https://github.com/identicons/alex.png",
  },
  {
    id: "2",
    name: "Maria Johnson",
    accountNumber: "09082846729",
    recent: true,
  },
  {
    id: "3",
    name: "John Lee",
    accountNumber: "09063728192",
    recent: false,
  },
  {
    id: "4",
    name: "Sarah Williams",
    accountNumber: "09045637281",
    recent: false,
  },
];

type Step = "recipient" | "amount" | "result";
type TransactionStatus = "Succeeded" | "Failed";

const SendAsset = () => {
  const router = useRouter();
  // Step management
  const [currentStep, setCurrentStep] = useState<Step>("recipient");
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatus>("Succeeded");
  const [transactionHash, setTransactionHash] = useState("");

  // Form state
  const [amount, setAmount] = useState("");
  const [currentCurrency, setCurrentCurrency] = useState<Currency>("USD");
  const [isTokenDrawerOpen, setIsTokenDrawerOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | undefined>(
    mockTokens[0] ?? undefined,
  );
  const [selectedRecipient, setSelectedRecipient] = useState<Contact | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus the search input when on recipient step
    if (currentStep === "recipient" && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    }
  }, [currentStep]);

  // Convert amount to different currencies
  const convertAmount = useCallback(
    (value: string, from: Currency, to: Currency): string => {
      if (!selectedToken || !value || isNaN(parseFloat(value))) return "0";

      const numValue = parseFloat(value);
      const { exchangeRates } = selectedToken;

      // Convert everything to token amount first
      let tokenAmount = 0;
      if (from === "USD") {
        tokenAmount = numValue * exchangeRates.usdToToken;
      } else if (from === "NGN") {
        tokenAmount = numValue * exchangeRates.ngnToToken;
      } else {
        tokenAmount = numValue;
      }

      // Convert token amount to target currency
      if (to === "USD") {
        return (tokenAmount / exchangeRates.usdToToken).toFixed(2);
      } else if (to === "NGN") {
        return (tokenAmount / exchangeRates.ngnToToken).toFixed(2);
      } else {
        return tokenAmount.toFixed(6); // Token amounts typically need more precision
      }
    },
    [selectedToken],
  );

  // Get display amount based on current currency
  const getDisplayAmount = useCallback(() => {
    if (!amount) return "0";

    if (currentCurrency === "USD") {
      return `$${parseFloat(amount).toFixed(2)}`;
    } else if (currentCurrency === "NGN") {
      return `₦${parseFloat(amount).toFixed(2)}`;
    } else {
      return `${parseFloat(amount).toFixed(6)} ${selectedToken?.symbol}`;
    }
  }, [amount, currentCurrency, selectedToken]);

  // Get converted amounts for other currencies
  const getConvertedAmounts = useCallback(() => {
    if (!amount || !selectedToken) return { usd: "0", ngn: "0", token: "0" };

    const usdAmount =
      currentCurrency === "USD"
        ? amount
        : convertAmount(amount, currentCurrency, "USD");

    const ngnAmount =
      currentCurrency === "NGN"
        ? amount
        : convertAmount(amount, currentCurrency, "NGN");

    const tokenAmount =
      currentCurrency === "TOKEN"
        ? amount
        : convertAmount(amount, currentCurrency, "TOKEN");

    return {
      usd: usdAmount,
      ngn: ngnAmount,
      token: tokenAmount,
    };
  }, [amount, currentCurrency, selectedToken, convertAmount]);

  // Toggle between currencies
  const toggleCurrency = useCallback(() => {
    // Preserve the value when switching currencies
    if (amount) {
      const newCurrency =
        currentCurrency === "USD"
          ? "NGN"
          : currentCurrency === "NGN"
            ? "TOKEN"
            : "USD";

      const convertedValue = convertAmount(
        amount,
        currentCurrency,
        newCurrency,
      );
      setAmount(convertedValue);
      setCurrentCurrency(newCurrency);
    } else {
      // Just cycle through currencies if no amount entered
      setCurrentCurrency((prev) =>
        prev === "USD" ? "NGN" : prev === "NGN" ? "TOKEN" : "USD",
      );
    }
  }, [amount, currentCurrency, convertAmount]);

  // Handle step navigation
  const goToNextStep = useCallback(() => {
    if (currentStep === "recipient" && selectedRecipient) {
      setCurrentStep("amount");
    } else if (currentStep === "amount" && amount && parseFloat(amount) > 0) {
      // Process the transaction
      processTransaction();
    }
  }, [currentStep, selectedRecipient, amount]);

  const goToPrevStep = useCallback(() => {
    if (currentStep === "amount") {
      setCurrentStep("recipient");
    }
  }, [currentStep]);

  // Process transaction and show result
  const processTransaction = useCallback(() => {
    // Show loading state (could add this as a separate step)

    // Simulate API call
    setTimeout(() => {
      // Random success or failure (90% success rate)
      const success = Math.random() > 0.1;
      setTransactionStatus(success ? "Succeeded" : "Failed");

      // Generate random transaction hash
      const hash =
        "0x" +
        Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16),
        ).join("");
      setTransactionHash(hash);

      // Move to result step
      setCurrentStep("result");
    }, 1500);
  }, [amount, selectedToken, selectedRecipient]);

  // Handle number input
  const handleNumberPress = useCallback(
    (num: string) => {
      if (num === "." && amount.includes(".")) return;
      if (
        amount.includes(".") &&
        amount.split(".")[1] &&
        amount.split(".")[1]!.length >= 2 &&
        currentCurrency !== "TOKEN" &&
        num !== "←"
      )
        return;
      if (
        amount.includes(".") &&
        amount.split(".")[1] &&
        amount.split(".")[1]!.length >= 6 &&
        currentCurrency === "TOKEN" &&
        num !== "←"
      )
        return;
      if (amount.length >= 12 && num !== "←") return;

      setAmount((prev) => prev + num);
    },
    [amount, currentCurrency],
  );

  // Handle delete button press
  const handleDelete = useCallback(() => {
    setAmount((prev) => prev.slice(0, -1));
  }, []);

  // Handle token selection
  const handleSelectToken = useCallback(
    (token: Token) => {
      setSelectedToken(token);
      setIsTokenDrawerOpen(false);

      // Recalculate amount based on new token exchange rates
      if (amount && currentCurrency !== "TOKEN") {
        const tokenAmount = convertAmount(amount, currentCurrency, "TOKEN");
        const displayAmount =
          currentCurrency === "USD"
            ? (
                parseFloat(tokenAmount) / token.exchangeRates.usdToToken
              ).toFixed(2)
            : (
                parseFloat(tokenAmount) / token.exchangeRates.ngnToToken
              ).toFixed(2);
        setAmount(displayAmount);
      }
    },
    [amount, currentCurrency, convertAmount],
  );

  // Handle recipient selection
  const handleSelectRecipient = useCallback((contact: Contact) => {
    setSelectedRecipient(contact);
    setAccountNumber(contact.accountNumber);
    // Automatically go to next step when recipient is selected
    setTimeout(() => setCurrentStep("amount"), 300);
  }, []);

  // Handle manual account number input
  const handleSubmitAccountNumber = useCallback(() => {
    if (accountNumber.length >= 8) {
      setSelectedRecipient({
        id: "custom",
        name: "Custom Account",
        accountNumber: accountNumber,
        recent: false,
      });
      setTimeout(() => setCurrentStep("amount"), 300);
    }
  }, [accountNumber]);

  // Filter contacts based on search query
  const filteredContacts = mockContacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.accountNumber.includes(searchQuery),
  );

  // Share transaction as image
  const handleShareTransaction = async () => {
    if (!resultRef.current) return;

    try {
      // This would use html2canvas in a real implementation
      alert("Transaction shared successfully!");
    } catch (error) {
      console.error("Error generating transaction image:", error);
    }
  };

  // Get the currency icon
  const getCurrencyIcon = () => {
    switch (currentCurrency) {
      case "USD":
        return <IconCurrencyDollar size={20} />;
      case "NGN":
        return <IconCurrencyNaira size={20} />;
      case "TOKEN":
        return <IconCoin size={20} />;
    }
  };

  // Get converted values for display
  const convertedAmounts = getConvertedAmounts();

  return (
    <div className={"p-6 py-20"}>
      {currentStep === "recipient" ? (
        /* Step 1: Recipient Selection */
        <div className="flex flex-col">
          <h2 className="mb-6 text-2xl font-bold">Send To</h2>

          {/* Search Input */}
          <div className="relative mb-6">
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
              <IconSearch size={20} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by name or account number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/5 bg-neutral-900 py-3 pr-4 pl-10 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Manual Input */}
          <div className="mb-6 rounded-2xl border border-white/5 bg-neutral-900 p-4">
            <h4 className="mb-2 font-semibold">Enter Account Number</h4>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                placeholder="e.g., 09071234567"
                value={accountNumber}
                onChange={(e) =>
                  setAccountNumber(e.target.value.replace(/[^0-9]/g, ""))
                }
                className="flex-1 rounded-2xl border border-white/5 bg-neutral-800 p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              />
              <button
                onClick={handleSubmitAccountNumber}
                disabled={accountNumber.length < 8}
                className="rounded-2xl bg-purple-600 px-4 font-semibold text-white disabled:bg-purple-600/50"
              >
                Done
              </button>
            </div>
          </div>

          {/* Recent Recipients */}
          {filteredContacts.some((c) => c.recent) && (
            <>
              <h4 className="mb-2 font-semibold text-gray-400">Recent</h4>
              <div className="mb-6 space-y-2">
                {filteredContacts
                  .filter((contact) => contact.recent)
                  .map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => handleSelectRecipient(contact)}
                      className="flex w-full items-center gap-3 rounded-2xl bg-neutral-900/70 p-3 text-left transition-colors hover:bg-neutral-800"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600/20 text-purple-400">
                        {contact.avatar ? (
                          <Image
                            src={contact.avatar}
                            alt={contact.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <IconUser size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{contact.name}</p>
                        <p className="text-sm text-gray-400">
                          {contact.accountNumber}
                        </p>
                      </div>
                    </button>
                  ))}
              </div>
            </>
          )}

          {/* All Contacts */}
          {filteredContacts.some((c) => !c.recent) && (
            <>
              <h4 className="mb-2 font-semibold text-gray-400">All Contacts</h4>
              <div className="space-y-2">
                {filteredContacts
                  .filter((contact) => !contact.recent)
                  .map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => handleSelectRecipient(contact)}
                      className="flex w-full items-center gap-3 rounded-2xl bg-neutral-900/70 p-3 text-left transition-colors hover:bg-neutral-800"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600/20 text-purple-400">
                        {contact.avatar ? (
                          <Image
                            src={contact.avatar}
                            alt={contact.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <IconUser size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{contact.name}</p>
                        <p className="text-sm text-gray-400">
                          {contact.accountNumber}
                        </p>
                      </div>
                    </button>
                  ))}
              </div>
            </>
          )}

          {filteredContacts.length === 0 && searchQuery && (
            <div className="mt-8 text-center text-gray-400">
              <p>No matching contacts found</p>
              <p className="mt-2 text-sm">
                Try a different search or enter the account number manually
              </p>
            </div>
          )}
        </div>
      ) : currentStep === "amount" ? (
        /* Step 2: Amount Input */
        <div className="flex flex-col">
          {/* Back button and recipient display */}
          <button
            onClick={goToPrevStep}
            className="sticky top-16 z-[999] mb-4 flex items-center rounded-3xl bg-neutral-900/50 p-2.5 backdrop-blur-lg transition-all duration-100 ease-in-out hover:scale-[0.9]"
          >
            <span className="mr-2 rounded-full bg-neutral-900/70 p-2 text-white/70 hover:bg-neutral-800 hover:text-white">
              <IconChevronLeft size={20} />
            </span>
            <div className="flex flex-1 items-center gap-2">
              <div className="rounded-full bg-purple-600/20 p-2">
                <IconUser size={16} className="text-purple-400" />
              </div>
              <div>
                <p className="font-semibold">
                  {selectedRecipient?.name ?? "Custom Account"}
                </p>
                <p className="text-sm text-gray-400">
                  {selectedRecipient?.accountNumber}
                </p>
              </div>
            </div>
          </button>

          <div
            className={
              "relative mt-4 flex h-32 place-items-center items-center justify-center text-center align-middle"
            }
          >
            <div
              className={
                "absolute top-0 left-0 h-32 w-12 bg-gradient-to-r from-black to-transparent"
              }
            />
            {/* Currency Toggle Button - Top Left */}
            <button
              onClick={toggleCurrency}
              className="absolute top-0 left-2 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white/80 hover:bg-neutral-700"
            >
              {getCurrencyIcon()}
            </button>

            <textarea
              name="amount"
              id="amount"
              className="mx-auto max-w-full resize-none truncate text-center text-7xl font-bold placeholder:text-white/20 focus:outline-none"
              rows={1}
              placeholder={
                currentCurrency === "USD"
                  ? "$0.00"
                  : currentCurrency === "NGN"
                    ? "₦0.00"
                    : "0.000000"
              }
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            ></textarea>
            <div
              className={"h-32 w-4 bg-gradient-to-l from-black to-transparent"}
            />
          </div>

          {/* Currency Conversion Display */}
          <div className="mb-4 flex flex-col items-center gap-1">
            {currentCurrency !== "USD" && (
              <div className="text-sm text-gray-400">
                ≈ ${parseFloat(convertedAmounts.usd).toFixed(2)} USD
              </div>
            )}
            {currentCurrency !== "NGN" && (
              <div className="text-sm text-gray-400">
                ≈ ₦{parseFloat(convertedAmounts.ngn).toFixed(2)} NGN
              </div>
            )}
            {currentCurrency !== "TOKEN" && (
              <div className="text-sm text-gray-400">
                ≈ {parseFloat(convertedAmounts.token).toFixed(6)}{" "}
                {selectedToken?.symbol}
              </div>
            )}
          </div>

          <div
            className={"flex items-center justify-center gap-2 align-middle"}
          >
            {/* Token display */}
            <div className={"rounded-full bg-neutral-800 p-0.5"}>
              <Image
                src={selectedToken?.icon}
                alt={selectedToken?.symbol}
                width={25}
                height={25}
              />
            </div>
            <span className="text-2xl font-bold">{selectedToken?.symbol}</span>

            <button
              onClick={toggleCurrency}
              className={
                "ml-2 flex cursor-pointer place-items-center justify-center rounded-full bg-neutral-900 p-1 align-middle transition-all duration-300 ease-in-out hover:scale-[0.99]"
              }
            >
              <IconSwitchVertical size={20} />
            </button>
          </div>

          {/* Token Selection Drawer */}
          <Drawer open={isTokenDrawerOpen} onOpenChange={setIsTokenDrawerOpen}>
            <DrawerTrigger asChild>
              <button className="my-7 flex w-full items-center gap-4 rounded-3xl bg-neutral-900/50 px-6 py-2.5 transition-all duration-100 ease-in-out hover:bg-neutral-800/60 active:scale-[0.99]">
                <div className="flex aspect-square w-16 items-center justify-center rounded-full bg-neutral-800 p-1">
                  <Image
                    className="aspect-square rounded-full"
                    src={selectedToken?.icon}
                    alt={selectedToken?.symbol}
                    width={40}
                    height={40}
                  />
                </div>

                <div className="flex flex-1 flex-col items-start text-left">
                  <h4 className="text-lg font-semibold">
                    {selectedToken?.name}
                  </h4>
                  <h4 className="font-medium text-white/60">
                    {selectedToken?.balance} {selectedToken?.symbol}
                  </h4>
                </div>

                <span className="ml-auto rounded-full bg-purple-800/20 px-4 py-1.5 text-sm font-semibold text-purple-600 transition-colors hover:bg-purple-800/30">
                  Use max
                </span>
              </button>
            </DrawerTrigger>
            <DrawerContent className="bg-black text-white">
              <div className="h-[50vh] overflow-y-auto p-6">
                <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-xl font-bold">Select Token</h3>
                  <button
                    onClick={() => setIsTokenDrawerOpen(false)}
                    className="rounded-full bg-white/10 p-1 hover:bg-white/20"
                  >
                    <IconX size={20} />
                  </button>
                </div>

                <div className="space-y-3">
                  {mockTokens.map((token) => (
                    <button
                      key={token.id}
                      onClick={() => handleSelectToken(token)}
                      className={`flex w-full items-center gap-4 rounded-xl p-4 transition-colors ${
                        selectedToken?.id === token.id
                          ? "border border-purple-600/30 bg-purple-900/30"
                          : "bg-neutral-900/50 hover:bg-neutral-800"
                      }`}
                    >
                      <div className="flex aspect-square w-12 items-center justify-center rounded-full bg-neutral-800 p-1">
                        <Image
                          className="aspect-square rounded-full"
                          src={token.icon}
                          alt={token.symbol}
                          width={30}
                          height={30}
                        />
                      </div>
                      <div className="flex flex-1 flex-col items-start text-left">
                        <h4 className="font-semibold">{token.name}</h4>
                        <h4 className="text-sm text-white/60">
                          {token.balance} {token.symbol}
                        </h4>
                      </div>
                      {selectedToken?.id === token.id && (
                        <div className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-purple-600">
                          <IconCheck size={16} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Number Keyboard */}

          {/* Continue Button */}
          <button
            onClick={goToNextStep}
            className="mt-8 w-full rounded-full bg-purple-600 py-4 text-center font-bold text-white disabled:opacity-50"
            disabled={!amount || parseFloat(amount) === 0}
          >
            Send
          </button>
        </div>
      ) : (
        /* Step 3: Transaction Result */
        <div className="flex min-h-[80vh] flex-col" ref={resultRef}>
          {/* Transaction Details */}
          <div className="mt-8 flex flex-col items-center">
            <div
              className="relative mb-2 h-16 w-16 rounded-full p-2"
              style={{ backgroundColor: "#ffffff1a" }}
            >
              <Image
                src={selectedToken?.icon ?? "https://github.com/ethereum.png"}
                alt={selectedToken?.symbol ?? "ETH"}
                fill
                className="rounded-full object-contain p-2"
              />
              <div
                className="absolute -right-1 bottom-0 rounded-full p-1"
                style={{
                  backgroundColor:
                    transactionStatus === "Succeeded" ? "#22c55e" : "#ef4444",
                }}
              >
                {transactionStatus === "Succeeded" ? (
                  <IconCheck size={12} />
                ) : (
                  <IconX size={12} />
                )}
              </div>
            </div>

            <h2
              className="mt-4 text-3xl font-bold"
              style={{
                color:
                  transactionStatus === "Succeeded" ? "#22c55e" : "#ef4444",
              }}
            >
              {currentCurrency === "USD"
                ? `$${parseFloat(amount).toFixed(2)}`
                : currentCurrency === "NGN"
                  ? `₦${parseFloat(amount).toFixed(2)}`
                  : `${parseFloat(amount).toFixed(6)} ${selectedToken?.symbol}`}
            </h2>
            <p className="mt-2 text-center text-gray-400">
              {transactionStatus === "Succeeded"
                ? "Transaction completed successfully"
                : "Transaction failed"}
            </p>

            <div
              className="mt-8 w-full divide-y rounded-2xl"
              style={{ backgroundColor: "#0a0a0a", borderColor: "#ffffff1a" }}
            >
              <div className="flex h-16 items-center justify-between px-6">
                <span style={{ color: "#9ca3af" }}>Date</span>
                <span className="font-semibold" style={{ color: "#ffffff" }}>
                  {new Date().toLocaleString()}
                </span>
              </div>

              <div className="flex h-16 items-center justify-between px-6">
                <span style={{ color: "#9ca3af" }}>Status</span>
                <span
                  style={{
                    color:
                      transactionStatus === "Succeeded" ? "#22c55e" : "#ef4444",
                  }}
                >
                  {transactionStatus}
                </span>
              </div>

              <div className="flex h-16 items-center justify-between px-6">
                <span style={{ color: "#9ca3af" }}>Amount</span>
                <span className="font-semibold" style={{ color: "#ffffff" }}>
                  {parseFloat(convertedAmounts.token).toFixed(6)}{" "}
                  {selectedToken?.symbol}
                </span>
              </div>

              <div className="flex h-16 items-center justify-between px-6">
                <span style={{ color: "#9ca3af" }}>USD Value</span>
                <span className="font-semibold" style={{ color: "#ffffff" }}>
                  ${parseFloat(convertedAmounts.usd).toFixed(2)}
                </span>
              </div>

              <div className="flex h-16 items-center justify-between px-6">
                <span style={{ color: "#9ca3af" }}>From</span>
                <span className="font-semibold" style={{ color: "#ffffff" }}>
                  My Wallet
                </span>
              </div>

              <div className="flex h-16 items-center justify-between px-6">
                <span style={{ color: "#9ca3af" }}>To</span>
                <span className="font-semibold" style={{ color: "#ffffff" }}>
                  {selectedRecipient?.name ?? "Custom Account"} (
                  {selectedRecipient?.accountNumber})
                </span>
              </div>

              <div className="flex h-16 items-center justify-between px-6">
                <span style={{ color: "#9ca3af" }}>Network</span>
                <span className="font-semibold" style={{ color: "#ffffff" }}>
                  {selectedToken?.name ?? "Ethereum"}
                </span>
              </div>

              <div className="flex h-16 items-center justify-between px-6">
                <span style={{ color: "#9ca3af" }}>Hash</span>
                <span
                  className="max-w-[200px] truncate font-semibold"
                  style={{ color: "#ffffff" }}
                >
                  {transactionHash}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto flex flex-col gap-3 p-6">
            <button
              onClick={() => router.push(`/transactions`)}
              className="block w-full rounded-full py-4 text-center font-medium"
              style={{ backgroundColor: "#4f46e5", color: "#ffffff" }}
            >
              View All Transactions
            </button>
            <button
              onClick={handleShareTransaction}
              className="flex w-full items-center justify-center gap-2 rounded-full py-4 text-center font-medium"
              style={{ backgroundColor: "#262626", color: "#ffffff" }}
            >
              <IconShare size={18} />
              Share as Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendAsset;
