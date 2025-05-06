"use client";

import React from 'react';
import Link from 'next/link';

export default function SideNavbar() {  
  return (
    <div className="relative h-screen">
      {/* เมนู */}
      <div className="fixed top-0 left-0 h-full w-64 z-40">
        <div className="relative flex flex-col items-center h-full sm:w-40 md:w-52 xl:w-64 bg-gradient-to-b p-6">
          
          {/* วงกลมบน */}
          <div className="absolute sm:top-[-70px] top-[-30px] left-0 sm:right-0 w-24 sm:left-[-30px] sm:w-52 md:w-56 xl:w-72 h-screen bg-[#7CBBEB] rounded-tr-full"></div>

          {/* เนื้อหา */}
      
          <Link href="/profile" className="flex flex-col sm:items-center z-10 w-full mt-20 ">
            <img
              src="/all/owen.png"
              alt="Profile"
              className="sm:w-24  w-14 xl:w-36 h-auto rounded-full object-cover border-4 border-white mb-2 cursor-pointer"
            />
            <h1 className="text-md sm:text-xl text-white font-bold">โอเวน</h1>
          </Link>

          {/* วงกลมล่าง */}
          <div className="absolute items-center bottom-0 left-0 sm:left-[-30px] h-3/5 bg-[#AFDAFB] w-24 sm:w-52 md:w-56 xl:w-72 rounded-t-full z-0">
            <div className="flex flex-col space-y-8 w-full items-center text-white pt-10 text-sm sm:text-lg md:text-xl xl:text-2xl">
              <Link href="/profile" className="hover:text-blue-900">ประวัติส่วนตัว</Link>
              <Link href="/pet" className="hover:text-blue-900">สัตว์เลี้ยง</Link>
              <Link href="/announcement" className="hover:text-blue-900">ประกาศ</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
