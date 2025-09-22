"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // สำหรับ app router
import SideNavbar from "@/app/component/SideNavbar";
import TopNavbar from "@/app/component/TopNavbar";

const AnnouncementLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login"); // redirect ไปหน้า login
    }
  }, [status, router]);

  // ถ้า session ยัง loading อยู่ อาจจะ return null หรือ spinner
  if (status === "loading") return null;

  // ถ้าไม่มี session จะโดน redirect ไปแล้ว
  return (
    <div className="flex flex-col h-screen">
      <TopNavbar />

      <div className="flex flex-1 overflow-hidden">
        <div className="md:w-64 xl:w-64 sm:w-56 w-32">
          <SideNavbar />
        </div>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default AnnouncementLayout;
