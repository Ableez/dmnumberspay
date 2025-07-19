"use client";

import { Button } from "#/components/ui/button";
import React from "react";

const LogoutBtn = () => {
  return (
    <Button
      variant={"destructive"}
      className="flex w-full items-center justify-center gap-2 bg-red-600/10! px-4 py-3 text-red-600! transition-all hover:bg-red-700"
      onClick={() => console.log("Logout")}
    >
      Logout
    </Button>
  );
};

export default LogoutBtn;
