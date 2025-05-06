import React from 'react';

interface PetCardProps {
  imageSrc: string;
  name: string;
}

export default function PetCard({ imageSrc, name }: PetCardProps) {
  return (
    <div className="cursor-pointer"> {/* ตรงนี้! */}
      <div className="bg-[#E5EEFF] hover:bg-gray-200 inline-block rounded-xl p-3 shadow-lg">
        <img
          src={imageSrc}
          alt={name}
          className="sm:w-28 w-20 xl:w-40 h-auto rounded-xl object-cover mb-2"
        />
        <span className="flex justify-center font-medium 2xl:text-xl xl:text-lg lg:text-md md:text-sm sm:text-xs text-[10px]">
          {name}
        </span>
      </div>
    </div>
  );
}
