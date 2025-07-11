import React from "react";
import { Button } from "../ui/button";
import {
  IconDownload,
  IconPlus,
  IconSend,
  IconSquareRoundedPlusFilled,
} from "@tabler/icons-react";
import Link from "next/link";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";

const QuickActions = () => {
  return (
    <div
      className={
        "flex w-full flex-col place-items-center justify-center gap-4 px-4 align-middle"
      }
    >
      <Link className={"w-full"} href={"/send"}>
        <Button className="bg-primary w-full font-semibold">
          <IconSend size={20} /> Send
        </Button>
      </Link>
      <div className="flex w-full place-items-center justify-between gap-4 align-middle">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="faded" className="flex-1">
              <IconPlus size={20} /> Add money
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="flex flex-col gap-4 p-4 pb-16">
              <DrawerTitle className="text-xl font-black">
                Add money
              </DrawerTitle>
              <div className="flex flex-col gap-2">
                <Link href="/crypto/buy">
                  <Button
                    variant="primary"
                    className="flex h-20 w-full gap-2 rounded-3xl text-left"
                  >
                    <IconSquareRoundedPlusFilled size={20} />
                    Buy Crypto
                  </Button>
                </Link>
                <Link href="/receive">
                  <Button
                    variant="faded"
                    className="flex h-20 w-full gap-2 rounded-3xl text-left"
                  >
                    <IconDownload size={20} />
                    Receive Crypto
                  </Button>
                </Link>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
        <Button variant={"faded"} className="flex-1">
          <IconDownload size={20} /> Withdraw
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;
