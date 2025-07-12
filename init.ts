import {
  Soroban,
  TransactionBuilder,
  Networks,
  Keypair,
} from "@stellar/stellar-sdk";

async function initializeSmartWalletContract() {
  // 1. Connect to the deployed contract
  const contractId = "C..."; // Your deployed contract ID
  const client = new Client({
    contractId,
    networkPassphrase: networks.testnet.networkPassphrase,
    rpcUrl: "https://soroban-testnet.stellar.org",
  });

  // 2. Define admin address (Stellar account that will control the contract)
  const adminKeypair = Keypair.random(); // Or load your admin keypair
  const adminAddress = adminKeypair.publicKey();

  // 3. Define supported tokens
  const supportedTokens = [
    {
      address: "CDLPG5KAPBVLF5YRPAFCLQMAY5VKQXPBFAYDHPZBDQLZR6CRDZBMDPYL", // Example USDC token contract
      symbol: "USDC",
      decimals: 6,
    },
    {
      address: "CBBNMYKNV4NKRHY23XRZS253HTM4TF7YA6ZJ2XB7QZNB6XGK4DPXNVTA", // Example XLM token contract
      symbol: "XLM",
      decimals: 7,
    },
  ];

  // 4. Initialize the contract
  const initTx = await client.initialize({
    owner: adminAddress,
    supported_tokens: supportedTokens,
  });

  // 5. Sign with the admin key
  const signedTx = await initTx
    .setNetworkPassphrase(networks.testnet.networkPassphrase)
    .sign(adminKeypair);

  // 6. Submit the transaction
  const result = await signedTx.send();
  console.log("Contract initialized:", result);

  return {
    adminAddress,
    contractId,
  };
}

initializeSmartWalletContract().catch(console.error);
