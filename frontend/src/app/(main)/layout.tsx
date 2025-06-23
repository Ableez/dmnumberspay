import MainNavbar from "#/components/navbar";
import React from "react";

const MainLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <main>
      <MainNavbar />
      {children}
    </main>
  );
};

export default MainLayout;
