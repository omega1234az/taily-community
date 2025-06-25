"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getUserProfile } from "@/app/utils/Profiles";
import { usePathname } from "next/navigation";

export default function SideNavbar() {
  const [userData, setUserData] = useState<any>(null);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await getUserProfile();
        setUserData(profile);
      } catch (err) {
        console.error("ไม่สามารถโหลดข้อมูลผู้ใช้:", err);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="relative h-screen">
      <div className="fixed top-0 left-0 h-full w-64 z-40">
        <div className="relative flex flex-col items-center h-full sm:w-40 md:w-52 xl:w-64 bg-gradient-to-b p-6">
          {/* วงกลมบน */}
          <div className="absolute sm:top-[-70px] top-[-30px] left-0 sm:left-[-30px] sm:w-52 md:w-56 xl:w-72 w-24 h-screen bg-[#7CBBEB] rounded-tr-full z-0"></div>

          {/* โปรไฟล์ในวงกลม */}
          <div className="absolute top-7 left-1/5 sm:top-10 sm:left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center mt-16 sm:mt-20">
            <Link href="/profile" className="flex flex-col items-center">
              <img
                src={userData?.image || "/all/owen.png"}
                alt="Profile"
                className="sm:w-24 w-14 xl:w-36 h-auto rounded-full object-cover sm:border-4 border-2 border-white mb-2 cursor-pointer"
              />
              <h1 className="text-md sm:text-xl text-white font-bold xl:mb-10">
                {userData?.name || "ไม่ทราบชื่อ"}
              </h1>
            </Link>
          </div>

          {/* วงกลมล่าง */}
          <div className="absolute bottom-0 left-0 sm:left-[-30px] sm:h-3/5 h-5/7 bg-[#AFDAFB] w-24 sm:w-52 md:w-56 xl:w-72 rounded-t-full z-0">
            <div className="flex flex-col space-y-8 w-full items-center text-white pt-10 text-sm sm:text-lg md:text-xl xl:text-2xl">
              <Link
                href="/profile"
                className={
                  isActive("/profile")
                    ? "text-blue-900 "
                    : "hover:text-blue-900"
                }
              >
                ประวัติส่วนตัว
              </Link>
              <Link
                href="/pet"
                className={
                  isActive("/pet") ? "text-blue-900 " : "hover:text-blue-900"
                }
              >
                สัตว์เลี้ยง
              </Link>
              <Link
                href="/announcement"
                className={
                  isActive("/announcement")
                    ? "text-blue-900 "
                    : "hover:text-blue-900"
                }
              >
                ประกาศ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
