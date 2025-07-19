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





export interface User {
  created_at: u64;
  primary_wallet: Option<string>;
  user_id: Buffer;
  wallets: Array<string>;
}

export type WalletType = {tag: "Standard", values: void} | {tag: "SavingsOnly", values: void} | {tag: "StableCoinsOnly", values: void} | {tag: "Custom", values: void};

export type DataKey = {tag: "Users", values: readonly [Buffer]} | {tag: "UserByWallet", values: readonly [string]} | {tag: "WalletTypes", values: readonly [string]};

export interface Client {
  /**
   * Construct and simulate a register_user transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Register a new user and automatically deploy their first wallet
   */
  register_user: ({user_id, passkey_id, public_key, daily_limit, wallet_type}: {user_id: Buffer, passkey_id: Buffer, public_key: Buffer, daily_limit: Option<i128>, wallet_type: WalletType}, options?: {
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
  }) => Promise<AssembledTransaction<Result<string>>>

  /**
   * Construct and simulate a create_wallet transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Create an additional wallet for an existing user
   */
  create_wallet: ({user_id, passkey_id, public_key, daily_limit, wallet_type, set_as_primary}: {user_id: Buffer, passkey_id: Buffer, public_key: Buffer, daily_limit: Option<i128>, wallet_type: WalletType, set_as_primary: boolean}, options?: {
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
  }) => Promise<AssembledTransaction<Result<string>>>

  /**
   * Construct and simulate a get_user transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get user data
   */
  get_user: ({user_id}: {user_id: Buffer}, options?: {
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
  }) => Promise<AssembledTransaction<Result<User>>>

  /**
   * Construct and simulate a get_user_by_wallet transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get user ID from wallet address
   */
  get_user_by_wallet: ({wallet_address}: {wallet_address: string}, options?: {
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
  }) => Promise<AssembledTransaction<Result<Buffer>>>

  /**
   * Construct and simulate a get_wallet_type transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get wallet type
   */
  get_wallet_type: ({wallet_address}: {wallet_address: string}, options?: {
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
  }) => Promise<AssembledTransaction<Result<WalletType>>>

