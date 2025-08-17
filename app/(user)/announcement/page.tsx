"use client";

import React, { useState, useEffect } from "react";
import AnCard from "@/app/component/AnCard";
import Link from "next/link";

// Type definitions
interface Pet {
  id: number;
  name: string;
  species: {
    name: string;
  };
  breed: string;
  age: number;
  gender: string;
  color: string[];
  description: string;
  markings: string;
  images: Array<{
    url: string;
  }>;
}

interface User {
  id: string;
  firstName: string;
  province: string;
}

interface LostPet {
  id: number;
  description: string;
  location: string;
  lostDate: string;
  reward: number;
  status: string;
  ownerName: string;
  pet: Pet;
  user: User;
  images: Array<{
    url: string;
  }>;
  clues: any[];
  createdAt: string;
}

export default function Announcement() {
  const [lostPets, setLostPets] = useState<LostPet[]>([]);
  const [foundPets, setFoundPets] = useState<LostPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ฟังก์ชันดึงข้อมูลสัตว์หาย
  const fetchLostPets = async () => {
    try {
      const response = await fetch('/api/lostpet/me');
      if (!response.ok) throw new Error('Failed to fetch lost pets');
      const data = await response.json();
      setLostPets(data.data || []);
    } catch (err) {
      console.error('Error fetching lost pets:', err);
      setError('ไม่สามารถโหลดข้อมูลสัตว์หายได้');
    }
  };

  // ฟังก์ชันดึงข้อมูลสัตว์หาเจ้าของ
  const fetchFoundPets = async () => {
    try {
      const response = await fetch('/api/lostpet');
      if (!response.ok) throw new Error('Failed to fetch found pets');
      const data = await response.json();
      setFoundPets(data.data || []);
    } catch (err) {
      console.error('Error fetching found pets:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchLostPets(), fetchFoundPets()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  // ฟังก์ชันแปลงวันที่
  const formatThaiDate = (dateString: string) => {
    const date = new Date(dateString);
    const thaiYear = date.getFullYear() + 543;
    return `${date.getDate()}/${date.getMonth() + 1}/${thaiYear}`;
  };

  // ฟังก์ชันคำนวณวันที่หาย
  const calculateDaysSinceLost = (lostDate: string) => {
    return Math.floor(
      (new Date().getTime() - new Date(lostDate).getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  // Loading Component
  const LoadingCard = () => (
    <div className="animate-pulse bg-gray-200 rounded-2xl shadow-lg w-full xl:h-[300px] lg:h-[275px] md:h-[250px] sm:h-[390px] h-[350px] 2xl:max-w-[200px] xl:max-w-[200px] lg:max-w-[170px] md:max-w-[160px] sm:max-w-[288px] max-w-[235px]">
      <div className="h-40 bg-gray-300 rounded-t-2xl"></div>
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
      </div>
    </div>
  );

  return (
    <div>
      {/* สัตว์เลี้ยงหาย Section */}
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
        <h1 className="sm:text-lg xl:text-2xl font-bold">สัตว์เลี้ยงหาย</h1>
        {lostPets.length > 0 && (
          <span className="text-sm text-gray-500 ml-2">
            ({lostPets.length} รายการ)
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
          {error}
        </div>
      )}

      <div className="flex xl:flex-row xl:flex-wrap flex-col lg:pl-14 xl:pl-0 gap-10 py-5">
        {loading ? (
          // แสดง Loading Cards
          Array.from({ length: 3 }).map((_, index) => (
            <LoadingCard key={index} />
          ))
        ) : lostPets.length > 0 ? (
          // แสดงข้อมูลสัตว์หาย
          lostPets.map((lostPet) => (
              
              <AnCard
                id={lostPet.id}
                imageSrc={lostPet.pet.images[0]?.url || "/placeholder.jpg"}
                name={lostPet.pet.name}
                age={`${lostPet.pet.age} ปี`}
                gender={lostPet.pet.gender}
                breed={lostPet.pet.breed}
                lostDate={formatThaiDate(lostPet.lostDate)}
                lostLocation={lostPet.location}
                reward={lostPet.reward.toString()}
                status={lostPet.status}
                daysSinceLost={calculateDaysSinceLost(lostPet.lostDate)}
                ownerName={lostPet.ownerName}
                species={lostPet.pet.species.name}
                color={lostPet.pet.color}
                pet={lostPet.pet}
                
              />
              
            
          ))
        ) : (
          <div className="text-gray-500 text-center py-8 w-full">
            ยังไม่มีรายการสัตว์เลี้ยงหาย
          </div>
        )}

        {/* ปุ่มเพิ่มรายการใหม่ */}
        <Link
          href="/registermissing"
          className="group cursor-pointer hover:bg-gray-200 transition duration-200 flex justify-center items-center flex-col md:flex-row gap-6 p-6 rounded-2xl shadow-lg bg-[#E5EEFF] w-full xl:h-[300px] lg:h-[275px] md:h-[250px] sm:h-[390px] h-[350px] 2xl:max-w-[200px] xl:max-w-[200px] lg:max-w-[170px] md:max-w-[160px] sm:max-w-[288px] max-w-[235px] ml-5 sm:ml-12 md:ml-0"
        >
          <div className="bg-[#7CBBEB] group-hover:bg-[#addbf7] transition-colors duration-200 rounded-full p-2 flex justify-center items-center">
            <svg
              className="2xl:w-20 2xl:h-20 xl:w-18 xl:h-18 lg:w-14 lg:h-14 md:w-12 md:h-12 sm:w-12 sm:h-12 w-10 h-10"
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
          <span className="text-sm text-gray-600 text-center">
            แจ้งสัตว์หาย
          </span>
        </Link>
      </div>

      {/* แสดง "ดูทั้งหมด" หากมีข้อมูลมากกว่า 6 รายการ */}
      {lostPets.length >= 6 && (
        <div className="text-center mt-4">
          <Link 
            href="/lostpets" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ดูสัตว์หายทั้งหมด
          </Link>
        </div>
      )}

      {/* หาเจ้าของ Section */}
      <div className="flex items-center gap-2 mt-8">
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
        <h1 className="sm:text-lg xl:text-2xl font-bold">หาเจ้าของ</h1>
        {foundPets.length > 0 && (
          <span className="text-sm text-gray-500 ml-2">
            ({foundPets.length} รายการ)
          </span>
        )}
      </div>

      <div className="flex xl:flex-row xl:flex-wrap flex-col lg:pl-14 xl:pl-0 gap-10 py-5">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <LoadingCard key={`found-${index}`} />
          ))
        ) : foundPets.length > 0 ? (
          foundPets.map((foundPet) => (
            <Link key={foundPet.id} href={`/foundpet/${foundPet.id}`}>
              <AnCard
                id={foundPet.id}
                imageSrc={foundPet.pet?.images[0]?.url || "/placeholder.jpg"}
                name={foundPet.pet?.name || "ไม่ทราบชื่อ"}
                age={foundPet.pet?.age ? `${foundPet.pet.age} ปี` : "ไม่ทราบ"}
                gender={foundPet.pet?.gender || "ไม่ทราบ"}
                breed={foundPet.pet?.breed || "ไม่ทราบสายพันธุ์"}
                lostDate={formatThaiDate(foundPet.lostDate)}
                lostLocation={foundPet.location}
                reward={foundPet.reward?.toString() || "0"}
                status="FOUND"
                species={foundPet.pet?.species?.name || "ไม่ทราบ"}
                color={foundPet.pet?.color || []} pet={foundPet.pet} />
            </Link>
          ))
        ) : (
          <Link
            href="/registerowner"
            className="group cursor-pointer hover:bg-gray-200 transition duration-200 flex justify-center items-center flex-col md:flex-row gap-6 p-6 my-5 rounded-2xl shadow-lg bg-[#E5EEFF] w-full xl:h-[300px] lg:h-[275px] md:h-[250px] sm:h-[390px] h-[350px] 2xl:max-w-[200px] xl:max-w-[200px] lg:max-w-[170px] md:max-w-[160px] sm:max-w-[288px] max-w-[235px] ml-5 sm:ml-12 md:ml-0"
          >
            <div className="bg-[#7CBBEB] group-hover:bg-[#addbf7] transition-colors duration-200 rounded-full p-2 flex justify-center items-center">
              <svg
                className="2xl:w-20 2xl:h-20 xl:w-18 xl:h-18 lg:w-14 lg:h-14 md:w-12 md:h-12 sm:w-12 sm:h-12 w-10 h-10"
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
            <span className="text-sm text-gray-600 text-center">
              แจ้งเจอสัตว์
            </span>
          </Link>
        )}
      </div>

      {foundPets.length >= 6 && (
        <div className="text-center mt-4">
          <Link 
            href="/foundpets" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ดูสัตว์หาเจ้าของทั้งหมด
          </Link>
        </div>
      )}
    </div>
  );
}