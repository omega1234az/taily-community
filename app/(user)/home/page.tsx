"use client";

import React, { useState, useRef ,useEffect} from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons (for fallback if needed)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

// Interfaces based on Prisma models
interface LostPetImage {
  id: number;
  url: string;
  lostPetId: number;
}

interface FoundPetImage {
  id: number;
  url: string;
  foundPetId: number;
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
  images: FoundPetImage[];
}

// Enhanced Pet Cards with beautiful design
const PetCardh = ({ id, title, description, location, lostDate, reward, images }: LostPet) => (
  <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
    <div className="relative overflow-hidden">
      {images && images.length > 0 ? (
        <img
          src={images[0].url}
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
          <span>วันที่หาย: {new Date(lostDate).toLocaleDateString('th-TH')}</span>
        </div>
      </div>
      
      {reward && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-center font-semibold shadow-md">
          💰 รางวัล: {reward.toLocaleString()} บาท
        </div>
      )}
    </div>
  </div>
);

const PetCardj = ({ id, title, description, location, foundDate, species, images }: FoundPet) => (
  <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
    <div className="relative overflow-hidden">
      {images && images.length > 0 ? (
        <img
          src={images[0].url}
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
          <span>วันที่พบ: {new Date(foundDate).toLocaleDateString('th-TH')}</span>
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

// Enhanced custom marker icon function with better visibility
const createCustomIcon = (imageUrl?: string, isLostPet: boolean = true) => {
  // Create a custom HTML element for the marker
  const markerHtml = `
    <div style="
      position: relative;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 4px solid ${isLostPet ? '#ef4444' : '#3b82f6'};
      background: white;
      box-shadow: 0 8px 20px rgba(0,0,0,0.3);
      overflow: hidden;
      transform: translate(-50%, -50%);
    ">
      <img 
        src="${imageUrl || '/images/default_pet.png'}" 
        style="
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        "
        onerror="this.src='/images/default_pet.png'"
      />
      <div style="
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 12px solid ${isLostPet ? '#ef4444' : '#3b82f6'};
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
      "></div>
      <div style="
        position: absolute;
        top: -8px;
        right: -8px;
        width: 20px;
        height: 20px;
        background: ${isLostPet ? '#ef4444' : '#3b82f6'};
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: white;
        font-weight: bold;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      ">
        ${isLostPet ? '!' : '✓'}
      </div>
    </div>
  `;

  return L.divIcon({
    html: markerHtml,
    iconSize: [60, 60],
    iconAnchor: [30, 60],
    popupAnchor: [0, -60],
    className: 'custom-pet-marker'
  });
};

export default function Home() {
  const [selectedDisplay, setSelectedDisplay] = useState<"info" | "map">("info");
  const [filterDate, setFilterDate] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [isEditing, setIsEditing] = useState(true);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [showLostPets, setShowLostPets] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null); // State สำหรับเก็บพิกัดผู้ใช้
  
  const petsPerPage = 10;

  const friendSectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting user location:", error);
          // Fallback เป็นพิกัดกำแพงเพชรถ้าไม่สามารถดึงตำแหน่งได้
          setUserLocation([16.4707, 99.5367]);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      // Fallback ถ้าเบราว์เซอร์ไม่รองรับ Geolocation
      setUserLocation([16.4707, 99.5367]);
    }
  }, []);

 
  const mapCenter = userLocation || [16.4707, 99.5367];
  // Mock data for LostPet
     const lostPets: LostPet[] = [
    {
      id: 1,
      title: "ไข่ตุ๋น",
      description: "แมว บริติช ช็อตแฮร์ อายุ 1 ปี ตัวผู้ มีปลอกคอสีแดง",
      location: "บ้านหนองอึ่งพัฒนา อ.เมือง จ.กำแพงเพชร",
      lat: 16.4707,
      lng: 99.5367,
      lostDate: "2025-02-05",
      reward: 5000,
      userId: "user1",
      createdAt: new Date().toISOString(),
      images: [{ id: 1, url: "/home/eggtun.png", lostPetId: 1 }],
    },
    {
      id: 2,
      title: "ส้มโอ",
      description: "สุนัข เพมโบรก เวลช์คอร์กี้ อายุ 2 ปี ตัวผู้",
      location: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
      lat: 18.7880,
      lng: 98.9850,
      lostDate: "2025-01-05",
      reward: 4000,
      userId: "user2",
      createdAt: new Date().toISOString(),
      images: [{ id: 2, url: "/home/sumo.png", lostPetId: 2 }],
    },
    {
      id: 3,
      title: "มิลมิล",
      description: "งูขาว อายุ 2 ปี ตัวเมีย",
      location: "ซอยสุขุมวิท 101 ถนนสุขุมวิท เขตบางนา",
      lat: 13.6800,
      lng: 100.6167,
      lostDate: "2025-02-18",
      reward: 3000,
      userId: "user3",
      createdAt: new Date().toISOString(),
      images: [{ id: 3, url: "/home/milmil.jpg", lostPetId: 3 }],
    },
    {
      id: 4,
      title: "จาเบล",
      description: "แฮมสเตอร์แคระขาว อายุ 1 ปี ตัวผู้",
      location: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
      lat: 18.7880,
      lng: 98.9850,
      lostDate: "2025-02-15",
      reward: 2000,
      userId: "user4",
      createdAt: new Date().toISOString(),
      images: [{ id: 4, url: "/home/ham.jpg", lostPetId: 4 }],
    },
    {
      id: 5,
      title: "ไคลี่",
      description: "ชิปมังก์ อายุ 3 ปี ตัวเมีย",
      location: "บ้านหนองอึ่งพัฒนา อ.เมือง จ.กำแพงเพชร",
      lat: 16.4707,
      lng: 99.5367,
      lostDate: "2025-05-05",
      reward: 1000,
      userId: "user5",
      createdAt: new Date().toISOString(),
      images: [{ id: 5, url: "/home/karog.jpg", lostPetId: 5 }],
    },
    {
      id: 6,
      title: "มิลา",
      description: "นก ค็อกคาเทล อายุ 2 ปี ตัวเมีย",
      location: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
      lat: 18.7880,
      lng: 98.9850,
      lostDate: "2025-01-09",
      reward: 1500,
      userId: "user6",
      createdAt: new Date().toISOString(),
      images: [{ id: 6, url: "/home/nok.jpg", lostPetId: 6 }],
    },
    {
      id: 7,
      title: "ริรี่",
      description: "กระต่าย ฮอลแลนด์ลอป อายุ 2 ปี ตัวเมีย",
      location: "บ้านหนองอึ่งพัฒนา อ.เมือง จ.กำแพงเพชร",
      lat: 16.4707,
      lng: 99.5367,
      lostDate: "2025-04-10",
      reward: 2500,
      userId: "user7",
      createdAt: new Date().toISOString(),
      images: [{ id: 7, url: "/home/katay.jpg", lostPetId: 7 }],
    },
    {
      id: 8,
      title: "โอเวน",
      description: "นก เลิฟเบิร์ดหน้ากุหลาบ อายุ 3 ปี ตัวผู้",
      location: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
      lat: 18.7880,
      lng: 98.9850,
      lostDate: "2025-05-22",
      reward: 1100,
      userId: "user8",
      createdAt: new Date().toISOString(),
      images: [{ id: 8, url: "/home/kok2.jpg", lostPetId: 8 }],
    },
    {
      id: 9,
      title: "อัลเดน",
      description: "เฟอร์ริต อายุ 3 ปี ตัวผู้",
      location: "บ้านหนองอึ่งพัฒนา อ.เมือง จ.กำแพงเพชร",
      lat: 16.4707,
      lng: 99.5367,
      lostDate: "2025-04-30",
      reward: 3500,
      userId: "user9",
      createdAt: new Date().toISOString(),
      images: [{ id: 9, url: "/home/ferrit.jpg", lostPetId: 9 }],
    },
    {
      id: 10,
      title: "จ๊ะโอ๋",
      description: "สุนัข ไทย อายุ 2 ปี ตัวผู้",
      location: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
      lat: 18.7880,
      lng: 98.9850,
      lostDate: "2025-03-02",
      reward: 1200,
      userId: "user10",
      createdAt: new Date().toISOString(),
      images: [{ id: 10, url: "/home/thai.png", lostPetId: 10 }],
    },
    {
      id: 11,
      title: "ปุกปุย",
      description: "เม่นแคระ อายุ 2 ปี ตัวผู้",
      location: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
      lat: 18.7880,
      lng: 98.9850,
      lostDate: "2025-05-03",
      reward: 500,
      userId: "user11",
      createdAt: new Date().toISOString(),
      images: [{ id: 11, url: "/home/men.jpg", lostPetId: 11 }],
    },
    {
      id: 12,
      title: "มูมู่",
      description: "ชูก้าไรเดอร์ อายุ 3 ปี ตัวผู้",
      location: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
      lat: 18.7880,
      lng: 98.9850,
      lostDate: "2025-03-20",
      reward: 600,
      userId: "user12",
      createdAt: new Date().toISOString(),
      images: [{ id: 12, url: "/home/chuga.jpg", lostPetId: 12 }],
    },
    {
      id: 13,
      title: "ลูมิส",
      description: "งูขาว อายุ 3 ปี ตัวผู้",
      location: "หน้าบ้านในซอยสวนผัก 32 เขตตลิ่งชัน",
      lat: 13.7790,
      lng: 100.4460,
      lostDate: "2025-02-12",
      reward: 700,
      userId: "user13",
      createdAt: new Date().toISOString(),
      images: [{ id: 13, url: "/home/Lumis.jpg", lostPetId: 13 }],
    },
    {
      id: 14,
      title: "บันบัน",
      description: "กระต่าย แองโกล่า อายุ 2 ปี ตัวเมีย",
      location: "หน้าบ้านในซอยสวนผัก 32 เขตตลิ่งชัน",
      lat: 13.7790,
      lng: 100.4460,
      lostDate: "2025-05-01",
      reward: 800,
      userId: "user14",
      createdAt: new Date().toISOString(),
      images: [{ id: 14, url: "/home/bunbun.jpg", lostPetId: 14 }],
    },
    {
      id: 15,
      title: "โนว่า",
      description: "แมว สฟิงซ์ อายุ 4 ปี ตัวผู้",
      location: "คอนโดแถวรัชดาภิเษก ซอย 14",
      lat: 13.7690,
      lng: 100.5770,
      lostDate: "2025-04-18",
      reward: 900,
      userId: "user15",
      createdAt: new Date().toISOString(),
      images: [{ id: 15, url: "/home/Nova.jpg", lostPetId: 15 }],
    },
    {
      id: 16,
      title: "บิสกิต",
      description: "เม่นแคระสโนว์ อายุ 4 ปี ตัวผู้",
      location: "หอพักใกล้มหาวิทยาลัยเชียงใหม่",
      lat: 18.7970,
      lng: 98.9530,
      lostDate: "2025-06-10",
      reward: 1000,
      userId: "user16",
      createdAt: new Date().toISOString(),
      images: [{ id: 16, url: "/home/Biscuit.jpg", lostPetId: 16 }],
    },
    {
      id: 17,
      title: "ดัสตี้",
      description: "ชินชิล่า อายุ 2 ปี ตัวผู้",
      location: "บ้านในซอยลาดปลาเค้า 72 เขตบางเขน",
      lat: 13.8550,
      lng: 100.5910,
      lostDate: "2025-06-01",
      reward: 2000,
      userId: "user17",
      createdAt: new Date().toISOString(),
      images: [{ id: 17, url: "/home/Dusty.jpg", lostPetId: 17 }],
    },
    {
      id: 18,
      title: "ไอวี่",
      description: "สุนัข ซามอย อายุ 2 ปี ตัวเมia",
      location: "บ้านหนองรี อ.บ่อพลอย จ.กาญจนบุรี",
      lat: 14.3167,
      lng: 99.5167,
      lostDate: "2025-05-28",
      reward: 2000,
      userId: "user18",
      createdAt: new Date().toISOString(),
      images: [{ id: 18, url: "/home/samoy.png", lostPetId: 18 }],
    },
  ];

  // Mock data for FoundPet
 const foundPets: FoundPet[] = [
    {
      id: 19,
      title: "แมวบริติช ช็อตแฮร์",
      description: "แมวบริติช ช็อตแฮร์ ตัวผู้",
      location: "บ้านหนองอึ่งพัฒนา อ.เมือง จ.กำแพงเพชร",
      lat: 16.4707,
      lng: 99.5367,
      foundDate: "2025-05-10",
      speciesId: 1,
      species: "แมว",
      breed: "บริติช ช็อตแฮร์",
      gender: "ตัวผู้",
      color: "ไม่ระบุ",
      age: 1,
      distinctive: "ไม่ระบุ",
      status: "finding",
      userId: "user19",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: [{ id: 19, url: "/home/eggtun.png", foundPetId: 19 }],
    },
    {
      id: 20,
      title: "สุนัขเพมโบรก",
      description: "สุนัขเพมโบรก เวลช์คอร์กี้ ตัวผู้",
      location: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
      lat: 18.7880,
      lng: 98.9850,
      foundDate: "2025-05-08",
      speciesId: 2,
      species: "สุนัข",
      breed: "เพมโบรก เวลช์คอร์กี้",
      gender: "ตัวผู้",
      color: "ไม่ระบุ",
      age: 2,
      distinctive: "ไม่ระบุ",
      status: "finding",
      userId: "user20",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: [{ id: 20, url: "/home/sumo.png", foundPetId: 20 }],
    },
    {
      id: 21,
      title: "งูขาว",
      description: "งูขาว ตัวเมีย",
      location: "ซอยสุขุมวิท 101 ถนนสุขุมวิท เขตบางนา",
      lat: 13.6800,
      lng: 100.6167,
      foundDate: "2025-06-02",
      speciesId: 3,
      species: "งู",
      breed: "งูขาว",
      gender: "ตัวเมีย",
      color: "ขาว",
      age: 2,
      distinctive: "ไม่ระบุ",
      status: "finding",
      userId: "user21",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: [{ id: 21, url: "/home/milmil.jpg", foundPetId: 21 }],
    },
    {
      id: 22,
      title: "แฮมสเตอร์แคระขาว",
      description: "แฮมสเตอร์แคระขาว ตัวผู้",
      location: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
      lat: 18.7880,
      lng: 98.9850,
      foundDate: "2025-02-13",
      speciesId: 4,
      species: "หนู",
      breed: "แฮมสเตอร์แคระขาว",
      gender: "ตัวผู้",
      color: "ขาว",
      age: 1,
      distinctive: "ไม่ระบุ",
      status: "finding",
      userId: "user22",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: [{ id: 22, url: "/home/ham.jpg", foundPetId: 22 }],
    },
    {
      id: 23,
      title: "ชิปมังก์",
      description: "ชิปมังก์ ตัวเมีย",
      location: "บ้านหนองอึ่งพัฒนา อ.เมือง จ.กำแพงเพชร",
      lat: 16.4707,
      lng: 99.5367,
      foundDate: "2025-05-06",
      speciesId: 5,
      species: "กระรอก",
      breed: "ชิปมังก์",
      gender: "ตัวเมีย",
      color: "ไม่ระบุ",
      age: 3,
      distinctive: "ไม่ระบุ",
      status: "finding",
      userId: "user23",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: [{ id: 23, url: "/home/karog.jpg", foundPetId: 23 }],
    },
    {
      id: 24,
      title: "นกค็อกคาเทล",
      description: "นกค็อกคาเทล ตัวเมีย",
      location: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
      lat: 18.7880,
      lng: 98.9850,
      foundDate: "2025-01-12",
      speciesId: 6,
      species: "นก",
      breed: "ค็อกคาเทล",
      gender: "ตัวเมีย",
      color: "ไม่ระบุ",
      age: 2,
      distinctive: "ไม่ระบุ",
      status: "finding",
      userId: "user24",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: [{ id: 24, url: "/home/nok.jpg", foundPetId: 24 }],
    },
    {
      id: 25,
      title: "กระต่ายฮอลแลนด์ลอป",
      description: "กระต่ายฮอลแลนด์ลอป ตัวเมีย",
      location: "บ้านหนองอึ่งพัฒนา อ.เมือง จ.กำแพงเพชร",
      lat: 16.4707,
      lng: 99.5367,
      foundDate: "2025-04-15",
      speciesId: 7,
      species: "กระต่าย",
      breed: "ฮอลแลนด์ลอป",
      gender: "ตัวเมีย",
      color: "ไม่ระบุ",
      age: 2,
      distinctive: "ไม่ระบุ",
      status: "finding",
      userId: "user25",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: [{ id: 25, url: "/home/katay.jpg", foundPetId: 25 }],
    },
    {
      id: 26,
      title: "นกเลิฟเบิร์ด",
      description: "นกเลิฟเบิร์ดหน้ากุหลาบ ตัวผู้",
      location: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
      lat: 18.7880,
      lng: 98.9850,
      foundDate: "2025-05-23",
      speciesId: 8,
      species: "นก",
      breed: "เลิฟเบิร์ดหน้ากุหลาบ",
      gender: "ตัวผู้",
      color: "ไม่ระบุ",
      age: 3,
      distinctive: "หน้ากุหลาบ",
      status: "finding",
      userId: "user26",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: [{ id: 26, url: "/home/kok2.jpg", foundPetId: 26 }],
    },
    {
      id: 27,
      title: "เฟอร์ริต",
      description: "เฟอร์ริต ตัวผู้",
      location: "บ้านหนองอึ่งพัฒนา อ.เมือง จ.กำแพงเพชร",
      lat: 16.4707,
      lng: 99.5367,
      foundDate: "2025-05-02",
      speciesId: 9,
      species: "เฟอร์ริต",
      breed: "เฟอร์ริต",
      gender: "ตัวผู้",
      color: "ไม่ระบุ",
      age: 3,
      distinctive: "ไม่ระบุ",
      status: "finding",
      userId: "user27",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: [{ id: 27, url: "/home/ferrit.jpg", foundPetId: 27 }],
    },
    {
      id: 28,
      title: "สุนัขไทย",
      description: "สุนัขไทย ตัวผู้",
      location: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
      lat: 18.7880,
      lng: 98.9850,
      foundDate: "2025-03-04",
      speciesId: 10,
      species: "สุนัข",
      breed: "ไทย",
      gender: "ตัวผู้",
      color: "ไม่ระบุ",
      age: 2,
      distinctive: "ไม่ระบุ",
      status: "finding",
      userId: "user28",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: [{ id: 28, url: "/home/thai.png", foundPetId: 28 }],
    },
    {
      id: 29,
      title: "เม่นแคระ",
      description: "เม่นแคระ ตัวผู้",
      location: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
      lat: 18.7880,
      lng: 98.9850,
      foundDate: "2025-05-05",
      speciesId: 11,
      species: "เม่นแคระ",
      breed: "เม่นแคระ",
      gender: "ตัวผู้",
      color: "ไม่ระบุ",
      age: 2,
      distinctive: "ไม่ระบุ",
      status: "finding",
      userId: "user29",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: [{ id: 29, url: "/home/men.jpg", foundPetId: 29 }],
    },
    {
      id: 30,
      title: "ชูก้าไรเดอร์",
      description: "ชูก้าไรเดอร์ ตัวผู้",
      location: "ซอยสุขใจ 4 อ.เมือง จ.เชียงใหม่",
      lat: 18.7880,
      lng: 98.9850,
      foundDate: "2025-03-22",
      speciesId: 12,
      species: "ชูก้าไรเดอร์",
      breed: "ชูก้าไรเดอร์",
      gender: "ตัวผู้",
      color: "ไม่ระบุ",
      age: 3,
      distinctive: "ไม่ระบุ",
      status: "finding",
      userId: "user30",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: [{ id: 30, url: "/home/chuga.jpg", foundPetId: 30 }],
    },
    {
      id: 31,
      title: "งูเหลือง",
      description: "งูเหลือง ตัวผู้",
      location: "หน้าบ้านในซอยสวนผัก 32 เขตตลิ่งชัน",
      lat: 13.7790,
      lng: 100.4460,
      foundDate: "2025-02-15",
      speciesId: 13,
      species: "งู",
      breed: "เหลือง",
      gender: "ตัวผู้",
      color: "เหลือง",
      age: 3,
      distinctive: "ไม่ระบุ",
      status: "finding",
      userId: "user31",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: [{ id: 31, url: "/home/Lumis.jpg", foundPetId: 31 }],
    },
    {
      id: 32,
      title: "กระต่ายเนเธอร์แลนด์ดวร์ฟ",
      description: "กระต่ายเนเธอร์แลนด์ดวร์ฟ ตัวเมีย",
      location: "หน้าบ้านในซอยสวนผัก 32 เขตตลิ่งชัน",
      lat: 13.7790,
      lng: 100.4460,
      foundDate: "2025-05-05",
      speciesId: 14,
      species: "กระต่าย",
      breed: "เนเธอร์แลนด์ดวร์ฟ",
      gender: "ตัวเมีย",
      color: "ไม่ระบุ",
      age: 2,
      distinctive: "ไม่ระบุ",
      status: "finding",
      userId: "user32",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: [{ id: 32, url: "/home/bunbun.jpg", foundPetId: 32 }],
    },
    {
      id: 33,
      title: "แมวสฟิงซ์",
      description: "แมวสฟิงซ์ ตัวผู้",
      location: "คอนโดแถวรัชดาภิเษก ซอย 14",
      lat: 13.7690,
      lng: 100.5770,
      foundDate: "2025-04-20",
      speciesId: 15,
      species: "แมว",
      breed: "สฟิงซ์",
      gender: "ตัวผู้",
      color: "ไม่ระบุ",
      age: 4,
      distinctive: "ไม่มีขน",
      status: "finding",
      userId: "user33",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: [{ id: 33, url: "/home/Nova.jpg", foundPetId: 33 }],
    },
    {
      id: 34,
      title: "เม่นแคระสโนว์",
      description: "เม่นแคระสโนว์ ตัวผู้",
      location: "หอพักใกล้มหาวิทยาลัยเชียงใหม่",
      lat: 18.7970,
      lng: 98.9530,
      foundDate: "2025-06-15",
      speciesId: 16,
      species: "เม่น",
      breed: "เม่นแคระสโนว์",
      gender: "ตัวผู้",
      color: "ขาว",
      age: 4,
      distinctive: "ไม่ระบุ",
      status: "finding",
      userId: "user34",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: [{ id: 34, url: "/home/Biscuit.jpg", foundPetId: 34 }],
    },
    {
      id: 35,
      title: "ชินชิล่า",
      description: "ชินชิล่า ตัวผู้",
      location: "บ้านในซอยลาดปลาเค้า 72 เขตบางเขน",
      lat: 13.8550,
      lng: 100.5910,
      foundDate: "2025-06-01",
      speciesId: 17,
      species: "หนู",
      breed: "ชินชิล่า",
      gender: "ตัวผู้",
      color: "ไม่ระบุ",
      age: 2,
      distinctive: "ไม่ระบุ",
      status: "finding",
      userId: "user35",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: [{ id: 35, url: "/home/Dusty.jpg", foundPetId: 35 }],
    },
    {
      id: 36,
      title: "สุนัขซามอย",
      description: "สุนัขซามอย ตัวเมีย",
      location: "บ้านหนองรี อ.บ่อพลอย จ.กาญจนบุรี",
      lat: 14.3167,
      lng: 99.5167,
      foundDate: "2025-06-02",
      speciesId: 18,
      species: "สุนัข",
      breed: "ซามอย",
      gender: "ตัวเมีย",
      color: "ขาว",
      age: 2,
      distinctive: "ไม่ระบุ",
      status: "finding",
      userId: "user36",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: [{ id: 36, url: "/home/samoy.png", foundPetId: 36 }],
    },
  ];



  const toggleDropdown = () => {
    if (isEditing) {
      setIsDropdownVisible(!isDropdownVisible);
    }
  };

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    setIsDropdownVisible(false);
  };

  const handleScrollToFriends = () => {
    friendSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Separate filtering for lost and found pets
  const filteredLostPets = lostPets.filter((pet) => {
    const matchType =
      !selectedType ||
      selectedType === "ทั้งหมด" ||
      pet.title.toLowerCase().includes(selectedType.toLowerCase());

    const matchDate = !filterDate || pet.lostDate === filterDate;

    const matchLocation =
      !filterLocation ||
      pet.location.toLowerCase().includes(filterLocation.toLowerCase());

    return matchType && matchLocation && matchDate;
  });

  const filteredFoundPets = foundPets.filter((pet) => {
    const matchType =
      !selectedType ||
      selectedType === "ทั้งหมด" ||
      pet.species === selectedType;

    const matchDate = !filterDate || pet.foundDate === filterDate;

    const matchLocation =
      !filterLocation ||
      pet.location.toLowerCase().includes(filterLocation.toLowerCase());

    return matchType && matchLocation && matchDate;
  });

  // Get current pets based on the selected type
  const currentFilteredPets = showLostPets ? filteredLostPets : filteredFoundPets;
  const totalPages = Math.ceil(currentFilteredPets.length / petsPerPage);

  const paginate = (page: number) => {
    setCurrentPage(page);
  };

  const currentLostPets = filteredLostPets.slice(
    (currentPage - 1) * petsPerPage,
    currentPage * petsPerPage
  );

  const currentFoundPets = filteredFoundPets.slice(
    (currentPage - 1) * petsPerPage,
    currentPage * petsPerPage
  );

  // Combined pets for map display (with proper typing)
  const allFilteredPets: (LostPet | FoundPet)[] = [...filteredLostPets, ...filteredFoundPets];
  const currentMapPets = showLostPets ? filteredLostPets : filteredFoundPets;

  return (
    <div className="w-full">
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

      {/* Pet Type Selection Section */}
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
              className="w-full text-[10px] xl:text-lg md:text-md sm:text-sm mt-1 lg:p-2 sm:p-1 p-1.5 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
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
              className="w-full text-[10px] xl:text-lg md:text-md sm:text-sm mt-1 lg:p-2 sm:p-1 p-1.5 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
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
                className="w-full text-[10px] xl:text-lg md:text-md sm:text-sm mt-1 lg:p-2 sm:p-1 p-1.5 pr-10 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
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

      <div className="ml-16 2xl:text-xl lg:text-lg sm:text-md text-sm">
        <p>ทั้งหมด: {currentFilteredPets.length} ตัว</p>
      </div>

      {selectedDisplay === "info" ? (
  showLostPets ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8 2xl:gap-10 p-6 lg:p-10">
      {currentLostPets.map((pet, index) => (
        <PetCardh key={pet.id} {...pet} />
      ))}
    </div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8 2xl:gap-10 p-6 lg:p-10">
      {currentFoundPets.map((pet, index) => (
        <PetCardj key={pet.id} {...pet} />
      ))}
    </div>
  )
      ) : (
        <div className="w-full flex justify-center mt-8">
  <div className="flex flex-col mb-10 mt-5 2xl:ml-20 xl:mr-20 lg:mr-20 lg:ml-10 md:mr-20 sm:mr-10 mr-auto w-full max-w-6xl"> {/* Increased max-w-5xl to max-w-6xl */}
    <p className="sm:text-xl xl:text-lg mb-4 font-semibold text-gray-700">สถานที่{showLostPets ? "หาย" : "พบ"}</p>
    <input
      type="text"
      value={filterLocation}
      onChange={(e) => setFilterLocation(e.target.value)}
      placeholder="ค้นหาตามสถานที่..."
      className="w-full text-center mt-1 p-3 border-2 border-gray-300 rounded-lg mb-6 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
    />
    <div className="h-[700px] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-200"> {/* Changed h-[500px] to h-[700px] */}
      <MapContainer
        center={[16.4707, 99.5367]} // Center on Kamphaeng Phet, Thailand
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {currentMapPets.map((pet) =>
          pet.lat && pet.lng ? (
            <Marker
              key={pet.id}
              position={[pet.lat, pet.lng]}
              icon={createCustomIcon(
                pet.images && pet.images.length > 0 ? pet.images[0].url : undefined,
                showLostPets
              )}
            >
              <Popup className="rounded-lg shadow-lg bg-white" maxWidth={300}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-800">{pet.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                      showLostPets ? 'bg-red-500' : 'bg-blue-500'
                    }`}>
                      {showLostPets ? 'หาย' : 'พบแล้ว'}
                    </span>
                  </div>
                  {pet.images && pet.images.length > 0 && (
                    <img
                      src={pet.images[0].url}
                      alt={pet.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span>{pet.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span>
                        {showLostPets
                          ? `วันที่หาย: ${new Date((pet as LostPet).lostDate).toLocaleDateString('th-TH')}`
                          : `วันที่พบ: ${new Date((pet as FoundPet).foundDate).toLocaleDateString('th-TH')}`}
                      </span>
                    </div>
                    {showLostPets && (pet as LostPet).reward && (
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-lg text-center text-sm font-semibold mt-3">
                        💰 รางวัล: {(pet as LostPet).reward?.toLocaleString()} บาท
                      </div>
                    )}
                    {!showLostPets && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01- Banda Aceh, Indonesia-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                        </svg>
                        <span>ประเภท: {(pet as FoundPet).species}</span>
                      </div>
                    )}
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
            onClick={() => paginate(Math.max(1, currentPage - 1))}
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
            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
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
        
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
        }
        
        .leaflet-popup-tip {
          background: white !important;
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