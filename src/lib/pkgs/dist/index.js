import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Constructor/Initialization Args for the contract's `__constructor` method */
    { admin, wallet_wasm_hash }, 
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy({ admin, wallet_wasm_hash }, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAQAAAAAAAAAAAAAABFVzZXIAAAAEAAAAAAAAAApjcmVhdGVkX2F0AAAAAAAGAAAAAAAAAA5wcmltYXJ5X3dhbGxldAAAAAAD6AAAABMAAAAAAAAAB3VzZXJfaWQAAAAADgAAAAAAAAAHd2FsbGV0cwAAAAPqAAAAEw==",
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
            "AAAAAAAAAB1HZXQgcHJpbWFyeSB3YWxsZXQgZm9yIGEgdXNlcgAAAAAAABJnZXRfcHJpbWFyeV93YWxsZXQAAAAAAAEAAAAAAAAAB3VzZXJfaWQAAAAADgAAAAEAAAPpAAAAEwAAB9AAAAAIU2RrRXJyb3I="]), options);
        this.options = options;
    }
    fromJSON = {
        register_user: (this.txFromJSON),
        create_wallet: (this.txFromJSON),
        get_user: (this.txFromJSON),
        get_user_by_wallet: (this.txFromJSON),
        get_wallet_type: (this.txFromJSON),
        set_primary_wallet: (this.txFromJSON),
        update_wallet_wasm: (this.txFromJSON),
        get_user_wallets: (this.txFromJSON),
        get_primary_wallet: (this.txFromJSON)
    };
}
