"use client";

import React from "react";
import TopNavbar from "@/app/component/TopNavbar";

// Layout component for missing pet pages
const MissingPetLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen">
      <TopNavbar />

      <div className="px-30 mt-10">
        <title>สัตว์เลี้ยงหาย</title>
        {children}
      </div>
    </div>
  );
};

export default MissingPetLayout;
