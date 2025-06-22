import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const Navbar = () => {
  return (
    <div className={"flex place-items-center justify-between align-middle"}>
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>

      <div>
        
      </div>
    </div>
  );
};

export default Navbar;
