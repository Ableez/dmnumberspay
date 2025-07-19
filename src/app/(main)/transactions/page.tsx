"use client";

import ListWithFilter from "#/components/transactions/list-with-filter";
import { mockTransactions } from "./dummy-data";

const TransactionsPage = () => {
  return (
    <div className={"relative"}>
      <div
        className={
          "absolute top-0 left-0 -z-10 min-h-[40dvh] w-full bg-gradient-to-b from-indigo-600 to-transparent p-4"
        }
      ></div>
      <div className="p-4 pt-16">
        <h4 className="text-2xl font-black text-white">Transactions</h4>

        <div className="my-4">
          <div className={"h-32 w-full rounded-xl bg-white/5"}></div>
        </div>

        <ListWithFilter mockTransactions={mockTransactions} />
      </div>
    </div>
  );
};

export default TransactionsPage;
