import {
  type Keypair,
  StrKey,
  xdr,
  hash,
  Address,
  Account,
  TransactionBuilder,
  Operation,
} from "@stellar/stellar-sdk";
import { Server, Api } from "@stellar/stellar-sdk/rpc";
import { assembleTransaction } from "stellar-sdk/rpc";

// keep temporary here
const PUBLIC_networkPassphrase = "Test SDF Network ; September 2015";
const PUBLIC_rpcUrl = "https://soroban-testnet.stellar.org";
const PUBLIC_horizonUrl = "https://soroban-testnet.stellar.org";
const PUBLIC_factoryContractId =
  "CB7B63GEUZ3UQGXUZVOL3QI4ZODDS5J2AIC42AQX7J4TQIBO5YOIKF7F";

export async function handleDeploy(
  bundlerKey: Keypair,
  contractSalt: Buffer,
  publicKey?: Buffer,
) {
  const rpc = new Server(PUBLIC_rpcUrl);
  const deployee = StrKey.encodeContract(
    hash(
      xdr.HashIdPreimage.envelopeTypeContractId(
        new xdr.HashIdPreimageContractId({
          networkId: hash(Buffer.from(PUBLIC_networkPassphrase, "utf-8")),
          contractIdPreimage:
            xdr.ContractIdPreimage.contractIdPreimageFromAddress(
              new xdr.ContractIdPreimageFromAddress({
                address: Address.fromString(
                  "CB7B63GEUZ3UQGXUZVOL3QI4ZODDS5J2AIC42AQX7J4TQIBO5YOIKF7F",
                ).toScAddress(),
                salt: contractSalt,
              }),
            ),
        }),
      ).toXDR(),
    ),
  );

  // This is a signup deploy vs a signin deploy. Look up if this contract has been already been deployed, otherwise fail
  if (!publicKey) {
    await rpc.getContractData(
      deployee,
      xdr.ScVal.scvLedgerKeyContractInstance(),
    );
    return deployee;
  }

  const bundlerKeyAccount = await rpc
    .getAccount(bundlerKey.publicKey())
    .then((res) => new Account(res.accountId(), res.sequenceNumber()));
  const simTxn = new TransactionBuilder(bundlerKeyAccount, {
    fee: "100",
    networkPassphrase: PUBLIC_networkPassphrase,
  })
    .addOperation(
      Operation.invokeContractFunction({
        contract: PUBLIC_factoryContractId,
        function: "deploy",
        args: [xdr.ScVal.scvBytes(contractSalt), xdr.ScVal.scvBytes(publicKey)],
      }),
    )
    .setTimeout(0)
    .build();

  const sim = await rpc.simulateTransaction(simTxn);

  if (Api.isSimulationError(sim) || Api.isSimulationRestore(sim)) {
    console.error("Simulation failed", sim);
    throw new Error("Simulation failed");
  }

  const transaction = assembleTransaction(simTxn, sim).setTimeout(0).build();

  transaction.sign(bundlerKey);

  // TODO failure here is resulting in sp:deployee undefined
  // TODO handle archived entries

  const txResp = (await (
    await fetch(`${PUBLIC_horizonUrl}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ tx: transaction.toXDR() }),
    })
  ).json()) as unknown as { successful: boolean };

  if (txResp.successful) {
    return deployee;
  } else {
    console.error("Transaction failed", txResp);
    throw new Error("Transaction failed");
  }
}
