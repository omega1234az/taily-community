"use client";

import React from "react";
import Link from "next/link";

interface AnCardhProps {
  imageSrc: string;
  name: string;
  age: string;
  gender: string;
  breed: string;
  lostDate: string;
  lostLocation: string;
}

const PetCard: React.FC<AnCardhProps> = ({
  imageSrc,
  name,
  age,
  gender,
  breed,
  lostDate,
  lostLocation,
}) => {
  return (
    <div className="flex flex-col  md:flex-row  gap-6 p-6   rounded-2xl shadow-lg bg-[#E5EEFF] w-full 2xl:max-w-md xl:max-w-md lg:max-w-md md:max-w-md  sm:max-w-[300px] max-w-[240px]  hover:bg-gray-200 ml-4  sm:ml-10 md:ml-0">
      {/* รูปภาพ */}
      <div className="mx-auto xl:w-[300px] xl:h-[250px] md:w-[250px] md:h-[200px] sm:w-[150px] sm:h-[180px] w-[100px] h-[120px] rounded-xl overflow-hidden">
        <img src={imageSrc} alt={name} className="w-full h-full object-cover" />
      </div>

      {/* เนื้อหา */}
      <div className="flex flex-col justify-between  w-full ">
        <div className="sm:space-y-2 space-y-2 text-[10px]  sm:text-sm   sm:pl-12 pl-10 md:pl-0">
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
        <div className="flex justify-center mt-3 text-center md:text-left">
          <Link href="/eggtunmissing">
            <button className="rounded-xl shadow-md bg-[#EAD64D] text-black text-[10px] sm:text-sm  sm:px-6 sm:py-2 px-3 py-1.5 hover:bg-yellow-200 transition duration-300 cursor-pointer">
              รายละเอียด
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PetCard;
