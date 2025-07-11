"use client";

import ListWithFilter from "#/components/transactions/list-with-filter";
import { Drawer, DrawerContent, DrawerTrigger } from "#/components/ui/drawer";
import {
  IconArrowRight,
  IconChartFunnelFilled,
  IconPlus,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import React, { useState, useMemo } from "react";

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

const TransactionsPage = () => {
  return (
    <div className={"relative"}>
      <div
        className={
          "absolute top-0 left-0 -z-10 min-h-[40dvh] w-full bg-gradient-to-b from-blue-600 to-transparent p-4"
        }
      ></div>
      <div className="p-4 pt-16">
        <h4 className="text-2xl font-black text-white">Transactions</h4>

        <div className="my-4">
          <div className={"h-32 w-full rounded-xl bg-white/5"}></div>
        </div>

        <ListWithFilter />
      </div>
    </div>
  );
};

export default TransactionsPage;
