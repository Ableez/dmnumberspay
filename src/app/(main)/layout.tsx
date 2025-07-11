import BottomNav from "#/components/globals/bottom-nav";
import MainNavbar from "#/components/navbar";
import React from "react";

const MainLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <main>
      <MainNavbar />
      <div className="pb-10">{children}</div>
      <BottomNav />
    </main>
  );
};

export default MainLayout;
