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
          className="lg:w-12 lg:h-12 xl:w-14 xl:h-14 w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full object-cover"
        />
      </div>

      <div className="flex gap-4 font-medium sm:gap-10 lg:gap-28 xl:gap-42 items-center relative text-xs sm:text-lg lg:text-xl 2xl:text-2xl">
        <Link className="hover:text-sky-600 cursor-pointer" href="/home">
          หน้าแรก
        </Link>
        <div
          className="flex items-center gap-1 relative cursor-pointer"
          ref={dropdownRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={toggleDropdown}
        >
          <h1 className={isHovered ? "text-sky-600" : ""}>ประกาศ</h1>
          <span
            className={`transition-colors ${
              isHovered ? "text-sky-600" : "text-gray-600"
            }`}
          >
            <svg
              width="21"
              height="24"
              viewBox="0 0 21 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-2 h-2 sm:w-3 sm:h-3  xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4"
            >
              <path
                d="M9.552 23.864C8.88 23.864 8.256 23.512 7.68 22.808C7.104 22.136 6.656 21.32 6.336 20.36C6.272 20.136 5.792 18.808 4.896 16.376C3.232 12.056 2.096 8.904 1.488 6.92C1.296 6.216 1.072 5.592 0.816 5.048C0.464 4.12 0.288 3.464 0.288 3.08C0.288 2.536 0.528 2.04 1.008 1.592C1.52 1.144 2.08 0.919998 2.688 0.919998C3.168 0.919998 3.632 1.064 4.08 1.352C4.56 1.64 4.896 2.104 5.088 2.744C5.28 3.32 5.632 4.52 6.144 6.344C6.848 8.808 7.456 10.904 7.968 12.632C8.512 14.36 9.104 16.072 9.744 17.768L12.384 11.432L15.312 4.52C15.472 4.232 15.712 3.784 16.032 3.176C16.352 2.568 16.688 2.136 17.04 1.88C17.392 1.624 17.824 1.496 18.336 1.496C18.944 1.496 19.472 1.656 19.92 1.976C20.368 2.296 20.592 2.76 20.592 3.368C20.592 3.912 20.496 4.408 20.304 4.856C20.144 5.304 19.856 5.96 19.44 6.824C19.024 7.56 18.768 8.04 18.672 8.264L13.152 20.072C12.672 21.32 12.176 22.264 11.664 22.904C11.152 23.544 10.448 23.864 9.552 23.864Z"
                fill="currentColor"
              />
            </svg>
          </span>
          {dropdownOpen && (
            <div className="absolute top-6 left-0 lg:w-40 sm:w-30 w-24 2xl:mt-7 xl:mt-6 sm:mt-5 mt-4  bg-white border border-gray-300 rounded shadow-md z-50">
              <ul className="text-sm text-gray-700">
                <li className="px-4 py-2 hover:bg-gray-300 cursor-pointer border-b border-gray-300 text-[10px] sm:text-sm lg:text-md">
                  <Link href="/missing">สัตว์เลี้ยงหาย</Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-300 cursor-pointer border-b border-gray-300 text-[10px] sm:text-sm lg:text-md">
                  <Link href="/registerowner">หาเจ้าของ</Link>
                </li>
              </ul>
            </div>
          )}
        </div>
        <Link className="hover:text-sky-600 cursor-pointer" href="/petfriend">
          เพิ่มเพื่อนสัตว์เลี้ยง
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 xl:gap-5 relative">
        {/* 🔔 Notification */}
        <div className="cursor-pointer relative" onClick={toggleNotification}>
          <img
            src="/all/bell.svg"
            alt="bell"
            className="lg:w-12 lg:h-12 xl:w-14 xl:h-14 w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 p-2 md:p-3 rounded-full object-cover cursor-pointer text-gray-600 hover:text-white bg-[#7CBBEB] hover:bg-[#b7ccf5]"
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
              <Link href="/chat">
                <div className="grid grid-cols-4 bg-[#F6F6F6] hover:bg-gray-200 p-2 cursor-pointer">
                  <div className="col-span-1">
                    <img
                      src="/all/comment.png"
                      alt="profilecomment"
                      className="lg:w-12 lg:h-12 xl:w-14 xl:h-14 w-12 h-12 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover"
                    />
                  </div>
                  <div className="col-span-2 flex flex-col justify-center">
                    <span className="sm:text-xs lg:text-md xl:text-[16px] text-sm">
                      เจอน้องตรงหน้าบ้านไม่รู้ใช่ไหม
                    </span>
                    <span className="lg:text-xs sm:text-[10px] text-xs text-gray-500">
                      1 ชั่วโมง
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end items-center">
                    <img
                      src="/all/catcomment.png"
                      alt="catcomment"
                      className="lg:w-12 lg:h-12 xl:w-14 xl:h-14 w-12 h-12 sm:w-10 sm:h-10 md:w-12 md:h-12 object-cover"
                    />
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>

        <div ref={profileRef}>
          <img
            src="/all/profile.png"
            alt="profile"
            className="lg:w-12 lg:h-12 xl:w-14 xl:h-14 w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full object-cover cursor-pointer"
            onClick={toggleProfile}
          />
          {profileOpen && (
            <div className="absolute right-0 mt-4 lg:w-40 sm:w-30 w-28 bg-white border border-gray-300 rounded shadow-md z-50">
              <ul className="text-sm text-gray-700">
                <li className="px-4 py-2 hover:bg-gray-300 cursor-pointer border-b border-gray-300">
                  <Link href="/profile">โปรไฟล์</Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-300">
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
