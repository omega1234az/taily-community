"use client";

import React from "react";
import TopNavbar from "@/app/component/Navbaradmin";

const CategoryLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <TopNavbar />

      <main className=" m-12 overflow-auto">{children}</main>
    </div>
  );
};

export default CategoryLayout;
