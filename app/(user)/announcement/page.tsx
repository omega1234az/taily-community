"use client";

import React, { useState } from "react";
import AnCard from "@/app/component/AnCard";
import PetCard from "@/app/component/PetCard";
import Link from 'next/link';
import Image from 'next/image';


export default function Announcement() {
  const [showModal, setShowModal] = useState(false);

  // กำหนดค่าเป็น false เพื่อทดสอบว่าไม่ได้ลงทะเบียน
  const [hasRegisteredPets, setHasRegisteredPets] = useState(true);

  const handleCancel = () => setShowModal(false);
  const handleSave = () => setShowModal(false);

  return (
    <div>
      <div className="flex items-center gap-2">
        <svg
          width="19"
          height="15"
          viewBox="0 0 19 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-2.5 h-2.5 sm:w-3 sm:h-3 xl:w-3.5 xl:h-3.5 2xl:w-6 2xl:h-10"
        >
          <ellipse cx="9.5" cy="7.5" rx="9.5" ry="7.5" fill="#7CBBEB" />
        </svg>
        <h1 className="sm:text-lg xl:text-2xl font-bold">สัตว์เลี้ยง</h1>
      </div>

      <div className="flex xl:flex-row xl:flex-wrap flex-col lg:pl-14 xl:pl-0 gap-10 py-5">
        <AnCard
          imageSrc="/home/eggtun.png"
          name="ไข่ตุ๋น"
          age="1 ปี"
          gender="ตัวผู้"
          breed="บริติช ช็อตแฮร์"
          lostDate="2/5/2568"
          lostLocation="บ้านหนองอึ่งพัฒนา อ.เมือง จ.กำแพงเพชร"
        />

        <div
          className="group cursor-pointer hover:bg-gray-200 transition duration-200 flex justify-center items-center flex-col md:flex-row gap-6 p-6 rounded-2xl shadow-lg bg-[#E5EEFF] w-full xl:h-[300px] lg:h-[275px] md:h-[250px] sm:h-[390px] h-[350px] 2xl:max-w-[200px] xl:max-w-[200px] lg:max-w-[170px] md:max-w-[160px] sm:max-w-[288px] max-w-[235px] ml-5 sm:ml-12 md:ml-0"
          onClick={() => setShowModal(true)}
        >
          <div className="bg-[#7CBBEB] group-hover:bg-[#addbf7] transition-colors duration-200 rounded-full p-2 flex justify-center items-center">
            <svg
              className="2xl:w-20 2xl:h-20 xl:w-18 xl:h-18 lg:w-14 lg:h-14 md:w-12 md:h-12 sm:w-12 sm:h-12 w-10 h-10"
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
        </div>
      </div>



{showModal && (
  <div className="fixed inset-0 bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white xl:w-[800px] xl:h-[550px] lg:w-[700px] lg:h-[450px] md:w-[650px] md:h-[400px] sm:w-[550px] sm:h-[400px] w-[350px] h-[400px] p-6 rounded-4xl shadow-xl relative flex flex-col justify-between">

      {/* ▼ กรณียังไม่ได้ลงทะเบียน ▼ */}
      {!hasRegisteredPets && (
        <div className="flex flex-col items-center justify-center flex-grow">
          <h1 className="text-xl font-bold text-center mb-6">สัตว์เลี้ยงหาย</h1>
          <p className="text-center mb-6 text-gray-600">กรุณาลงทะเบียนสัตว์เลี้ยง</p>
          <div className="relative w-96 h-64 mb-6">
            <Image
              src="/all/cat.png"
              alt="Cute cat"
              fill
              className="object-contain"
              priority
            />
          </div>
          <Link href="/registerpet" className="rounded-full shadow-md bg-[#EAD64D] text-black text-lg py-2 px-7 hover:bg-yellow-200 transition duration-300  cursor-pointer">
            ลงทะเบียน
          </Link>
        </div>
      )}

      {/* ▼ กรณีลงทะเบียนแล้ว ▼ */}
      {hasRegisteredPets && (
        <div className="flex flex-col  flex-grow">
          <h1 className="text- font-bold text-center mb-6 lg:text-xl sm:text-lg text-md ">สัตว์เลี้ยงหาย</h1>
          <div className="flex flex-wrap ml-5 gap-5 ">
            <Link href="/missing">
            <PetCard imageSrc="/home/eggtun2.png" name="ไข่ตุ๋น" />
            </Link>
            <PetCard imageSrc="/all/pigtun.png" name="หมูตุ๋น" />
          </div>
        </div>
      )}

      {/* ปุ่มล่างขวา (ใช้ร่วมกันได้ทั้ง 2 กรณี) */}
      <div className="flex justify-end">
        <div className="flex gap-4">
          <button
            onClick={handleCancel}
            className="bg-gray-400 text-white hover:bg-gray-600 shadow-md rounded-xl px-6 py-1 lg:text-xl  sm:text-lg text-sm  cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="bg-[#7CBBEB] text-white hover:bg-sky-600 shadow-md rounded-xl px-6 py-1 lg:text-xl  sm:text-lg  text-sm   cursor-pointer"
          >
            บันทึก
          </button>
        </div>
      </div>

    </div>
  </div>
)}

    </div>
  );
}
