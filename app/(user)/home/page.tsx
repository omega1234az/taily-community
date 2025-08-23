"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import L, { Map } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

// Interfaces
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
  title: string;
  description: string;
  location: string;
  lat?: number;
  lng?: number;
  foundDate: string;
  speciesId: number;
  species: string;
  breed?: string;
  gender?: string;
  color?: string;
  age?: number;
  distinctive?: string;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  images: { id: number; url: string; foundPetId: number; mainImage?: boolean }[];
}

interface ApiResponse {
  data: LostPet[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Custom marker icon function
const createCustomIcon = (imageUrl?: string, isLostPet: boolean = true) => {
  const markerHtml = `
    <div style="
      position: relative;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: 4px solid ${isLostPet ? "#ef4444" : "#3b82f6"};
      background: white;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
      overflow: hidden;
      transform: translate(-50%, -50%);
      transition: transform 0.3s ease;
    ">
      <img 
        src="${imageUrl || "/images/default_pet.png"}" 
        style="
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          transition: transform 0.3s ease;
        "
        onerror="this.src='/images/default_pet.png'"
      />
      <div style="
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-top: 14px solid ${isLostPet ? "#ef4444" : "#3b82f6"};
        filter: drop-shadow(0 3px 5px rgba(0,0,0,0.2));
      "></div>
      <div style="
        position: absolute;
        top: -10px;
        right: -10px;
        width: 24px;
        height: 24px;
        background: ${isLostPet ? "#ef4444" : "#3b82f6"};
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: white;
        font-weight: bold;
        box-shadow: 0 3px 10px rgba(0,0,0,0.25);
      ">
        ${isLostPet ? "!" : "✓"}
      </div>
    </div>
  `;
  return L.divIcon({
    html: markerHtml,
    iconSize: [64, 64],
    iconAnchor: [32, 64],
    popupAnchor: [0, -64],
    className: "custom-pet-marker",
  });
};

// PetCardh component for LostPet
const PetCardh = ({ id, title, description, location, lostDate, reward, pet }: LostPet) => (
  <Link href={`/home/${id}`}>
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 cursor-pointer">
      <div className="relative overflow-hidden">
        {pet.images && pet.images.length > 0 ? (
          <img
            src={
              pet.images.find((image) => image.mainImage)?.url ||
              pet.images[0].url ||
              "/images/default_pet.png"
            }
            alt={title}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm text-gray-500">ไม่มีรูปภาพ</span>
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
          หาย
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-700">
            <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>วันที่หาย: {new Date(lostDate).toLocaleDateString("th-TH")}</span>
          </div>
        </div>
        {typeof reward === 'number' && (
          <div className="bg-[#7CBBEB] text-white px-4 py-2 rounded-lg text-center font-semibold shadow-md">
            รางวัล: {reward.toLocaleString()} บาท
          </div>
        )}
      </div>
    </div>
  </Link>
);

// PetCardj component for FoundPet
const PetCardj = ({ id, title, description, location, foundDate, species, images }: FoundPet) => (
  <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
    <div className="relative overflow-hidden">
      {images && images.length > 0 ? (
        <img
          src={
            images.find((image) => image.mainImage)?.url ||
            images[0].url ||
            "/images/default_pet.png"
          }
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm text-gray-500">ไม่มีรูปภาพ</span>
          </div>
        </div>
      )}
      <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
        พบแล้ว
      </div>
    </div>
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
        {description}
      </p>
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-700">
          <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="truncate">{location}</span>
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <span>วันที่พบ: {new Date(foundDate).toLocaleDateString("th-TH")}</span>
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
          <span>ประเภท: {species}</span>
        </div>
      </div>
    </div>
  </div>
);

export default function Home() {
  const [selectedDisplay, setSelectedDisplay] = useState<"info" | "map">("info");
  const [filterDate, setFilterDate] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [isEditing, setIsEditing] = useState(true);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [showLostPets, setShowLostPets] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [lostPets, setLostPets] = useState<LostPet[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<Map | null>(null);
  const friendSectionRef = useRef<HTMLDivElement>(null);
  const petsPerPage = 10;

  // Mock data for FoundPet
  const foundPets: FoundPet[] = [];

  // Fetch lost pets
  useEffect(() => {
    const fetchLostPets = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: petsPerPage.toString(),
          ...(selectedType && selectedType !== "ทั้งหมด" ? { species: selectedType } : {}),
          ...(filterLocation ? { location: filterLocation } : {}),
          status: "lost",
        });

        const response = await fetch(`http://localhost:3000/api/lostpet?${queryParams}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลได้");
        }

        const data: ApiResponse = await response.json();
        const mappedPets = data.data.map((pet) => ({
          ...pet,
          title: pet.pet.name,
          userId: pet.user.id,
          images: pet.pet.images,
        }));

        setLostPets(mappedPets);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        setError((err as Error).message || "เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    if (showLostPets) {
      fetchLostPets();
    }
  }, [currentPage, selectedType, filterLocation, showLostPets]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterLocation, selectedType, showLostPets]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting user location:", error);
          setUserLocation([16.4707, 99.5367]);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setUserLocation([16.4707, 99.5367]);
    }
  }, []);

  const mapCenter = userLocation || [16.4707, 99.5367];

  const toggleDropdown = () => {
    if (isEditing) {
      setIsDropdownVisible(!isDropdownVisible);
    }
  };

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    setIsDropdownVisible(false);
    setCurrentPage(1);
  };

  const handleScrollToFriends = () => {
    friendSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleGoToMyLocation = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.setView([userLocation[0], userLocation[1]], 12);
    }
  };

  // Filter pets
  const filteredLostPets = lostPets.filter((pet) => {
    const matchDate = !filterDate || pet.lostDate.includes(filterDate);
    const matchLocation =
      !filterLocation ||
      pet.location.toLowerCase().includes(filterLocation.toLowerCase());
    return matchDate && matchLocation;
  });

  const filteredFoundPets = foundPets.filter((pet) => {
    const matchType =
      !selectedType || selectedType === "ทั้งหมด" || pet.species === selectedType;
    const matchDate = !filterDate || pet.foundDate === filterDate;
    const matchLocation =
      !filterLocation ||
      pet.location.toLowerCase().includes(filterLocation.toLowerCase());
    return matchType && matchLocation && matchDate;
  });

  const currentFilteredPets = showLostPets ? filteredLostPets : filteredFoundPets;
  const currentLostPets = filteredLostPets.slice(
    (currentPage - 1) * petsPerPage,
    currentPage * petsPerPage
  );
  const currentFoundPets = filteredFoundPets.slice(
    (currentPage - 1) * petsPerPage,
    currentPage * petsPerPage
  );
  const currentMapPets = showLostPets ? filteredLostPets : filteredFoundPets;

  return (
    <div className="w-full font-sans">
      {/* Header Section */}
      <div className="bg-[#E5EEFF] pt-10 px-6 sm:px-14 md:px-20 xl:px-40 2xl:px-32">
        <div className="flex justify-between items-start 2xl:gap-56 xl:gap-28 lg:gap-18 md:gap-10 max-w-screen-2xl mx-auto">
          <div className="max-w-2xl 2xl:pt-40 lg:pt-28 md:pt-20 sm:pt-16 pt-2">
            <h1 className="2xl:text-6xl xl:text-4xl lg:text-3xl md:text-2xl sm:text-xl text-lg font-bold sm:pb-4 xl:pb-6 pb-2">
              ประกาศตามหาสัตว์เลี้ยง
            </h1>
            <p className="2xl:text-2xl xl:text-xl lg:text-lg md:text-md sm:text-sm text-xs pb-2">
              When a pet goes missing, every moment counts
            </p>
            <p className="2xl:text-2xl xl:text-xl lg:text-lg md:text-md sm:text-sm text-xs pb-2">
              - our platform helps reunite lost pets with their loving families.
            </p>
            <div className="flex gap-4 sm:mt-4 lg:mt-6 mt-2">
              <button
                onClick={handleScrollToFriends}
                className="rounded-full shadow-md bg-[#010200] text-white 2xl:text-2xl xl:text-lg lg:text-md md:text-sm sm:text-xs text-[10px] sm:py-2 sm:px-6 lg:px-8 xl:px-10 py-1 px-4 cursor-pointer hover:bg-gray-500 transition duration-300"
              >
                ดูประกาศ
              </button>
              <Link href="/announcement">
                <button className="rounded-full shadow-md bg-[#EAD64D] text-black 2xl:text-2xl xl:text-lg lg:text-md md:text-sm sm:text-xs text-[10px] sm:py-2 sm:px-8 lg:px-10 xl:px-12 py-1 px-6 cursor-pointer hover:bg-yellow-200 transition duration-300">
                  ประกาศ
                </button>
              </Link>
            </div>
          </div>
          <div className="2xl:w-96 lg:w-72 md:w-60 sm:w-56 w-40">
            <img src="/all/h.png" alt="dog" className="w-full h-auto object-cover" />
          </div>
        </div>
      </div>

      {/* Pet Type Selection */}
      <div className="flex justify-center">
        <div className="grid grid-cols-2 lg:gap-60 sm:gap-36 gap-20 place-items-center lg:py-10 py-5">
          <div className="flex flex-col items-center" onClick={() => setShowLostPets(true)}>
            <div className="bg-[#E5EEFF] hover:bg-[#b7ccf5] p-3 cursor-pointer rounded-2xl 2xl:w-28 xl:w-24 lg:w-20 md:w-16 sm:w-14 w-12">
              <img src="/all/lostpets.png" alt="lostpets" className="w-full h-auto object-cover" />
            </div>
            <p className="mt-2 text-[10px] 2xl:text-xl xl:text-lg lg:text-md md:text-sm sm:text-xs text-center font-medium">
              สัตว์เลี้ยงหาย
            </p>
          </div>
          <div className="flex flex-col items-center" onClick={() => setShowLostPets(false)}>
            <div className="bg-[#E5EEFF] hover:bg-[#b7ccf5] p-3 cursor-pointer rounded-2xl 2xl:w-28 xl:w-24 lg:w-20 md:w-16 sm:w-14 w-12">
              <img src="/all/owner.png" alt="owner" className="w-full h-auto object-cover" />
            </div>
            <p className="mt-2 text-[10px] 2xl:text-xl xl:text-lg lg:text-md md:text-sm sm:text-xs text-center font-medium">
              หาเจ้าของ
            </p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex justify-center w-full mb-5">
        <div className="grid grid-cols-3 gap-10 2xl:max-w-5xl xl:max-w-4xl lg:max-w-3xl md:max-w-2xl sm:max-w-xl w-full mx-8 sm:mx-0">
          <div className="flex flex-col">
            <p className="sm:text-lg xl:text-xl text-xs">
              {showLostPets ? "วันที่หาย" : "วันที่พบ"}
            </p>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full text-[10px] xl:text-lg md:text-md sm:text-sm mt-1 lg:p-2 sm:p-1 p-1.5 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            />
            <div className="mt-4">
              <p className="sm:text-lg xl:text-xl text-xs mb-3 text-left">แสดงข้อมูล</p>
              <div className="flex gap-x-6">
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
                  <p className="text-center lg:text-sm sm:text-xs text-[10px] font-medium">ข้อมูล</p>
                </div>
                <div
                  onClick={() => setSelectedDisplay("map")}
                  className={`flex flex-col justify-center items-center border-2 border-[#777777] rounded-2xl lg:px-6 lg:py-2 sm:px-5 sm:py-2 px-3.5 py-1 cursor-pointer hover:shadow-md transition ${
                    selectedDisplay === "map" ? "bg-[#B3B3B3]" : "bg-white"
                  }`}
                >
                  <img
                    src="/home/map1.png"
                    alt="map"
                    className="2xl:w-10 2xl:h-10 xl:w-9 xl:h-9 lg:w-8 lg:h-8 md:w-7 md:h-7 sm:w-6 sm:h-6 w-5 h-5 object-contain mb-0.5"
                  />
                  <p className="text-center lg:text-sm sm:text-xs text-[10px] font-medium">แผนที่</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <p className="sm:text-lg xl:text-xl text-xs">
              สถานที่{showLostPets ? "หาย" : "พบ"}
            </p>
            <input
              type="text"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full text-[10px] xl:text-lg md:text-md sm:text-sm mt-1 lg:p-2 sm:p-1 p-1.5 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              placeholder="ค้นหาตามสถานที่..."
            />
          </div>
          <div className="flex flex-col">
            <p className="sm:text-lg xl:text-xl text-xs">ประเภท</p>
            <div className="relative w-full">
              <input
                value={selectedType}
                onClick={toggleDropdown}
                readOnly
                disabled={!isEditing}
                className="w-full text-[10px] xl:text-lg md:text-md sm:text-sm mt-1 lg:p-2 sm:p-1 p-1.5 pr-10 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              />
              <svg
                className={`absolute sm:right-3 right-2 top-1/2 transform -translate-y-1/2 w-7 h-7 pb-1 text-gray-500 cursor-pointer ${
                  !isEditing ? "pointer-events-none" : ""
                }`}
                onClick={toggleDropdown}
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" />
              </svg>
              {isDropdownVisible && (
                <div className="absolute sm:right-3 right-0 sm:top-12 top-8 sm:w-32 w-24 mt-2 bg-white shadow-lg rounded-md border border-gray-300 z-10">
                  <ul>
                    {["ทั้งหมด", "แมว", "สุนัข", "นก", "อื่นๆ"].map((type) => (
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

      {loading && <div className="text-center py-4">กำลังโหลด...</div>}
      {error && <div className="text-center py-4 text-red-500">{error}</div>}

      <div className="ml-16 2xl:text-xl lg:text-lg sm:text-md text-sm">
        <p>ทั้งหมด: {currentFilteredPets.length} ตัว</p>
      </div>

      {selectedDisplay === "info" ? (
        showLostPets ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8 2xl:gap-10 p-6 lg:p-10">
            {currentLostPets.map((pet) => (
              <PetCardh key={pet.id} {...pet} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8 2xl:gap-10 p-6 lg:p-10">
            {currentFoundPets.map((pet) => (
              <PetCardj key={pet.id} {...pet} />
            ))}
          </div>
        )
      ) : (
        <div className="w-full flex justify-center mt-8">
          <div className="relative flex flex-col mb-10 mt-5 2xl:ml-20 xl:mr-20 lg:mr-20 lg:ml-10 md:mr-20 sm:mr-10 mr-auto w-full max-w-7xl">
            <p className="sm:text-xl xl:text-lg mb-4 font-semibold text-gray-800">
              สถานที่{showLostPets ? "หาย" : "พบ"}
            </p>
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:gap-4 z-10 mb-6">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  placeholder="ค้นหาตามสถานที่..."
                  className="w-full text-sm sm:text-base py-3 px-4 pr-10 border-2 border-gray-200 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white/90 backdrop-blur-sm"
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0a7 7 0 111.414-1.414L21 21z" />
                </svg>
              </div>
              <button
                onClick={handleGoToMyLocation}
                className="w-full sm:w-auto bg-[#EAD64D] text-black text-sm sm:text-base py-3 px-6 rounded-lg hover:bg-yellow-200 transition duration-300 shadow-md flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                ตำแหน่งของฉัน
              </button>
            </div>
            <div className="relative h-[600px] sm:h-[700px] w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-100">
              <MapContainer
                center={mapCenter}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
                ref={mapRef}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <ZoomControl position="topright" />
                {currentMapPets.map((pet) =>
                  pet.lat && pet.lng ? (
                    <Marker
                      key={pet.id}
                      position={[pet.lat, pet.lng]}
                      icon={createCustomIcon(
                        showLostPets
                          ? (pet as LostPet).pet.images.find((image) => image.mainImage)?.url ||
                            (pet as LostPet).pet.images[0]?.url
                          : (pet as FoundPet).images.find((image) => image.mainImage)?.url ||
                            (pet as FoundPet).images[0]?.url,
                        showLostPets
                      )}
                    >
                      <Popup className="rounded-lg shadow-lg bg-white" maxWidth={320}>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-gray-800">{pet.title}</h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                                showLostPets ? "bg-red-500" : "bg-blue-500"
                              }`}
                            >
                              {showLostPets ? "หาย" : "พบแล้ว"}
                            </span>
                          </div>
                          {showLostPets
                            ? (pet as LostPet).pet.images && (pet as LostPet).pet.images.length > 0 && (
                                <img
                                  src={
                                    (pet as LostPet).pet.images.find((image) => image.mainImage)?.url ||
                                    (pet as LostPet).pet.images[0].url
                                  }
                                  alt={pet.title}
                                  className="w-full h-36 object-cover rounded-lg mb-3 shadow-sm"
                                />
                              )
                            : (pet as FoundPet).images && (pet as FoundPet).images.length > 0 && (
                                <img
                                  src={
                                    (pet as FoundPet).images.find((image) => image.mainImage)?.url ||
                                    (pet as FoundPet).images[0].url
                                  }
                                  alt={pet.title}
                                  className="w-full h-36 object-cover rounded-lg mb-3 shadow-sm"
                                />
                              )}
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <svg
                                className="w-4 h-4 mr-2 text-gray-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>{pet.location}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <svg
                                className="w-4 h-4 mr-2 text-gray-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>
                                {showLostPets
                                  ? `วันที่หาย: ${new Date(
                                      (pet as LostPet).lostDate
                                    ).toLocaleDateString("th-TH")}`
                                  : `วันที่พบ: ${new Date(
                                      (pet as FoundPet).foundDate
                                    ).toLocaleDateString("th-TH")}`}
                              </span>
                            </div>
                            {showLostPets && (pet as LostPet).reward && (
                              <div className="bg-amber-500 text-white px-3 py-2 rounded-lg text-center text-sm font-semibold mt-3">
                                💰 รางวัล: {(pet as LostPet).reward?.toLocaleString()} บาท
                              </div>
                            )}
                            {!showLostPets && (
                              <div className="flex items-center text-sm text-gray-600">
                                <svg
                                  className="w-4 h-4 mr-2 text-gray-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                </svg>
                                <span>ประเภท: {(pet as FoundPet).species}</span>
                              </div>
                            )}
                            <Link
                              href={showLostPets ? `/lostpet/${pet.id}` : `/foundpet/${pet.id}`}
                              className="block bg-blue-600 text-white px-3 py-2 rounded-lg text-center text-sm font-semibold mt-3 hover:bg-blue-700 transition duration-300"
                            >
                              ดูรายละเอียด
                            </Link>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ) : null
                )}
              </MapContainer>
            </div>
          </div>
        </div>
      )}

