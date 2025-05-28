"use client";

import React from "react";
import TopNavbar from "@/app/component/TopNavbar";

const RegisterownerLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen">
      <TopNavbar />

      <main className="flex-1 xl:pl-40 lg:pl-18  md:pl-20 sm:pl-18 pl-10  md:pt-18 sm:pt-14 pt-14 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default RegisterownerLayout;
