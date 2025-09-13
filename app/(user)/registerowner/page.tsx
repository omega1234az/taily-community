"use client";

import React, { useRef, useState, useEffect, ChangeEvent } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useParams, useRouter } from "next/navigation";

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

export default function RegisterMissing() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  // ✅ States
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

  // ✅ Refs
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mainInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  // ✅ สี
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

  // ✅ ดึงข้อมูลสัตว์จาก API
  const fetchPetData = async () => {
    if (!params.id) return;
    try {
      const response = await fetch(`http://localhost:3000/api/pets/${params.id}`);
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

  // ✅ จัดการเปลี่ยนรูปหลัก
  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPet((prev) => ({ ...prev, mainImage: URL.createObjectURL(file) }));
    }
  };

  // ✅ จัดการเปลี่ยนรูปแกลเลอรี่
  const handleGalleryImageChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const newImages = [...(pet.galleryImages || [])];
      newImages[index] = URL.createObjectURL(file);
      setPet((prev) => ({ ...prev, galleryImages: newImages }));
    }
  };

  // ✅ ส่งข้อมูล
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
      ownerName: pet.ownerName,
      phone: pet.contactNumber,
    };

    try {
      const response = await fetch("http://localhost:3000/api/lostpet", {
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

  // ✅ สร้างแผนที่
  const initializeMap = () => {
    if (!mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
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

  const createMap = (lat: number, lng: number, zoom: number) => {
    mapRef.current = L.map(mapContainerRef.current!, {
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
  };

  // ✅ useEffect
  useEffect(() => {
    fetchPetData();
  }, [params.id]);

  useEffect(() => {
    initializeMap();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // ✅ UI
  return (
    <div className="p-5">
      <h1 className="text-xl font-semibold mb-5">
        <span className="bg-[#EAD64D] py-2 px-4 rounded-full">ลง</span> ทะเบียนสัตว์เลี้ยงหาย
      </h1>

      {/* ภาพสัตว์ */}
      <div className="flex gap-5 mb-10">
        <div>
          <img
            src={pet.mainImage || "/all/image.png"}
            alt="main"
            onClick={() => mainInputRef.current?.click()}
            className="w-48 h-56 object-cover rounded-2xl cursor-pointer"
          />
          <input
            ref={mainInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleMainImageChange}
          />
          <div className="flex gap-2 mt-3">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <img
                  src={pet.galleryImages?.[i] || "/all/image.png"}
                  alt={`gallery-${i}`}
                  onClick={() => galleryInputRefs[i].current?.click()}
                  className="w-16 h-16 object-cover rounded-md cursor-pointer"
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

        <div className="flex flex-col gap-3 w-full max-w-lg">
          <input value={pet.name} disabled className="input-disabled" />
          <input value={pet.age} disabled className="input-disabled" />
          <input value={pet.gender} disabled className="input-disabled" />
          <input value={pet.species} disabled className="input-disabled" />
          <input value={pet.breed} disabled className="input-disabled" />
          <input value={pet.sterilized} disabled className="input-disabled" />
          <input value={pet.markings} disabled className="input-disabled" />
          <input value={pet.description} disabled className="input-disabled" />
        </div>
      </div>

      {/* ฟอร์มการหาย */}
      <div className="grid grid-cols-2 gap-5 mb-10">
        <div>
          <p>วันที่หาย</p>
          <input
            type="date"
            value={missingDate}
            onChange={(e) => setMissingDate(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <p>สถานที่หาย</p>
          <input
            value={missingLocation}
            onChange={(e) => setMissingLocation(e.target.value)}
            className="input"
          />
        </div>
      </div>

      <div className="mb-10">
        <p>รายละเอียดการหาย</p>
        <input
          value={missingDetail}
          onChange={(e) => setMissingDetail(e.target.value)}
          className="input"
        />
      </div>

      <div className="mb-10">
        <p>เงินรางวัล</p>
        <input
          value={reward}
          onChange={(e) => setReward(e.target.value)}
          className="input"
        />
      </div>

      {/* แผนที่ */}
      <div className="mb-10">
        <div ref={mapContainerRef} className="w-full h-[400px] rounded-lg shadow-md"></div>
        <p className="mt-3 text-sm">
          Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}
        </p>
      </div>

      {/* การติดต่อ */}
      <div className="mb-10">
        <p>ชื่อเจ้าของ</p>
        <input
          value={pet.ownerName}
          onChange={(e) => setPet({ ...pet, ownerName: e.target.value })}
          className="input"
        />

        <p className="mt-3">เบอร์ติดต่อ</p>
        <input
          value={pet.contactNumber}
          onChange={(e) => setPet({ ...pet, contactNumber: e.target.value })}
          className="input"
        />

        <p className="mt-3">Facebook</p>
        <input
          value={pet.facebook}
          onChange={(e) => setPet({ ...pet, facebook: e.target.value })}
          className="input"
        />
      </div>

      {/* ปุ่ม */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-[#7CBBEB] text-white hover:bg-sky-600 px-6 py-2 rounded-xl shadow-md"
        >
          ตกลง
        </button>
      </div>
    </div>
  );
}
