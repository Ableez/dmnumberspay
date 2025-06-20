import express, { Request, Response } from "express";
import { Redis } from "ioredis";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import { body, validationResult, param } from "express-validator";
import {
  Keypair,
  Server,
  Networks,
  TransactionBuilder,
  Operation,
  Asset,
  Account,
  BASE_FEE,
} from "stellar-sdk";
import crypto from "crypto";

// Types
interface User {
  id: string;
  phoneNumber: string;
  publicKey: string;
  encryptedSecretKey: {
    ciphertext: string;
    iv: string;
  };
  createdAt: Date;
  isVerified: boolean;
}

interface WalletBalance {
  [tokenSymbol: string]: string;
}

interface TransferRequest {
  fromPhone: string;
  toPhone: string;
  tokenSymbol: string;
  amount: string;
  pin?: string;
}

interface SupportedToken {
  symbol: string;
  issuer: string;
  code: string;
  decimals: number;
}

// Configuration
const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "your-super-secret-jwt-key",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  stellarNetwork: process.env.STELLAR_NETWORK || "testnet",
  contractAddress: process.env.WALLET_CONTRACT_ADDRESS || "",
  horizonUrl: process.env.HORIZON_URL || "https://horizon-testnet.stellar.org",
  encryptionKey: process.env.ENCRYPTION_KEY || "a_default_32_byte_key_for_devs",
};

// Validate encryption key length
if (Buffer.from(config.encryptionKey, "utf8").length !== 32) {
  console.warn(
    "WARNING: config.encryptionKey is not 32 bytes. AES-256 requires a 32-byte key. Please update your ENCRYPTION_KEY environment variable."
  );
  // Consider exiting or throwing an error in production
}

// Supported stablecoins on Stellar
const SUPPORTED_TOKENS: Record<string, SupportedToken> = {
  USDC: {
    symbol: "USDC",
    issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN", // Circle USDC issuer
    code: "USDC",
    decimals: 7,
  },
  USDT: {
    symbol: "USDT",
    issuer: "GCQTGZQQ5G4PTM2GL7CDIFKUBIPEC52BROAQIAPW53XBRJVN6ZJVTG6V", // Tether USDT issuer
    code: "USDT",
    decimals: 7,
  },
};

class WalletService {
  private redis: Redis;
  private stellar: Server;
  private encryptionKey: Buffer;

  constructor() {
    this.redis = new Redis(config.redisUrl);
    this.stellar = new Server(config.horizonUrl);
    this.encryptionKey = Buffer.from(config.encryptionKey, "utf8");
  }

  // Generate Stellar keypair
  generateKeypair(): Keypair {
    return Keypair.random();
  }

  // Encrypt secret key using AES-256-CBC
  private encryptSecretKey(secretKey: string): User["encryptedSecretKey"] {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", this.encryptionKey, iv);
    let encrypted = cipher.update(secretKey, "utf8", "hex");
    encrypted += cipher.final("hex");
    return {
      ciphertext: encrypted,
      iv: iv.toString("hex"),
    };
  }

