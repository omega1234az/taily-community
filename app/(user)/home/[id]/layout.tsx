"use client";

import React from "react";

const DetailsmissingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 xl:px-40 lg:px-28  md:px-20 sm:px-18 px-12  md:pt-18 sm:pt-14 pt-14 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default DetailsmissingLayout;
