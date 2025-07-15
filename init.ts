import { writeFileSync } from "fs";
// Example values
const user_id = Buffer.from("user123456"); // 10 bytes
const passkey_id = Buffer.from("passkeyid1234567890"); // 18 bytes
const public_key = Buffer.alloc(65, 1); // 65 bytes, all 1s for demo
const daily_limit = "1000000000"; // as string for big numbers
const wallet_type = 0; // 0 = Standard, 1 = SavingsOnly, 2 = StableCoinsOnly, 3 = Custom

// If using Soroban JS SDK, you might call like this:
const result = {
  user_id: user_id.toString("base64"), // Buffer or Uint8Array
  passkey_id: passkey_id.toString("base64"), // Buffer or Uint8Array
  public_key: public_key.toString("base64"), // Buffer or Uint8Array (65 bytes)
  daily_limit, // string or number, or undefined for None
  wallet_type, // number (enum index)
};

// If using a raw XDR builder, convert as needed for your SDK.

console.log("RESULT", result);

// Write the result to a file
writeFileSync("register_user_result.json", JSON.stringify(result, null, 2));
