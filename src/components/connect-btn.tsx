"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

import {
  Settings,
  ChevronDown,
  Copy,
  Wallet,
  CircleDollarSign,
  HelpingHand,
  LogOut,
  LoaderCircle,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "#/components/ui/popover";
import { Button } from "#/components/ui/button";
import { useMachine } from "@xstate/react";
import { machine } from "#/lib/xstate/auth-store";

type ConnectBtnProps = Record<string, never>;

// Custom hooks for managing keyId and contractId
const useKeyId = () => {
  const [keyId, setKeyIdState] = useState<string>("");
  
  const setKeyId = (id: string) => {
    setKeyIdState(id);
    localStorage.setItem("yog:keyId", id);
  };
  
  const resetKeyId = () => {
    setKeyIdState("");
  };
  
  useEffect(() => {
    const storedKeyId = localStorage.getItem("yog:keyId");
    if (storedKeyId) {
      setKeyIdState(storedKeyId);
    }
  }, []);
  
  return { keyId, setKeyId, resetKeyId };
};

const useContractId = () => {
  const [contractId, setContractId] = useState<string>("");
  return { contractId, setContractId };
};

const ConnectBtn: React.FC<ConnectBtnProps> = () => {
  const [state, send] = useMachine(machine);
  const [balance, setBalance] = useState<string>("0");
  const [isFunding, setIsFunding] = useState<boolean>(false);
  const [isDonating, setIsDonating] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");

  const { keyId, setKeyId, resetKeyId } = useKeyId();
  const { contractId, setContractId } = useContractId();

  const getBalance = async (): Promise<void> => {
    try {
      const { result } = await native.balance({ id: contractId });
      setBalance(result.toString());
    } catch (err) {
      console.error(err);
      toast.error(
        "Something went wrong checking your balance. Please try again later.",
      );
    }
  };

  const signup = async (): Promise<void> => {
    try {
      send({ type: "login" });
      const name = window.prompt("Please provide a username below.");

      if (!name) {
        toast.error("Username is required");
        send({ type: "failure" });
        return;
      }

      setUserName(name);

      const {
        keyIdBase64,
        contractId: cid,
        signedTx,
      } = await account.createWallet("Ye Olde Guestbook", name);

      setKeyId(keyIdBase64);
      setContractId(cid);

      if (!signedTx) {
        throw new Error("built transaction missing");
      }

      await send({ type: "success" });
      await fundContract(contractId);
      void getBalance();
      send({ type: "connectWallet" });
      send({ type: "walletConnected" });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong signing up. Please try again later.");
      send({ type: "failure" });
    }
  };

  const login = async (): Promise<void> => {
    try {
      send({ type: "login" });
      const { keyIdBase64, contractId: cid } = await account.connectWallet({
        getContractId,
      });

      setKeyId(keyIdBase64);
      setContractId(cid);
      send({ type: "success" });
      send({ type: "connectWallet" });
      send({ type: "walletConnected" });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong logging in. Please try again later.");
      send({ type: "failure" });
    }
  };

  const fund = async (): Promise<void> => {
    setIsFunding(true);

    const toastId = toast.loading("You got it! Awaiting airdrop.");

    try {
      await fundContract(contractId);
      toast.dismiss(toastId);
      toast.success("Funds received. Congrats!");
      void getBalance();
    } catch (err) {
      toast.dismiss(toastId);
      console.error(err);
      toast.error(
        "Something went wrong funding smart wallet. Please try again later.",
      );
    } finally {
      setIsFunding(false);
    }
  };

  //   const donate = async (): Promise<void> => {
  //     setIsDonating(true);
  //     let toastId = "";

  //     try {
  //       const donationInput = window.prompt(
  //         "Donations help this guestbook stay alive. Please enter the quantity of XLM you would like to donate.",
  //         "1",
  //       );

  //       if (!donationInput) {
  //         setIsDonating(false);
  //         return;
  //       }

  //       const donation = Number(donationInput);

  //       if (isNaN(donation) || donation < 1) {
  //         toast.error("Please enter a valid donation amount of at least 1.");
  //         setIsDonating(false);
  //         return;
  //       }

  //       toastId = toast.loading("Submitting donation. Much appreciated!");

  //       const at = await native.transfer({
  //         to: networks.testnet.contractId,
  //         from: contractId,
  //         amount: BigInt(donation * 10_000_000),
  //       });

  //       await account.sign(at, { keyId });
  //       await send(at.built!);

  //       toast.dismiss(toastId);
  //       toast.success("Donation received! You really ARE the goat.");
  //       void getBalance();
  //     } catch (err) {
  //       console.error(err);
  //       toast.error("Something went wrong donating. Please try again later.");
  //     } finally {
  //       setIsDonating(false);
  //       if (toastId !== "") {
  //         toast.dismiss(toastId);
  //       }
  //     }
  //   };

  const logout = async (): Promise<void> => {
    try {
      resetKeyId();
      setContractId("");
      localStorage.removeItem("yog:keyId");
      send({ type: "logout" });
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong logging out. Please try again later.");
    }
  };

  const disconnectWallet = async (): Promise<void> => {
    try {
      send({ type: "disconnectWallet" });
      setContractId("");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong disconnecting wallet. Please try again later.");
    }
  };

  useEffect(() => {
    if (contractId) {
      void getBalance();
    }
  }, [contractId]);

  // Sync state machine with local state
  useEffect(() => {
    if (keyId && contractId && state.matches("unauthenticated")) {
      send({ type: "login" });
      send({ type: "success" });
      send({ type: "connectWallet" });
      send({ type: "walletConnected" });
    }
  }, [keyId, contractId, state, send]);

  const isWalletConnected = state.matches("walletConnected");
  const isAuthenticated = state.matches("authenticated") || isWalletConnected;

  return (
    <div className="flex space-x-1 md:space-x-2">
      {!isAuthenticated ? (
        <>
          <Button variant="default" onClick={signup}>
            Signup
          </Button>
          <Button variant="outline" onClick={login}>
            Login
          </Button>
        </>
      ) : (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="hover:bg-primary/10">
              <Settings />
              <ChevronDown size={18} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="card z-10 w-60 p-4 shadow-xl">
            <div className="space-y-4">
              <div className="flex w-full justify-between gap-4">
                <div>
                  <Identicon width="w-12" address={contractId} />
                </div>
                <div className="flex flex-col gap-0.25">
                  <div className="text-right">
                    <small>Balance</small>
                  </div>
                  <div>
                    <h4 className="h4">
                      {parseFloat((Number(balance) / 1e7).toFixed(2))}
                      <small>XLM</small>
                    </h4>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-bold">Your Wallet</p>
                <div className="mt-1">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <TruncatedAddress address={contractId} />
                    <Clipboard value={contractId}>
                      <Button size="sm" variant="ghost" className="btn-icon-sm">
                        <Copy size={14} />
                      </Button>
                    </Clipboard>
                  </div>
                </div>
              </div>
              <hr className="opacity-50" />
              <nav className="list-nav">
                <ul>
                  <li>
                    <Button
                      variant="success"
                      className="w-full"
                      onClick={fund}
                      disabled={isFunding}
                    >
                      {isFunding ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        <CircleDollarSign />
                      )}
                      <span>Fund Wallet</span>
                    </Button>
                  </li>
                  <li>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() =>
                        window.open(seContractLink(contractId), "_blank")
                      }
                    >
                      <Wallet />
                      <span>View Wallet</span>
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full" onClick={donate}>
                      {isDonating ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        <HelpingHand />
                      )}
                      <span>Send Donation</span>
                    </Button>
                  </li>
                  <li>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={logout}
                    >
                      <LogOut />
                      <span>Logout</span>
                    </Button>
                  </li>
                </ul>
              </nav>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default ConnectBtn;
