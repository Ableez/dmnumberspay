"use client";

import { cn } from "#/lib/utils";
import Logo from "#/components/globals/logo";
import { useState } from "react";
import { CreateWalletButton } from "./create-wallet-btn";
import { LoginWalletButton } from "./login-wallet";
import {
  IconCircleCheckFilled,
  IconFingerprint,
  IconLoader,
  IconSettingsFilled,
  IconWallet,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type Stage =
  | "creating_passkey"
  | "creating_user_data"
  | "creating_wallet"
  | "wallet_created"
  | "prepping_onboard"
  | "idle";

type LoginFormProps = React.ComponentPropsWithoutRef<"div">;

export function LoginForm({ className, ...props }: LoginFormProps) {
  const [stage, setStage] = useState<Stage>("prepping_onboard");

  const renderLoadingState = (message: string) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col place-items-center items-center justify-center gap-6 text-center text-2xl",
        className,
      )}
      {...props}
    >
      <div className="flex min-h-[50dvh] flex-col place-items-center justify-start gap-4">
        <div className="relative my-8 h-24 w-24">
          <AnimatePresence mode="wait">
            {stage === "creating_passkey" && (
              <motion.div
                key="passkey"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <IconFingerprint size={96} className="text-primary" />
              </motion.div>
            )}
            {stage === "creating_user_data" && (
              <motion.div
                key="user-data"
                initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                animate={{ opacity: 0.1, scale: 1, rotate: 360 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{
                  duration: 0.4,
                  rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <IconSettingsFilled size={96} className="text-primary" />
              </motion.div>
            )}
            {stage === "creating_wallet" && (
              <motion.div
                key="wallet"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <IconWallet size={96} className="text-primary" />
              </motion.div>
            )}
            {stage === "wallet_created" && (
              <motion.div
                key="wallet"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <IconCircleCheckFilled size={96} className="text-green" />
              </motion.div>
            )}
            {stage === "prepping_onboard" && (
              <motion.div
                key="wallet"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Image
                  src={"/icons/Boarding-Document--Streamline-Stickies.png"}
                  width={66}
                  height={66}
                  alt="Onboarding"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex place-items-center items-center gap-4 align-middle"
        >
          <IconLoader size={30} className="animate-spin" />
          <h4>{message}</h4>
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {stage !== "prepping_onboard" && (
        <div className="flex flex-col items-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <a
              href="#"
              className={`to-primary/50 from-primary flex flex-col items-center gap-6 bg-gradient-to-b ${stage === "idle" ? "rounded-3xl p-5" : "rounded-2xl p-3"} font-medium`}
            >
              <Logo size={stage === "idle" ? 56 : 32} />
            </a>
          </motion.div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {stage === "creating_passkey" &&
          renderLoadingState("Creating passkey...")}

        {stage === "creating_user_data" &&
          renderLoadingState("Creating user data...")}

        {stage === "creating_wallet" &&
          renderLoadingState("Creating wallet...")}

        {stage === "wallet_created" && renderLoadingState("Lets continue!...")}
        {stage === "prepping_onboard" &&
          renderLoadingState("Lets set you up!...")}

        {stage === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid h-full min-h-[60dvh] flex-col items-center justify-between gap-6 md:min-h-[50dvh]"
          >
            <div className="row-span-6 flex h-full flex-col place-items-center justify-center gap-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="flex flex-col items-center text-center text-4xl font-bold md:text-5xl md:font-semibold"
              >
                <motion.h4
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Your Crypto.
                </motion.h4>
                <motion.h4
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Your Number.
                </motion.h4>
              </motion.div>

              <motion.h4
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="px-4 text-center"
              >
                Create a new wallet with your phone number, or login with your
                existing wallet.
              </motion.h4>
            </div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="flex flex-col place-items-center justify-center gap-4"
            >
              <CreateWalletButton
                setStage={(stage: Stage) => setStage(stage)}
              />
              <LoginWalletButton
                isLoading={false}
                isRedirecting={false}
                disabled={false}
                text="I already have a wallet"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.4 }}
              className="text-center text-xs md:text-sm"
            >
              <h4 className="opacity-60">
                By using Numberspay, you agree to accept our
              </h4>
              <a className="font-bold opacity-80" href="/terms-of-use">
                Terms of Use
              </a>{" "}
              <span className="opacity-60">and </span>
              <a className="font-bold opacity-80" href="/privacy-policy">
                Privacy Policy
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
