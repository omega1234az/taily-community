"use client";

import React from "react";
import TopNavbar from "@/app/component/Navbaradmin";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <TopNavbar />

      <main className=" sm:m-12 m-8 overflow-auto">{children}</main>
    </div>
  );
};

export default DashboardLayout;
