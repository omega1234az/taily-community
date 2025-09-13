"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import Image from "next/image";
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
    <div className="w-full font-sans p-6 lg:p-10 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl lg:text-4xl font-bold mb-8 text-gray-800 flex items-center gap-3">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          จัดการประกาศ
        </h1>

        {/* Toggle between Lost and Found Pets */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-full shadow-md p-1">
            <button
              onClick={() => setShowLostPets(true)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                showLostPets
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg"
                  : "bg-transparent text-gray-700 hover:bg-gray-100"
              }`}
            >
              สัตว์เลี้ยงหาย
            </button>
            <button
              onClick={() => setShowLostPets(false)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                !showLostPets
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg"
                  : "bg-transparent text-gray-700 hover:bg-gray-100"
              }`}
            >
              หาเจ้าของ
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-3 bg-white rounded-lg shadow-md px-6 py-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700 font-medium">กำลังโหลด...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="text-center py-6">
            <div className="inline-block bg-red-50 border border-red-200 rounded-lg shadow-md px-6 py-3 text-red-600 font-medium">
              {error}
            </div>
          </div>
        )}

        {/* Display Lost Pets */}
        {showLostPets && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {lostPets.map((pet) => (
              <div
                key={pet.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:-translate-y-1"
              >
                <div className="relative">
                  {pet.images && pet.images.length > 0 ? (
                    <Image
                      src={
                        pet.images.find((image) => image.mainImage)?.url ||
                        pet.images[0].url ||
                        "/images/default_pet.png"
                      }
                      alt={pet.title}
                      width={400}
                      height={192}
                      className="w-full h-48 object-cover rounded-t-2xl"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-t-2xl">
                      <span className="text-sm text-gray-500 font-medium">ไม่มีรูปภาพ</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    หาย
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{pet.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pet.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-700">
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{pet.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>วันที่หาย: {new Date(pet.lostDate).toLocaleDateString("th-TH")}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>โดย: {pet.user.firstName}</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Link
                      href={`/lostpet/${pet.id}`}
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg text-center text-sm font-semibold hover:bg-blue-600 transition-all shadow-md hover:shadow-lg"
                    >
                      ดูรายละเอียด
                    </Link>
                    <button
                      onClick={() => handleDeleteLostPet(pet.id)}
                      className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-center text-sm font-semibold hover:bg-red-600 transition-all shadow-md hover:shadow-lg"
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
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:-translate-y-1"
              >
                <div className="relative">
                  {pet.images && pet.images.length > 0 ? (
                    <Image
                      src={
                        pet.images.find((image) => image.mainImage)?.url ||
                        pet.images[0].url ||
                        "/images/default_pet.png"
                      }
                      alt={pet.description}
                      width={400}
                      height={192}
                      className="w-full h-48 object-cover rounded-t-2xl"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-t-2xl">
                      <span className="text-sm text-gray-500 font-medium">ไม่มีรูปภาพ</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    พบแล้ว
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{pet.species.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pet.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-700">
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{pet.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>วันที่พบ: {new Date(pet.foundDate).toLocaleDateString("th-TH")}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>โดย: {pet.user.firstName}</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Link
                      href={`/foundpet/${pet.id}`}
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg text-center text-sm font-semibold hover:bg-blue-600 transition-all shadow-md hover:shadow-lg"
                    >
                      ดูรายละเอียด
                    </Link>
                    <button
                      onClick={() => handleDeleteFoundPet(pet.id)}
                      className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-center text-sm font-semibold hover:bg-red-600 transition-all shadow-md hover:shadow-lg"
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
        <div className="flex justify-center items-center space-x-4 py-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full px-4 py-2 text-sm font-semibold shadow-md">
            {currentPage}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={showLostPets ? lostPets.length < petsPerPage : foundPets.length < petsPerPage}
            className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Modal for Lost Pet */}
        {showLostPets && lostPets.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 hidden">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative p-6">
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">รายละเอียดสัตว์เลี้ยงหาย</h2>
                  <button
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ✕
                  </button>
                </div>
                {/* Modal content for lost pet */}
              </div>
            </div>
          </div>
        )}

        {/* Modal for Found Pet */}
        {!showLostPets && foundPets.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 hidden">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative p-6">
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">รายละเอียดสัตว์เลี้ยงที่พบ</h2>
                  <button
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ✕
                  </button>
                </div>
                {/* Modal content for found pet */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAnnouncements;