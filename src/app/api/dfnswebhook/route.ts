import { type NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ConvexHttpClient } from "convex/browser";
import { env } from "#/env";
import { api } from "#/convex/_generated/api";

const IMPORTANT_EVENTS = [
  "wallet.transfer.requested",
  "wallet.transfer.confirmed",
  "wallet.blockchainevent.detected",
  "policy.approval.pending",
  "policy.approval.resolved",
];

// currently one weird error which i think its the LSP says convex pacakge is not found
// IMPMENTING THIS TO SAVE EVENTS DIRECTLY TO CONVEX DB
// use front convex hooks to fetch and show data making it "realtime"
// IMPLEMENT TRANSFER
// SIMPLIFY PHONE NUMBER TRANSFERS
// ITERATE AND IMPROVE

interface DfnsWebhookEvent {
  id: string;
  kind: string;
  date: string;
  data: {
    transferRequest?: {
      requester: {
        userId: string;
      };
      walletId: string;
      metadata: {
        asset: {
          symbol: string;
          decimals: number;
          quotes?: Record<
            string,
            {
              price: number;
              change24h?: number;
              volume24h?: number;
            }
          >;
        };
      };
      requestBody: {
        kind: string;
        amount: string;
        to: string;
      };
      fee?: string;
      dateRequested: string;
      dateBroadcasted?: string;
      dateConfirmed?: string;
      id: string;
      txHash?: string;
      network: string;
      status: "Pending" | "Confirmed" | "Failed";
    };
    blockchainEvent?: {
      kind: string;
      walletId: string;
      orgId: string;
      network: string;
      direction: string;
      timestamp: string;
      blockNumber: number;
      txHash: string;
      from: string;
      to: string;
      value: string;
      fee: string;
      index: string;
      metadata: {
        asset: { symbol: string; decimals: number };
        fee: { symbol: string; decimals: number };
      };
      symbol: string;
      decimals: number;
    };
    wallet?: {
      id: string;
      network: string;
      status: string;
      signingKey: {
        id: string;
        publicKey: string;
        scheme: string;
        curve: string;
      };
      address: string;
      name: string;
      dateCreated: string;
      custodial: boolean;
      externalId: string;
      tags: string[];
    };
    [key: string]: unknown;
  };
  deliveryAttempt: number;
  timestampSent: number;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const data = (await req.json()) as DfnsWebhookEvent;
    const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

    const eventKind = data.kind;
    if (!eventKind || !IMPORTANT_EVENTS.includes(eventKind)) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Process transaction events
    if (eventKind === "wallet.transfer.requested") {
      await processTransferRequested(data, convex);
    } else if (eventKind === "wallet.transfer.confirmed") {
      await processTransferConfirmed(data, convex);
    } else if (eventKind === "wallet.blockchainevent.detected") {
      await processBlockchainEvent(data, convex);
    }

    // Log the event
    const eventCategory = eventKind.split(".")[0];
    const eventInfo = {
      id: data.id,
      kind: data.kind,
      timestampSent: data.timestampSent,
      data: data.data,
    };

    const logEntry = `[${new Date().toISOString()}] ${JSON.stringify(eventInfo, null, 2)}\n`;

    const logDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, `dfns-${eventCategory}-events.log`);
    fs.appendFileSync(logFile, logEntry);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const errorLog = `[${new Date().toISOString()}] Error processing webhook: ${error as string}\n`;

    const logDir = path.join(process.cwd(), "logs");
    const logFile = path.join(logDir, "dfns-webhooks-errors.log");

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    fs.appendFileSync(logFile, errorLog);

    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 },
    );
  }
}

