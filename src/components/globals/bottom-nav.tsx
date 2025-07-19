"use client";

import {
  IconArrowLeft,
  IconGridDots,
  IconHome,
  IconReceiptFilled,
  IconUserFilled,
  IconX,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

const BottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  const mainPages = ["/", "/transactions", "/account"];
  const showBackButton = !mainPages.includes(pathname);

  const [open, setOpen] = useState(false);

  // Set open state when on main pages
  useEffect(() => {
    if (mainPages.includes(pathname)) {
      setOpen(true);
    }
  }, [pathname]);

  // Load state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem("bottomNavOpen");
    if (savedState !== null) {
      setOpen(savedState === "true");
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("bottomNavOpen", String(open));
  }, [open]);

  const toggleOpen = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const isActivePath = (path: string): boolean => {
    if (path === pathname) return true;
    if (path === "/transactions" && pathname.startsWith("/transactions/"))
      return true;
    return false;
  };

  return (
    <div
      className={
        "fixed bottom-0 left-1/2 z-[49] flex w-full -translate-x-1/2 place-items-center items-center justify-between bg-gradient-to-b from-transparent to-black/50 p-3 px-4 align-middle"
      }
    >
      {showBackButton && (
        <button
          onClick={() => router.back()}
          className="absolute left-6 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white backdrop-blur-xl transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <IconArrowLeft size={20} />
        </button>
      )}
      <div
        className={`mx-auto flex ${open ? "w-2/4 border-white/10 opacity-100" : "w-0 border-transparent opacity-0"} place-items-center justify-between overflow-hidden rounded-full border bg-black/30 align-middle shadow-lg backdrop-blur-xl transition-all duration-500 ease-in-out`}
      >
        {[
          {
            icon: (
              <IconHome
                size={24}
                className={`transform transition-transform duration-500 ease-out ${open ? "scale-100" : "scale-0"}`}
              />
            ),
            id: 0,
            path: "/",
          },
          {
            icon: (
              <IconReceiptFilled
                size={24}
                className={`transform transition-transform duration-500 ease-out ${open ? "scale-100" : "scale-0"}`}
              />
            ),
            id: 1,
            path: "/transactions",
          },
          {
            icon: (
              <IconUserFilled
                size={24}
                className={`transform transition-transform duration-500 ease-out ${open ? "scale-100" : "scale-0"}`}
              />
            ),
            id: 2,
            path: "/account",
          },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              router.push(item.path);
            }}
            className={`relative flex h-14 w-full cursor-pointer place-items-center items-center justify-center px-3.5 align-middle transition-all duration-500 ease-in-out ${
              isActivePath(item.path)
                ? "text-primary z-10 scale-110"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            {isActivePath(item.path) && (
              <span className="absolute inset-0 animate-pulse rounded-full bg-purple-300/10 blur-md" />
            )}
            <span className="relative z-10">{item.icon}</span>
          </button>
        ))}
      </div>

      <button
        onClick={toggleOpen}
        className="absolute right-6 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/30 text-white backdrop-blur-xl transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] active:bg-white/5"
      >
        {open ? (
          <IconX
            size={20}
            className="rotate-0 transform transition-all duration-500 ease-in-out"
            style={{ animation: open ? "rotateIn 0.5s ease-out" : "none" }}
          />
        ) : (
          <IconGridDots
            size={20}
            className="rotate-0 transform transition-all duration-500 ease-in-out"
            style={{ animation: !open ? "fadeIn 0.5s ease-out" : "none" }}
          />
        )}
      </button>
    </div>
  );
};

export default BottomNav;
