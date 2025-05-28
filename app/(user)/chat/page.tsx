"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // ✅ import useRouter

export default function Chat() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 bg-white w-full h-full sm:relative md:w-[620px] md:h-[520px] sm:w-[600px] sm:h-[490px] sm:rounded-xl sm:shadow-2xl mx-auto ">
      {/* กากบาท */}
      <button
        className="absolute top-5 right-8 text-black hover:text-gray-500 text-xl font-bold cursor-pointer"
        onClick={() => router.back()}
      >
        ✕
      </button>

      <div className="flex flex-col">
        <h1 className="p-4 sm:text-xl text-lg text-center font-semibold">
          แจ้งเบาะแส
        </h1>

        <div className="flex flex-col pl-8 sm:pl-14">
          {/* รูป + ลูลู่ */}
          <div className="flex items-center gap-3">
            <img
              src="/all/comment.png"
              alt="profilecomment"
              className="2xl:w-20 2xl:h-20 w-16 h-16 rounded-full object-cover"
            />
            <h1 className="sm:text-xl text-lg font-semibold pl-5">ลูลู่</h1>
          </div>

          {/* เนื้อหาอื่นๆ */}
          <div className="pl-10 ml-[3.5rem]">
            {/* ชื่อผู้พบเห็น */}
            <div className="flex items-center gap-3 mt-3">
              <svg width="10" height="9" viewBox="0 0 10 9" fill="none">
                <ellipse cx="5" cy="4.5" rx="5" ry="4.5" fill="#FFBA60" />
              </svg>
              <p className="sm:text-lg text-md">ชื่อผู้พบเห็น</p>
            </div>
            <p className="sm:text-sm text-xs text-gray-700 pl-6 mb-2">ลูลู่</p>

            {/* รายละเอียดการติดต่อ */}
            <div className="flex items-center gap-3">
              <svg width="10" height="9" viewBox="0 0 10 9" fill="none">
                <ellipse cx="5" cy="4.5" rx="5" ry="4.5" fill="#FFBA60" />
              </svg>
              <p className="sm:text-lg text-md">รายละเอียดการติดต่อ</p>
            </div>
            <div className="flex m:text-sm text-xs text-gray-700 pl-6 mb-2">
              <p className="mr-5">ลูลู่1467</p>
              <p>เบอร์ 022333333</p>
            </div>

            {/* รายละเอียดการพบเห็น */}
            <div className="flex items-center gap-3">
              <svg width="10" height="9" viewBox="0 0 10 9" fill="none">
                <ellipse cx="5" cy="4.5" rx="5" ry="4.5" fill="#FFBA60" />
              </svg>
              <p className="sm:text-lg text-md">รายละเอียดการพบเห็น</p>
            </div>
            <p className="m:text-sm text-xs text-gray-700 pl-6 mb-4">
              เจอน้องตรงหน้าบ้านไม่รู้ใช่ไหม ถ้าใช่ทักมาเลยค่ะ
            </p>

            {/* รูปแมว */}
            <img
              src="/all/catcomment1.png"
              alt="catcomment"
              className="2xl:w-80 2xl:h-40 w-64 h-32 rounded-xl object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
