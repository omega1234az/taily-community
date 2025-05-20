"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface PetCardjProps {
  id: string;
  imageSrc: string;
  gender: string;
  breed: string;
  lostDate: string;

  onDetailClick?: () => void;
}

const PetCard: React.FC<PetCardjProps> = ({
  id,
  imageSrc,
  gender,
  breed,
  lostDate,
}) => {
  const router = useRouter();

  const handleDetailClick = () => {
    router.push(`/home/${id}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 border-2 border-gray-300 rounded-2xl shadow-lg bg-white w-full 2xl:max-w-2xl xl:max-w-xl lg:max-w-md md:max-w-lg sm:max-w-xs max-w-[230px] hover:bg-gray-200">
      {/* รูปภาพ */}
      <div className="mx-auto 2xl:w-[400px] 2xl:h-[350px] xl:w-[350px] xl:h-[300px] lg:w-[300px] lg:h-[250px] md:w-[300px] md:h-[250px] sm:w-[180px] sm:h-[230px] h-[150px] w-[100px] rounded-xl overflow-hidden">
        <img
          src={imageSrc}
          alt={breed}
          className="w-full h-full object-cover"
        />
      </div>

      {/* เนื้อหา */}
      <div className="flex flex-col justify-between w-full">
        <div className="sm:space-y-4 space-y-2 text-[10px] 2xl:text-xl xl:text-lg lg:text-md md:text-sm sm:text-xs 2xl:pt-20 xl:pt-18 lg:pt-14 md:pt-13 sm:pl-12 pl-10 md:pl-0">
          <p>
            <strong>เพศ:</strong> {gender}
          </p>
          <p>
            <strong>สายพันธุ์:</strong> {breed}
          </p>
          <p>
            <strong>พบวันที่:</strong> {lostDate}
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
