"use client";

import {
  IconArrowLeft,
  IconHome,
  IconReceiptFilled,
  IconUserFilled,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const BottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  const showBackButton = !["/", "/transactions", "/account"].includes(pathname);

  return (
    <div
      className={
        "fixed bottom-0 left-1/2 flex w-full -translate-x-1/2 place-items-center items-center justify-between bg-gradient-to-b from-transparent to-black/50 p-3 px-4 align-middle"
      }
    >
      {showBackButton && (
        <button
          onClick={() => router.back()}
          className="absolute left-6 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white backdrop-blur-xl"
        >
          <IconArrowLeft size={20} />
        </button>
      )}
      <div className="mx-auto flex w-2/4 place-items-center justify-between overflow-clip rounded-full border border-white/10 bg-black/30 align-middle shadow-lg backdrop-blur-xl">
        {[
          { icon: <IconHome size={24} />, id: 0, path: "/" },
          {
            icon: <IconReceiptFilled size={24} />,
            id: 1,
            path: "/transactions",
          },
          { icon: <IconUserFilled size={24} />, id: 2, path: "/account" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              router.push(item.path);
            }}
            className={`relative flex h-14 w-full cursor-pointer place-items-center items-center justify-center px-3.5 align-middle transition-all duration-500 ease-out ${
              pathname === item.path
                ? "text-primary z-10 scale-110"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            {pathname === item.path && (
              <span className="absolute inset-0 animate-pulse rounded-full bg-purple-300/10 blur-md" />
            )}
            <span className="relative z-10">{item.icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
