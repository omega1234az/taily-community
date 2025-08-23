"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import LostPetDetails from "@/app/component/LostPetDetails";

// Types ตาม API Response ที่ได้รับจริง
type LostPet = {
  id: number;
  description: string;
  location: string;
  lat?: number;
  lng?: number;
  lostDate: string; // API ส่งมาเป็น string
  reward?: number;
  status: "lost" | "found" | "pending" | "closed" | "reunited" | "reported" | "fake";
  userId: string;
  petId: number;
  facebook?: string;
  ownerName?: string;
  mainImage: string;
  phone?: string;
  createdAt: string; // API ส่งมาเป็น string
  pet: Pet;
  user: User;
  images: LostPetImage[];
  clues: Clue[];
};

type Pet = {
  id: number;
  name: string;
  speciesId: number;
  breed?: string;
  gender?: string;
  age?: number;
  color?: string[]; // จาก API เป็น array ของ string
  description?: string;
  markings?: string;
  isNeutered: number;
  userId: string;
  createdAt: string; // API ส่งมาเป็น string
  images: PetImage[];
};

type PetSpecies = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type PetImage = {
  id: number;
  url: string;
  petId: number;
  mainImage: boolean;
};

type LostPetImage = {
  id: number;
  url: string;
  lostPetId: number;
};

type FoundPet = {
  id: number;
  title: string;
  description: string;
  location: string;
  lat?: number;
  lng?: number;
  foundDate: Date;
  speciesId: number;
  species: PetSpecies;
  breed?: string;
  gender?: string;
  color?: any; // JSON type
  age?: number;
  distinctive?: string;
  status: string;
  images: FoundPetImage[];
  userId: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
};

type FoundPetImage = {
  id: number;
  url: string;
  foundPetId: number;
};

type User = {
  id: string;
  name?: string;
  image?: string;
};

type Clue = {
  id: number;
  content: string;
  location?: string;
  lat?: number;
  lng?: number;
  userId: string;
  lostPetId: number;
  images: ClueImage[];
  createdAt: Date;
};

type ClueImage = {
  id: number;
  url: string;
  clueId: number;
};

type PetChronicDisease = {
  id: number;
  petId: number;
  disease: string;
  description?: string;
  diagnosedAt?: Date;
};

type VaccineRecord = {
  id: number;
  petId: number;
  vaccine: string;
  date: Date;
  nextDue?: Date;
  note?: string;
};

export default function Id() {
  const params = useParams();
  const petId = params?.id;
  
  const [lostPet, setLostPet] = useState<LostPet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // แปลง petId เป็น number เพื่อตรงกับ schema
  const numericPetId = petId ? parseInt(petId as string) : null;

  useEffect(() => {
    const fetchLostPetData = async () => {
      if (!numericPetId) {
        setError("ไม่พบ ID สัตว์");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/lostpet/${numericPetId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("ไม่พบข้อมูลสัตว์หาย");
          } else {
            setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setLostPet(data);
        
      } catch (err) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", err);
        setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      } finally {
        setLoading(false);
      }
    };

    fetchLostPetData();
  }, [numericPetId]);

  if (!numericPetId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">ไม่พบ ID สัตว์</h2>
          <p className="text-gray-500 mt-2">กรุณาตรวจสอบ URL อีกครั้ง</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">{error}</h2>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  if (lostPet) {
    const petForComponent = convertLostPetForComponent(lostPet);
    return <LostPetDetails pet={petForComponent} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-700">ไม่พบข้อมูล</h2>
        <p className="text-gray-500 mt-2">ไม่พบข้อมูลสัตว์ที่คุณค้นหา</p>
      </div>
    </div>
  );
}

// Helper functions สำหรับใช้งาน
export const formatPetAge = (age?: number): string => {
  if (!age) return "ไม่ระบุ";
  return age === 1 ? "1 ปี" : `${age} ปี`;
};

export const formatNeuteredStatus = (isNeutered: number): string => {
  return isNeutered === 1 ? "ทำหมันแล้ว" : "ไม่ได้ทำหมัน";
};

export const formatReward = (reward?: number): string => {
  if (!reward || reward === 0) return "ไม่มีรางวัล";
  return `${reward.toLocaleString()} บาท`;
};

export const formatLostPetStatus = (status: string): string => {
  const statusMap = {
    lost: "หาย",
    found: "พบแล้ว",
    pending: "รอดำเนินการ",
    closed: "ปิดคดี",
    reunited: "กลับมาแล้ว",
    reported: "รายงานแล้ว",
    fake: "เป็นข้อมูลเท็จ"
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

export const getMainPetImage = (images: PetImage[]): string | null => {
  const mainImage = images.find(img => img.mainImage);
  return mainImage?.url || images[0]?.url || null;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatColors = (colors?: string[]): string => {
  if (!colors || colors.length === 0) return "ไม่ระบุ";
  return colors.join(", ");
};
type LostPetForComponent = {
  id: string;
  name: string;
  age: string;
  gender: string;
  type: string;
  breed: string;
  sterilized: string;
  color: string;
  marks: string;
  description: string;
  lostDate: string;
  mainImage: string;
  lat?: number;
  lng?: number;
  lostDetail: string;
  lostLocation: string;
  images: string[];
  reward?: string;
  ownerName?: string;
  phone?: string;
  facebook?: string;
};

// Helper function แปลงข้อมูลจาก API เป็น format ที่ LostPetDetails component ต้องการ
export const convertLostPetForComponent = (lostPet: LostPet): LostPetForComponent => {
  return {
    id: lostPet.id.toString(),
    name: lostPet.pet.name,
    age: formatPetAge(lostPet.pet.age),
    gender: lostPet.pet.gender || "ไม่ระบุ",
    type: "สัตว์เลี้ยง", // หรือจะดึงจาก species ก็ได้
    breed: lostPet.pet.breed || "ไม่ระบุ",
    sterilized: formatNeuteredStatus(lostPet.pet.isNeutered),
    color: formatColors(lostPet.pet.color),
    marks: lostPet.pet.markings || "ไม่มี",
    description: lostPet.pet.description || lostPet.description,
    lostDate: formatDate(lostPet.lostDate),
    lat: lostPet.lat,
    lng: lostPet.lng,
    mainImage: getMainPetImage(lostPet.pet.images) || "/default-image.jpg",
    lostDetail: lostPet.description,
    lostLocation: lostPet.location,
    images: lostPet.pet.images.map(img => img.url),
    reward: lostPet.reward ? formatReward(lostPet.reward) : undefined,
    ownerName: lostPet.ownerName,
    phone: lostPet.phone,
    facebook: lostPet.facebook
  };
};