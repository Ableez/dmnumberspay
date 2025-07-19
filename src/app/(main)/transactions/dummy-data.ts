export type TransactionStatus =
  | "Succeeded"
  | "Failed"
  | "Pending"
  | "Refunded"
  | "Received";

export type TransactionType = "Received" | "Sent" | "Swapped" | "Staked" | "Unstaked";

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: string;
  currency: string;
  date: string;
  status: TransactionStatus;
  from: string;
  to?: string;
  network: string;
  hash: string;
  fee?: string;
  icon?: string;
};

export const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "Received",
    amount: "+0.00031",
    currency: "ETH",
    date: "Feb 5, 2025 at 2:28 pm",
    status: "Succeeded",
    from: "Alex Wallet (9071957815)",
    network: "Ethereum",
    hash: "0x123456789abcdef",
    icon: "https://github.com/ethereum.png",
  },
  {
    id: "2",
    type: "Sent",
    amount: "-0.5",
    currency: "BTC",
    date: "Feb 3, 2025 at 10:15 am",
    status: "Pending",
    from: "My Wallet",
    to: "Exchange (8801234567)",
    network: "Bitcoin",
    hash: "0xabc123def456789",
    fee: "0.0001 BTC",
    icon: "https://github.com/bitcoin.png",
  },
  {
    id: "3",
    type: "Swapped",
    amount: "100",
    currency: "USDT to USDC",
    date: "Jan 28, 2025 at 5:45 pm",
    status: "Succeeded",
    from: "Uniswap",
    network: "Polygon",
    hash: "0xpolygon123456789",
    fee: "0.01 MATIC",
    icon: "https://github.com/polygon.png",
  },
  {
    id: "4",
    type: "Staked",
    amount: "10",
    currency: "SOL",
    date: "Jan 25, 2025 at 9:30 am",
    status: "Succeeded",
    from: "Solana Staking Pool",
    network: "Solana",
    hash: "0xsolana987654321",
    icon: "https://github.com/solana.png",
  },
  {
    id: "5",
    type: "Received",
    amount: "+500",
    currency: "XRP",
    date: "Jan 20, 2025 at 3:12 pm",
    status: "Failed",
    from: "Ripple Gateway",
    network: "XRP Ledger",
    hash: "0xxrp567891234",
    icon: "https://github.com/ripple.png",
  },
];