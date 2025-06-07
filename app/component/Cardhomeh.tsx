"use client";

import { useRouter, usePathname } from "next/navigation"; // เพิ่ม usePathname
import React, { useState, useRef, useEffect } from "react";

interface PetCardhProps {
  id: string;
  imageSrc: string;
  name: string;
  age: string;
  gender: string;
  breed: string;
  lostDate: string;
  lostLocation: string;
}

const PetCard: React.FC<PetCardhProps> = ({
  id,
  imageSrc,
  name,
  age,
  gender,
  breed,
  lostDate,
  lostLocation,
}) => {
  const router = useRouter();
  const pathname = usePathname(); // ดึง path ปัจจุบัน

  const isAdminPage = pathname?.includes("/manageanns"); // ตรวจสอบว่าอยู่หน้าแอดมิน

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleDetailClick = () => {
    router.push(`/home/${id}`);
  };

  const handleDelete = () => {
    alert(`ลบประกาศ id: ${id}`);
    setMenuOpen(false);
    // เพิ่มฟังก์ชันลบจริง ๆ ที่นี่
  };

  const handleHide = () => {
    alert(`ซ่อนประกาศ id: ${id}`);
    setMenuOpen(false);
    // เพิ่มฟังก์ชันซ่อนจริง ๆ ที่นี่
  };

  // ปิดเมนูถ้าคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="relative flex flex-col md:flex-row gap-6 p-6 border-2 border-gray-300 rounded-2xl shadow-lg bg-white w-full 2xl:max-w-2xl xl:max-w-xl lg:max-w-md md:max-w-lg sm:max-w-xs max-w-[230px] hover:bg-gray-200">
      {/* ไอคอน อยู่มุมบนขวา ของกรอบหลัก */}
      {isAdminPage && (
        <div className="absolute top-4 right-4 z-20" ref={menuRef}>
          <img
            src="/all/Meatballs.png"
            alt="menu"
            className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
          />
          {/* เมนู Dropdown */}
          {menuOpen && (
            <div className="absolute top-6 sm:top-8 right-1 sm:right-2 bg-white border border-gray-300 rounded shadow-md w-24 sm:w-36 sm:text-sm lg:text-md z-30">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 border-gray-300 border-b cursor-pointer"
                onClick={handleDelete}
              >
                ลบประกาศ
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={handleHide}
              >
                ซ่อนประกาศ
              </button>
            </div>
          )}
        </div>
      )}

      {/* รูปภาพ */}
      <div className="mx-auto md:mx-0">
        <img
          src={imageSrc}
          alt={name}
          className="mx-auto 2xl:w-[400px] 2xl:h-[350px] xl:w-[350px] xl:h-[300px] lg:w-[300px] lg:h-[250px] md:w-[300px] md:h-[250px] sm:w-[180px] sm:h-[230px] h-[150px] w-[100px] rounded-xl overflow-hidden object-cover"
        />
      </div>

      {/* เนื้อหา */}
      <div className="flex flex-col justify-between w-full">
        <div className="sm:space-y-4 space-y-2 text-[10px] 2xl:text-xl xl:text-lg lg:text-md md:text-sm sm:text-xs sm:pl-12 pl-10 md:pl-0">
          <p>
            <strong>ชื่อ:</strong> {name}
          </p>
          <p>
            <strong>อายุ:</strong> {age}
          </p>
          <p>
            <strong>เพศ:</strong> {gender}
          </p>
          <p>
            <strong>สายพันธุ์:</strong> {breed}
          </p>
          <p>
            <strong>หายวันที่:</strong> {lostDate}
          </p>
          <p>
            <strong>สถานที่หาย:</strong> {lostLocation}
          </p>
        </div>

        {/* ปุ่ม */}
        <div className="flex justify-center mt-6 text-center md:text-left">
          <button
            onClick={handleDetailClick}
            className="rounded-xl shadow-md bg-[#EAD64D] text-black text-[10px] 2xl:text-xl xl:text-lg lg:text-md md:text-sm sm:text-xs sm:px-6 sm:py-2 px-4 py-1 hover:bg-yellow-200 transition duration-300 cursor-pointer"
          >
            รายละเอียด
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetCard;
