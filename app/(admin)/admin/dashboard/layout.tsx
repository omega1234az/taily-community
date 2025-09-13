"use client";

import React from "react";
import TopNavbar from "@/app/component/Navbaradmin";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen pb-10">  
      <TopNavbar />

      <main className=" sm:m-12 m-8 overflow-auto">{children}</main>
    </div>
  );
};

export default DashboardLayout;
