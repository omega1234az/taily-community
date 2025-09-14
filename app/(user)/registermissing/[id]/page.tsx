"use client";

import React, { useRef, useState, useEffect, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import L from "leaflet";
// Type definition for pet data
type PetData = {
  name: string;
  age: string;
  gender: string;
  breed: string;
  sterilized: string;
  color: string[];
  markings: string;
  description: string;
  species: string;
  ownerName: string;
  contactNumber: string;
  facebook: string;
  mainImage?: string | null;
  galleryImages?: (string | null)[];
};

// Dynamically import Leaflet components to avoid SSR issues

import "leaflet/dist/leaflet.css";

export default function RegisterMissing() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  // States
  const [pet, setPet] = useState<PetData>({
    name: "",
    age: "",
    gender: "",
    breed: "",
    sterilized: "",
    color: [],
    markings: "",
    description: "",
    species: "",
    ownerName: "",
    contactNumber: "",
    facebook: "",
    mainImage: null,
    galleryImages: [null, null, null],
  });

  const [missingDate, setMissingDate] = useState("");
  const [missingLocation, setMissingLocation] = useState("");
  const [missingDetail, setMissingDetail] = useState("");
  const [reward, setReward] = useState("");
  const [coords, setCoords] = useState({ lat: 13.736717, lng: 100.523186 });

  // Refs
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mainInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  // Colors
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

  // Fetch pet data
  const fetchPetData = async () => {
    if (!params.id) return;
    try {
      const response = await fetch(`/api/pets/${params.id}`);
      const data = await response.json();

      setPet({
        name: data.name || "",
        age: data.age?.toString() || "",
        gender: data.gender || "",
        breed: data.breed || "",
        sterilized: data.isNeutered === 1 ? "ทำหมันแล้ว" : "ยังไม่ได้ทำหมัน",
        color: Array.isArray(data.color)
          ? data.color
          : data.color
          ? data.color.split(",").filter((c: string) => c.trim())
          : [],
        markings: data.markings || "",
        description: data.description || "",
        species: data.species?.name || "",
        ownerName: data.user?.name || "",
        contactNumber: data.user?.phone || "",
        facebook: data.user?.name || "",
        mainImage: data.images?.find((img: any) => img.mainImage)?.url || null,
        galleryImages: data.images
          ?.filter((img: any) => !img.mainImage)
          ?.map((img: any) => img.url)
          .slice(0, 3) || [null, null, null],
      });
    } catch (error) {
      console.error("Error fetching pet data:", error);
    }
  };

  // Handle main image change
  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPet((prev) => ({ ...prev, mainImage: URL.createObjectURL(file) }));
    }
  };

  // Handle gallery image change
  const handleGalleryImageChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const newImages = [...(pet.galleryImages || [])];
      newImages[index] = URL.createObjectURL(file);
      setPet((prev) => ({ ...prev, galleryImages: newImages }));
    }
  };

  // Submit form
  const handleSubmit = async () => {
    if (new Date(missingDate) > new Date()) {
      alert("วันที่หายต้องไม่เป็นวันในอนาคต");
      return;
    }

    const payload = {
      description: missingDetail,
      lat: coords.lat,
      lng: coords.lng,
      lostDate: missingDate ? new Date(missingDate).toISOString() : null,
      reward: reward ? parseInt(reward) : 0,
      petId: parseInt(params.id),
      facebook: pet.facebook,
      missingLocation : missingLocation,
      ownerName: pet.ownerName,
      phone: pet.contactNumber,
    };

    try {
      const response = await fetch("/api/lostpet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("ลงทะเบียนสัตว์เลี้ยงหายสำเร็จ!");
        router.push("/announcement");
      } else {
        const errorData = await response.json();
        alert(`เกิดข้อผิดพลาด: ${errorData.message || "ไม่ทราบสาเหตุ"}`);
      }
    } catch (error) {
      console.error("Error submitting:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ API");
    }
  };

  // Initialize map
  const initializeMap = () => {
    if (!mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    if (mapContainerRef.current) {
      mapContainerRef.current.innerHTML = '';
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        createMap(latitude, longitude, 17);
      },
      () => {
        createMap(13.736717, 100.523186, 13);
      }
    );
  };

  const createMap = async (lat: number, lng: number, zoom: number) => {
    if (!mapContainerRef.current) return;

    try {
      // Ensure Leaflet is loaded
      const L = (await import("leaflet")).default;

      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        dragging: true,
        scrollWheelZoom: true,
      }).setView([lat, lng], zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(mapRef.current);

      setCoords({ lat, lng });

      const circle = L.circle([lat, lng], {
        radius: 200,
        color: "red",
        fillColor: "red",
        fillOpacity: 0.2,
      }).addTo(mapRef.current);

      mapRef.current.on("move", () => {
        const center = mapRef.current?.getCenter();
        if (center) {
          setCoords({ lat: center.lat, lng: center.lng });
          circle.setLatLng(center);
        }
      });
    } catch (error) {
      console.error("Error creating map:", error);
    }
  };

  // useEffect for fetching pet data
  useEffect(() => {
    fetchPetData();
  }, [params.id]);

  // useEffect for map initialization
  useEffect(() => {
    const timeout = setTimeout(() => {
      initializeMap();
    }, 100);

    return () => {
      clearTimeout(timeout);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold">
        <span className="bg-[#EAD64D] py-5 pl-3 sm:py-7 sm:pl-5 xl:py-9 xl:pl-7 rounded-full">
          ลง
        </span>
        ทะเบียนสัตว์เลี้ยงหาย
      </h1>

      <div className="flex flex-col lg:flex-row 2xl:gap-56 xl:gap-44 lg:gap-24 md:gap-5 sm:gap-8 lg:pl-12 md:pl-28 sm:pl-20 pl-7 pt-18">
        <div className="lg:pl-0 md:pl-28 sm:pl-24 pl-20 pb-5">
          <div className="your-container">
            <img
              src={pet.mainImage || "/all/image.png"}
              alt="main"
              onClick={() => mainInputRef.current?.click()}
              className="2xl:w-72 2xl:h-80 xl:w-64 xl:h-72 lg:w-60 lg:h-64 md:w-56 md:h-60 sm:w-48 sm:h-56 w-36 h-48 object-cover rounded-2xl cursor-pointer overflow-hidden"
            />
            <input
              ref={mainInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleMainImageChange}
            />
            <div className="flex gap-2 pt-3">
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <img
                    src={pet.galleryImages?.[i] || "/all/image.png"}
                    alt={`gallery-${i}`}
                    onClick={() => galleryInputRefs[i].current?.click()}
                    className="2xl:w-22 2xl:h-22 xl:w-20 xl:h-20 lg:w-18 lg:h-18 md:w-17 md:h-17 sm:w-14 sm:h-14 w-11 h-11 object-cover cursor-pointer rounded-md"
                  />
                  <input
                    ref={galleryInputRefs[i]}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleGalleryImageChange(e, i)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full 2xl:max-w-xl xl:max-w-lg md:max-w-md sm:max-w-sm max-w-xs mb-2">
          <p className="sm:text-lg xl:text-xl">ชื่อ</p>
          <input
            value={pet.name}
            disabled
            className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
          />

          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">อายุ</p>
              <input
                type="text"
                value={pet.age}
                disabled
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">เพศ</p>
              <input
                value={pet.gender}
                disabled
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">ประเภท</p>
              <input
                value={pet.species}
                disabled
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">สายพันธุ์</p>
              <input
                value={pet.breed}
                disabled
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 mb-2">
            <div className="flex flex-col mb-4">
              <p className="sm:text-lg xl:text-xl">ทำหมัน</p>
              <input
                value={pet.sterilized}
                disabled
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
              />
            </div>

            <div className="flex flex-wrap gap-3 mb-2">
              {colors.map((color, idx) => {
                const isSelected = pet.color.includes(color.name);
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
              value={pet.markings}
              disabled
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">รายละเอียด</p>
            <input
              value={pet.description}
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
                onChange={(e) => setMissingDate(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3"
              />
            </div>
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">สถานที่หาย</p>
              <input
                value={missingLocation}
                onChange={(e) => setMissingLocation(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3"
              />
            </div>
          </div>

          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">รายละเอียดการหาย</p>
            <input
              value={missingDetail}
              onChange={(e) => setMissingDetail(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3"
            />
          </div>

          <div className="flex flex-col mb-20">
            <p className="sm:text-lg xl:text-xl">เงินรางวัล</p>
            <input
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col mb-10 2xl:mr-40 xl:mr-32 lg:mr-28 lg:ml-10 md:mr-20 sm:mr-18 mr-10">
        <div className="relative">
          <div
            ref={mapContainerRef}
            id="map"
            className="w-full h-[500px] relative"
            style={{ zIndex: 1 }}
          ></div>
          <img
            id="pin"
            src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
            width="40"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full z-[999] pointer-events-none"
          />
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
            value={pet.ownerName}
            onChange={(e) => setPet({ ...pet, ownerName: e.target.value })}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3"
          />

          <div className="flex flex-col my-3">
            <p className="sm:text-lg xl:text-xl">เบอร์ติดต่อ</p>
            <input
              value={pet.contactNumber}
              onChange={(e) => setPet({ ...pet, contactNumber: e.target.value })}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3"
            />
          </div>

          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">Facebook</p>
            <input
              value={pet.facebook}
              onChange={(e) => setPet({ ...pet, facebook: e.target.value })}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3"
            />
          </div>
        </div>

        <div className="flex justify-end ml-20 mt-5 lg:mb-8 mb-5">
          <button
            onClick={handleSubmit}
            className="bg-[#7CBBEB] text-white hover:bg-sky-600 shadow-md rounded-xl px-6 py-1 sm:text-lg xl:text-xl cursor-pointer"
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
}