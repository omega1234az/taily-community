"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import PetCard from "@/app/component/PetCard";

export default function Pet() {
  const [showModal, setShowModal] = useState(false);
  const [isRegistered, setIsRegistered] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPet, setSelectedPet] = useState<any | null>(null);

  const handlePetClick = (pet: any) => {
    setSelectedPet(pet);
    setShowModal(true);
    setIsEditing(false);
  };

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [breed, setBreed] = useState("");
  const [color, setColor] = useState("");
  const [markings, setMarkings] = useState("");
  const [description, setDescription] = useState("");
  const [sterilized, setSterilized] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  useEffect(() => {
    if (selectedPet) {
      setName(selectedPet.name || "");
      setAge(selectedPet.age || "");
      setGender(selectedPet.gender || "");
      setBreed(selectedPet.breed || "");
      setColor(selectedPet.color || "");
      setMarkings(selectedPet.markings || "");
      setDescription(selectedPet.description || "");
      setSterilized(selectedPet.sterilized || "");
      setSelectedType(selectedPet.breed || ""); // สมมุติใช้ breed แทน type
    }
  }, [selectedPet]);

  const petData = [
    {
      id: 1,
      name: "ไข่ตุ๋น",
      imageSrc: "/home/eggtun2.png",
      breed: "แมว",
      age: "2 ปี",
      gender: "เพศผู้",
      color: "ส้ม",
      sterilized: "ทำหมันแล้ว",
      markings: "ไม่มี",
      description: "แมวขนสั้น น่ารัก ขี้อ้อน",
      additionalImages: [
        "/home/eggtun3.png",
        "/home/eggtun4.png",
        "/home/eggtun5.png",
      ],
    },
    {
      id: 2,
      name: "ริรี่",
      imageSrc: "/home/katay.jpg",
      breed: "กระต่าย",
      age: "3 ปี",
      gender: "เพศเมีย",
      color: "น้ำตาลอ่อน",
      sterilized: "ทำหมันแล้ว",
      markings: "ไม่มี",
      description: "กระต่ายขี้เล่น",
      additionalImages: [
        "/home/katay2.jpg",
        "/home/katay3.jpg",
        "/home/katay4.jpg",
      ],
    },
  ];

  const handleCancel = () => {
    setShowModal(false);
    setIsEditing(false);
  };

  const handleSave = () => {
    setShowModal(false);
    setIsEditing(false);
  };

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    setIsDropdownVisible(false);
  };

  if (!isRegistered) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow mt-10">
        <h1 className="text-xl font-bold text-center mb-6">สัตว์เลี้ยงหาย</h1>
        <p className="text-center mb-6 text-gray-600">
          กรุณาลงทะเบียนสัตว์เลี้ยง
        </p>
        <div className="relative w-96 h-64 mb-6">
          <Image
            src="/all/cat.png"
            alt="Cute cat"
            fill
            className="object-contain"
            priority
          />
        </div>
        <Link
          href="/registerpet"
          className="rounded-full shadow-md bg-[#EAD64D] text-black text-lg py-2 px-7 hover:bg-yellow-200 transition duration-300 cursor-pointer"
        >
          ลงทะเบียน
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
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

      {/* Pet Cards */}
      <div className="flex flex-wrap py-5 lg:gap-10 sm:gap-6 gap-5">
        <div
          onClick={() => handlePetClick(petData[0])}
          className="cursor-pointer"
        >
          <PetCard imageSrc="/home/eggtun2.png" name="ไข่ตุ๋น" />
        </div>
        <div
          onClick={() => handlePetClick(petData[1])}
          className="cursor-pointer"
        >
          <PetCard imageSrc="/home/katay.jpg" name="หมูตุ๋น" />
        </div>

        {/* Register Button */}
        <div
          className="group cursor-pointer hover:bg-gray-200 transition duration-200 flex justify-center items-center flex-col md:flex-row gap-6 p-6 rounded-2xl shadow-lg bg-[#E5EEFF]  2xl:w-[185px] 2xl:h-[250px]
                        xl:w-[170px] xl:h-[232px]
                        lg:w-[140px] lg:h-[192px]
                        md:w-[130px] md:h-[172px]
                        sm:w-[110px] sm:h-[150px]
                        w-[95px] h-[140px]"
        >
          <Link
            href="/registerpet"
            className="w-full h-full flex justify-center items-center"
          >
            <div className="bg-[#7CBBEB] group-hover:bg-[#addbf7] transition-colors duration-200 rounded-full p-2 flex justify-center items-center">
              <svg
                className="2xl:w-14 2xl:h-14 xl:w-14 xl:h-14 lg:w-11 lg:h-11 md:w-10 md:h-10 sm:w-9 sm:h-9 w-8 h-8"
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
          </Link>
        </div>
      </div>

      {/* Modal for Pet Details */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div className="bg-white w-full h-full sm:w-[500px] sm:h-[400px] md:w-[600px] md:h-[450px] lg:w-[700px] lg:h-[450px] xl:w-[800px] xl:h-[550px] p-4 sm:p-6 rounded-none sm:rounded-[2rem] shadow-xl relative flex flex-col justify-between overflow-y-auto">
            <div className="flex flex-col  flex-grow overflow-y-auto max-h-[calc(100vh-150px)]">
              {selectedPet && (
                <div className="flex items-center justify-between mb-6 m-8 lg:text-xl sm:text-lg text-md">
                  {/* ชื่อสัตว์ */}
                  <h1 className="font-bold">
                    <span className="bg-[#7CBBEB] pl-5 py-4 sm:py-5 sm:pl-6 md:py-4 md:pl-6 xl:py-5 xl:pl-8 lg:py-4 lg:pl-6 rounded-full">
                      {selectedPet.name.slice(0, 1)}
                    </span>
                    {selectedPet.name.slice(1)}
                  </h1>

                  {/* ปุ่มปิด */}
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedPet(null);
                    }}
                    className="text-black hover:text-gray-500 text-5xl font-bold"
                    aria-label="Close modal"
                  >
                    &times;
                  </button>
                </div>
              )}

              <div className="flex flex-col lg:flex-row justify-center 2xl:gap-20 xl:gap-20 lg:gap-20 items-center lg:items-start pt-5 sm:px-10 px-5">
                <div className="pb-5 flex flex-col items-center lg:items-start">
                  {selectedPet && (
                    <>
                      {/* รูปหลัก */}
                      <img
                        src={selectedPet.imageSrc}
                        alt={selectedPet.name}
                        className="2xl:w-72 2xl:h-56 xl:w-64 xl:h-52 lg:w-56 lg:h-48 md:w-64 md:h-60 sm:w-52 sm:h-48 w-48 h-48 object-cover rounded-xl"
                      />

                      {/* รูปเพิ่มเติม */}
                      <div className="grid grid-cols-3 gap-2 pt-3">
                        {selectedPet.additionalImages?.map(
                          (img: string, index: number) => (
                            <img
                              key={index}
                              src={img}
                              alt={`${selectedPet.name}-${index}`}
                              className="2xl:w-36 2xl:h-20 xl:w-32 xl:h-16 lg:w-32 lg:h-16 md:w-20 md:h-20 sm:w-16 sm:h-16 w-14 h-14 object-cover rounded-md"
                            />
                          )
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Pet Details Form */}
                <div className="flex flex-col w-full 2xl:max-w-md xl:max-w-md lg:max-w-md md:max-w-sm sm:max-w-sm max-w-xs mb-2">
                  <p className="sm:text-md xl:text-lg">ชื่อ</p>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md  resize-none mb-3 disabled:bg-gray-100"
                  />

                  {/* อายุ / เพศ */}
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="flex flex-col">
                      <p className="sm:text-md xl:text-lg">อายุ</p>
                      <input
                        type="text"
                        value={age}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d*$/.test(value)) {
                            // ตรวจสอบว่าเป็นตัวเลขเท่านั้น
                            setAge(value);
                          }
                        }}
                        disabled={!isEditing}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md   mb-3 disabled:bg-gray-100"
                      />
                    </div>
                    <div className="flex flex-col">
                      <p className="sm:text-md xl:text-lg">เพศ</p>
                      <input
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        disabled={!isEditing}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* ประเภท / สายพันธุ์ */}
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="flex flex-col">
                      <p className="sm:text-md xl:text-lg">ประเภท</p>
                      <div className="relative w-full">
                        <input
                          value={selectedType}
                          onClick={toggleDropdown}
                          readOnly
                          disabled={!isEditing}
                          className="w-full mt-1 p-2 pr-10 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
                        />
                        <svg
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-7 h-7 pb-1 text-gray-500 cursor-pointer ${
                            !isEditing ? "pointer-events-none" : ""
                          }`}
                          onClick={toggleDropdown}
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M7 10l5 5 5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                        {isDropdownVisible && (
                          <div className="absolute right-3 top-12 w-32 mt-1 bg-white shadow-lg rounded-md border border-gray-300 z-10">
                            <ul>
                              {[
                                "แมว",
                                "สุนัข",
                                "นก",
                                "หนู",
                                "ชูก้าไรเดอร์",
                                "เฟอร์ริต",
                                "เม่นแคระ",
                                "กระรอก",
                                "กระต่าย",
                              ].map((type) => (
                                <li
                                  key={type}
                                  className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-200 border-b border-gray-300 last:border-b-0"
                                  onClick={() => handleSelectType(type)}
                                >
                                  {type}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <p className="sm:text-md xl:text-lg">สายพันธุ์</p>
                      <input
                        value={breed}
                        onChange={(e) => setBreed(e.target.value)}
                        disabled={!isEditing}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* ทำหมัน / สี */}
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="flex flex-col">
                      <p className="sm:text-md xl:text-lg">ทำหมัน</p>
                      <input
                        value={sterilized}
                        onChange={(e) => setSterilized(e.target.value)}
                        disabled={!isEditing}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
                      />
                    </div>
                    <div className="flex flex-col">
                      <p className="sm:text-md xl:text-lg">สี</p>
                      <input
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        disabled={!isEditing}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* รอยตำหนิ */}
                  <div className="flex flex-col mb-2">
                    <p className="sm:text-md xl:text-lg">รอยตำหนิ</p>
                    <input
                      value={markings}
                      onChange={(e) => setMarkings(e.target.value)}
                      disabled={!isEditing}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
                    />
                  </div>

                  {/* รายละเอียด */}
                  <div className="flex flex-col mb-2">
                    <p className="sm:text-md xl:text-lg">รายละเอียด</p>
                    <input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={!isEditing}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Save/Cancel Buttons */}
              <div className="flex justify-end mr-10 sm:mr-11 md:mr-20 lg:mr-10 mt-5 lg:mb-8 mb-5">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-[#7CBBEB] text-white hover:bg-sky-600 shadow-md rounded-xl px-6 py-1 sm:text-lg xl:text-xl cursor-pointer"
                  >
                    แก้ไข
                  </button>
                ) : (
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
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
