"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Pet = {
  id: number;
  name: string;
  speciesId: number;
  breed: string;
  gender: string;
  age: number;
  color: string[];
  description: string;
  userId: string;
  markings: string;
  isNeutered: number;
  createdAt: string;
  images: {
    id: number;
    url: string;
    petId: number;
    mainImage: boolean;
  }[];
  chronicDiseases: any[];
  vaccines: any[];
  ownerName: string;
};

interface RegistrationProps {
  onClose?: () => void;
}

export default function Registration({ onClose }: RegistrationProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  // Fetch pets from API
  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/pets/me/available', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // เพิ่ม authentication headers หากจำเป็น
            // 'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPets(data);
      } catch (err) {
        console.error('Error fetching pets:', err);
        setError('ไม่สามารถโหลดข้อมูลสัตว์เลี้ยงได้');
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  const handleSelectPet = (id: number) => {
    setSelectedPet(id);
  };

  const handleConfirm = () => {
    if (selectedPet) {
      const selectedPetData = pets.find(pet => pet.id === selectedPet);
      router.push(`/registermissing/${selectedPetData?.id}`);
      onClose?.();
    }
  };

  // Get main image for pet
  const getPetMainImage = (pet: Pet): string => {
    const mainImage = pet.images.find(img => img.mainImage);
    return mainImage?.url || pet.images[0]?.url || '/placeholder-pet.jpg';
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex justify-center items-center sm:p-4 bg-opacity-30">
        <div className="bg-white shadow-lg sm:rounded-2xl sm:p-6 p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7CBBEB] mb-4"></div>
          <p className="text-lg">กำลังโหลดข้อมูลสัตว์เลี้ยง...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center sm:p-4 bg-opacity-30">
      <div
        className={`bg-white shadow-lg sm:rounded-2xl sm:p-6 sm:mt-5 pt-18 
    ${pets.length > 0 ? "sm:pt-10" : ""} 
    2xl:w-[800px] 2xl:h-[730px] xl:w-[780px] xl:h-[680px] lg:w-[680px] lg:h-[600px] md:w-[580px] md:h-[565px] sm:w-[520px] sm:h-[500px] w-full h-full relative`}
      >
        {/* Error state */}
        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* กรณียังไม่ลงทะเบียนหรือไม่มีสัตว์เลี้ยง */}
        {pets.length === 0 && !loading ? (
          <>
            {/* กากบาทปิด modal */}
            <button
              onClick={onClose}
              className="absolute top-4 right-10 text-gray-500 hover:text-gray-800 lg:text-6xl text-5xl font-bold cursor-pointer"
            >
              ×
            </button>

            <h2 className="xl:text-2xl text-xl font-bold mb-4 text-center">
              สัตว์เลี้ยงหาย
            </h2>
            <p className="text-gray-600 xl:text-xl text-lg mb-4 text-center">
              กรุณาลงทะเบียนสัตว์เลี้ยง
            </p>

            {/* รูป responsive */}
            <div className="flex justify-center lg:mb-2 xl:mb-4">
              <div className="2xl:w-[500px] 2xl:h-[500px] xl:w-[460px] xl:h-[460px] lg:w-[400px] lg:h-[400px] md:w-[380px] md:h-[380px] sm:w-[320px] sm:h-[320px] w-[380px] h-[380px] relative ">
                <Image
                  src="/login/bgadmin.jpeg"
                  alt="no pets"
                  fill
                  className="rounded-lg object-cover object-center"
                />
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <Link href="/registerpet">
                <button className="rounded-full shadow-md bg-[#EAD64D] text-black xl:text-xl text-lg py-2 px-10 hover:bg-yellow-200 transition duration-300 cursor-pointer">
                  ลงทะเบียน
                </button>
              </Link>
            </div>
          </>
        ) : (
          // กรณีลงทะเบียนแล้ว
          pets.length > 0 && (
            <>
              <h2 className="xl:text-2xl text-xl font-bold mb-6 text-center">
                สัตว์เลี้ยงหาย
              </h2>
              <div className="overflow-y-auto h-[calc(100%-70px)] px-2">
                <div className="flex flex-wrap xl:gap-8 sm:gap-6 lg:p-4 sm:p-2 gap-12 p-7">
                  {pets.map((pet) => (
                    <div
                      key={pet.id}
                      onClick={() => handleSelectPet(pet.id)}
                      className={`cursor-pointer rounded-xl p-5 2xl:w-52 xl:w-48 lg:w-44 md:w-[150px] sm:w-[130px] w-[150px] transition-transform duration-200 transform hover:scale-105 ${
                        selectedPet === pet.id
                          ? "bg-[#AFDAFB] shadow-xl"
                          : "bg-[#E5EEFF] shadow-md hover:shadow-lg"
                      }`}
                    >
                      <div className="relative 2xl:w-[165px] 2xl:h-44 xl:w-[160px] xl:h-[165px] lg:w-[145px] lg:h-[150px] md:w-[110px] md:h-[120px] sm:w-[90px] sm:h-[95px] w-[110px] h-[110px] overflow-hidden rounded-lg flex items-center justify-center">
                        <Image
                          src={getPetMainImage(pet)}
                          alt={pet.name}
                          fill
                          className="object-cover object-center"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-pet.jpg';
                          }}
                        />
                      </div>
                      <p className="mt-3 text-base font-medium text-center">
                        {pet.name}
                      </p>
                      <p className="text-sm text-gray-500 text-center">
                        {pet.breed} • {pet.gender}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )
        )}

        {/* ปุ่มยืนยัน/ยกเลิก สำหรับกรณีลงทะเบียนแล้ว */}
        {pets.length > 0 && (
          <div className="absolute bottom-6 right-6 flex gap-4 ">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-[#D9D9D9] hover:bg-gray-400 text-white cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedPet}
              className={`px-5 py-2 rounded-lg text-white cursor-pointer ${
                selectedPet
                  ? "bg-[#7CBBEB] hover:bg-[#28a7f7]"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              ยืนยัน
            </button>
          </div>
        )}
      </div>
    </div>
  );
}