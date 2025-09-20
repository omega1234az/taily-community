"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import React, { useState, useEffect, useRef } from "react";

export default function TopNavbar() {
  const { data: session } = useSession(); // ✅ ใช้ session จาก NextAuth
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    setProfileOpen(false);
  };

  const toggleProfile = () => {
    setProfileOpen(!profileOpen);
    setDropdownOpen(false);
  };

  const toggleNotification = () => {
    setNotificationOpen(!notificationOpen);
  };

  return (
    <div className="sticky mt-5 left-0 right-0 z-50 bg-white px-4 py-2 mx-6 flex justify-between items-center shadow-md rounded-lg">
      {/* โลโก้ */}
      <div>
        <img
          src="/all/logo.png"
          alt="logo"
          className="lg:w-10 lg:h-10 xl:w-11 xl:h-11 w-5.5 h-5.5 sm:w-8 sm:h-8 md:w-9 md:h-9 object-cover"
        />
      </div>

      {/* เมนู */}
      <div className="flex gap-1 font-medium 2xl:gap-20 lg:gap-10 sm:gap-3 items-center relative text-[8px] sm:text-[13px] md:text-[15px] lg:text-lg xl:text-xl 2xl:text-2xl">
        <Link className="hover:text-sky-600 cursor-pointer" href="/home">
          หน้าหลัก
        </Link>
        <Link
          className="hover:text-sky-600 cursor-pointer"
          href="/admin/manageanns"
        >
          จัดการประกาศ
        </Link>
        <Link className="hover:text-sky-600 cursor-pointer" href="/admin/users">
          จัดการผู้ใช้
        </Link>
        <Link
          className="hover:text-sky-600 cursor-pointer"
          href="/admin/category"
        >
          จัดการหมวดหมู่
        </Link>
        <Link
          className="hover:text-sky-600 cursor-pointer"
          href="/admin/report"
        >
          ตรวจสอบรายงาน
        </Link>
        <Link
          className="hover:text-sky-600 cursor-pointer"
          href="/admin/dashboard"
        >
          Dashboard
        </Link>
      </div>

      {/* โปรไฟล์ + แจ้งเตือน */}
      <div className="flex items-center gap-2 sm:gap-3 xl:gap-5 relative">
        {/* 🔔 Notification */}
        <div className="cursor-pointer relative" onClick={toggleNotification}>
          <img
            src="/all/bell.svg"
            alt="bell"
            className="lg:w-12 lg:h-12 xl:w-14 xl:h-14 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 p-1 lg:p-3 md:p-2 rounded-full object-cover cursor-pointer text-gray-600 hover:text-white bg-[#7CBBEB] hover:bg-[#b7ccf5]"
          />
          {/* ... notification popup ... */}
        </div>

        {/* 👤 Profile */}
        <div ref={profileRef}>
          <img
            src={session?.user?.image || "/all/imageadmin.png"} // ✅ ใช้รูปจาก session ถ้าไม่มีใช้ default
            alt="profile"
            className="lg:w-12 lg:h-12 xl:w-14 xl:h-14 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full object-cover cursor-pointer"
            onClick={toggleProfile}
          />
          {profileOpen && (
            <div className="absolute right-3 mt-6 lg:w-36 sm:w-28 w-20 bg-white border border-gray-300 rounded shadow-md z-50">
              <ul className="text-[10px] sm:text-sm lg:text-md text-gray-700">
                <Link href="/profile">
                  <li className="px-2 sm;px-4 py-2 hover:bg-gray-300">
                    โปรไฟล์
                  </li>
                </Link>
                <li className="px-2 sm;px-4 py-2 hover:bg-gray-300">
                  <button
                    className="w-full text-left cursor-pointer"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                  >
                    ออกจากระบบ
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
