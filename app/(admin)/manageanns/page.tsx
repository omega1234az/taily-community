"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import PetCardh from "@/app/component/Cardhomeh";
import PetCardj from "@/app/component/Cardhomej";

export default function ManageAnns() {
  const [selectedDisplay, setSelectedDisplay] = useState<"info" | "map">(
    "info"
  );
  const [filterDate, setFilterDate] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [isEditing, setIsEditing] = useState(true);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    if (isEditing) {
      setIsDropdownVisible(!isDropdownVisible);
    }
  };

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    setIsDropdownVisible(false);
  };

  const [showLostPets, setShowLostPets] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const petsPerPage = 6;

  type LostPet = {
    id: string;
    imageSrc: string;
    name: string;
    age: string;
    gender: string;
    breed: string;
    lostDate: string;
    lostLocation: string;
    type: string;
  };

  type OwnerPet = {
    id: string;
    imageSrc: string;
    gender: string;
    breed: string;
    lostDate: string;
  };

  const petsLost = [
    {
      id: "01",
      imageSrc: "/home/eggtun.png",
      name: "ไข่ตุ๋น",
      age: "1 ปี",
      gender: "ตัวผู้",
      breed: "บริติช ช็อตแฮร์",
      lostDate: "2025-02-05",
      lostLocation: "บ้านหนองอึ่งพัฒนา อ.เมือง จ.กำแพงเพชร",
      type: "แมว",
    },
    {
      id: "02",
      imageSrc: "/home/sumo.png",
      name: "ส้มโอ",
      age: "2 ปี",
      gender: "ตัวผู้",
      breed: "เพมโบรก เวลช์คอร์กี้",
      lostDate: "2025-01-05",
      lostLocation: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
      type: "สุนัข",
    },
    {
      id: "03",
      imageSrc: "/home/milmil.jpg",
      name: "มิลมิล",
      age: "2 ปี",
      gender: "ตัวเมีย",
      breed: "งูขาว",
      lostDate: "2025-02-18",
      lostLocation: "ซอยสุขุมวิท 101 ถนนสุขุมวิท เขตบางนา",
      type: "งู",
    },
    {
      id: "04",
      imageSrc: "/home/ham.jpg",
      name: "จาเบล",
      age: "1 ปี",
      gender: "ตัวผู้",
      breed: "แฮมสเตอร์แคระขาว",
      lostDate: "2025-02-15",
      lostLocation: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
      type: "หนู",
    },
    {
      id: "05",
      imageSrc: "/home/karog.jpg",
      name: "ไคลี่",
      age: "3 ปี",
      gender: "ตัวเมีย",
      breed: "ชิปมังก์",
      lostDate: "2025-05-05",
      lostLocation: "บ้านหนองอึ่งพันฒานา อ.เมือง จ.กำแพงเพชร",
      type: "กระรอก",
    },
    {
      id: "06",
      imageSrc: "/home/nok.jpg",
      name: "มิลา",
      age: "2 ปี",
      gender: "ตัวเมีย",
      breed: "ค็อกคาเทล",
      lostDate: "2025-01-09",
      lostLocation: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
      type: "นก",
    },
    {
      id: "07",
      imageSrc: "/home/katay.jpg",
      name: "ริรี่",
      age: "2 ปี",
      gender: "ตัวเมีย",
      breed: "ฮอลแลนด์ลอป",
      lostDate: "2025-04-10",
      lostLocation: "บ้านหนองอึ่งพันฒานา อ.เมือง จ.กำแพงเพชร",
      type: "กระต่าย",
    },
    {
      id: "08",
      imageSrc: "/home/kok2.jpg",
      name: "โอเวน",
      age: "3 ปี",
      gender: "ตัวผู้",
      breed: "เลิฟเบิร์ดหน้ากุหลาบ",
      lostDate: "22-05-2025",
      lostLocation: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
      type: "นก",
    },
    {
      id: "09",
      imageSrc: "/home/ferrit.jpg",
      name: "อัลเดน",
      age: "3 ปี",
      gender: "ตัวผู้",
      breed: "เฟอร์ริต",
      lostDate: "2025-04-30",
      lostLocation: "บ้านหนองอึ่งพันฒานา อ.เมือง จ.กำแพงเพชร",
      type: "เฟอร์ริต",
    },
    {
      id: "10",
      imageSrc: "/home/thai.png",
      name: "จ๊ะโอ๋",
      age: "2 ปี",
      gender: "ตัวผู้",
      breed: "ไทย",
      lostDate: "2025-03-02",
      lostLocation: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
      type: "สุนัข",
    },
    {
      id: "11",
      imageSrc: "/home/men.jpg",
      name: "ปุกปุย",
      age: "2 ปี",
      gender: "ตัวผู้",
      breed: "เม่นแคระ",
      lostDate: "2025-05-03",
      lostLocation: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
      type: "เม่นแคระ",
    },
    {
      id: "12",
      imageSrc: "/home/chuga.jpg",
      name: "มูมู่",
      age: "3 ปี",
      gender: "ตัวผู้",
      breed: "ชูก้าไรเดอร์",
      lostDate: "2025-03-20",
      lostLocation: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
      type: "ชูก้าไรเดอร์",
    },
    {
      id: "13",
      imageSrc: "/home/Lumis.jpg",
      name: "ลูมิส",
      age: "3 ปี",
      gender: "ตัวผู้",
      breed: "งูขาว",
      lostDate: "2025-02-12",
      lostLocation: "หน้าบ้านในซอยสวนผัก 32 เขตตลิ่งชัน",
      type: "งู",
    },
    {
      id: "14",
      imageSrc: "/home/bunbun.jpg",
      name: "บันบัน",
      age: "2 ปี",
      gender: "ตัวเมีย",
      breed: "แองโกล่า ",
      lostDate: "2025-05-01",
      lostLocation: "หน้าบ้านในซอยสวนผัก 32 เขตตลิ่งชัน",
      type: "กระต่าย",
    },
    {
      id: "15",
      imageSrc: "/home/Nova.jpg",
      name: "โนว่า",
      age: "4 ปี",
      gender: "ตัวผู้",
      breed: "สฟิงซ์",
      lostDate: "2025-04-18",
      lostLocation: "คอนโดแถวรัชดาภิเษก ซอย 14",
      type: "แมว",
    },
    {
      id: "16",
      imageSrc: "/home/Biscuit.jpg",
      name: "บิสกิต",
      age: "4 ปี",
      gender: "ตัวผู้",
      breed: "เม่นแคระสโนว์",
      lostDate: "2025-06-10",
      lostLocation: "หอพักใกล้มหาวิทยาลัยเชียงใหม่",
      type: "เม่น",
    },
    {
      id: "17",
      imageSrc: "/home/Dusty.jpg",
      name: "ดัสตี้",
      age: "2 ปี",
      gender: "ตัวผู้",
      breed: "ชินชิล่า",
      lostDate: "2025-06-01",
      lostLocation: "บ้านในซอยลาดปลาเค้า 72 เขตบางเขน",
      type: "หนู",
    },
    {
      id: "18",
      imageSrc: "/home/samoy.png",
      name: "ไอวี่",
      age: "2 ปี",
      gender: "ตัวเมีย",
      breed: "ซามอย",
      lostDate: "2025-05-28",
      lostLocation: "บ้านหนองรี อ.บ่อพลอย จ.กาญจนบุรี",
      type: "สุนัข",
    },
  ];

  const petsOwner = [
    {
      id: "19",
      imageSrc: "/home/eggtun.png",
      gender: "ตัวผู้",
      breed: "บริติช ช็อตแฮร์",
      lostDate: "2025-05-10",
      type: "แมว",
    },
    {
      id: "20",
      imageSrc: "/home/sumo.png",
      gender: "ตัวผู้",
      breed: "เพมโบรก เวลช์คอร์กี้",
      lostDate: "2025-05-08",
      type: "สุนัข",
    },
    {
      id: "21",
      imageSrc: "/home/milmil.jpg",
      gender: "ตัวเมีย",
      breed: "งูขาว",
      lostDate: "2025-06-02",
      type: "งู",
    },
    {
      id: "22",
      imageSrc: "/home/ham.jpg",
      gender: "ตัวผู้",
      breed: "แฮมสเตอร์แคระขาว",
      lostDate: "2025-02-13",
      type: "หนู",
    },
    {
      id: "23",
      imageSrc: "/home/karog.jpg",
      gender: "ตัวเมีย",
      breed: "ชิปมังก์",
      lostDate: "2025-05-06",
      type: "กระรอก",
    },
    {
      id: "24",
      imageSrc: "/home/nok.jpg",
      gender: "ตัวเมีย",
      breed: " ค็อกคาเทล",
      lostDate: "2025-01-12",
      type: "นก",
    },
    {
      id: "25",
      imageSrc: "/home/katay.jpg",
      gender: "ตัวเมีย",
      breed: "ฮอลแลนด์ลอป",
      lostDate: "2025-04-15",
      type: "กระต่าย",
    },
    {
      id: "26",
      imageSrc: "/home/kok2.jpg",
      gender: "ตัวผู้",
      breed: "เลิฟเบิร์ดหน้ากุหลาบ",
      lostDate: "2025-05-23",
      type: "นก",
    },
    {
      id: "27",
      imageSrc: "/home/ferrit.jpg",
      gender: "ตัวผู้",
      breed: "เฟอร์ริต",
      lostDate: "2025-05-02",
      type: "เฟอร์ริต",
    },
    {
      id: "28",
      imageSrc: "/home/thai.png",
      gender: "ตัวผู้",
      breed: "ไทย",
      lostDate: "2025-03-04",
      type: "สุนัข",
    },
    {
      id: "29",
      imageSrc: "/home/men.jpg",
      gender: "ตัวผู้",
      breed: "เม่นแคระ",
      lostDate: "2025-05-05",
      type: "เม่นแคระ",
    },
    {
      id: "30",
      imageSrc: "/home/chuga.jpg",
      gender: "ตัวผู้",
      breed: "ชูก้าไรเดอร์",
      lostDate: "2025-03-22",
      type: "ชูก้าไรเดอร์",
    },
    {
      id: "31",
      imageSrc: "/home/Lumis.jpg",
      gender: "ตัวผู้",
      breed: "เหลือง",
      lostDate: "2025-02-15",
      type: "งู",
    },
    {
      id: "32",
      imageSrc: "/home/bunbun.jpg",
      gender: "ตัวเมีย",
      breed: "เนเธอร์แลนด์ดวร์ฟ",
      lostDate: "2025-05-05",
      type: "กระต่าย",
    },
    {
      id: "33",
      imageSrc: "/home/Nova.jpg",
      gender: "ตัวผู้",
      breed: "สฟิงซ์",
      lostDate: "2025-04-20",
      type: "แมว",
    },
    {
      id: "34",
      imageSrc: "/home/Biscuit.jpg",
      gender: "ตัวผู้",
      breed: "เม่นแคระสโนว์",
      lostDate: "2025-06-15",
      type: "เม่น",
    },
    {
      id: "35",
      imageSrc: "/home/Dusty.jpg",
      gender: "ตัวผู้",
      breed: "ชินชิล่า",
      lostDate: "2025-06-01",
      type: "หนู",
    },
    {
      id: "36",
      imageSrc: "/home/samoy.png",
      gender: "ตัวเมีย",
      breed: "ซามอย",
      lostDate: "2025-06-02",
      type: "สุนัข",
    },
  ];

  const friendSectionRef = useRef<HTMLDivElement>(null);

  const handleScrollToFriends = () => {
    friendSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredPets = (showLostPets ? petsLost : petsOwner).filter((pet) => {
    const matchType =
      !selectedType ||
      selectedType === "ทั้งหมด" ||
      (showLostPets && (pet as LostPet).type === selectedType);

    const matchDate = !filterDate || pet.lostDate === filterDate;

    const matchLocation = showLostPets
      ? !filterLocation ||
        (pet as LostPet).lostLocation
          .toLowerCase()
          .includes(filterLocation.toLowerCase())
      : true;

    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
      setHasMounted(true);
    }, []);

    if (!hasMounted) return null; // หรือ Skeleton

    return matchType && matchLocation && matchDate;
  });

  const paginate = (page: number) => {
    setCurrentPage(page);
  };

  const currentPets = filteredPets.slice(
    (currentPage - 1) * petsPerPage,
    currentPage * petsPerPage
  );

  return (
    <div className="w-full">
      {/* Header Section */}

      {/* Pet Type Selection Section */}
      <div className="flex justify-center lg:mt-5 mt-3">
        <div className="grid grid-cols-2 lg:gap-60 sm:gap-36 gap-20 place-items-center lg:py-10 py-5">
          {/* สัตว์เลี้ยงหาย */}
          <div
            className="flex flex-col items-center"
            onClick={() => setShowLostPets(true)}
          >
            <div className="bg-[#E5EEFF] hover:bg-[#b7ccf5] p-3 cursor-pointer rounded-2xl 2xl:w-28 xl:w-24 lg:w-20 md:w-16 sm:w-14 w-12">
              <img
                src="/all/lostpets.png"
                alt="lostpets"
                className="w-full h-auto object-cover"
              />
            </div>
            <p className="mt-2 text-[10px] 2xl:text-xl xl:text-lg lg:text-md md:text-sm sm:text-xs text-center font-medium">
              สัตว์เลี้ยงหาย
            </p>
          </div>

          {/* หาเจ้าของ */}
          <div
            className="flex flex-col items-center"
            onClick={() => setShowLostPets(false)}
          >
            <div className="bg-[#E5EEFF] hover:bg-[#b7ccf5] p-3 cursor-pointer rounded-2xl 2xl:w-28 xl:w-24 lg:w-20 md:w-16 sm:w-14 w-12">
              <img
                src="/all/owner.png"
                alt="owner"
                className="w-full h-auto object-cover"
              />
            </div>
            <p className="mt-2 text-[10px] 2xl:text-xl xl:text-lg lg:text-md md:text-sm sm:text-xs text-center font-medium">
              หาเจ้าของ
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center w-full mb-5">
        <div className="grid grid-cols-3 gap-10 2xl:max-w-5xl xl:max-w-4xl lg:max-w-3xl md:max-w-2xl sm:max-w-xl w-full mx-8 sm:mx-0">
          {/* คอลัมน์ 1: วันที่หาย / วันที่พบ + แสดงข้อมูล */}
          <div className="flex flex-col">
            <p className="sm:text-lg xl:text-xl text-xs">
              {showLostPets ? "วันที่หาย" : "วันที่พบ"}
            </p>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full text-[10px] xl:text-lg md:text-md sm:text-sm  mt-1  lg:p-2 sm:p-1 p-1.5 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
            />

            {/* แสดงข้อมูล */}
            <div className="mt-4">
              <p className="sm:text-lg xl:text-xl text-xs mb-3 text-left">
                แสดงข้อมูล
              </p>
              <div className="flex gap-x-6">
                {/* กล่องข้อมูล */}
                <div
                  onClick={() => setSelectedDisplay("info")}
                  className={`flex flex-col justify-center items-center border-2 border-[#777777] rounded-2xl lg:px-6 lg:py-2 sm:px-5 sm:py-2 px-3.5 py-1 cursor-pointer hover:shadow-md transition ${
                    selectedDisplay === "info" ? "bg-[#B3B3B3]" : "bg-white"
                  }`}
                >
                  <img
                    src="/home/livestock.png"
                    alt="info"
                    className="2xl:w-10 2xl:h-10 xl:w-9 xl:h-9 lg:w-8 lg:h-8 md:w-7 md:h-7 sm:w-6 sm:h-6 w-5 h-5 object-contain mb-0.5"
                  />
                  <p className="text-center lg:text-sm sm:text-xs text-[10px] font-medium">
                    ข้อมูล
                  </p>
                </div>

                {/* กล่องแผนที่ */}
                <div
                  onClick={() => setSelectedDisplay("map")}
                  className={`flex flex-col justify-center items-center border-2 border-[#777777] rounded-2xl lg:px-6 lg:py-2 sm:px-5 sm:py-2 px-3.5 py-1 cursor-pointer hover:shadow-md transition ${
                    selectedDisplay === "map" ? "bg-[#B3B3B3]" : "bg-white"
                  }`}
                >
                  <img
                    src="/home/map1.png"
                    alt="map"
                    className="2xl:w-10 2xl:h-10 xl:w-9 xl:h-9 lg:w-8 lg:h-8 md:w-7 md:h-7 sm:w-6 sm:h-6 w-5 h-5  object-contain mb-0.5 "
                  />
                  <p className="text-center lg:text-sm sm:text-xs text-[10px] font-medium">
                    แผนที่
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* คอลัมน์ 2: สถานที่ */}
          <div className="flex flex-col">
            <p className="sm:text-lg xl:text-xl text-xs">
              สถานที่{showLostPets ? "หาย" : "พบ"}
            </p>
            <input
              type="text"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full text-[10px] xl:text-lg md:text-md sm:text-sm  mt-1  lg:p-2 sm:p-1 p-1.5 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
            />
          </div>

          {/* คอลัมน์ 3: ประเภท */}
          <div className="flex flex-col">
            <p className="sm:text-lg xl:text-xl  text-xs">ประเภท</p>
            <div className="relative w-full">
              <input
                value={selectedType}
                onClick={toggleDropdown}
                readOnly
                disabled={!isEditing}
                className="w-full text-[10px] xl:text-lg md:text-md sm:text-sm mt-1  lg:p-2 sm:p-1 p-1.5 pr-10 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
              />
              <svg
                className={`absolute sm:right-3 right-2  top-1/2 transform -translate-y-1/2 w-7 h-7 pb-1 text-gray-500 cursor-pointer ${
                  !isEditing ? "pointer-events-none" : ""
                }`}
                onClick={toggleDropdown}
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" />
              </svg>
              {isDropdownVisible && (
                <div className="absolute sm:right-3 right-0 sm:top-12 top-8 sm:w-32 w-24  mt-2 bg-white shadow-lg rounded-md border border-gray-300 z-10">
                  <ul>
                    {[
                      "ทั้งหมด",
                      "แมว",
                      "สุนัข",
                      "นก",
                      "หนู",
                      "ชูก้าไรเดอร์",
                      "เฟอร์ริต",
                      "เม่นแคระ",
                      "กระรอก",
                      "กระต่าย",
                      "งู",
                      "อื่นๆ",
                    ].map((type) => (
                      <li
                        key={type}
                        className="px-4 py-2 sm:text-sm text-[10px] cursor-pointer hover:bg-gray-200 border-b border-gray-300 last:border-b-0"
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
        </div>
      </div>

      <div ref={friendSectionRef} className="flex justify-center mb-3 lg:mb-5">
        <button className="rounded-full shadow-md bg-[#EAD64D] text-black 2xl:text-2xl xl:text-xl lg:text-lg md:text-md sm:text-sm text-xs sm:py-2.5 sm:px-8 lg:px-10 xl:px-12 py-1.5 px-6 cursor-pointer hover:bg-yellow-200 transition duration-300">
          {showLostPets ? "สัตว์เลี้ยงหาย" : "หาเจ้าของ"}
        </button>
      </div>

      <div className="ml-16 2xl:text-xl lg:text-lg sm:text-md text-sm">
        <p>ทั้งหมด: {filteredPets.length} ตัว</p>
      </div>

      {selectedDisplay === "info" ? (
        showLostPets ? (
          <div className="flex flex-wrap justify-center gap-10 lg:gap-12 2xl:gap-16 p-6">
            {currentPets.map((pet, index) => {
              const lostPet = pet as (typeof petsLost)[number];
              return (
                <PetCardh
                  key={index}
                  id={lostPet.id} // ✅ ส่ง id เข้าไป
                  imageSrc={lostPet.imageSrc}
                  name={lostPet.name}
                  age={lostPet.age}
                  gender={lostPet.gender}
                  breed={lostPet.breed}
                  lostDate={lostPet.lostDate}
                  lostLocation={lostPet.lostLocation}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-10 lg:gap-12 2xl:gap-16 p-6">
            {currentPets.map((pet, index) => {
              const ownerPet = pet as (typeof petsOwner)[number];
              return (
                <PetCardj
                  key={index}
                  id={ownerPet.id}
                  imageSrc={ownerPet.imageSrc}
                  gender={ownerPet.gender}
                  breed={ownerPet.breed}
                  lostDate={ownerPet.lostDate}
                />
              );
            })}
          </div>
        )
      ) : (
        // ส่วนนี้สำหรับแผนที่
        <div className="w-full flex justify-center mt-8">
          {/* แสดงแผนที่ เมื่อเลือกแผนที่ */}
          {selectedDisplay === "map" && (
            <div className="flex flex-col mb-10 mt-5 2xl:ml-28 xl:mr-32 lg:mr-28 lg:ml-10 md:mr-20 sm:mr-18 mr-10">
              {/* สถานที่หาย */}
              <div className="mt-2">
                <p className="sm:text-lg xl:text-xl">สถานที่หาย</p>
                <input
                  disabled={!isEditing}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
                />
              </div>
              <div>
                <img
                  src="/home/map2.png"
                  alt="info"
                  className="w-full h-auto object-contain mb-2"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination Section */}
      {selectedDisplay === "info" && (
        <div className="flex justify-center items-center space-x-5 sm:py-7 lg:py-10 py-5">
          {/* Previous button */}
          <button
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex items-center justify-center bg-[#D9D9D9] rounded sm:p-2.5 p-2 disabled:opacity-50"
          >
            <img
              src="/home/arrow.svg"
              alt="arrow"
              className="w-2 sm:w-3 md:w-4 lg:w-5 xl:w-6 object-contain cursor-pointer"
            />
          </button>

          <span className="bg-[#D9D9D9] rounded xl:px-5 xl:py-2 sm:px-4 sm:py-2 px-2.5 py-1 2xl:text-xl xl:text-lg lg:text-md md:text-sm sm:text-xs text-[10px] text-center">
            {currentPage}
          </span>

          <span className="text-center px-2 2xl:text-xl xl:text-lg lg:text-md md:text-sm sm:text-xs text-[10px]">
            ถึง
          </span>

          <span className="bg-[#D9D9D9] rounded xl:px-5 xl:py-2 sm:px-4 sm:py-2 px-2.5 py-1 2xl:text-xl xl:text-lg lg:text-md md:text-sm sm:text-xs text-[10px] text-center">
            {Math.ceil(
              (showLostPets ? petsLost.length : petsOwner.length) / petsPerPage
            )}
          </span>

          {/* Next button */}
          <button
            onClick={() =>
              paginate(
                Math.min(
                  Math.ceil(
                    (showLostPets ? petsLost.length : petsOwner.length) /
                      petsPerPage
                  ),
                  currentPage + 1
                )
              )
            }
            disabled={
              currentPage >=
              Math.ceil(
                (showLostPets ? petsLost.length : petsOwner.length) /
                  petsPerPage
              )
            }
            className="flex items-center justify-center bg-[#D9D9D9] rounded sm:p-2.5 p-2 disabled:opacity-50"
          >
            <img
              src="/home/arrowl.svg"
              alt="arrowl"
              className="w-2 sm:w-3 md:w-4 lg:w-5 xl:w-6 object-contain cursor-pointer"
            />
          </button>
        </div>
      )}
    </div>
  );
}
