"use client";

import React, { useRef, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import Leaflet to prevent SSR issues
const DynamicMap = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] bg-gray-200 animate-pulse rounded-md flex items-center justify-center">Loading map...</div>
});

type LostPetData = {
  id: number;
  description: string;
  location: string;
  lat: number;
  lng: number;
  lostDate: string;
  reward?: number | null;
  facebook?: string;
  ownerName: string;
  phone: string;
  status: string;
  pet: {
    id: number;
    name: string;
    age: number;
    gender: string;
    breed: string;
    isNeutered: number;
    color: string[];
    markings: string;
    description: string;
    speciesId: number;
    images: { url: string; mainImage: boolean }[];
  };
  user: {
    id: string;
    name: string;
    image?: string;
  };
  images: { url: string }[];
  clues: {
    id: number;
    content: string;
    location?: string;
    lat?: number;
    lng?: number;
    witnessName?: string;
    contactDetails?: string;
    userId?: string;
    user?: { id: string; name: string; image?: string } | null;
    images: { url: string }[];
    createdAt: string;
  }[];
};

export default function ViewLostPet() {
  const params = useParams<{ id: string }>();

  // State for form fields
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [breed, setBreed] = useState<string>("");
  const [sterilized, setSterilized] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [markings, setMarkings] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [missingDate, setMissingDate] = useState<string>("");
  const [missingLocation, setMissingLocation] = useState<string>("");
  const [missingDetail, setMissingDetail] = useState<string>("");
  const [reward, setReward] = useState<string>("");
  const [ownerName, setOwnerName] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [facebook, setFacebook] = useState<string>("");
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 13.736717,
    lng: 100.523186,
  });
  const [selectedType, setSelectedType] = useState<string>("");
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<(string | null)[]>([null, null, null]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("");
  const [clues, setClues] = useState<
    {
      id: number;
      content: string;
      location?: string;
      lat?: number;
      lng?: number;
      witnessName?: string;
      contactDetails?: string;
      userId?: string;
      user?: { id: string; name: string; image?: string } | null;
      images: { url: string }[];
      createdAt: string;
    }[]
  >([]);

  const colors = [
    { name: "ขาว", code: "bg-white" },
    { name: "เหลือง", code: "bg-yellow-300" },
    { name: "เทา", code: "bg-gray-500" },
    { name: "น้ำตาล", code: "bg-[#866261]" },
    { name: "ชมพู", code: "bg-[#e68181]" },
    { name: "น้ำเงิน", code: "bg-blue-800" },
    { name: "แดง", code: "bg-red-600" },
    { name: "เขียว", code: "bg-green-600" },
    { name: "ฟ้า", code: "bg-sky-400" },
    { name: "ส้ม", code: "bg-orange-500" },
    { name: "ไม่มีขน", code: "bg-pink-200" },
    { name: "ม่วง", code: "bg-fuchsia-500" },
    { name: "ดำ", code: "bg-black" },
  ];

  // Map LostPetStatus enum to Thai labels
  const statusLabels: { [key: string]: string } = {
    lost: "หาย",
    found: "พบแล้ว",
    pending: "รอการยืนยัน",
    closed: "ปิดประกาศ",
    reunited: "รวมตัวแล้ว",
    reported: "ถูกรายงาน",
    fake: "ปลอม",
  };

  // Fetch LostPet data
  const fetchLostPetData = async () => {
    if (params.id) {
      try {
        const response = await fetch(`/api/lostpet/${params.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: LostPetData = await response.json();

        // Populate pet-related fields
        setName(data.pet.name || "");
        setAge(data.pet.age ? data.pet.age.toString() : "");
        setGender(data.pet.gender || "");
        setBreed(data.pet.breed || "");
        setSterilized(data.pet.isNeutered ? "ทำหมันแล้ว" : "ยังไม่ได้ทำหมัน");
        setMarkings(data.pet.markings || "");
        setDescription(data.pet.description || "");
        setSelectedType(data.pet.speciesId === 1 ? "แมว" : data.pet.speciesId === 2 ? "สุนัข" : "ไม่ระบุ");

        // Handle color
        setSelectedColors(data.pet.color || []);
        setColor(data.pet.color?.join(", ") || "");

        // Populate LostPet-specific fields
        setMissingDetail(data.description || "");
        setMissingDate(data.lostDate ? new Date(data.lostDate).toISOString().split("T")[0] : "");
        setMissingLocation(data.location || "");
        setReward(data.reward ? data.reward.toString() : "");
        setOwnerName(data.ownerName || data.user.name || "");
        setContactNumber(data.phone || "");
        setFacebook(data.facebook || "");
        setCoords({ lat: data.lat || 13.736717, lng: data.lng || 100.523186 });
        setStatus(data.status || "lost");
        setClues(data.clues || []);

        // Set images
        const mainImg = data.pet.images?.find((img) => img.mainImage)?.url || null;
        const galleryImgs = data.pet.images?.filter((img) => !img.mainImage).map((img) => img.url).slice(0, 3) || [];
        setMainImage(mainImg);
        setGalleryImages([
          galleryImgs[0] || null,
          galleryImgs[1] || null,
          galleryImgs[2] || null,
        ]);
      } catch (error) {
        console.error("Error fetching LostPet data:", error);
        alert("เกิดข้อผิดพลาดในการดึงข้อมูล");
      }
    }
  };

  useEffect(() => {
    fetchLostPetData();
  }, [params.id]);

  return (
    <div>
      <h1 className="text-xl font-semibold">
        <span className="bg-[#EAD64D] py-5 pl-3 sm:py-7 sm:pl-5 xl:py-9 xl:pl-7 rounded-full">
          ดู
        </span>
        ข้อมูลสัตว์เลี้ยงหาย
      </h1>

      <div className="flex flex-col lg:flex-row 2xl:gap-56 xl:gap-44 lg:gap-24 md:gap-5 sm:gap-8 lg:pl-12 md:pl-28 sm:pl-20 pl-7 pt-18">
        <div className="lg:pl-0 md:pl-28 sm:pl-24 pl-20 pb-5">
          <div className="your-container">
            <img
              src={mainImage || "/all/image.png"}
              alt="main"
              className="2xl:w-72 2xl:h-80 xl:w-64 xl:h-72 lg:w-60 lg:h-64 md:w-56 md:h-60 sm:w-48 sm:h-56 w-36 h-48 object-cover rounded-2xl"
            />

            <div className="flex gap-2 pt-3">
              {[0, 1, 2].map((index) => (
                <div key={index}>
                  <img
                    src={galleryImages[index] || "/all/image.png"}
                    alt={`gallery-${index}`}
                    className="2xl:w-22 2xl:h-22 xl:w-20 xl:h-20 lg:w-18 lg:h-18 md:w-17 md:h-17 sm:w-14 sm:h-14 w-11 h-11 object-cover rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full 2xl:max-w-xl xl:max-w-lg md:max-w-md sm:max-w-sm max-w-xs mb-2">
          <p className="sm:text-lg xl:text-xl">ชื่อ</p>
          <input
            value={name}
            disabled
            className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
          />

          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">อายุ</p>
              <input
                type="text"
                value={age}
                disabled
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">เพศ</p>
              <input
                value={gender}
                disabled
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">ประเภท</p>
              <input
                value={selectedType}
                disabled
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">สายพันธุ์</p>
              <input
                value={breed}
                disabled
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 mb-2">
            <div className="flex flex-col mb-4">
              <p className="sm:text-lg xl:text-xl">ทำหมัน</p>
              <input
                value={sterilized}
                disabled
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
              />
            </div>

            <div className="flex flex-wrap gap-3 mb-2">
              {colors.map((color, idx) => {
                const isSelected = selectedColors.includes(color.name);
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                      isSelected ? "bg-gray-400" : "bg-gray-300"
                    } cursor-not-allowed`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full ${color.code} border border-gray-300`}
                    ></div>
                    <span className="text-sm">{color.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">รอยตำหนิ</p>
            <input
              value={markings}
              disabled
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">รายละเอียด (สัตว์เลี้ยง)</p>
            <input
              value={description}
              disabled
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">วันที่หาย</p>
              <input
                type="date"
                value={missingDate}
                disabled
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">สถานที่หาย</p>
              <input
                value={missingLocation}
                disabled
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">รายละเอียดการหาย</p>
            <input
              value={missingDetail}
              disabled
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">เงินรางวัล</p>
            <input
              value={reward}
              disabled
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col mb-20">
            <p className="sm:text-lg xl:text-xl">สถานะ</p>
            <input
              value={statusLabels[status] || status}
              disabled
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col mb-10 2xl:mr-40 xl:mr-32 lg:mr-28 lg:ml-10 md:mr-20 sm:mr-18 mr-10">
        <div className="relative">
          <DynamicMap coords={coords} />
          <div className="mt-3 text-sm">
            Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}
          </div>
        </div>

        <div className="mt-10 mb-5">
          <p className="sm:text-lg xl:text-xl">การติดต่อ</p>
        </div>

        <div className="flex flex-col w-full xl:max-w-xl md:max-w-md sm:max-w-sm max-w-xs mb-2">
          <p className="sm:text-lg xl:text-xl">ชื่อเจ้าของ</p>
          <input
            value={ownerName}
            disabled
            className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
          />

          <div className="flex flex-col my-3">
            <p className="sm:text-lg xl:text-xl">เบอร์ติดต่อ</p>
            <input
              value={contactNumber}
              disabled
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">Facebook</p>
            <input
              value={facebook}
              disabled
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="mt-10 mb-5">
          <p className="sm:text-lg xl:text-xl">เบาะแส</p>
        </div>

        <div className="flex flex-col w-full xl:max-w-xl md:max-w-md sm:max-w-sm max-w-xs mb-10">
          {clues.length > 0 ? (
            clues.map((clue) => (
              <div key={clue.id} className="mb-6 p-4 border border-gray-300 rounded-md bg-gray-50">
                <p className="sm:text-lg xl:text-xl font-semibold">
                  ชื่อผู้พบเห็น: {clue.witnessName || clue.user?.name || "ไม่ระบุ"}
                </p>
                <p className="mt-2">
                  <span className="font-medium">รายละเอียดการติดต่อ:</span>{" "}
                  {clue.contactDetails || "ไม่ระบุ"}
                </p>
                <p className="mt-2">
                  <span className="font-medium">รายละเอียดการพบเห็น:</span> {clue.content}
                </p>
                {clue.location && (
                  <p className="mt-1">
                    <span className="font-medium">สถานที่:</span> {clue.location}
                  </p>
                )}
                {(clue.lat != null && clue.lng != null && typeof clue.lat === 'number' && typeof clue.lng === 'number') && (
                  <p className="mt-1">
                    <span className="font-medium">พิกัด:</span> Lat: {clue.lat.toFixed(6)}, Lng: {clue.lng.toFixed(6)}
                  </p>
                )}
                <p className="mt-1">
                  <span className="font-medium">วันที่รายงาน:</span>{" "}
                  {new Date(clue.createdAt).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {clue.images.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">รูปภาพ:</p>
                    <div className="flex gap-2 mt-1">
                      {clue.images.map((image, index) => (
                        <img
                          key={index}
                          src={image.url}
                          alt={`clue-image-${index}`}
                          className="w-20 h-20 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">ยังไม่มีเบาะแสสำหรับสัตว์เลี้ยงนี้</p>
          )}
        </div>
      </div>
    </div>
  );
}