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


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CD3Z5C3PAF4IUYTKYYI2CB6VGQARX4B244EL7KWIRK5CHR6ODG55WDGA",
  }
} as const


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

export type DataKey = {tag: "Passkey", values: void} | {tag: "DailySpending", values: void} | {tag: "Recovery", values: void} | {tag: "TransactionHistory", values: void} | {tag: "Settings", values: void};


export interface WalletSettings {
  created_at: u64;
  daily_limit: i128;
  recovery_enabled: boolean;
}

export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize a new mobile banking wallet with passkey
   */
  initialize: ({passkey_id, public_key, daily_limit}: {passkey_id: Buffer, public_key: Buffer, daily_limit: Option<i128>}, options?: {
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
   * Send tokens to another mobile wallet
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
   * Construct and simulate a update_passkey transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Update passkey (for device migration)
   */
  update_passkey: ({new_passkey_id, new_public_key}: {new_passkey_id: Buffer, new_public_key: Buffer}, options?: {
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
   * Construct and simulate a initiate_recovery transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initiate recovery process
   */
  initiate_recovery: ({new_passkey_id, new_public_key}: {new_passkey_id: Buffer, new_public_key: Buffer}, options?: {
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
   * Construct and simulate a complete_recovery transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Complete recovery process
   */
  complete_recovery: (options?: {
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

  /**
   * Construct and simulate a get_transaction_history transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get transaction history (last 50 transactions)
   */
  get_transaction_history: (options?: {
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
  }) => Promise<AssembledTransaction<Array<Transaction>>>

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
        "AAAAAAAAABlJbml0aWF0ZSByZWNvdmVyeSBwcm9jZXNzAAAAAAAAEWluaXRpYXRlX3JlY292ZXJ5AAAAAAAAAgAAAAAAAAAObmV3X3Bhc3NrZXlfaWQAAAAAAA4AAAAAAAAADm5ld19wdWJsaWNfa2V5AAAAAAPuAAAAQQAAAAEAAAPpAAAD7QAAAAAAAAfQAAAACFNka0Vycm9y",
        "AAAAAAAAABlDb21wbGV0ZSByZWNvdmVyeSBwcm9jZXNzAAAAAAAAEWNvbXBsZXRlX3JlY292ZXJ5AAAAAAAAAAAAAAEAAAPpAAAD7QAAAAAAAAfQAAAACFNka0Vycm9y",
        "AAAAAAAAABpHZXQgY3VycmVudCBkYWlseSBzcGVuZGluZwAAAAAAEmdldF9kYWlseV9zcGVuZGluZwAAAAAAAAAAAAEAAAAL",
        "AAAAAAAAAC5HZXQgdHJhbnNhY3Rpb24gaGlzdG9yeSAobGFzdCA1MCB0cmFuc2FjdGlvbnMpAAAAAAAXZ2V0X3RyYW5zYWN0aW9uX2hpc3RvcnkAAAAAAAAAAAEAAAPqAAAH0AAAAAtUcmFuc2FjdGlvbgA=",
        "AAAAAAAAAB9XZWJBdXRobiBzaWduYXR1cmUgdmVyaWZpY2F0aW9uAAAAAAxfX2NoZWNrX2F1dGgAAAABAAAAAAAAAAlzaWduYXR1cmUAAAAAAAfQAAAAEVdlYkF1dGhuU2lnbmF0dXJlAAAAAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAAIU2RrRXJyb3I=" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<Result<void>>,
        deposit: this.txFromJSON<Result<void>>,
        withdraw: this.txFromJSON<Result<void>>,
        send: this.txFromJSON<Result<void>>,
        balance: this.txFromJSON<i128>,
        update_passkey: this.txFromJSON<Result<void>>,
        initiate_recovery: this.txFromJSON<Result<void>>,
        complete_recovery: this.txFromJSON<Result<void>>,
        get_daily_spending: this.txFromJSON<i128>,
        get_transaction_history: this.txFromJSON<Array<Transaction>>
  }
}