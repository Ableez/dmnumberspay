import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions, Result } from '@stellar/stellar-sdk/contract';
import type { u64, i128, Option } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
export interface User {
    created_at: u64;
    primary_wallet: Option<string>;
    user_id: Buffer;
    wallets: Array<string>;
}
export type WalletType = {
    tag: "Standard";
    values: void;
} | {
    tag: "SavingsOnly";
    values: void;
} | {
    tag: "StableCoinsOnly";
    values: void;
} | {
    tag: "Custom";
    values: void;
};
export type DataKey = {
    tag: "Users";
    values: readonly [Buffer];
} | {
    tag: "UserByWallet";
    values: readonly [string];
} | {
    tag: "WalletTypes";
    values: readonly [string];
};
export interface Client {
    /**
     * Construct and simulate a register_user transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Register a new user and automatically deploy their first wallet
     */
    register_user: ({ user_id, passkey_id, public_key, daily_limit, wallet_type }: {
        user_id: Buffer;
        passkey_id: Buffer;
        public_key: Buffer;
        daily_limit: Option<i128>;
        wallet_type: WalletType;
    }, options?: {
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
    }) => Promise<AssembledTransaction<Result<string>>>;
    /**
     * Construct and simulate a create_wallet transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Create an additional wallet for an existing user
     */
    create_wallet: ({ user_id, passkey_id, public_key, daily_limit, wallet_type, set_as_primary }: {
        user_id: Buffer;
        passkey_id: Buffer;
        public_key: Buffer;
        daily_limit: Option<i128>;
        wallet_type: WalletType;
        set_as_primary: boolean;
    }, options?: {
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
    }) => Promise<AssembledTransaction<Result<string>>>;
    /**
     * Construct and simulate a get_user transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get user data
     */
    get_user: ({ user_id }: {
        user_id: Buffer;
    }, options?: {
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
    }) => Promise<AssembledTransaction<Result<User>>>;
    /**
     * Construct and simulate a get_user_by_wallet transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get user ID from wallet address
     */
    get_user_by_wallet: ({ wallet_address }: {
        wallet_address: string;
    }, options?: {
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
    }) => Promise<AssembledTransaction<Result<Buffer>>>;
    /**
     * Construct and simulate a get_wallet_type transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get wallet type
     */
    get_wallet_type: ({ wallet_address }: {
        wallet_address: string;
    }, options?: {
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
    }) => Promise<AssembledTransaction<Result<WalletType>>>;
    /**
     * Construct and simulate a set_primary_wallet transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Set primary wallet
     */
    set_primary_wallet: ({ user_id, wallet_address }: {
        user_id: Buffer;
        wallet_address: string;
    }, options?: {
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
    }) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a update_wallet_wasm transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Update wallet WASM hash (admin only)
     */
    update_wallet_wasm: ({ new_wasm_hash }: {
        new_wasm_hash: Buffer;
    }, options?: {
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
    }) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a get_user_wallets transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get all wallets for a user
     */
    get_user_wallets: ({ user_id }: {
        user_id: Buffer;
    }, options?: {
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
    }) => Promise<AssembledTransaction<Result<Array<string>>>>;
    /**
     * Construct and simulate a get_primary_wallet transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get primary wallet for a user
     */
    get_primary_wallet: ({ user_id }: {
        user_id: Buffer;
    }, options?: {
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
    }) => Promise<AssembledTransaction<Result<string>>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    static deploy<T = Client>(
    /** Constructor/Initialization Args for the contract's `__constructor` method */
    { admin, wallet_wasm_hash }: {
        admin: string;
        wallet_wasm_hash: Buffer;
    }, 
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions & Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
    }): Promise<AssembledTransaction<T>>;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        register_user: (json: string) => AssembledTransaction<Result<string, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        create_wallet: (json: string) => AssembledTransaction<Result<string, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_user: (json: string) => AssembledTransaction<Result<User, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_user_by_wallet: (json: string) => AssembledTransaction<Result<Buffer, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_wallet_type: (json: string) => AssembledTransaction<Result<WalletType, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        set_primary_wallet: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        update_wallet_wasm: (json: string) => AssembledTransaction<Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_user_wallets: (json: string) => AssembledTransaction<Result<string[], import("@stellar/stellar-sdk/contract").ErrorMessage>>;
        get_primary_wallet: (json: string) => AssembledTransaction<Result<string, import("@stellar/stellar-sdk/contract").ErrorMessage>>;
    };
}
