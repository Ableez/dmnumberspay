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
    contractId: "CD6OXT77T6QDR6SJGC7R2QIZF64KIWZFONO7CITFTTQUEW6STBZ5OOEV",
  }
} as const


export interface TokenInfo {
  address: string;
  decimals: u32;
  symbol: string;
}


export interface Signature {
  authenticator_data: Buffer;
  client_data_json: Buffer;
  id: Buffer;
  signature: Buffer;
}

export type DataKey = {tag: "Owner", values: void} | {tag: "Tokens", values: void} | {tag: "WalletRegistry", values: void};

export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({owner, supported_tokens}: {owner: string, supported_tokens: Array<TokenInfo>}, options?: {
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
   * Construct and simulate a register_wallet transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  register_wallet: ({wallet_address}: {wallet_address: string}, options?: {
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
   * Construct and simulate a transfer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  transfer: ({from_wallet, to_wallet, token, amount}: {from_wallet: string, to_wallet: string, token: string, amount: i128}, options?: {
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
   * Construct and simulate a add transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  add: ({id, pk, admin}: {id: Buffer, pk: Buffer, admin: boolean}, options?: {
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
   * Construct and simulate a remove transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  remove: ({id}: {id: Buffer}, options?: {
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
   * Construct and simulate a get_balance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_balance: ({wallet, token}: {wallet: string, token: string}, options?: {
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
  }) => Promise<AssembledTransaction<Result<i128>>>

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
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAACVRva2VuSW5mbwAAAAAAAAMAAAAAAAAAB2FkZHJlc3MAAAAAEwAAAAAAAAAIZGVjaW1hbHMAAAAEAAAAAAAAAAZzeW1ib2wAAAAAABA=",
        "AAAAAQAAAAAAAAAAAAAACVNpZ25hdHVyZQAAAAAAAAQAAAAAAAAAEmF1dGhlbnRpY2F0b3JfZGF0YQAAAAAADgAAAAAAAAAQY2xpZW50X2RhdGFfanNvbgAAAA4AAAAAAAAAAmlkAAAAAAAOAAAAAAAAAAlzaWduYXR1cmUAAAAAAAPuAAAAQA==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAAAAAAAAAAABU93bmVyAAAAAAAAAAAAAAAAAAAGVG9rZW5zAAAAAAAAAAAAAAAAAA5XYWxsZXRSZWdpc3RyeQAA",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAABBzdXBwb3J0ZWRfdG9rZW5zAAAD6gAAB9AAAAAJVG9rZW5JbmZvAAAAAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAAIU2RrRXJyb3I=",
        "AAAAAAAAAAAAAAAPcmVnaXN0ZXJfd2FsbGV0AAAAAAEAAAAAAAAADndhbGxldF9hZGRyZXNzAAAAAAATAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAAIU2RrRXJyb3I=",
        "AAAAAAAAAAAAAAAIdHJhbnNmZXIAAAAEAAAAAAAAAAtmcm9tX3dhbGxldAAAAAATAAAAAAAAAAl0b193YWxsZXQAAAAAAAATAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAEAAAPpAAAD7QAAAAAAAAfQAAAACFNka0Vycm9y",
        "AAAAAAAAAAAAAAADYWRkAAAAAAMAAAAAAAAAAmlkAAAAAAAOAAAAAAAAAAJwawAAAAAD7gAAAEEAAAAAAAAABWFkbWluAAAAAAAAAQAAAAEAAAPpAAAD7QAAAAAAAAfQAAAACFNka0Vycm9y",
        "AAAAAAAAAAAAAAAGcmVtb3ZlAAAAAAABAAAAAAAAAAJpZAAAAAAADgAAAAEAAAPpAAAD7QAAAAAAAAfQAAAACFNka0Vycm9y",
        "AAAAAAAAAAAAAAAMX19jaGVja19hdXRoAAAAAwAAAAAAAAARc2lnbmF0dXJlX3BheWxvYWQAAAAAAAPuAAAAIAAAAAAAAAAJc2lnbmF0dXJlAAAAAAAH0AAAAAlTaWduYXR1cmUAAAAAAAAAAAAADWF1dGhfY29udGV4dHMAAAAAAAPqAAAH0AAAAAdDb250ZXh0AAAAAAEAAAPpAAAD7QAAAAAAAAfQAAAACFNka0Vycm9y",
        "AAAAAAAAAAAAAAALZ2V0X2JhbGFuY2UAAAAAAgAAAAAAAAAGd2FsbGV0AAAAAAATAAAAAAAAAAV0b2tlbgAAAAAAABMAAAABAAAD6QAAAAsAAAfQAAAACFNka0Vycm9y" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<Result<void>>,
        register_wallet: this.txFromJSON<Result<void>>,
        transfer: this.txFromJSON<Result<void>>,
        add: this.txFromJSON<Result<void>>,
        remove: this.txFromJSON<Result<void>>,
        get_balance: this.txFromJSON<Result<i128>>
  }
}