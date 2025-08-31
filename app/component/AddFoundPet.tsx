
"use client";

import React from "react";
import Link from "next/link";

interface AddFoundPetProps {
  onClose?: () => void;
}

export default function AddFoundPet({ onClose }: AddFoundPetProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center sm:p-4 bg-opacity-30">
      <div className="bg-white shadow-lg sm:rounded-2xl sm:p-6 p-8 relative 2xl:w-[800px] xl:w-[780px] lg:w-[680px] md:w-[580px] sm:w-[520px] w-full h-full flex justify-center items-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-10 text-gray-500 hover:text-gray-800 lg:text-6xl text-5xl font-bold cursor-pointer"
        >
          ×
        </button>

        {/* "+" button */}
        <Link
          href="/registerfoundpet"
          className="group cursor-pointer hover:bg-gray-200 flex justify-center items-center flex-col gap-6 p-6 rounded-2xl shadow-lg bg-[#E5EEFF] 2xl:h-[315px] 2xl:w-[220px] xl:h-[300px] xl:w-[210px] lg:h-[290px] lg:w-[190px] md:h-[290px] md:w-[200px] sm:w-[180px] sm:h-[250px] h-[380px] w-[280px] transition-transform duration-200 transform hover:scale-105"
        >
          <div className="bg-[#7CBBEB] group-hover:bg-[#addbf7] transition-colors duration-200 rounded-full p-2 flex justify-center items-center">
            <svg
              className="2xl:w-20 2xl:h-20 xl:w-18 xl:h-18 lg:w-14 lg:h-14 md:w-12 md:h-12 sm:w-12 sm:h-12 w-14 h-14"
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
  );
}
