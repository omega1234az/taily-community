"use client";

import React from "react";
import SideNavbar from "@/app/component/SideNavbar";
import TopNavbar from "@/app/component/TopNavbar";

const AnnouncementLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen">
     

      <div className="flex flex-1 overflow-hidden">
        

        <main className="flex-1  xl:p-11  md:pt-16 sm:pt-9 pt-7 overflow-auto">
          <title>ประกาศ</title>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AnnouncementLayout;
