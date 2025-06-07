"use client";

import React from "react";
import TopNavbar from "@/app/component/Navbaradmin";

const UsersLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <TopNavbar />

      <main className=" m-12 overflow-auto">{children}</main>
    </div>
  );
};

export default UsersLayout;