  // Decrypt secret key using AES-256-CBC
  private decryptSecretKey(encryptedData: User["encryptedSecretKey"]): string {
    const iv = Buffer.from(encryptedData.iv, "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      this.encryptionKey,
      iv
    );
    let decrypted = decipher.update(encryptedData.ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  // Create user wallet
  async createUser(phoneNumber: string): Promise<User> {
    const existingUser = await this.redis.get(`user:${phoneNumber}`);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const keypair = this.generateKeypair();
    const userId = `user_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const user: User = {
      id: userId,
      phoneNumber,
      publicKey: keypair.publicKey(),
      encryptedSecretKey: this.encryptSecretKey(keypair.secret()),
      createdAt: new Date(),
      isVerified: false,
    };

    await this.redis.set(`user:${phoneNumber}`, JSON.stringify(user));
    await this.redis.set(`userByKey:${keypair.publicKey()}`, phoneNumber);
    await this.redis.set(`userIdByPhone:${phoneNumber}`, userId);

    await this.createStellarWallet(keypair.publicKey());

    const { encryptedSecretKey, ...userDataToReturn } = user;
    return userDataToReturn as User;
  }

  // Get user by phone number
  async getUserByPhone(
    phoneNumber: string,
    includeSensitive = false
  ): Promise<User | null> {
    const userData = await this.redis.get(`user:${phoneNumber}`);
    if (!userData) {
      return null;
    }
    const user: User = JSON.parse(userData);

    if (!includeSensitive) {
      const { encryptedSecretKey, ...publicUserData } = user;
      return publicUserData as User;
    }

    return user;
  }

  // Get user by public key
  async getUserByPublicKey(
    publicKey: string,
    includeSensitive = false
  ): Promise<User | null> {
    const phoneNumber = await this.redis.get(`userByKey:${publicKey}`);
    if (!phoneNumber) {
      return null;
    }
    return this.getUserByPhone(phoneNumber, includeSensitive);
  }

  // Create Stellar wallet (Placeholder for smart contract interaction)
  private async createStellarWallet(publicKey: string): Promise<void> {
    try {
      console.log(`[Stellar] Simulating wallet creation for ${publicKey}`);
      await this.redis.set(`stellarWalletCreated:${publicKey}`, "true");
    } catch (error) {
      console.error("[Stellar] Error creating Stellar wallet:", error);
      throw new Error("Failed to create Stellar wallet on chain");
    }
  }

  // Get wallet balances
  async getBalances(phoneNumber: string): Promise<WalletBalance> {
    const user = await this.getUserByPhone(phoneNumber);
    if (!user || !user.publicKey) {
      throw new Error("User not found or wallet not initialized");
    }

    try {
      const account = await this.stellar.loadAccount(user.publicKey);
      const balances: WalletBalance = {};

      account.balances.forEach((balance: any) => {
        if (balance.asset_type === "native") {
          balances["XLM"] = balance.balance;
        } else if (
          balance.asset_type === "credit_alphanum4" ||
          balance.asset_type === "credit_alphanum12"
        ) {
          const supportedToken = Object.values(SUPPORTED_TOKENS).find(
            (token) =>
              token.code === balance.asset_code &&
              token.issuer === balance.asset_issuer
          );
          if (supportedToken) {
            balances[supportedToken.symbol] = balance.balance;
          } else {
            console.warn(
              `[Stellar] Unknown asset found for ${user.publicKey}: ${balance.asset_code}:${balance.asset_issuer}`
            );
            balances[`${balance.asset_code}:${balance.asset_issuer}`] =
              balance.balance;
          }
        }
      });

      return balances;
    } catch (error: any) {
      console.error("[Stellar] Error getting balances:", error);
      if (error.response && error.response.status === 404) {
        throw new Error(
          "Wallet not found on Stellar network. It might not be activated or created yet."
        );
      }
      throw new Error("Failed to get balances");
    }
  }

  // Transfer tokens between users
  async transferTokens(transferReq: TransferRequest): Promise<string> {
    const { fromPhone, toPhone, tokenSymbol, amount } = transferReq;

    const fromUser = await this.getUserByPhone(fromPhone, true);
    const toUser = await this.getUserByPhone(toPhone);

    if (!fromUser || !fromUser.encryptedSecretKey) {
      throw new Error(
        "Sender user not found or wallet not initialized correctly."
      );
    }
    if (!toUser || !toUser.publicKey) {
      throw new Error(
        "Recipient user not found or wallet not initialized correctly."
      );
    }

    const supportedToken = SUPPORTED_TOKENS[tokenSymbol];
    if (!supportedToken && tokenSymbol !== "XLM") {
      throw new Error("Token not supported");
    }

    try {
      const senderSecretKey = this.decryptSecretKey(
        fromUser.encryptedSecretKey
      );
      const senderKeypair = Keypair.fromSecret(senderSecretKey);

      if (senderKeypair.publicKey() !== fromUser.publicKey) {
        console.error("[Security] Decrypted secret key public key mismatch!");
        throw new Error("Internal server error: Key mismatch during transfer.");
      }

      const senderAccount = await this.stellar.loadAccount(fromUser.publicKey);

      const asset =
        tokenSymbol === "XLM"
          ? Asset.native()
          : new Asset(supportedToken.code, supportedToken.issuer);

      const transaction = new TransactionBuilder(senderAccount, {
        fee: BASE_FEE,
        networkPassphrase:
          config.stellarNetwork === "testnet"
            ? Networks.TESTNET
            : Networks.PUBLIC,
      })
        .addOperation(
          Operation.payment({
            destination: toUser.publicKey,
            asset: asset,
            amount: amount,
          })
        )
        .setTimeout(30)
        .build();

      transaction.sign(senderKeypair);

      console.log(`[Stellar] Submitting transaction...`);
      const result = await this.stellar.submitTransaction(transaction);
      const transactionHash = result.hash;
      console.log(`[Stellar] Transaction submitted: ${transactionHash}`);

      await this.redis.lpush(
        `transfers:${fromPhone}`,
        JSON.stringify({
          to: toPhone,
          token: tokenSymbol,
          amount,
          timestamp: new Date(),
          txHash: transactionHash,
          type: "sent",
          status: "completed",
        })
      );

      await this.redis.lpush(
        `transfers:${toPhone}`,
        JSON.stringify({
          from: fromPhone,
          token: tokenSymbol,
          amount,
          timestamp: new Date(),
          txHash: transactionHash,
          type: "received",
          status: "completed",
        })
      );

      return transactionHash;
    } catch (error: any) {
      console.error("[Stellar] Transfer error:", error);
      await this.redis.lpush(
        `transfers:${fromPhone}`,
        JSON.stringify({
          to: toPhone,
          token: tokenSymbol,
          amount,
          timestamp: new Date(),
          type: "sent",
          status: "failed",
          error: error.message || "Unknown error",
        })
      );
      if (
        error.response &&
        error.response.extras &&
        error.response.extras.result_codes
      ) {
        console.error(
          "[Stellar] Horizon Error Codes:",
          error.response.extras.result_codes
        );
        throw new Error(
          `Transfer failed: ${JSON.stringify(
            error.response.extras.result_codes
          )}`
        );
      }
      throw new Error("Transfer failed");
    }
  }

  // Get transfer history
  async getTransferHistory(
    phoneNumber: string,
    limit: number = 50
  ): Promise<any[]> {
    const transfers = await this.redis.lrange(
      `transfers:${phoneNumber}`,
      0,
      limit - 1
    );
    return transfers.map((transfer) => JSON.parse(transfer));
  }
}

// Express app setup
const app = express();
const walletService = new WalletService();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP",
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Validation middleware
const validatePhoneNumber = [
  body("phoneNumber")
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage("Invalid phone number format (use E.164 format)"),
];

const validateTransfer = [
  body("fromPhone")
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage("Invalid sender phone number"),
  body("toPhone")
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage("Invalid recipient phone number"),
  body("tokenSymbol")
    .isIn(Object.keys(SUPPORTED_TOKENS))
    .withMessage("Unsupported token"),
  body("amount")
    .isDecimal({ decimal_digits: "0,7" })
    .withMessage("Invalid amount format"),
];

// Error handling middleware
const handleValidationErrors = (req: Request, res: Response, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

// Routes

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Create wallet
app.post(
  "/wallet/create",
  validatePhoneNumber,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { phoneNumber } = req.body;
      const user = await walletService.createUser(phoneNumber);

      res.status(201).json({
        success: true,
        data: {
          userId: user.id,
          phoneNumber: user.phoneNumber,
          publicKey: user.publicKey,
          createdAt: user.createdAt,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      console.error("Create wallet error:", error);
      res.status(400).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create wallet",
      });
    }
  }
);

// Get wallet info
app.get(
  "/wallet/:phoneNumber",
  param("phoneNumber").matches(/^\+[1-9]\d{1,14}$/),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { phoneNumber } = req.params;
      const user = await walletService.getUserByPhone(phoneNumber);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "Wallet not found",
        });
      }

      const balances = await walletService.getBalances(phoneNumber);

      res.json({
        success: true,
        data: {
          phoneNumber: user.phoneNumber,
          publicKey: user.publicKey,
          balances,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error("Get wallet error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get wallet information",
      });
    }
  }
);

// Transfer tokens
app.post(
  "/wallet/transfer",
  validateTransfer,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const transferReq: TransferRequest = req.body;
      const txHash = await walletService.transferTokens(transferReq);

      res.json({
        success: true,
        data: {
          transactionHash: txHash,
          from: transferReq.fromPhone,
          to: transferReq.toPhone,
          token: transferReq.tokenSymbol,
          amount: transferReq.amount,
        },
      });
    } catch (error) {
      console.error("Transfer error:", error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Transfer failed",
      });
    }
  }
);

// Get transfer history
app.get(
  "/wallet/:phoneNumber/history",
  param("phoneNumber").matches(/^\+[1-9]\d{1,14}$/),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { phoneNumber } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const history = await walletService.getTransferHistory(
        phoneNumber,
        limit
      );

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      console.error("Get history error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get transfer history",
      });
    }
  }
);

// Get supported tokens
app.get("/tokens", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: SUPPORTED_TOKENS,
  });
});

// Error handling middleware
app.use((error: Error, req: Request, res: Response, next: any) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// 404 handler
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Start server
const server = app.listen(config.port, () => {
  console.log(`🚀 Wallet API server running on port ${config.port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌟 Stellar Network: ${config.stellarNetwork}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

export default app;
