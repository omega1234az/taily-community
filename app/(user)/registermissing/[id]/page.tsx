
"use client";

import React, { useRef, useState, useEffect, ChangeEvent } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useParams , useRouter} from 'next/navigation';

type PetData = {
  name: string;
  age: string;
  gender: string;
  breed: string;
  sterilized: string;
  color: string | string[];
  markings: string;
  description: string;
  missingDate: string;
  missingLocation: string;
  missingDetail: string;
  reward?: string;
  ownerName: string;
  contactNumber: string;
  facebook: string;
};

export default function RegisterMissing() {
  const params = useParams<{ id: string }>();
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

  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mainInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];
  const router = useRouter();
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

  // Fetch pet data from API
  useEffect(() => {
    const fetchPetData = async () => {
      if (params.id) {
        try {
          const response = await fetch(`http://localhost:3000/api/pets/${params.id}`);
          const data = await response.json();
          console.log("API Response:", data); // Debug API response

          // Update state with API data
          setName(data.name || "");
          setAge(data.age ? data.age.toString() : "");
          setGender(data.gender || "");
          setBreed(data.breed || "");
          setSterilized(data.isNeutered === 1 ? "ทำหมันแล้ว" : "ยังไม่ได้ทำหมัน");
          setMarkings(data.markings || "");
          setDescription(data.description || "");
          setOwnerName(data.user?.name || "");
          setContactNumber(data.user?.phone || "");
          setFacebook(data.user?.name || "");
          setSelectedType(data.species?.name || "");

          // Handle color (array or string)
          if (data.color) {
            if (Array.isArray(data.color)) {
              setSelectedColors(data.color.filter((c: string) => c.trim()));
              setColor(data.color.join(","));
            } else {
              setSelectedColors(data.color.split(",").filter((c: string) => c.trim()));
              setColor(data.color);
            }
          } else {
            setSelectedColors([]);
            setColor("");
          }

          // Set images
          const mainImg = data.images?.find((img: any) => img.mainImage === true)?.url || null;
          const galleryImgs = data.images
            ?.filter((img: any) => img.mainImage === false)
            ?.map((img: any) => img.url)
            .slice(0, 3);
          setMainImage(mainImg);
          setGalleryImages([
            galleryImgs?.[0] || null,
            galleryImgs?.[1] || null,
            galleryImgs?.[2] || null,
          ]);

          // Initialize missing fields
          setMissingDate("");
          setMissingLocation("");
          setMissingDetail("");
          setReward("");
        } catch (error) {
          console.error("Error fetching pet data:", error);
        }
      }
    };

    fetchPetData();
  }, [params.id]);

  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setMainImage(URL.createObjectURL(file));
  };

  const handleGalleryImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const newImages = [...galleryImages];
      newImages[index] = URL.createObjectURL(file);
      setGalleryImages(newImages);
    }
  };

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
      facebook: facebook,
      ownerName: ownerName,
      phone: contactNumber,
    };

    try {
      const response = await fetch('http://localhost:3000/api/lostpet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        alert("ลงทะเบียนสัตว์เลี้ยงหายสำเร็จ!");
        router.push(`/announcement`);
      } else {
        const errorData = await response.json();
        alert(`เกิดข้อผิดพลาดในการส่งข้อมูล: ${errorData.message || 'ไม่ทราบสาเหตุ'}`);
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ API");
    }
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(
        [13.736717, 100.523186],
        13
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(mapRef.current);

      const updateCenterCoords = () => {
        const center = mapRef.current?.getCenter();
        if (center) {
          setCoords({
            lat: center.lat,
            lng: center.lng,
          });
        }
      };

      mapRef.current.on("move", updateCenterCoords);
      updateCenterCoords();

      return () => {
        mapRef.current?.remove();
        mapRef.current = null;
      };
    }
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
              src={mainImage || "/all/image.png"}
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
              {[0, 1, 2].map((index) => (
                <div key={index}>
                  <img
                    src={galleryImages[index] || "/all/image.png"}
                    alt={`gallery-${index}`}
                    onClick={() => galleryInputRefs[index]?.current?.click()}
                    className="2xl:w-22 2xl:h-22 xl:w-20 xl:h-20 lg:w-18 lg:h-18 md:w-17 md:h-17 sm:w-14 sm:h-14 w-11 h-11 object-cover cursor-pointer rounded-md"
                  />
                  <input
                    ref={galleryInputRefs[index]}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleGalleryImageChange(e, index)}
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
            <p className="sm:text-lg xl:text-xl">รายละเอียด</p>
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
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3"
          />

          <div className="flex flex-col my-3">
            <p className="sm:text-lg xl:text-xl">เบอร์ติดต่อ</p>
            <input
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3"
            />
          </div>

          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">Facebook</p>
            <input
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
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
