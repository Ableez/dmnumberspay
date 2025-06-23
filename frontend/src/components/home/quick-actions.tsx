import React from "react";
import { Button } from "../ui/button";
import {
  IconDownload,
  IconSend,
  IconSquareRoundedPlusFilled,
} from "@tabler/icons-react";
import Link from "next/link";

type Props = {};

const QuickActions = (props: Props) => {
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
        <Button variant={"faded"} className="flex-1">
          <IconSquareRoundedPlusFilled size={20} /> Add money
        </Button>
        <Button variant={"faded"} className="flex-1">
          <IconDownload size={20} /> Withdraw
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;
