"use client";

import React from "react";
import TopNavbar from "@/app/component/Navbaradmin";
import { usePathname } from "next/navigation";

const ManageAnnsLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isDetailPage =
    pathname.includes("/manageanns/") && pathname.split("/manageanns/")[1]; // มี [id] ต่อท้าย

  return (
    <div>
      <TopNavbar />
      <main className="w-full bg-white flex-1">{children}</main>
    </div>
  );
};

export default ManageAnnsLayout;
