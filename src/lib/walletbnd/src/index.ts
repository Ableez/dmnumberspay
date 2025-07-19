import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}





export interface PasskeyCredential {
  created_at: u64;
  id: Buffer;
  public_key: Buffer;
}


export interface WebAuthnSignature {
  authenticator_data: Buffer;
  client_data_json: Buffer;
  signature: Buffer;
}


export interface DailySpending {
  amount: i128;
  date: u64;
}


export interface Transaction {
  amount: i128;
  from: string;
  timestamp: u64;
  to: string;
  token: string;
  tx_hash: Buffer;
}


export interface Signature {
  authenticator_data: Buffer;
  client_data_json: Buffer;
  signature: Buffer;
}


export interface RecoveryRequest {
  expires_at: u64;
  new_passkey: PasskeyCredential;
  requested_at: u64;
}

export type WalletType = {tag: "Standard", values: void} | {tag: "SavingsOnly", values: void} | {tag: "StableCoinsOnly", values: void} | {tag: "Custom", values: void};

export type DataKey = {tag: "Passkey", values: void} | {tag: "DailySpending", values: void} | {tag: "Recovery", values: void} | {tag: "TransactionHistory", values: void} | {tag: "Settings", values: void} | {tag: "AllowedTokens", values: void} | {tag: "WalletType", values: void} | {tag: "Owner", values: void};


export interface WalletSettings {
  created_at: u64;
  daily_limit: i128;
  recovery_enabled: boolean;
}

export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize a new smart wallet with passkey
   */
  initialize: ({owner, passkey_id, public_key, daily_limit, wallet_type, allowed_tokens}: {owner: string, passkey_id: Buffer, public_key: Buffer, daily_limit: Option<i128>, wallet_type: WalletType, allowed_tokens: Option<Array<string>>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  deposit: ({from, token, amount}: {from: string, token: string, amount: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a withdraw transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Withdraw tokens from the wallet (requires passkey authentication)
   */
  withdraw: ({token, amount, destination}: {token: string, amount: i128, destination: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a send transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Send tokens to another wallet
   */
  send: ({to_wallet, token, amount}: {to_wallet: string, token: string, amount: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a balance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get token balance
   */
  balance: ({token}: {token: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a get_owner transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get wallet owner
   */
  get_owner: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a get_wallet_type transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get wallet type
   */
  get_wallet_type: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<WalletType>>

  /**
   * Construct and simulate a update_allowed_tokens transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Update allowed tokens (for Custom wallet type)
   */
  update_allowed_tokens: ({tokens}: {tokens: Array<string>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a check_token_allowed transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Check if a token is allowed in this wallet (public)
   */
  check_token_allowed: ({token}: {token: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a get_daily_spending transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get current daily spending
   */
  get_daily_spending: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "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",
        "AAAAAAAAABBHZXQgd2FsbGV0IG93bmVyAAAACWdldF9vd25lcgAAAAAAAAAAAAABAAAAEw==",
        "AAAAAAAAAA9HZXQgd2FsbGV0IHR5cGUAAAAAD2dldF93YWxsZXRfdHlwZQAAAAAAAAAAAQAAB9AAAAAKV2FsbGV0VHlwZQAA",
        "AAAAAAAAAC5VcGRhdGUgYWxsb3dlZCB0b2tlbnMgKGZvciBDdXN0b20gd2FsbGV0IHR5cGUpAAAAAAAVdXBkYXRlX2FsbG93ZWRfdG9rZW5zAAAAAAAAAQAAAAAAAAAGdG9rZW5zAAAAAAPqAAAAEwAAAAEAAAPpAAAD7QAAAAAAAAfQAAAACFNka0Vycm9y",
        "AAAAAAAAADNDaGVjayBpZiBhIHRva2VuIGlzIGFsbG93ZWQgaW4gdGhpcyB3YWxsZXQgKHB1YmxpYykAAAAAE2NoZWNrX3Rva2VuX2FsbG93ZWQAAAAAAQAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAQAAAAE=",
        "AAAAAAAAABpHZXQgY3VycmVudCBkYWlseSBzcGVuZGluZwAAAAAAEmdldF9kYWlseV9zcGVuZGluZwAAAAAAAAAAAAEAAAAL" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<Result<void>>,
        deposit: this.txFromJSON<Result<void>>,
        withdraw: this.txFromJSON<Result<void>>,
        send: this.txFromJSON<Result<void>>,
        balance: this.txFromJSON<i128>,
        get_owner: this.txFromJSON<string>,
        get_wallet_type: this.txFromJSON<WalletType>,
        update_allowed_tokens: this.txFromJSON<Result<void>>,
        check_token_allowed: this.txFromJSON<boolean>,
        get_daily_spending: this.txFromJSON<i128>
  }
}