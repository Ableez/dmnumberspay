import { setup } from "xstate";

type User = {
  id: string;
  name: string;
  // Add other user properties as needed
} | null;

type AuthContext = {
  user: User;
  walletConnected: boolean;
};

type AuthEvents =
  | { type: "login" }
  | { type: "success" }
  | { type: "failure" }
  | { type: "connectWallet" }
  | { type: "logout" }
  | { type: "walletConnected" }
  | { type: "walletConnectionFailed" }
  | { type: "disconnectWallet" };

export const machine = setup({
  types: {
    context: () =>
      ({
        user: null,
        walletConnected: false,
      }) as AuthContext,
    events: {} as AuthEvents,
  },
}).createMachine({
  context: {
    user: null,
    walletConnected: false,
  },
  id: "web3Auth",
  initial: "unauthenticated",
  states: {
    unauthenticated: {
      on: {
        login: {
          target: "authenticating",
        },
      },
      description: "The user is not logged in and no wallet is connected.",
    },

    authenticating: {
      on: {
        success: {
          target: "authenticated",
          actions: () => {
            // Inline action to handle successful login
            console.log("User logged in successfully");
          },
        },
        failure: {
          target: "unauthenticated",
          actions: () => {
            // Inline action to handle login failure
            console.log("Login failed");
          },
        },
      },
      description: "The user is in the process of logging in.",
    },

    authenticated: {
      on: {
        connectWallet: {
          target: "walletConnecting",
        },
        logout: {
          target: "unauthenticated",
          actions: () => {
            // Inline action to handle logout
            console.log("User logged out");
          },
        },
      },
      description: "The user is logged in but the wallet is not yet connected.",
    },

    walletConnecting: {
      on: {
        walletConnected: {
          target: "walletConnected",
          actions: () => {
            // Inline action to handle successful wallet connection
            console.log("Wallet connected");
          },
        },
        walletConnectionFailed: {
          target: "authenticated",
          actions: () => {
            // Inline action to handle wallet connection failure
            console.log("Wallet connection failed");
          },
        },
      },
      description:
        "The user is logged in and the wallet is in the process of connecting.",
    },

    walletConnected: {
      on: {
        disconnectWallet: {
          target: "authenticated",
          actions: () => {
            // Inline action to handle wallet disconnection
            console.log("Wallet disconnected");
          },
        },
        logout: {
          target: "unauthenticated",
          actions: () => {
            // Inline action to handle logout
            console.log("User logged out");
          },
        },
      },
      description:
        "The user is logged in and the wallet is successfully connected.",
    },
  },
});
