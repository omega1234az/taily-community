"use client";

import React, { useState } from 'react';

export default function RegisterPet() {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [isEditing, setIsEditing] = useState(false); 

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    setDropdownVisible(false);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };


  return (
    <div>
      <h1 className="text-xl font-semibold">
        <span className="bg-[#EAD64D] py-5 pl-3  sm:py-7 sm:pl-5 xl:py-9 xl:pl-7  rounded-full">ลง</span>ทะเบียนสัตว์เลี้ยง
      </h1>

      <div className="flex flex-col lg:flex-row 2xl:gap-56 xl:gap-44 lg:gap-24 md:gap-5 sm:gap-8 lg:pl-12 md:pl-28 sm:pl-20 pl-7 pt-18">
        {/* รูปภาพ */}
        <div className="lg:pl-0 md:pl-28 sm:pl-24 pl-20 pb-5">
          <img
            src="/all/image.png"
            alt="image"
            className="2xl:w-72 xl:w-64 lg:w-60 md:w-56 sm:w-48 w-36 h-auto object-cover"
          />
          <div className="lg:grid grid-cols-3 flex  gap-2 pt-3">
            <img src="/all/image.png" alt="image" className="2xl:w-22 xl:w-20 lg:w-18 md:w-17 sm:w-14 w-11 h-auto object-cover" />
            <img src="/all/image.png" alt="image" className="2xl:w-22 xl:w-20 lg:w-18 md:w-17 sm:w-14 w-11 h-auto object-cover" />
            <img src="/all/image.png" alt="image" className="2xl:w-22 xl:w-20 lg:w-18 md:w-17 sm:w-14 w-11 h-auto object-cover" />
          </div>
        </div>

        {/* ช่องกรอกชื่อ */}
        <div className="flex flex-col w-full  md:max-w-md sm:max-w-sm max-w-xs mb-2">
          <p className=" sm:text-lg xl:text-xl">ชื่อ</p>
          <input
            className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
          />

          <div className="grid grid-cols-2 gap-4 mb-2">
            {/* ช่องกรอกอายุ */}
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">อายุ</p>
              <input
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
              />
            </div>

            {/* ช่องกรอกเพศ */}
            <div className="flex flex-col">
              <p className=" sm:text-lg xl:text-xl">เพศ</p>
              <input
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-2">
            {/* ช่องกรอกประเภท */}
            <div className="flex flex-col">
  <p className="sm:text-lg xl:text-xl">ประเภท</p>
  <div className="relative w-full">
    <input
      className="w-full mt-1 p-2 pr-10 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
      value={selectedType}
    />
    <svg
      width="21"
      height="24"
      viewBox="0 0 21 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pb-1 text-gray-500 cursor-pointer ${!isEditing ? 'pointer-events-none' : ''}`}
      onClick={toggleDropdown} // คลิกที่ไอคอน dropdown
    >
      <path
        d="M9.552 23.864C8.88 23.864 8.256 23.512 7.68 22.808C7.104 22.136 6.656 21.32 6.336 20.36C6.272 20.136 5.792 18.808 4.896 16.376C3.232 12.056 2.096 8.904 1.488 6.92C1.296 6.216 1.072 5.592 0.816 5.048C0.464 4.12 0.288 3.464 0.288 3.08C0.288 2.536 0.528 2.04 1.008 1.592C1.52 1.144 2.08 0.919998 2.688 0.919998C3.168 0.919998 3.632 1.064 4.08 1.352C4.56 1.64 4.896 2.104 5.088 2.744C5.28 3.32 5.632 4.52 6.144 6.344C6.848 8.808 7.456 10.904 7.968 12.632C8.512 14.36 9.104 16.072 9.744 17.768L12.384 11.432L15.312 4.52C15.472 4.232 15.712 3.784 16.032 3.176C16.352 2.568 16.688 2.136 17.04 1.88C17.392 1.624 17.824 1.496 18.336 1.496C18.944 1.496 19.472 1.656 19.92 1.976C20.368 2.296 20.592 2.76 20.592 3.368C20.592 3.912 20.496 4.408 20.304 4.856C20.144 5.304 19.856 5.96 19.44 6.824C19.024 7.56 18.768 8.04 18.672 8.264L13.152 20.072C12.672 21.32 12.176 22.264 11.664 22.904C11.152 23.544 10.448 23.864 9.552 23.864Z"
        fill="currentColor"
      />
    </svg>

    {isDropdownVisible && (
      <div className="absolute right-3 top-12 w-32 mt-2 bg-white shadow-lg rounded-md border border-gray-300">
        <ul>
          <li
            className="px-4 py-2 text-sm cursor-pointer border-b border-gray-300 hover:bg-gray-200"
            onClick={() => handleSelectType("แมว")}
          >
            แมว
          </li>
          <li
            className="px-4 py-2 text-sm cursor-pointer  border-b border-gray-300 hover:bg-gray-200"
            onClick={() => handleSelectType("สุนัข")}
          >
            สุนัข
          </li>
          <li
            className="px-4 py-2 text-sm cursor-pointer  border-b border-gray-300 hover:bg-gray-200"
            onClick={() => handleSelectType("นก")}
          >
            นก
          </li>
          <li
            className="px-4 py-2 text-sm cursor-pointer  border-b border-gray-300 hover:bg-gray-200"
            onClick={() => handleSelectType("หนู")}
          >
            หนู
          </li>
          <li
            className="px-4 py-2 text-sm cursor-pointer  border-b border-gray-300 hover:bg-gray-200"
            onClick={() => handleSelectType("ชูก้าไรเดอร์")}
          >
            ชูก้าไรเดอร์
          </li>
          <li
            className="px-4 py-2 text-sm cursor-pointer  border-b border-gray-300 hover:bg-gray-200"
            onClick={() => handleSelectType("เฟอร์ริต")}
          >
            เฟอร์ริต
          </li>
          <li
            className="px-4 py-2 text-sm cursor-pointer  border-b border-gray-300 hover:bg-gray-200"
            onClick={() => handleSelectType("เม่นแคระ")}
          >
            เม่นแคระ
          </li>
          <li
            className="px-4 py-2 text-sm cursor-pointer  hover:bg-gray-200"
            onClick={() => handleSelectType("กระรอก")}
          >
            กระรอก
          </li>
          <li
            className="px-4 py-2 text-sm cursor-pointer  hover:bg-gray-200"
            onClick={() => handleSelectType("กระต่าย")}
          >
            กระต่าย
          </li>
        </ul>
      </div>
    )}
  </div>
</div>

            {/* ช่องกรอกสายพันธุ์ */}
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">สายพันธุ์</p>
              <input
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
           
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-2">
            {/* ช่องกรอกทำหมัน */}
            <div className="flex flex-col">
              <p className=" sm:text-lg xl:text-xl">ทำหมัน</p>
              <input
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
              
              />
            </div>

            {/* ช่องกรอกสี */}
            <div className="flex flex-col">
              <p className=" sm:text-lg xl:text-xl">สี</p>
              <input
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
           
              />
            </div>
          </div>

          {/* ช่องกรอกรอยตำหนิ */}
          <div className="flex flex-col mb-2">
            <p className=" sm:text-lg xl:text-xl">รอยตำหนิ</p>
            <input
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
           
            />
          </div>

          {/* ช่องกรอกรายละเอียด */}
          <p className=" sm:text-lg xl:text-xl">รายละเอียด</p>
          <input
            className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
          
          />

          <div className="flex justify-end ml-20 mt-5 mb-10">
  <div className="flex gap-4">
    <button
      onClick={handleCancel}
      className="bg-gray-400 text-white hover:bg-gray-600 shadow-md rounded-xl px-6 py-1 sm:text-lg xl:text-xl cursor-pointer"
    >
      ยกเลิก
    </button>
    <button
      onClick={handleSave}
      className="bg-[#7CBBEB] text-white hover:bg-sky-600 shadow-md rounded-xl px-6 py-1 sm:text-lg xl:text-xl cursor-pointer"
    >
      บันทึก
    </button>
  </div>
</div>

        </div>
      </div>
    </div>
  );
}
