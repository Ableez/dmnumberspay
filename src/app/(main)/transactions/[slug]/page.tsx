"use client";

import React, { use, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  mockTransactions,
  type TransactionStatus,
  type TransactionType,
} from "../dummy-data";
import html2canvas from "html2canvas";

type TransactionProps = {
  params: Promise<{
    slug: string;
  }>;
};

const getStatusColor = (status: TransactionStatus): string => {
  switch (status) {
    case "Succeeded":
    case "Received":
      return "#22c55e"; // green-500
    case "Failed":
      return "#ef4444"; // red-500
    case "Pending":
      return "#eab308"; // yellow-500
    case "Refunded":
      return "#3b82f6"; // blue-500
    default:
      return "#ffffff"; // white
  }
};

const getAmountColor = (type: TransactionType): string => {
  switch (type) {
    case "Received":
      return "#22c55e"; // green-500
    case "Sent":
      return "#ef4444"; // red-500
    case "Swapped":
      return "#3b82f6"; // blue-500
    case "Staked":
      return "#a855f7"; // purple-500
    case "Unstaked":
      return "#f97316"; // orange-500
    default:
      return "#ffffff"; // white
  }
};

const TransactionPage = ({ params }: TransactionProps) => {
  const slug = use(params);
  const transaction =
    mockTransactions.find((tx) => tx.id === slug.slug) ?? mockTransactions[0];
  const transactionRef = useRef<HTMLDivElement>(null);

  if (!transaction) {
    return <div>Transaction not found</div>;
  }

  const statusColor = getStatusColor(transaction.status);
  const amountColor = getAmountColor(transaction.type);

  const handleShareTransaction = async () => {
    if (!transactionRef.current) return;

    try {
      const canvas = await html2canvas(transactionRef.current, {
        backgroundColor: "#000000",
        scale: 2,
        logging: false,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `transaction-${transaction.id}.png`;
      link.click();
    } catch (error) {
      console.error("Error generating transaction image:", error);
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col pb-32"
      style={{ backgroundColor: "#000000", color: "#ffffff" }}
    >
      {/* Transaction Details */}
      <div
        ref={transactionRef}
        className="mt-16 flex flex-col items-center p-6"
      >
        <div
          className="relative mb-2 h-16 w-16 rounded-full p-2"
          style={{ backgroundColor: "#ffffff1a" }}
        >
          <Image
            src={transaction.icon ?? "https://github.com/ethereum.png"}
            alt={transaction.currency}
            fill
            className="rounded-full object-contain p-2"
          />
          <div
            className="absolute -right-1 bottom-0 rounded-full p-1"
            style={{ backgroundColor: "#4f46e5" }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>

        <h2 className="mt-4 text-3xl font-bold" style={{ color: amountColor }}>
          {transaction.amount} {transaction.currency}
        </h2>

        <div
          className="mt-8 w-full divide-y rounded-2xl"
          style={{ backgroundColor: "#0a0a0a", borderColor: "#ffffff1a" }}
        >
          <div className="flex h-16 items-center justify-between px-6">
            <span style={{ color: "#9ca3af" }}>Date</span>
            <span className="font-semibold" style={{ color: "#ffffff" }}>
              {transaction.date}
            </span>
          </div>

          <div className="flex h-16 items-center justify-between px-6">
            <span style={{ color: "#9ca3af" }}>Status</span>
            <span style={{ color: statusColor }}>{transaction.status}</span>
          </div>

          <div className="flex h-16 items-center justify-between px-6">
            <span style={{ color: "#9ca3af" }}>From</span>
            <span className="font-semibold" style={{ color: "#ffffff" }}>
              {transaction.from}
            </span>
          </div>

          {transaction.to && (
            <div className="flex h-16 items-center justify-between px-6">
              <span style={{ color: "#9ca3af" }}>To</span>
              <span className="font-semibold" style={{ color: "#ffffff" }}>
                {transaction.to}
              </span>
            </div>
          )}

          <div className="flex h-16 items-center justify-between px-6">
            <span style={{ color: "#9ca3af" }}>Network</span>
            <span className="font-semibold" style={{ color: "#ffffff" }}>
              {transaction.network}
            </span>
          </div>

          {transaction.fee && (
            <div className="flex h-16 items-center justify-between px-6">
              <span style={{ color: "#9ca3af" }}>Fee</span>
              <span className="font-semibold" style={{ color: "#ffffff" }}>
                {transaction.fee}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-auto flex flex-col gap-3 p-6">
        <Link
          href={`https://etherscan.io/tx/${transaction.hash}`}
          target="_blank"
          className="block w-full rounded-full py-4 text-center font-medium"
          style={{ backgroundColor: "#4f46e5", color: "#ffffff" }}
        >
          View on Etherscan
        </Link>
        <button
          onClick={handleShareTransaction}
          className="flex w-full items-center justify-center gap-2 rounded-full py-4 text-center font-medium"
          style={{ backgroundColor: "#262626", color: "#ffffff" }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Share as Image
        </button>
      </div>
    </div>
  );
};

export default TransactionPage;
