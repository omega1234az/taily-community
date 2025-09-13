"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Interfaces จาก schema เดิม
interface LostPetImage {
  url: string;
  mainImage?: boolean;
}

interface LostPet {
  id: number;
  title: string;
  description: string;
  location: string;
  lat?: number;
  lng?: number;
  lostDate: string;
  reward?: number;
  userId: string;
  createdAt: string;
  images: LostPetImage[];
  pet: {
    id: number;
    name: string;
    species: { name: string };
    breed: string;
    gender: string;
    age: number;
    color: string[];
    description: string;
    markings: string;
    images: LostPetImage[];
  };
  user: {
    id: string;
    firstName: string;
    province: string;
  };
}

interface FoundPet {
  id: number;
  description: string;
  location: string;
  lat?: number;
  lng?: number;
  foundDate: string;
  breed?: string;
  gender?: string;
  color?: string[];
  age?: number;
  distinctive?: string;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  images: { url: string; mainImage?: boolean }[];
  species: { id: number; name: string };
  user: { id: string; firstName: string; province: string };
}

interface ApiResponse {
  data: (LostPet | FoundPet)[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const ManageAnnouncements: React.FC = () => {
  const [showLostPets, setShowLostPets] = useState(true);
  const [lostPets, setLostPets] = useState<LostPet[]>([]);
  const [foundPets, setFoundPets] = useState<FoundPet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const petsPerPage = 10;

  // Fetch lost pets
  useEffect(() => {
    const fetchLostPets = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: petsPerPage.toString(),
          status: "lost",
        });

        const response = await fetch(`http://localhost:3000/api/lostpet?${queryParams}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลสัตว์เลี้ยงหายได้");
        }

        const data: ApiResponse = await response.json();
        const mappedPets = data.data.map((pet: any) => ({
          ...pet,
          title: pet.pet.name,
          userId: pet.user.id,
          images: pet.pet.images,
        }));

        setLostPets(mappedPets);
      } catch (err) {
        setError((err as Error).message || "เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    if (showLostPets) {
      fetchLostPets();
    }
  }, [currentPage, showLostPets]);

  // Fetch found pets
  useEffect(() => {
    const fetchFoundPets = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: petsPerPage.toString(),
          status: "finding",
        });

        const response = await fetch(`http://localhost:3000/api/foundpet?${queryParams}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลสัตว์เลี้ยงที่พบได้");
        }

        const data: ApiResponse = await response.json();
        setFoundPets(data.data as FoundPet[]);
      } catch (err) {
        setError((err as Error).message || "เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    if (!showLostPets) {
      fetchFoundPets();
    }
  }, [currentPage, showLostPets]);

  // Delete lost pet
  const handleDeleteLostPet = async (id: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบประกาศนี้?")) return;

    try {
      const response = await fetch(`http://localhost:3000/api/lostpet/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("ไม่สามารถลบประกาศได้");
      }

      setLostPets(lostPets.filter((pet) => pet.id !== id));
      toast.success("ลบประกาศสัตว์เลี้ยงหายสำเร็จ");
    } catch (err) {
      toast.error((err as Error).message || "เกิดข้อผิดพลาดในการลบ");
    }
  };

  // Delete found pet
  const handleDeleteFoundPet = async (id: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบประกาศนี้?")) return;

    try {
      const response = await fetch(`http://localhost:3000/api/foundpet/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("ไม่สามารถลบประกาศได้");
      }

      setFoundPets(foundPets.filter((pet) => pet.id !== id));
      toast.success("ลบประกาศสัตว์เลี้ยงที่พบสำเร็จ");
    } catch (err) {
      toast.error((err as Error).message || "เกิดข้อผิดพลาดในการลบ");
    }
  };

  return (
    <div className="w-full font-sans p-6 lg:p-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">จัดการประกาศ</h1>

      {/* Toggle between Lost and Found Pets */}
      <div className="flex justify-center mb-6">
        <div className="grid grid-cols-2 gap-8">
          <button
            onClick={() => setShowLostPets(true)}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
              showLostPets ? "bg-[#EAD64D] text-black" : "bg-gray-200 text-gray-700"
            } hover:bg-yellow-200`}
          >
            สัตว์เลี้ยงหาย
          </button>
          <button
            onClick={() => setShowLostPets(false)}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
              !showLostPets ? "bg-[#EAD64D] text-black" : "bg-gray-200 text-gray-700"
            } hover:bg-yellow-200`}
          >
            หาเจ้าของ
          </button>
        </div>
      </div>

      {loading && <div className="text-center py-4">กำลังโหลด...</div>}
      {error && <div className="text-center py-4 text-red-500">{error}</div>}

      {/* Display Lost Pets */}
      {showLostPets && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {lostPets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              <div className="relative overflow-hidden">
                {pet.images && pet.images.length > 0 ? (
                  <img
                    src={
                      pet.images.find((image) => image.mainImage)?.url ||
                      pet.images[0].url ||
                      "/images/default_pet.png"
                    }
                    alt={pet.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-sm text-gray-500">ไม่มีรูปภาพ</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                  หาย
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{pet.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pet.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="truncate">{pet.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>วันที่หาย: {new Date(pet.lostDate).toLocaleDateString("th-TH")}</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Link
                    href={`/lostpet/${pet.id}`}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg text-center text-sm font-semibold hover:bg-blue-600 transition"
                  >
                    ดู
                  </Link>
                  <button
                    onClick={() => handleDeleteLostPet(pet.id)}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-center text-sm font-semibold hover:bg-red-600 transition"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Display Found Pets */}
      {!showLostPets && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {foundPets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              <div className="relative overflow-hidden">
                {pet.images && pet.images.length > 0 ? (
                  <img
                    src={
                      pet.images.find((image) => image.mainImage)?.url ||
                      pet.images[0].url ||
                      "/images/default_pet.png"
                    }
                    alt={pet.description}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-sm text-gray-500">ไม่มีรูปภาพ</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                  พบแล้ว
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{pet.species.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pet.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="truncate">{pet.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>วันที่พบ: {new Date(pet.foundDate).toLocaleDateString("th-TH")}</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Link
                    href={`/foundpet/${pet.id}`}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg text-center text-sm font-semibold hover:bg-blue-600 transition"
                  >
                    ดู
                  </Link>
                  <button
                    onClick={() => handleDeleteFoundPet(pet.id)}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-center text-sm font-semibold hover:bg-red-600 transition"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center space-x-5 py-5">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="bg-gray-200 rounded-xl px-4 py-2 text-sm font-semibold">{currentPage}</span>
        <button
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={showLostPets ? lostPets.length < petsPerPage : foundPets.length < petsPerPage}
          className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <style jsx global>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ManageAnnouncements;