      {selectedDisplay === "info" && (
        <div className="flex justify-center items-center space-x-5 sm:p-7 lg:p-10 py-5">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex items-center justify-center bg-[#D9D9D9] hover:bg-[#C0C0C0] rounded-full sm:p-2.5 p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <img
              src="/home/arrow.svg"
              alt="arrow-left"
              className="w-2 sm:w-3 md:w-4 lg:w-5 xl:w-6 object-contain cursor-pointer"
            />
          </button>
          <span className="bg-[#D9D9D9] rounded-xl sm:px-4 py-2 sm:p-2 px-2.5 py-1 2xl:text-xl xl:text-lg md:text-sm sm:text-xs text-[10px] text-center font-semibold">
            {currentPage}
          </span>
          <span className="text-center px-2 2xl:text-xl xl:text-lg md:text-sm sm:text-xs text-[11px] font-medium">
            ถึง
          </span>
          <span className="bg-[#D9D9D9] rounded-xl sm:px-4 sm:py-2 px-2.5 py-1 2xl:text-xl xl:text-lg md:text-sm sm:text-xs text-[10px] font-semibold">
            {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages}
            className="flex items-center justify-center bg-[#D9D9D9] hover:bg-[#C0C0C0] rounded-full sm:p-2.5 p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <img
              src="/home/arrowl.svg"
              alt="arrow-right"
              className="w-2 sm:w-3 md:w-4 lg:w-5 xl:w-6 object-contain cursor-pointer"
            />
          </button>
        </div>
      )}

      <style jsx global>{`
        .custom-pet-marker {
          background: transparent !important;
          border: none !important;
        }
        .custom-pet-marker:hover div {
          transform: translate(-50%, -55%) scale(1.1);
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
        }
        .leaflet-popup-tip {
          background: white !important;
        }
        .leaflet-container {
          background: #f8fafc !important;
          border-radius: 16px;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
          border-radius: 8px !important;
          background: white !important;
        }
        .leaflet-control-zoom a {
          color: #1f2937 !important;
          font-size: 16px !important;
          line-height: 28px !important;
          transition: all 0.2s ease !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f1f5f9 !important;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}