"use client";

import React from "react";
import TopNavbar from "@/app/component/Navbaradmin";

const CategoryLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <TopNavbar />

      <main className=" m-10 sm:m-12 lg:m-18 overflow-auto">{children}</main>
    </div>
  );
};

export default CategoryLayout;
