import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  IconBellFilled,
  IconDownload,
  IconSettings,
  IconTrashFilled,
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

const MainNavbar = () => {
  return (
    <nav className="fixed top-0 z-50 flex w-full items-center justify-between gap-6 p-4">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>

      <div className={"flex items-center justify-between gap-2 align-middle"}>
        <Drawer>
          <DrawerTrigger asChild>
            <button className="flex aspect-square h-11 w-11 cursor-pointer place-items-center items-center justify-center rounded-full bg-white/10 p-1 align-middle text-xl transition-all duration-300 ease-in-out hover:bg-white/20">
              <IconBellFilled size={20} />
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

        <Drawer>
          <DrawerTrigger asChild>
            <button className="flex aspect-square h-11 w-11 cursor-pointer place-items-center items-center justify-center rounded-full bg-white/10 p-1 align-middle text-xl transition-all duration-300 ease-in-out hover:bg-white/20">
              <IconSettings size={20} />
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
      </div>
    </nav>
  );
};

export default MainNavbar;
