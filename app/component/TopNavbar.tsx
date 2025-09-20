"use client";

import { signOut, signIn, useSession } from "next-auth/react";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { getUserProfile } from "@/app/utils/Profiles";
import { useRouter } from "next/navigation";

export default function TopNavbar() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<any[]>([]);

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

      // ดึง notifications
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => setNotifications(data.data || []))
        .catch((err) => console.error("Failed to fetch notifications", err));
    } else {
      setUserProfile(null);
      setNotifications([]);
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

  const handleClickNotification = async (notif: any) => {
    try {
      // mark as read
      await fetch(`/api/notifications/${notif.id}`, { method: "PATCH" });

      // update state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );

      // redirect
      if (notif.linkUrl) {
        router.push(notif.linkUrl);
        setNotificationOpen(false);
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // 🔴 noti ที่ยังไม่ได้อ่าน
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="sticky mt-5 left-0 right-0 z-50 bg-white px-4 py-2 mx-6 flex justify-between items-center shadow-md rounded-lg">
      {/* Logo */}
      <div>
        <img
          src="/all/logo.png"
          alt="logo"
          className="lg:w-10 lg:h-10 xl:w-11 xl:h-11 w-5.5 h-5.5 sm:w-8 sm:h-8 md:w-9 md:h-9  object-cover"
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
            <div className="absolute top-10 left-0 lg:w-40 sm:w-30 w-24 bg-white border border-gray-300 rounded shadow-md z-50">
              <ul className="text-sm text-gray-700">
                <li className="px-4 py-2 hover:bg-gray-300 cursor-pointer border-b border-gray-300 text-xs sm:text-sm lg:text-md">
                  <Link href="/announcement">สัตว์เลี้ยงหาย</Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-300 cursor-pointer text-xs sm:text-sm lg:text-md">
                  <Link href="/announcement">หาเจ้าของ</Link>
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
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full px-2">
              {unreadCount}
            </span>
          )}

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

              <div className="overflow-y-auto max-h-64 sm:max-h-80">
                {notifications.length === 0 ? (
                  <div className="p-4 text-gray-500 text-sm">
                    ไม่มีการแจ้งเตือน
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleClickNotification(n)}
                      className={`grid grid-cols-4 gap-2 p-2 cursor-pointer ${
                        n.isRead ? "bg-white" : "bg-gray-100"
                      } hover:bg-gray-200`}
                    >
                      <div className="col-span-1">
                        <img
                          src="/all/comment.png"
                          alt="notif"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </div>
                      <div className="col-span-3 flex flex-col justify-center">
                        <span className="text-sm font-medium">{n.title}</span>
                        <span className="text-xs text-gray-600">
                          {n.message}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
                src={
                  userProfile?.image || session.user.image || "/all/profile.png"
                }
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

                    {/* ✅ แสดงเมนูสำหรับ admin เท่านั้น */}
                    {session.user.role === "admin" && (
                      <Link href="/admin/dashboard">
                        <li className="px-4 py-2 hover:bg-gray-300 cursor-pointer border-b border-gray-300">
                          จัดการระบบ
                        </li>
                      </Link>
                    )}

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
