"use client";

import React from "react";
import TopNavbar from "@/app/component/TopNavbar";
import { usePathname } from "next/navigation";

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isDetailPage =
    pathname.includes("/home/") && pathname.split("/home/")[1]; // มี [id] ต่อท้าย

  return (
    <div
      className={`h w-full overflow-x-hidden ${
        !isDetailPage ? "bg-[#E5EEFF]" : ""
      }`}
    >
      <TopNavbar />
      <main className="w-full bg-white flex-1">{children}</main>
    </div>
  );
};

export default HomeLayout;
