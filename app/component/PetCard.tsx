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
      <div className="bg-[#E5EEFF] hover:bg-gray-200 inline-block rounded-xl p-3 shadow-lg">
        <img
          src={imageSrc}
          alt={name}
          className="  object-cover mb-2  rounded-2xl shadow-lg 2xl:w-[175px] 2xl:h-[190px]
                        xl:w-[150px] xl:h-[170px]
                        lg:w-[133px] lg:h-[140px]
                        md:w-[110px] md:h-[120px]
                        sm:w-[90px] sm:h-[100px]
                        w-[80px] h-[90px]"
        />
        <span className="flex justify-center font-medium 2xl:text-xl xl:text-lg lg:text-md md:text-sm sm:text-xs text-[10px]">
          {name}
        </span>
      </div>
    </div>
  );
}
