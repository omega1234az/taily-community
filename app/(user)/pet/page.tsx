"use client";

import React from 'react'
import Link from 'next/link'
import PetCard from '@/app/component/PetCard'



export default function pet() {
  return (
    <div>
        <div className="flex items-center gap-2">
        <svg width="19" height="15" viewBox="0 0 19 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 sm:w-3 sm:h-3 xl:w-3.5 xl:h-3.5 2xl:w-6 2xl:h-10">
          <ellipse cx="9.5" cy="7.5" rx="9.5" ry="7.5" fill="#7CBBEB" />
        </svg>
        <h1 className="sm:text-lg xl:text-2xl font-bold">สัตว์เลี้ยง</h1>
      </div>

      <div className="flex flex-wrap py-5 md:gap-10 gap-8">
        <PetCard imageSrc="/home/eggtun2.png" name="ไข่ตุ๋น" />
        <PetCard imageSrc="/all/pigtun.png" name="หมูตุ๋น" />
      

      <div className="group cursor-pointer hover:bg-gray-200 transition duration-200 flex justify-center items-center flex-col md:flex-row gap-6 p-6 rounded-2xl shadow-lg bg-[#E5EEFF] w-full xl:h-[240px] lg:h-[180px] md:h-[178px] sm:h-[175px] h-[140px] 2xl:max-w-[175px] xl:max-w-[175px] lg:max-w-[135px] md:max-w-[130px] sm:max-w-[125px] max-w-[95px]">
  <Link href="/registerpet" className="w-full h-full flex justify-center items-center">
    <div className="bg-[#7CBBEB] group-hover:bg-[#addbf7] transition-colors duration-200 rounded-full p-2 flex justify-center items-center">
      <svg
        className="2xl:w-14 2xl:h-14 xl:w-14 xl:h-14 lg:w-11 lg:h-11 md:w-10 md:h-10 sm:w-9 sm:h-9 w-8 h-8"
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
        </div>

    

     

    </div>
  )
}
