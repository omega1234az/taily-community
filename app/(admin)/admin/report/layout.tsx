"use client";

import React from "react";
import TopNavbar from "@/app/component/Navbaradmin";

const ReportLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">  
      <TopNavbar />

      <main className="m-10 sm:m-12 lg:m-18 overflow-auto">{children}</main>
    </div>
  );
};

export default ReportLayout;
