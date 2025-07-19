"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  IconBellFilled,
  IconDownload,
  IconSettings,
  IconTrashFilled,
  IconArrowLeft,
} from "@tabler/icons-react";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "./ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { usePathname, useRouter } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/": "Home",
  "/send": "Send",
  "/receive": "Receive",
  "/settings": "Settings",
  "/profile": "Profile",
  "/crypto/buy": "Buy",
  "/transactions": "Transactions",
  "/transactions(/.*)?": "Transactions",
  // ...
};

const RIGHT_ICONS: Array<{
  pattern: RegExp;
  config: { bell?: boolean; settings?: boolean };
}> = [
  { pattern: /^\/$/, config: { bell: true, settings: true } },
  { pattern: /^\/send$/, config: { bell: false } },
  { pattern: /^\/receive$/, config: { bell: true } },
  { pattern: /^\/settings$/, config: { bell: true } },
  { pattern: /^\/profile$/, config: { settings: true } },
  { pattern: /^\/crypto\/buy$/, config: { bell: true } },
  {
    pattern: /^\/transactions(\/.*)?$/,
    config: { bell: true, settings: true },
  },
];

// Routes that should show back button instead of profile avatar
const BACK_BUTTON_ROUTES = ["/account"];

const SHOW_TITLE_ROUTES: Record<
  string,
  { searchbar?: boolean; title?: string }
> = {
  "/account": { searchbar: false, title: "Manage Profile" },
  "/send": { searchbar: false, title: "Send" },
};

const MainNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const shouldShowBackButton = BACK_BUTTON_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  const rightIcons = RIGHT_ICONS.find((item) => item.pattern.test(pathname))
    ?.config ?? {
    bell: false,
    settings: false,
  };

  const showTitle = SHOW_TITLE_ROUTES[pathname]?.title ?? false;
  const showSearchbar = SHOW_TITLE_ROUTES[pathname]?.searchbar ?? false;

  const handleBackClick = () => {
    router.back();
  };

  return (
    <nav
      className={`${showTitle || showSearchbar ? "bg-gradient-to-b from-black to-black/70 backdrop-blur-md" : ""} fixed top-0 z-[999999] flex w-full items-center justify-between gap-6 p-4 px-4`}
    >
      <div className="flex items-center gap-2">
        {shouldShowBackButton ? (
          <button
            onClick={handleBackClick}
            className="flex h-11 w-11 cursor-pointer place-items-center justify-center rounded-full align-middle transition-all duration-300 ease-in-out hover:scale-[0.98] hover:bg-white/5"
          >
            <IconArrowLeft size={24} />
          </button>
        ) : (
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* this is where there will page title or searchbar also can be toggled based on route */}
      {showTitle && (
        <div
          className={
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          }
        >
          <h4 className={"text-2xl font-bold text-white"}>{showTitle}</h4>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 align-middle">
        {rightIcons.settings && (
          <Drawer>
            <DrawerTrigger asChild>
              <button className="flex aspect-square h-11 w-11 cursor-pointer place-items-center items-center justify-center rounded-full p-1 align-middle text-xl transition-all duration-300 ease-in-out">
                <IconSettings size={24} />
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <div
                className={
                  "flex min-h-[20dvh] flex-col place-items-center justify-center p-2 align-middle"
                }
              >
                <Dialog>
                  <DialogTrigger asChild>
                    <DrawerClose asChild>
                      <Button variant={"ghost"} className="w-full">
                        Install App
                      </Button>
                    </DrawerClose>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Install App</DialogTitle>
                      <DialogDescription>
                        Add this app to your home screen for quick access and a
                        better experience.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 rounded-lg border p-3">
                        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                          <IconDownload size={20} />
                        </div>
                        <div className="flex flex-col">
                          <p className="font-medium">Install as PWA</p>
                          <p className="text-muted-foreground text-sm">
                            Get app-like experience with offline support
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border p-3">
                        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                          <IconBellFilled size={20} />
                        </div>
                        <div className="flex flex-col">
                          <p className="font-medium">Push Notifications</p>
                          <p className="text-muted-foreground text-sm">
                            Stay updated with real-time notifications
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      {/* <Button variant="outline" onClick={() => window.close()}>
                        Maybe Later
                      </Button>
                      <Button onClick={() => window.close()}>Install Now</Button> */}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </DrawerContent>
          </Drawer>
        )}
        {rightIcons.bell && (
          <Drawer>
            <DrawerTrigger asChild>
              <button className="flex aspect-square h-11 w-11 cursor-pointer place-items-center items-center justify-center rounded-full p-1 align-middle text-xl transition-all duration-300 ease-in-out">
                <IconBellFilled size={24} />
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="h-[100vh] overflow-y-scroll">
                {Array.from({ length: 100 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-1">
                        <h3 className="font-semibold">Numberspay</h3>
                        <p className="text-muted-foreground text-sm">
                          A Progressive Web App built with Next.js
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex aspect-square h-11 w-11 cursor-pointer place-items-center items-center justify-center rounded-full p-1 align-middle text-xl transition-all duration-300 ease-in-out hover:bg-white/20">
                        <IconBellFilled size={20} />
                      </button>
                      <button className="flex aspect-square h-11 w-11 cursor-pointer place-items-center items-center justify-center rounded-full p-1 align-middle text-xl transition-all duration-300 ease-in-out hover:bg-white/20">
                        <IconTrashFilled color={"red"} size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </nav>
  );
};

export default MainNavbar;
