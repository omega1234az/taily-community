"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";

export default function TopNavbar() {
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

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const toggleNotification = () => {
    setNotificationOpen(!notificationOpen);
  };

  return (
    <div className="sticky mt-5 left-0 right-0 z-50 bg-white px-4 py-2 mx-6 flex justify-between items-center shadow-md rounded-lg">
      <div>
        <img
          src="/all/owen.png"
          alt="logo"
          className="lg:w-12 lg:h-12 xl:w-14 xl:h-14 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full object-cover"
        />
      </div>

      <div className="flex gap-1 font-medium 2xl:gap-20 lg:gap-10 sm:gap-3 items-center relative text-[8px] sm:text-[13px] md:text-[15px] lg:text-lg xl:text-xl 2xl:text-2xl">
        <Link className="hover:text-sky-600 cursor-pointer" href="/manageanns">
          จัดการประกาศ
        </Link>
        <Link className="hover:text-sky-600 cursor-pointer" href="/users">
          จัดการผู้ใช้
        </Link>
        <Link className="hover:text-sky-600 cursor-pointer" href="/category">
          จัดการหมวดหมู่
        </Link>
        <Link className="hover:text-sky-600 cursor-pointer" href="/report">
          ตรวจสอบรายงาน
        </Link>
        <Link className="hover:text-sky-600 cursor-pointer" href="/dashboard">
          Dashboard
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 xl:gap-5 relative">
        {/* 🔔 Notification */}
        <div className="cursor-pointer relative" onClick={toggleNotification}>
          <img
            src="/all/bell.svg"
            alt="bell"
            className="lg:w-12 lg:h-12 xl:w-14 xl:h-14 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 p-1 lg:p-3 md:p-2 rounded-full object-cover cursor-pointer text-gray-600 hover:text-white bg-[#7CBBEB] hover:bg-[#b7ccf5]"
          />

          {notificationOpen && (
            <div
              className="fixed inset-0 z-50 bg-white p-4 overflow-auto sm:absolute 
                        sm:top-18 lg:top-20 sm:left-[-220px] md:left-[-270px] lg:left-[-320px] xl:left-[-410px] sm:w-[250px] sm:h-[260px] md:w-[300px]
                        md:h-[300px] lg:w-[350px] lg:h-[350px] xl:w-[440px] xl:h-[350px]
                        sm:rounded-md sm:border sm:border-gray-300 sm:shadow-md
                        cursor-default"
            >
              {/* ❌ ปิด popup ได้เฉพาะบนจอเล็ก (มือถือ) */}
              <button
                onClick={toggleNotification}
                className="absolute top-[-3px] right-5 text-gray-500 hover:text-gray-900 text-5xl sm:hidden"
                aria-label="Close"
              >
                ×
              </button>
              <div className="border-b-2 border-gray-300 pb-2 xl:text-lg sm:text-md text-lg">
                การแจ้งเตือน
              </div>
              <Link href="/home/01">
                <div className="grid grid-cols-4 bg-[#F6F6F6] hover:bg-gray-200 p-2 cursor-pointer">
                  <div className="col-span-1 my-auto">
                    <img
                      src="/all/jadi.png"
                      alt="profilecomment"
                      className="lg:w-12 lg:h-12 xl:w-14 xl:h-14 w-12 h-12 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover"
                    />
                  </div>
                  <div className="col-span-2 flex flex-col justify-center">
                    <span className="sm:text-xs lg:text-md xl:text-[16px] text-sm">
                      จาได
                    </span>
                    <span className="sm:text-xs lg:text-md xl:text-[13px] text-sm">
                      ประกาศสัตว์เลี้ยงหาย
                    </span>
                    <span className="lg:text-xs sm:text-[10px] text-xs text-gray-500">
                      1 ชั่วโมง
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end items-center">
                    <img
                      src="/home/eggtun2.png"
                      alt="comment"
                      className="lg:w-12 lg:h-16 xl:w-16 xl:h-18 w-14 h-18 sm:w-8 sm:h-10 md:w-10 md:h-12 object-cover"
                    />
                  </div>
                </div>
              </Link>
              <Link href="/home/36">
                <div className="grid grid-cols-4 bg-[#F6F6F6] hover:bg-gray-200 p-2 cursor-pointer">
                  <div className="col-span-1 my-auto">
                    <img
                      src="/all/kala.png"
                      alt="profilecomment"
                      className="lg:w-12 lg:h-12 xl:w-14 xl:h-14 w-12 h-12 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover"
                    />
                  </div>
                  <div className="col-span-2 flex flex-col justify-center">
                    <span className="sm:text-xs lg:text-md xl:text-[16px] text-sm">
                      คาล่า
                    </span>
                    <span className="sm:text-xs lg:text-md xl:text-[13px] text-sm">
                      ประกาศสัตว์หาเจ้าของ
                    </span>
                    <span className="lg:text-xs sm:text-[10px] text-xs text-gray-500">
                      1 ชั่วโมง
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end items-center">
                    <img
                      src="/home/samoy.png"
                      alt="comment"
                      className="lg:w-12 lg:h-16 xl:w-16 xl:h-18 w-14 h-18 sm:w-8 sm:h-10 md:w-10 md:h-12 object-cover"
                    />
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>

        <div ref={profileRef}>
          <img
            src="/all/imageadmin.png"
            alt="profile"
            className="lg:w-12 lg:h-12 xl:w-14 xl:h-14 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full object-cover cursor-pointer"
            onClick={toggleProfile}
          />
          {profileOpen && (
            <div className="absolute right-3 mt-6 lg:w-36 sm:w-28 w-20 bg-white border border-gray-300 rounded shadow-md z-50">
              <ul className="text-[10px] sm:text-sm lg:text-md text-gray-700">
                <li className="px-2 sm;px-4 py-2 hover:bg-gray-300">
                  <button
                    className="w-full text-left cursor-pointer"
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = "/login";
                    }}
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
