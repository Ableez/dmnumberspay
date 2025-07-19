import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Globe } from "lucide-react";
import LogoutBtn from "./_component/logout-btn";

const AccountPage = () => {
  return (
    <div className="flex h-full min-h-screen flex-col bg-black p-4 text-white">
      <div className="mt-24 mb-8 flex flex-col items-center">
        <div className="relative mb-4 h-24 w-24">
          <Image
            src="https://github.com/ableez.png"
            alt="Profile"
            fill
            className="rounded-full object-cover"
          />
          <button className="absolute right-0 bottom-0 rounded-full bg-neutral-800 p-2 transition-all duration-300 ease-in-out hover:bg-neutral-700">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-2 p-2 text-sm text-neutral-500">About</h2>
        <div className="divide-y rounded-3xl bg-neutral-950">
          <Link href="#" className="flex items-center justify-between p-5 px-6">
            <span>Username</span>
            <div className="flex place-items-center items-center align-middle text-neutral-500">
              <h4 className={"font-bold"}>@ableez</h4>
              <ChevronRight size={18} className={"text-white/20"} />
            </div>
          </Link>
          <Link href="#" className="flex items-center justify-between p-5 px-6">
            <span>KYC Verification</span>
            <div
              className={
                "rounded-full bg-indigo-800/20 px-3 py-1 text-sm font-bold text-indigo-500"
              }
            >
              <h4>Tier 1</h4>
            </div>
          </Link>
        </div>
      </div>

      <div>
        <h2 className="mb-2 p-2 text-sm text-neutral-500">Manage</h2>
        <div className="divide-y rounded-3xl bg-neutral-950">
          <Link href="#" className="flex items-center justify-between p-5 px-6">
            <span>Blockchain ledger</span>
            <div className="flex items-center text-neutral-500">
              <span>0</span>
              <ChevronRight size={18} className={"text-white/20"} />
            </div>
          </Link>
          <Link
            href="#-factors"
            className="flex items-center justify-between p-5 px-6"
          >
            <span>Auth Factors</span>
            <div className="flex items-center text-neutral-500">
              <span>1</span>
              <ChevronRight size={18} className={"text-white/20"} />
            </div>
          </Link>
          <Link
            href="#-wallets"
            className="flex items-center justify-between p-5 px-6"
          >
            <span>Your wallets</span>
            <div className="flex items-center text-neutral-500">
              <span>1</span>
              <ChevronRight size={18} className={"text-white/20"} />
            </div>
          </Link>
          <Link href="#" className="flex items-center justify-between p-5 px-6">
            <span>Privacy</span>
            <div className="flex items-center text-neutral-500">
              <Globe size={16} className="mr-1" />
              <span>Public</span>
              <ChevronRight size={18} className={"text-white/20"} />
            </div>
          </Link>
        </div>
      </div>

      <div className={"mt-12 flex flex-col gap-4 p-4"}>
        <LogoutBtn />
        <div className="flex flex-col items-center justify-between p-5 px-6">
          <span>Version</span>
          <div className="text-neutral-500">1.0.0</div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
