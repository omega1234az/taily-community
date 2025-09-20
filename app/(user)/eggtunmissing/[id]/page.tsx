"use client";

import React, { useRef, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "react-qr-code";

// Dynamically import Leaflet to prevent SSR issues
const DynamicMap = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-200 animate-pulse rounded-md flex items-center justify-center">
      Loading map...
    </div>
  ),
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
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state

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
  const [galleryImages, setGalleryImages] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);
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
        setIsLoading(true); // Set loading to true before fetching
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
        setSelectedType(
          data.pet.speciesId === 1
            ? "แมว"
            : data.pet.speciesId === 2
            ? "สุนัข"
            : "ไม่ระบุ"
        );

        // Handle color
        setSelectedColors(data.pet.color || []);
        setColor(data.pet.color?.join(", ") || "");

        // Populate LostPet-specific fields
        setMissingDetail(data.description || "");
        setMissingDate(
          data.lostDate
            ? new Date(data.lostDate).toISOString().split("T")[0]
            : ""
        );
        setMissingLocation(data.location || "");
        setReward(data.reward ? data.reward.toString() : "");
        setOwnerName(data.ownerName || data.user.name || "");
        setContactNumber(data.phone || "");
        setFacebook(data.facebook || "");
        setCoords({ lat: data.lat || 13.736717, lng: data.lng || 100.523186 });
        setStatus(data.status || "lost");
        setClues(data.clues || []);

        // Set images
        const mainImg =
          data.pet.images?.find((img) => img.mainImage)?.url || null;
        const galleryImgs =
          data.pet.images
            ?.filter((img) => !img.mainImage)
            .map((img) => img.url)
            .slice(0, 3) || [];
        setMainImage(mainImg);
        setGalleryImages([
          galleryImgs[0] || null,
          galleryImgs[1] || null,
          galleryImgs[2] || null,
        ]);
      } catch (error) {
        console.error("Error fetching LostPet data:", error);
        alert("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setIsLoading(false); // Set loading to false after fetching
      }
    }
  };

  useEffect(() => {
    fetchLostPetData();
  }, [params.id]);

  const pdfRef = useRef<HTMLDivElement>(null);

  const handlePrint = async () => {
    if (!pdfRef.current) return;

    const canvas = await html2canvas(pdfRef.current, {
      scale: 2,
      allowTaint: true,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    // ใช้ชื่อสัตว์เลี้ยงเป็นชื่อไฟล์ ถ้าไม่มีให้ fallback เป็น "pet"
    const fileName = `ประกาศ-${name || "pet"}.pdf`;
    pdf.save(fileName);
  };

  // Loading state UI
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-[#EAD64D] rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div>
      <title>สัตว์เลี้ยงหาย</title>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          <span className="bg-[#EAD64D] py-5 pl-3 sm:py-7 sm:pl-5 xl:py-9 xl:pl-7 rounded-full">
            ดู
          </span>
          ข้อมูลสัตว์เลี้ยงหาย
        </h1>
        <div className="flex justify-center mt-6 mr-40">
          {" "}
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-lg cursor-pointer"
          >
            {" "}
            พิมพ์{" "}
          </button>{" "}
        </div>

        <div
          ref={pdfRef}
          style={{
            position: "absolute",
            top: 0,
            left: -9999, // ซ่อนออกนอกหน้าจอ
            width: "200mm",
            height: "285mm",
            backgroundImage: "url('/all/missing.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            padding: "40px",
            boxSizing: "border-box",
          }}
        >
          <h1
            style={{
              top: 10,
              color: "#dc2626",
              textAlign: "center",
              fontSize: "32px",
              fontWeight: "bold",
              marginTop: "60px",
              marginBottom: "40px",
            }}
          >
            ประกาศตามหาสัตว์เลี้ยง!
          </h1>

          {/* รูปสัตว์ */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "16px",
              margin: "24px 0",
            }}
          >
            {/* รูปซ้าย */}
            {mainImage && (
              <img
                src={galleryImages[0] || "/all/image.png"}
                alt="left"
                style={{
                  width: "180px",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
            )}

            {/* รูปกลางใหญ่ */}
            <img
              src={mainImage || "/all/image.png"}
              alt="main"
              style={{
                width: "230px",
                height: "230px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />

            {/* รูปขวา */}
            {galleryImages[1] && (
              <img
                src={galleryImages[1]}
                alt="right"
                style={{
                  width: "180px",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
            )}
          </div>

          {/* รายละเอียด */}
          {/* รายละเอียด */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: "80px",
              fontSize: "20px",
              lineHeight: 1.5,
              marginTop: "30px",
            }}
          >
            {/* คอลัมน์ซ้าย */}
            <div style={{ textAlign: "left" }}>
              <p style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                <strong>ชื่อ:</strong> {name || "-"}
              </p>
              <p style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                <strong>เพศ:</strong> {gender || "-"}
              </p>
              <p style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                <strong>สายพันธุ์:</strong> {breed || "-"}
              </p>
              <p style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                <strong>สี:</strong> {selectedColors.join(", ") || "-"}
              </p>
            </div>

            {/* คอลัมน์ขวา */}
            <div style={{ textAlign: "left" }}>
              <p style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                <strong>รอยตำหนิ:</strong> {markings || "-"}
              </p>
              <p style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                <strong>รายละเอียด:</strong> {description || "-"}
              </p>
              <p style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                <strong>วันที่หาย:</strong> {missingDate || "-"}
              </p>
              <p style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                <strong>สถานที่หาย:</strong> {missingLocation || "-"}
              </p>
            </div>
          </div>

          {/* เงินรางวัล */}
          {reward && (
            <div
              style={{
                textAlign: "center",
                margin: "20px 0",
                fontSize: "28px",
                fontWeight: "bold",
                color: "#EAB308", // สีทองเด่น ๆ
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)", // ทำให้เด่นขึ้น
              }}
            >
              💰 เงินรางวัล: {reward} บาท 💰
            </div>
          )}

          {/* ช่องทางติดต่อ + รูป + QR + ปุ่มปริ้น บรรทัดเดียว */}
          <div
            style={{
              marginTop: "24px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "40px", // ระยะห่างระหว่างแต่ละส่วน
            }}
          >
            {/* รายละเอียดการติดต่อ */}
            <div
              style={{ textAlign: "left", fontSize: "20px", lineHeight: 1.6 }}
            >
              <p
                style={{
                  marginTop: "10px",
                  fontWeight: "bold",
                  color: "#dc2626",
                  fontSize: "24px",
                  marginBottom: "8px",
                }}
              >
                หากพบเห็นกรุณาติดต่อ
              </p>
              <p>
                {" "}
                <strong>ชื่อ:</strong> {ownerName || "ไม่ระบุ"}
              </p>
              <p>
                <strong>เบอร์โทร:</strong> {contactNumber || "ไม่ระบุ"}
              </p>
              <p>
                <strong>facebook:</strong> {facebook || "ไม่ระบุ"}
              </p>
            </div>

            {/* รูปสัตว์ / โลโก้ */}
            <img
              src="/all/logo1.png"
              alt="สัตว์เลี้ยง"
              style={{
                width: "80px",
                height: "80px",
                objectFit: "cover",
                borderRadius: "8px",
                marginTop: "70px",
              }}
            />

            {/* QR Code */}
            <QRCode
              value={typeof window !== "undefined" ? window.location.href : ""}
              style={{
                paddingTop: "30px",
                width: "90px",
                height: "250",
              }}
            />
          </div>
        </div>
      </div>

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
              <div
                key={clue.id}
                className="mb-6 p-4 border border-gray-300 rounded-md bg-gray-50"
              >
                <p className="sm:text-lg xl:text-xl font-semibold">
                  ชื่อผู้พบเห็น:{" "}
                  {clue.witnessName || clue.user?.name || "ไม่ระบุ"}
                </p>
                <p className="mt-2">
                  <span className="font-medium">รายละเอียดการติดต่อ:</span>{" "}
                  {clue.contactDetails || "ไม่ระบุ"}
                </p>
                <p className="mt-2">
                  <span className="font-medium">รายละเอียดการพบเห็น:</span>{" "}
                  {clue.content}
                </p>
                {clue.location && (
                  <p className="mt-1">
                    <span className="font-medium">สถานที่:</span>{" "}
                    {clue.location}
                  </p>
                )}
                {clue.lat != null &&
                  clue.lng != null &&
                  typeof clue.lat === "number" &&
                  typeof clue.lng === "number" && (
                    <p className="mt-1">
                      <span className="font-medium">พิกัด:</span> Lat:{" "}
                      {clue.lat.toFixed(6)}, Lng: {clue.lng.toFixed(6)}
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
