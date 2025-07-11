import { PasskeyKit, SACClient } from "passkey-kit";
import { Server } from "@stellar/stellar-sdk/rpc";
import { env } from "#/env";

import type { Tx } from "@stellar/stellar-sdk/contract";

const {
  NEXT_PUBLIC_STELLAR_RPC_URL,
  NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE,
  NEXT_PUBLIC_WALLET_WASM_HASH,
  NEXT_PUBLIC_NATIVE_CONTRACT_ADDRESS,
} = env;

export const rpc = new Server(NEXT_PUBLIC_STELLAR_RPC_URL);

export const account = new PasskeyKit({
  rpcUrl: NEXT_PUBLIC_STELLAR_RPC_URL,
  networkPassphrase: NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE,
  walletWasmHash: NEXT_PUBLIC_WALLET_WASM_HASH,
  timeoutInSeconds: 30,
});

export const sac = new SACClient({
  rpcUrl: NEXT_PUBLIC_STELLAR_RPC_URL,
  networkPassphrase: NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE,
});

export const native = sac.getSACClient(NEXT_PUBLIC_NATIVE_CONTRACT_ADDRESS);

export async function send(tx: Tx): Promise<Record<string, unknown>> {
  return fetch("/api/send", {
    method: "POST",
    body: JSON.stringify({
      xdr: tx.toXDR(),
    }),
  }).then(async (res) => {
    if (res.ok) return res.json() as Promise<Record<string, unknown>>;
    else throw await res.text();
  });
}

export async function getContractId(signer: string): Promise<string> {
  return fetch(`/api/contract/${signer}`).then(async (res) => {
    if (res.ok) return res.text();
    else throw await res.text();
  });
}

export async function fundContract(
  address: string,
): Promise<Record<string, unknown>> {
  return fetch(`/api/fund/${address}`).then(async (res) => {
    if (res.ok) return res.json() as Promise<Record<string, unknown>>;
    else throw await res.text();
  });
}
