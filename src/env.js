import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    CLERK_SECRET_KEY: z.string(),
    PRIVATE_LAUNCHTUBE_JWT: z.string(),
    PRIVATE_MERCURY_KEY: z.string(),
    PRIVATE_MERCURY_JWT: z.string(),
    PRIVATE_FUNDER_SECRET_KEY: z.string(),
    VAPID_PRIVATE_KEY: z.string(),
    NEW_STELLAR_SK: z.string(),
    DFNS_PRIVATE_KEY: z.string(),
    DFNS_CRED_ID: z.string(),
    DFNS_ORG_ID: z.string(),
    DFNS_AUTH_TOKEN: z.string(),
    DFNS_API_URL: z.string(),
    PRIVY_SECRET_KEY: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_STELLAR_RPC_URL: z.string(),
    NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE: z.string(),
    NEXT_PUBLIC_WALLET_WASM_HASH: z.string(),
    NEXT_PUBLIC_NATIVE_CONTRACT_ADDRESS: z.string(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string(),
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: z.string(),
    NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: z.string(),
    NEXT_PUBLIC_CONVEX_URL: z.string(),
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string(),
    NEXT_PUBLIC_STELLAR_NETWORK: z.string(),
    NEXT_PUBLIC_STELLAR_ACCOUNT: z.string(),
    NEXT_PUBLIC_LAUNCHTUBE_URL: z.string(),
    NEXT_PUBLIC_MERCURY_URL: z.string(),
    NEXT_PUBLIC_FUNDER_PUBLIC_KEY: z.string(),
    NEXT_PUBLIC_PRIVY_APP_ID: z.string(),
    NEXT_PUBLIC_PRIVY_CLIENT_ID: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    PRIVATE_LAUNCHTUBE_JWT: process.env.PRIVATE_LAUNCHTUBE_JWT,
    PRIVATE_MERCURY_KEY: process.env.PRIVATE_MERCURY_KEY,
    PRIVATE_MERCURY_JWT: process.env.PRIVATE_MERCURY_JWT,
    PRIVATE_FUNDER_SECRET_KEY: process.env.PRIVATE_FUNDER_SECRET_KEY,
    VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
    NEXT_PUBLIC_STELLAR_RPC_URL: process.env.NEXT_PUBLIC_STELLAR_RPC_URL,
    NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE:
      process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE,
    NEXT_PUBLIC_WALLET_WASM_HASH: process.env.NEXT_PUBLIC_WALLET_WASM_HASH,
    NEXT_PUBLIC_NATIVE_CONTRACT_ADDRESS:
      process.env.NEXT_PUBLIC_NATIVE_CONTRACT_ADDRESS,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL:
      process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL:
      process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK,
    NEXT_PUBLIC_STELLAR_ACCOUNT: process.env.NEXT_PUBLIC_STELLAR_ACCOUNT,
    NEXT_PUBLIC_LAUNCHTUBE_URL: process.env.NEXT_PUBLIC_LAUNCHTUBE_URL,
    NEXT_PUBLIC_MERCURY_URL: process.env.NEXT_PUBLIC_MERCURY_URL,
    NEXT_PUBLIC_FUNDER_PUBLIC_KEY: process.env.NEXT_PUBLIC_FUNDER_PUBLIC_KEY,
    NEW_STELLAR_SK: process.env.NEW_STELLAR_SK,
    DFNS_PRIVATE_KEY: process.env.DFNS_PRIVATE_KEY,
    DFNS_CRED_ID: process.env.DFNS_CRED_ID,
    DFNS_ORG_ID: process.env.DFNS_ORG_ID,
    DFNS_AUTH_TOKEN: process.env.DFNS_AUTH_TOKEN,
    DFNS_API_URL: process.env.DFNS_AUTH_TOKEN,
    NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    NEXT_PUBLIC_PRIVY_CLIENT_ID: process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID,
    PRIVY_SECRET_KEY: process.env.PRIVY_SECRET_KEY,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
