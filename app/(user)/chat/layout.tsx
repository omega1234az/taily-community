"use client";

import React from "react";

const DetailsmissingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen bg-gray-100">
      <main className="h-full flex items-center justify-center">
        {children}
      </main>
    </div>
  );
};

export default DetailsmissingLayout;
