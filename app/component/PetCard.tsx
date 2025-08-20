import React from "react";

interface PetCardProps {
  imageSrc: string;
  name: string;
}

export default function PetCard({ imageSrc, name }: PetCardProps) {
  return (
    <div className="cursor-pointer">
      {" "}
      {/* ตรงนี้! */}
      <div className="bg-[#E5EEFF] hover:bg-gray-200 inline-block rounded-xl sm:p-5 p-3 shadow-lg transition-transform duration-200 transform hover:scale-105">
        <img
          src={imageSrc}
          alt={name}
          className="object-cover mb-2 rounded-2xl shadow-lg  2xl:h-[240px] xl:h-[210px] lg:h-[190px] md:h-[180px] sm:h-[155px] h-[110px] 2xl:max-w-[205px] xl:max-w-[190px] lg:max-w-[170px] md:max-w-[160px] sm:max-w-[140px] max-w-[105px]"
        />
        <span className="flex justify-center font-medium 2xl:text-xl xl:text-lg lg:text-[16px] md:text-[16px] sm:text-sm text-[12px]">
          {name}
        </span>
      </div>
    </div>
  );
}
