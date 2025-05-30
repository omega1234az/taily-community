"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import PetCard from "@/app/component/PetCard";
import PetModal from "@/app/component/PetModal";

export default function Pet() {
  const [showModal, setShowModal] = useState(false);
  const [isRegistered, setIsRegistered] = useState(true); // กรณียังไม่ลงทะเบียนสัตว์เลี้ยง //
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [activeSection, setActiveSection] = useState<
    "history" | "disease" | "vaccine"
  >("history");

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
      setSelectedType(selectedPet.breed || "");
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
      type: "แมว",
      color: "ส้ม",
      sterilized: "ทำหมันแล้ว",
      markings: "ไม่มี",
      description: "แมวขนสั้น น่ารัก ขี้อ้อน",

      additionalImages: [
        "/home/eggtun3.png",
        "/home/eggtun4.png",
        "/home/eggtun5.png",
      ],
      diseaseData: [
        { name: "โรคหอบหืด", date: "5/01/67" },
        { name: "ปัญหาไต", date: "10/03/67" },
      ],
      vaccineData: [
        { name: "วัคซีนพิษสุนัขบ้า", date: "1/01/67" },
        { name: "วัคซีนไข้หวัดแมว", date: "15/01/67" },
      ],
    },
    {
      id: 2,
      name: "ริรี่",
      imageSrc: "/home/katay.jpg",
      breed: "กระต่าย",
      age: "3 ปี",
      gender: "เพศเมีย",
      type: "กระต่าย",
      color: "น้ำตาลอ่อน",
      sterilized: "ทำหมันแล้ว",
      markings: "ไม่มี",
      description: "กระต่ายขี้เล่น",
      additionalImages: [
        "/home/katay2.jpg",
        "/home/katay3.jpg",
        "/home/katay4.jpg",
      ],
      diseaseData: [{ name: "ปัญหาระบบย่อยอาหาร", date: "2/01/67" }],
      vaccineData: [{ name: "วัคซีนไวรัสกระต่าย", date: "12/02/67" }],
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
          <PetCard imageSrc="/home/katay.jpg" name="ริรี่" />
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
      <PetModal
        showModal={showModal}
        setShowModal={setShowModal}
        selectedPet={selectedPet}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
    </div>
  );
}
