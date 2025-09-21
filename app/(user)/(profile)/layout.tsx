"use client";

import React from "react";
import SideNavbar from "@/app/component/SideNavbar";
import TopNavbar from "@/app/component/TopNavbar";

const AnnouncementLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen">
      <TopNavbar />

      <div className="flex flex-1 overflow-hidden">
        <div className="md:w-64   xl:w-64 sm:w-56 w-32">
          <SideNavbar />
        </div>

        <main className="flex-1  ">
          
          {children}
        </main>
      </div>
    </div>
  );
};

export default AnnouncementLayout;
