const crypto = require("crypto");

// Generate random passkey ID (32 bytes)
const passkeyId = crypto.randomBytes(32);
const passkeyIdBase64 = passkeyId.toString("base64url");
const passkeyIdHex = passkeyId.toString("hex");

// Generate secp256r1 (P-256) key pair
const { publicKey } = crypto.generateKeyPairSync("ec", {
  namedCurve: "P-256",
  publicKeyEncoding: {
    type: "spki",
    format: "der",
  },
});

// Extract the raw 65-byte public key (04 || x || y)
const rawPubKey = publicKey.slice(-65).toString("hex");

console.log("Passkey ID (hex):", passkeyIdHex);
console.log("Passkey ID (base64url for reference):", passkeyIdBase64);
console.log("Public Key (hex):", rawPubKey);

// Generate Soroban CLI command
console.log("\nSoroban CLI command:");
console.log(`stellar contract invoke \\
  --id CD3Z5C3PAF4IUYTKYYI2CB6VGQARX4B244EL7KWIRK5CHR6ODG55WDGA \\
  --source ableez \\
  --network testnet \\
  -- initialize \\
  --passkey_id ${passkeyIdHex} \\
  --public_key ${rawPubKey}`);




  // wallet 1 CD3Z5C3PAF4IUYTKYYI2CB6VGQARX4B244EL7KWIRK5CHR6ODG55WDGA