  /**
   * Construct and simulate a set_primary_wallet transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Set primary wallet
   */
  set_primary_wallet: ({user_id, wallet_address}: {user_id: Buffer, wallet_address: string}, options?: {
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
   * Construct and simulate a update_wallet_wasm transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Update wallet WASM hash (admin only)
   */
  update_wallet_wasm: ({new_wasm_hash}: {new_wasm_hash: Buffer}, options?: {
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
   * Construct and simulate a get_user_wallets transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all wallets for a user
   */
  get_user_wallets: ({user_id}: {user_id: Buffer}, options?: {
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
  }) => Promise<AssembledTransaction<Result<Array<string>>>>

  /**
   * Construct and simulate a get_primary_wallet transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get primary wallet for a user
   */
  get_primary_wallet: ({user_id}: {user_id: Buffer}, options?: {
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
  }) => Promise<AssembledTransaction<Result<string>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        {admin, wallet_wasm_hash}: {admin: string, wallet_wasm_hash: Buffer},
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
    return ContractClient.deploy({admin, wallet_wasm_hash}, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAABFVzZXIAAAAEAAAAAAAAAApjcmVhdGVkX2F0AAAAAAAGAAAAAAAAAA5wcmltYXJ5X3dhbGxldAAAAAAD6AAAABMAAAAAAAAAB3VzZXJfaWQAAAAADgAAAAAAAAAHd2FsbGV0cwAAAAPqAAAAEw==",
        "AAAAAgAAAAAAAAAAAAAACldhbGxldFR5cGUAAAAAAAQAAAAAAAAAAAAAAAhTdGFuZGFyZAAAAAAAAAAAAAAAC1NhdmluZ3NPbmx5AAAAAAAAAAAAAAAAD1N0YWJsZUNvaW5zT25seQAAAAAAAAAAAAAAAAZDdXN0b20AAA==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAEAAAAAAAAABVVzZXJzAAAAAAAAAQAAAA4AAAABAAAAAAAAAAxVc2VyQnlXYWxsZXQAAAABAAAAEwAAAAEAAAAAAAAAC1dhbGxldFR5cGVzAAAAAAEAAAAT",
        "AAAAAAAAADhDb25zdHJ1Y3RvciAtIGluaXRpYWxpemUgd2l0aCBhZG1pbiBhbmQgd2FsbGV0IFdBU00gaGFzaAAAAA1fX2NvbnN0cnVjdG9yAAAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAABB3YWxsZXRfd2FzbV9oYXNoAAAD7gAAACAAAAAA",
        "AAAAAAAAAD9SZWdpc3RlciBhIG5ldyB1c2VyIGFuZCBhdXRvbWF0aWNhbGx5IGRlcGxveSB0aGVpciBmaXJzdCB3YWxsZXQAAAAADXJlZ2lzdGVyX3VzZXIAAAAAAAAFAAAAAAAAAAd1c2VyX2lkAAAAAA4AAAAAAAAACnBhc3NrZXlfaWQAAAAAAA4AAAAAAAAACnB1YmxpY19rZXkAAAAAA+4AAABBAAAAAAAAAAtkYWlseV9saW1pdAAAAAPoAAAACwAAAAAAAAALd2FsbGV0X3R5cGUAAAAH0AAAAApXYWxsZXRUeXBlAAAAAAABAAAD6QAAABMAAAfQAAAACFNka0Vycm9y",
        "AAAAAAAAADBDcmVhdGUgYW4gYWRkaXRpb25hbCB3YWxsZXQgZm9yIGFuIGV4aXN0aW5nIHVzZXIAAAANY3JlYXRlX3dhbGxldAAAAAAAAAYAAAAAAAAAB3VzZXJfaWQAAAAADgAAAAAAAAAKcGFzc2tleV9pZAAAAAAADgAAAAAAAAAKcHVibGljX2tleQAAAAAD7gAAAEEAAAAAAAAAC2RhaWx5X2xpbWl0AAAAA+gAAAALAAAAAAAAAAt3YWxsZXRfdHlwZQAAAAfQAAAACldhbGxldFR5cGUAAAAAAAAAAAAOc2V0X2FzX3ByaW1hcnkAAAAAAAEAAAABAAAD6QAAABMAAAfQAAAACFNka0Vycm9y",
        "AAAAAAAAAA1HZXQgdXNlciBkYXRhAAAAAAAACGdldF91c2VyAAAAAQAAAAAAAAAHdXNlcl9pZAAAAAAOAAAAAQAAA+kAAAfQAAAABFVzZXIAAAfQAAAACFNka0Vycm9y",
        "AAAAAAAAAB9HZXQgdXNlciBJRCBmcm9tIHdhbGxldCBhZGRyZXNzAAAAABJnZXRfdXNlcl9ieV93YWxsZXQAAAAAAAEAAAAAAAAADndhbGxldF9hZGRyZXNzAAAAAAATAAAAAQAAA+kAAAAOAAAH0AAAAAhTZGtFcnJvcg==",
        "AAAAAAAAAA9HZXQgd2FsbGV0IHR5cGUAAAAAD2dldF93YWxsZXRfdHlwZQAAAAABAAAAAAAAAA53YWxsZXRfYWRkcmVzcwAAAAAAEwAAAAEAAAPpAAAH0AAAAApXYWxsZXRUeXBlAAAAAAfQAAAACFNka0Vycm9y",
        "AAAAAAAAABJTZXQgcHJpbWFyeSB3YWxsZXQAAAAAABJzZXRfcHJpbWFyeV93YWxsZXQAAAAAAAIAAAAAAAAAB3VzZXJfaWQAAAAADgAAAAAAAAAOd2FsbGV0X2FkZHJlc3MAAAAAABMAAAABAAAD6QAAA+0AAAAAAAAH0AAAAAhTZGtFcnJvcg==",
        "AAAAAAAAACRVcGRhdGUgd2FsbGV0IFdBU00gaGFzaCAoYWRtaW4gb25seSkAAAASdXBkYXRlX3dhbGxldF93YXNtAAAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAABAAAD6QAAA+0AAAAAAAAH0AAAAAhTZGtFcnJvcg==",
        "AAAAAAAAABpHZXQgYWxsIHdhbGxldHMgZm9yIGEgdXNlcgAAAAAAEGdldF91c2VyX3dhbGxldHMAAAABAAAAAAAAAAd1c2VyX2lkAAAAAA4AAAABAAAD6QAAA+oAAAATAAAH0AAAAAhTZGtFcnJvcg==",
        "AAAAAAAAAB1HZXQgcHJpbWFyeSB3YWxsZXQgZm9yIGEgdXNlcgAAAAAAABJnZXRfcHJpbWFyeV93YWxsZXQAAAAAAAEAAAAAAAAAB3VzZXJfaWQAAAAADgAAAAEAAAPpAAAAEwAAB9AAAAAIU2RrRXJyb3I=" ]),
      options
    )
  }
  public readonly fromJSON = {
    register_user: this.txFromJSON<Result<string>>,
        create_wallet: this.txFromJSON<Result<string>>,
        get_user: this.txFromJSON<Result<User>>,
        get_user_by_wallet: this.txFromJSON<Result<Buffer>>,
        get_wallet_type: this.txFromJSON<Result<WalletType>>,
        set_primary_wallet: this.txFromJSON<Result<void>>,
        update_wallet_wasm: this.txFromJSON<Result<void>>,
        get_user_wallets: this.txFromJSON<Result<Array<string>>>,
        get_primary_wallet: this.txFromJSON<Result<string>>
  }
}