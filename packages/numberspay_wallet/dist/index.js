import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CD6OXT77T6QDR6SJGC7R2QIZF64KIWZFONO7CITFTTQUEW6STBZ5OOEV",
    }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAQAAAAAAAAAAAAAACVRva2VuSW5mbwAAAAAAAAMAAAAAAAAAB2FkZHJlc3MAAAAAEwAAAAAAAAAIZGVjaW1hbHMAAAAEAAAAAAAAAAZzeW1ib2wAAAAAABA=",
            "AAAAAQAAAAAAAAAAAAAACVNpZ25hdHVyZQAAAAAAAAQAAAAAAAAAEmF1dGhlbnRpY2F0b3JfZGF0YQAAAAAADgAAAAAAAAAQY2xpZW50X2RhdGFfanNvbgAAAA4AAAAAAAAAAmlkAAAAAAAOAAAAAAAAAAlzaWduYXR1cmUAAAAAAAPuAAAAQA==",
            "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAAAAAAAAAAABU93bmVyAAAAAAAAAAAAAAAAAAAGVG9rZW5zAAAAAAAAAAAAAAAAAA5XYWxsZXRSZWdpc3RyeQAA",
            "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAABBzdXBwb3J0ZWRfdG9rZW5zAAAD6gAAB9AAAAAJVG9rZW5JbmZvAAAAAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAAIU2RrRXJyb3I=",
            "AAAAAAAAAAAAAAAPcmVnaXN0ZXJfd2FsbGV0AAAAAAEAAAAAAAAADndhbGxldF9hZGRyZXNzAAAAAAATAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAAIU2RrRXJyb3I=",
            "AAAAAAAAAAAAAAAIdHJhbnNmZXIAAAAEAAAAAAAAAAtmcm9tX3dhbGxldAAAAAATAAAAAAAAAAl0b193YWxsZXQAAAAAAAATAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAEAAAPpAAAD7QAAAAAAAAfQAAAACFNka0Vycm9y",
            "AAAAAAAAAAAAAAADYWRkAAAAAAMAAAAAAAAAAmlkAAAAAAAOAAAAAAAAAAJwawAAAAAD7gAAAEEAAAAAAAAABWFkbWluAAAAAAAAAQAAAAEAAAPpAAAD7QAAAAAAAAfQAAAACFNka0Vycm9y",
            "AAAAAAAAAAAAAAAGcmVtb3ZlAAAAAAABAAAAAAAAAAJpZAAAAAAADgAAAAEAAAPpAAAD7QAAAAAAAAfQAAAACFNka0Vycm9y",
            "AAAAAAAAAAAAAAAMX19jaGVja19hdXRoAAAAAwAAAAAAAAARc2lnbmF0dXJlX3BheWxvYWQAAAAAAAPuAAAAIAAAAAAAAAAJc2lnbmF0dXJlAAAAAAAH0AAAAAlTaWduYXR1cmUAAAAAAAAAAAAADWF1dGhfY29udGV4dHMAAAAAAAPqAAAH0AAAAAdDb250ZXh0AAAAAAEAAAPpAAAD7QAAAAAAAAfQAAAACFNka0Vycm9y",
            "AAAAAAAAAAAAAAALZ2V0X2JhbGFuY2UAAAAAAgAAAAAAAAAGd2FsbGV0AAAAAAATAAAAAAAAAAV0b2tlbgAAAAAAABMAAAABAAAD6QAAAAsAAAfQAAAACFNka0Vycm9y"]), options);
        this.options = options;
    }
    fromJSON = {
        initialize: (this.txFromJSON),
        register_wallet: (this.txFromJSON),
        transfer: (this.txFromJSON),
        add: (this.txFromJSON),
        remove: (this.txFromJSON),
        get_balance: (this.txFromJSON)
    };
}
