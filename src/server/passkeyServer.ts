import { PasskeyServer } from "passkey-kit";
import { version } from "../../package.json";
import { env } from "#/env";

const {
  NEXT_PUBLIC_STELLAR_RPC_URL,
  NEXT_PUBLIC_LAUNCHTUBE_URL,
  NEXT_PUBLIC_MERCURY_URL,
  PRIVATE_MERCURY_KEY,
  PRIVATE_LAUNCHTUBE_JWT,
} = env;

// Server-side environment variables

export const server = new PasskeyServer({
  rpcUrl: NEXT_PUBLIC_STELLAR_RPC_URL,
  launchtubeUrl: NEXT_PUBLIC_LAUNCHTUBE_URL,
  launchtubeJwt: PRIVATE_LAUNCHTUBE_JWT,
  mercuryProjectName: "smart-wallets-next-dima",
  mercuryUrl: NEXT_PUBLIC_MERCURY_URL,
  mercuryKey: PRIVATE_MERCURY_KEY,
  launchtubeHeaders: {
    "X-Client-Name": "ye-olde-guestbook",
    "X-Client-Version": version,
  },
});
