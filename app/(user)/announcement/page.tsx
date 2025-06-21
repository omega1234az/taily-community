"use client";

import React, { useState } from "react";
import AnCard from "@/app/component/AnCard";
import Link from "next/link";

export default function Announcement() {
  return (
    <div>
      <div className="flex items-center gap-2">
        <svg
          width="19"
          height="15"
          viewBox="0 0 19 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-2.5 h-2.5 sm:w-3 sm:h-3 xl:w-3.5 xl:h-3.5 2xl:w-6 2xl:h-10"
        >
          <ellipse cx="9.5" cy="7.5" rx="9.5" ry="7.5" fill="#7CBBEB" />
        </svg>
        <h1 className="sm:text-lg xl:text-2xl font-bold">สัตว์เลี้ยงหาย</h1>
      </div>

      <div className="flex xl:flex-row xl:flex-wrap flex-col lg:pl-14 xl:pl-0 gap-10 py-5">
        <AnCard
          imageSrc="/home/eggtun.png"
          name="ไข่ตุ๋น"
          age="1 ปี"
          gender="ตัวผู้"
          breed="บริติช ช็อตแฮร์"
          lostDate="2/5/2568"
          lostLocation="บ้านหนองอึ่งพัฒนา อ.เมือง จ.กำแพงเพชร"
          reward="5000"
        />

        <Link
          href="/registermissing"
          className="group cursor-pointer hover:bg-gray-200 transition duration-200 flex justify-center items-center flex-col md:flex-row gap-6 p-6 rounded-2xl shadow-lg bg-[#E5EEFF] w-full xl:h-[300px] lg:h-[275px] md:h-[250px] sm:h-[390px] h-[350px] 2xl:max-w-[200px] xl:max-w-[200px] lg:max-w-[170px] md:max-w-[160px] sm:max-w-[288px] max-w-[235px] ml-5 sm:ml-12 md:ml-0"
        >
          <div className="bg-[#7CBBEB] group-hover:bg-[#addbf7] transition-colors duration-200 rounded-full p-2 flex justify-center items-center">
            <svg
              className="2xl:w-20 2xl:h-20 xl:w-18 xl:h-18 lg:w-14 lg:h-14 md:w-12 md:h-12 sm:w-12 sm:h-12 w-10 h-10"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
            >
              <path
                d="M50 20V80M20 50H80"
                stroke="white"
                strokeWidth="10"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2 mt-5">
        <svg
          width="19"
          height="15"
          viewBox="0 0 19 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-2.5 h-2.5 sm:w-3 sm:h-3 xl:w-3.5 xl:h-3.5 2xl:w-6 2xl:h-10"
        >
          <ellipse cx="9.5" cy="7.5" rx="9.5" ry="7.5" fill="#7CBBEB" />
        </svg>
        <h1 className="sm:text-lg xl:text-2xl font-bold">หาเจ้าของ</h1>
      </div>

      <Link
        href="/registerowner"
        className="group cursor-pointer hover:bg-gray-200 transition duration-200 flex justify-center items-center flex-col md:flex-row gap-6 p-6 my-5 rounded-2xl shadow-lg bg-[#E5EEFF] w-full xl:h-[300px] lg:h-[275px] md:h-[250px] sm:h-[390px] h-[350px] 2xl:max-w-[200px] xl:max-w-[200px] lg:max-w-[170px] md:max-w-[160px] sm:max-w-[288px] max-w-[235px] ml-5 sm:ml-12 md:ml-0"
      >
        <div className="bg-[#7CBBEB] group-hover:bg-[#addbf7] transition-colors duration-200 rounded-full p-2 flex justify-center items-center">
          <svg
            className="2xl:w-20 2xl:h-20 xl:w-18 xl:h-18 lg:w-14 lg:h-14 md:w-12 md:h-12 sm:w-12 sm:h-12 w-10 h-10"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
          >
            <path
              d="M50 20V80M20 50H80"
              stroke="white"
              strokeWidth="10"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </Link>
    </div>
  );
}
