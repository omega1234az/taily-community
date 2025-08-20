"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Pet = {
  id: number;
  name: string;
  image: string;
};

interface RegistrationProps {
  onClose?: () => void;
}

export default function Registration({ onClose }: RegistrationProps) {
  const [pets, setPets] = useState<Pet[]>([
    // ตัวอย่างกรณีลงทะเบียนแล้ว
    { id: 1, name: "ไข่ตุ๋น", image: "/home/eggtun.png" },
    { id: 2, name: "ดัสตี้", image: "/home/dusty.jpg" },
    { id: 3, name: "ดัสตี้", image: "/home/dusty.jpg" },
    { id: 4, name: "ดัสตี้", image: "/home/dusty.jpg" },
    { id: 5, name: "ไข่ตุ๋น", image: "/home/eggtun.png" },
    { id: 6, name: "ดัสตี้", image: "/home/dusty.jpg" },
    { id: 7, name: "ดัสตี้", image: "/home/dusty.jpg" },
    { id: 8, name: "ดัสตี้", image: "/home/dusty.jpg" },
  ]);

  const [selectedPet, setSelectedPet] = useState<number | null>(null);

  const handleSelectPet = (id: number) => {
    setSelectedPet(id);
  };

  const handleConfirm = () => {
    if (selectedPet) {
      alert(`คุณเลือกสัตว์เลี้ยง ID: ${selectedPet}`);
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center sm:p-4 bg-opacity-30">
      <div
        className={`bg-white shadow-lg sm:rounded-2xl sm:p-6 sm:mt-5 pt-18 
    ${pets.length > 0 ? "sm:pt-10" : ""} 
    2xl:w-[800px] 2xl:h-[730px] xl:w-[780px] xl:h-[680px] lg:w-[680px] lg:h-[600px] md:w-[580px] md:h-[565px] sm:w-[520px] sm:h-[500px] w-full h-full relative`}
      >
        {/* กรณียังไม่ลงทะเบียน */}
        {pets.length === 0 ? (
          <>
            {/* กากบาทปิด modal */}
            <button
              onClick={onClose}
              className="absolute top-4 right-10 text-gray-500 hover:text-gray-800 lg:text-6xl text-5xl font-bold cursor-pointer"
            >
              ×
            </button>

            <h2 className="xl:text-2xl text-xl font-bold mb-4 text-center">
              สัตว์เลี้ยงหาย
            </h2>
            <p className="text-gray-600 xl:text-xl text-lg mb-4 text-center">
              กรุณาลงทะเบียนสัตว์เลี้ยง
            </p>

            {/* รูป responsive */}
            <div className="flex justify-center lg:mb-2 xl:mb-4">
              <div className="2xl:w-[500px] 2xl:h-[500px] xl:w-[460px] xl:h-[460px] lg:w-[400px] lg:h-[400px] md:w-[380px] md:h-[380px] sm:w-[320px] sm:h-[320px] w-[380px] h-[380px] relative ">
                <Image
                  src="/login/bgadmin.jpeg"
                  alt="no pets"
                  fill
                  className="rounded-lg object-cover object-center"
                />
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <Link href="/registerpet">
                <button className="rounded-full shadow-md bg-[#EAD64D] text-black xl:text-xl text-lg py-2 px-10 hover:bg-yellow-200 transition duration-300 cursor-pointer">
                  ลงทะเบียน
                </button>
              </Link>
            </div>
          </>
        ) : (
          // กรณีลงทะเบียนแล้ว
          <>
            <h2 className="xl:text-2xl text-xl font-bold mb-6 text-center">
              สัตว์เลี้ยงหาย
            </h2>
            <div className="overflow-y-auto h-[calc(100%-70px)] px-2">
              <div className="flex flex-wrap xl:gap-8 sm:gap-6 lg:p-4 sm:p-2 gap-12 p-7">
                {pets.map((pet) => (
                  <div
                    key={pet.id}
                    onClick={() => handleSelectPet(pet.id)}
                    className={`cursor-pointer rounded-xl p-5 2xl:w-52 xl:w-48 lg:w-44 md:w-[150px] sm:w-[130px] w-[150px] transition-transform duration-200 transform hover:scale-105 ${
                      selectedPet === pet.id
                        ? "bg-[#AFDAFB] shadow-xl"
                        : "bg-[#E5EEFF] shadow-md hover:shadow-lg"
                    }`}
                  >
                    <div className="relative 2xl:w-[165px] 2xl:h-44 xl:w-[160px] xl:h-[165px] lg:w-[145px] lg:h-[150px] md:w-[110px] md:h-[120px] sm:w-[90px] sm:h-[95px] w-[110px] h-[110px] overflow-hidden rounded-lg flex items-center justify-center">
                      <Image
                        src={pet.image}
                        alt={pet.name}
                        fill
                        className="object-cover object-center"
                      />
                    </div>
                    <p className="mt-3 text-base font-medium text-center">
                      {pet.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ปุ่มยืนยัน/ยกเลิก สำหรับกรณีลงทะเบียนแล้ว */}
        {pets.length > 0 && (
          <div className="absolute bottom-6 right-6 flex gap-4 ">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-[#D9D9D9] hover:bg-gray-400 text-white cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 rounded-lg bg-[#7CBBEB] text-white hover:bg-[#28a7f7] cursor-pointer"
            >
              ยืนยัน
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
