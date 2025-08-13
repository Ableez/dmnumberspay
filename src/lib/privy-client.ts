import { env } from "#/env";
import { PrivyClient } from "@privy-io/server-auth";

export const privyClient = new PrivyClient(
  env.NEXT_PUBLIC_PRIVY_APP_ID,
  env.PRIVY_SECRET_KEY,
);
