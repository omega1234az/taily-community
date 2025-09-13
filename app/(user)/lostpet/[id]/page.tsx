"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import LostPetDetails from "@/app/component/LostPetDetails";
import {
  formatPetAge,
  formatNeuteredStatus,
  formatReward,
  formatLostPetStatus,
  getMainPetImage,
  formatDate,
  formatColors,
} from "../../../utils/petFormatter";

// ---------------- Types ----------------
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

type User = {
  id: string;
  name?: string;
  image?: string;
};

type Pet = {
  id: number;
  name: string;
  speciesId: number;
  breed?: string;
  gender?: string;
  age?: number;
  color?: string[];
  description?: string;
  markings?: string;
  isNeutered: number;
  userId: string;
  createdAt: string;
  images: PetImage[];
};

type LostPet = {
  id: number;
  description: string;
  location: string;
  lat?: number;
  lng?: number;
  lostDate: string;
  reward?: number;
  status:
    | "lost"
    | "found"
    | "pending"
    | "closed"
    | "reunited"
    | "reported"
    | "fake";
  userId: string;
  petId: number;
  facebook?: string;
  ownerName?: string;
  mainImage: string;
  phone?: string;
  createdAt: string;
  pet: Pet;
  user: User;
  images: LostPetImage[];
};

// ---------------- Component ----------------
export default function Id() {
  const params = useParams();
  const petId = params?.id;
  const [lostPet, setLostPet] = useState<LostPet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

// ---------------- Converter ----------------
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

const convertLostPetForComponent = (lostPet: LostPet): LostPetForComponent => {
  return {
    id: lostPet.id.toString(),
    name: lostPet.pet.name,
    age: formatPetAge(lostPet.pet.age),
    gender: lostPet.pet.gender || "ไม่ระบุ",
    type: "สัตว์เลี้ยง",
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
    images: lostPet.pet.images.map((img) => img.url),
    reward: lostPet.reward ? formatReward(lostPet.reward) : undefined,
    ownerName: lostPet.ownerName,
    phone: lostPet.phone,
    facebook: lostPet.facebook,
  };
};
