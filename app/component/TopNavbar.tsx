"use client";

import { signOut, signIn, useSession } from "next-auth/react";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { getUserProfile } from "@/app/utils/Profiles"; // สมมติว่าคุณมีฟังก์ชันนี้

export default function TopNavbar() {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  // ปิด dropdown เมื่อคลิกข้างนอก
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

  // ดึงข้อมูลโปรไฟล์เมื่อ session พร้อม
  useEffect(() => {
    if (status === "authenticated") {
      setLoadingProfile(true);
      getUserProfile()
        .then((data) => {
          setUserProfile(data);
          setProfileError(null);
        })
        .catch((err) => {
          console.error("Failed to fetch user profile", err);
          setProfileError("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้");
        })
        .finally(() => {
          setLoadingProfile(false);
        });
    } else {
      setUserProfile(null);
      setProfileError(null);
    }
  }, [status]);

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

  // กรณียังโหลดข้อมูล หรือมี error สามารถแสดงได้ตรงนี้

  return (
    <div className="sticky mt-5 left-0 right-0 z-50 bg-white px-4 py-2 mx-6 flex justify-between items-center shadow-md rounded-lg">
      {/* Logo */}
      <div>
        <img
          src="/all/owen.png"
          alt="logo"
          className="lg:w-12 lg:h-12 xl:w-14 xl:h-14 w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full object-cover"
        />
      </div>

      {/* Menu */}
      <div className="flex gap-4 font-medium sm:gap-10 lg:gap-28 xl:gap-56 items-center relative text-xs sm:text-lg lg:text-xl 2xl:text-2xl">
        <Link className="hover:text-sky-600 cursor-pointer" href="/home">
          หน้าแรก
        </Link>
        <div
          className="flex items-center gap-1 relative cursor-pointer"
          ref={dropdownRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={toggleDropdown}
        >
          <h1 className={isHovered ? "text-sky-600" : ""}>ประกาศ</h1>
          <span
            className={`transition-colors ${
              isHovered ? "text-sky-600" : "text-gray-600"
            }`}
          >
            ▼
          </span>
          {dropdownOpen && (
            <div className="absolute top-6 left-0 lg:w-40 sm:w-30 w-24 2xl:mt-7 xl:mt-6 sm:mt-5 mt-4 bg-white border border-gray-300 rounded shadow-md z-50">
              <ul className="text-sm text-gray-700">
                <li className="px-4 py-2 hover:bg-gray-300 cursor-pointer border-b border-gray-300 text-[10px] sm:text-sm lg:text-md">
                  <Link href="/registermissing">สัตว์เลี้ยงหาย</Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-300 cursor-pointer border-b border-gray-300 text-[10px] sm:text-sm lg:text-md">
                  <Link href="/registerowner">หาเจ้าของ</Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Notification & Profile */}
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
              sm:top-18 lg:top-20 sm:left-[-220px] md:left-[-270px] lg:left-[-320px] xl:left-[-410px]
              sm:w-[250px] sm:h-[260px] md:w-[300px] md:h-[300px] lg:w-[350px] lg:h-[350px] xl:w-[440px] xl:h-[350px]
              sm:rounded-md sm:border sm:border-gray-300 sm:shadow-md cursor-default"
            >
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

        {/* 👤 Profile */}
        <div ref={profileRef}>
          {status === "loading" ? (
            <p className="text-gray-500 text-xs sm:text-sm">กำลังโหลด...</p>
          ) : session?.user ? (
            <>
              <img
                src={userProfile?.image || session.user.image || "/all/profile.png"}
                alt="profile"
                className="lg:w-12 lg:h-12 xl:w-14 xl:h-14 w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full object-cover cursor-pointer"
                onClick={toggleProfile}
              />
              {profileOpen && (
                <div className="absolute right-0 mt-4 lg:w-40 sm:w-30 w-28 bg-white border border-gray-300 rounded shadow-md z-50">
                  <ul className="text-sm text-gray-700">
                    <Link href="/profile">
                      <li className="px-4 py-2 hover:bg-gray-300 cursor-pointer border-b border-gray-300">
                        โปรไฟล์
                      </li>
                    </Link>
                    <li className="px-4 py-2 hover:bg-gray-300">
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
            </>
          ) : (
            <button
              onClick={() => signIn()}
              className="text-xs sm:text-sm md:text-base px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-md"
            >
              เข้าสู่ระบบ
            </button>
          )}
          {profileError && (
            <p className="text-red-600 text-xs mt-1">{profileError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