async function processTransferRequested(
  event: DfnsWebhookEvent,
  convex: ConvexHttpClient,
) {
  const transferRequest = event.data.transferRequest;
  if (!transferRequest) return;

  try {
    // Find wallet by externalWalletId
    const wallet = await convex.query(api.funcs.wallet.getWalletByExternalId, {
      externalWalletId: transferRequest.walletId,
    });

    if (!wallet) {
      console.error(
        `Wallet not found for externalId: ${transferRequest.walletId}`,
      );
      return;
    }

    // Create transaction record
    await convex.mutation(api.funcs.transactions.createOrUpdateTransaction, {
      dfnsTransferId: transferRequest.id,
      fromWalletId: wallet._id,
      fromAddress: wallet.walletAddress,
      toAddress: transferRequest.requestBody.to,
      amount:
        parseFloat(transferRequest.requestBody.amount) /
        Math.pow(10, transferRequest.metadata.asset.decimals),
      tokenAddress: transferRequest.metadata.asset.symbol,
      network: transferRequest.network,
      status: "PENDING",
      requestedAt: new Date(transferRequest.dateRequested).getTime(),
      fee: transferRequest.fee
        ? parseFloat(transferRequest.fee) /
          Math.pow(10, transferRequest.metadata.asset.decimals)
        : undefined,
      assetMetadata: {
        asset: {
          symbol: transferRequest.metadata.asset.symbol,
          decimals: transferRequest.metadata.asset.decimals,
        },
      },
      decimals: transferRequest.metadata.asset.decimals,
    });
  } catch (error) {
    console.error("Error processing transfer request:", error);
  }
}

async function processTransferConfirmed(
  event: DfnsWebhookEvent,
  convex: ConvexHttpClient,
) {
  const transferRequest = event.data.transferRequest;
  if (!transferRequest) return;

  try {
    // Update transaction with confirmation details
    await convex.mutation(api.funcs.transactions.createOrUpdateTransaction, {
      dfnsTransferId: transferRequest.id,
      txHash: transferRequest.txHash,
      status: "CONFIRMED",
      confirmedAt: transferRequest.dateConfirmed
        ? new Date(transferRequest.dateConfirmed).getTime()
        : Date.now(),
      blockchainFee: transferRequest.fee
        ? parseFloat(transferRequest.fee) /
          Math.pow(10, transferRequest.metadata.asset.decimals)
        : undefined,
    });
  } catch (error) {
    console.error("Error processing transfer confirmation:", error);
  }
}

async function processBlockchainEvent(
  event: DfnsWebhookEvent,
  convex: ConvexHttpClient,
) {
  const blockchainEvent = event.data.blockchainEvent;
  if (!blockchainEvent) return;

  try {
    // Find wallet by address
    const walletQuery =
      blockchainEvent.direction === "In"
        ? { walletAddress: blockchainEvent.to }
        : { walletAddress: blockchainEvent.from };

    const wallet = await convex.query(
      api.funcs.wallet.getWalletByAddress,
      walletQuery,
    );

    if (!wallet) {
      // This might be a transaction to/from an external wallet
      return;
    }

    // For blockchain events without a linked transfer request, create a new transaction record
    // This handles incoming transactions not initiated from our system
    if (
      blockchainEvent.direction === "In" &&
      !(await convex.query(api.funcs.transactions.getTransactionByTxHash, {
        txHash: blockchainEvent.txHash,
      }))
    ) {
      await convex.mutation(api.funcs.transactions.createOrUpdateTransaction, {
        fromAddress: blockchainEvent.from,
        toWalletId: wallet._id,
        toAddress: blockchainEvent.to,
        amount:
          parseFloat(blockchainEvent.value) /
          Math.pow(10, blockchainEvent.decimals),
        tokenAddress: blockchainEvent.symbol,
        txHash: blockchainEvent.txHash,
        network: blockchainEvent.network,
        status: "CONFIRMED",
        confirmedAt: new Date(blockchainEvent.timestamp).getTime(),
        blockNumber: blockchainEvent.blockNumber,
        direction: blockchainEvent.direction,
        decimals: blockchainEvent.decimals,
        assetMetadata: {
          asset: blockchainEvent.metadata.asset,
          fee: blockchainEvent.metadata.fee,
        },
        fee:
          parseFloat(blockchainEvent.fee) /
          Math.pow(10, blockchainEvent.metadata.fee.decimals),
      });
    }
  } catch (error) {
    console.error("Error processing blockchain event:", error);
  }
}
