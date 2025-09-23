"use client";

import React, { useRef, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "react-qr-code";
import { Eye, X, Calendar, MapPin, Phone, User, Image as ImageIcon } from "lucide-react";
import Swal from "sweetalert2";

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
  missingLocation?: string;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Image modal states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  
  // State for form fields
  const [name, setName] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [breed, setBreed] = useState<string>("");
  const [sterilized, setSterilized] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [markings, setMarkings] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [missingDate, setMissingDate] = useState<string>("");
  const [missingLocation, setMissingLocation] = useState<string>("ไม่ระบุ");
  const [location, setLocation] = useState<string>("ไม่ระบุ");
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

  const statusLabels: { [key: string]: string } = {
    lost: "หาย",
    found: "พบแล้ว",
    pending: "รอการยืนยัน",
    closed: "ปิดประกาศ",
    reunited: "รวมตัวแล้ว",
    reported: "ถูกรายงาน",
    fake: "ปลอม",
  };

  // Image modal functions
  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setIsImageModalOpen(false);
  };

  // Fetch LostPet data
  const fetchLostPetData = async () => {
    if (params.id) {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/lostpet/${params.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: LostPetData = await response.json();

        // Populate pet-related fields
        setName(data.pet.name || "");
        const totalMonths = data.pet.age || 0;
        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;
        setYear(years.toString());
        setMonth(months.toString());
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
        setMissingLocation(data.missingLocation || "ไม่ระบุ");
        setLocation(data.location || "ไม่ระบุ");
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
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด",
          text: "เกิดข้อผิดพลาดในการดึงข้อมูลสัตว์เลี้ยง",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchLostPetData();
  }, [params.id]);

  const pdfRef = useRef<HTMLDivElement>(null);

  const handlePrint = async () => {
    if (!pdfRef.current) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "ไม่สามารถสร้างเอกสาร PDF ได้",
      });
      return;
    }

    try {
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

      const fileName = `ประกาศ-${name || "pet"}.pdf`;
      pdf.save(fileName);

      Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "บันทึกเอกสาร PDF เรียบร้อยแล้ว",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "เกิดข้อผิดพลาดในการสร้างเอกสาร PDF",
      });
    }
  };

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
      
      {/* Image Modal */}
      {isImageModalOpen && selectedImage && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-gray-100 z-10"
            >
              <X size={24} />
            </button>
            <img
              src={selectedImage}
              alt="Enlarged view"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          <span className="bg-[#EAD64D] py-5 pl-3 sm:py-7 sm:pl-5 xl:py-9 xl:pl-7 rounded-full">
            ดู
          </span>
          ข้อมูลสัตว์เลี้ยงหาย
        </h1>
        <div className="flex justify-center mt-6 mr-40">
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-lg cursor-pointer"
          >
            พิมพ์
          </button>
        </div>

        <div
          ref={pdfRef}
          style={{
            position: "absolute",
            top: 0,
            left: -9999,
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

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "16px",
              margin: "24px 0",
            }}
          >
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
                <strong>สถานที่หาย:</strong> {missingLocation || "ไม่ระบุ"} {location}
              </p>
            </div>
          </div>

          {reward && (
            <div
              style={{
                textAlign: "center",
                margin: "20px 0",
                fontSize: "28px",
                fontWeight: "bold",
                color: "#EAB308",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              💰 เงินรางวัล: {Number(reward).toLocaleString()} บาท 💰
            </div>
          )}

          <div
            style={{
              marginTop: "24px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "40px",
            }}
          >
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
                <strong>ชื่อ:</strong> {ownerName || "ไม่ระบุ"}
              </p>
              <p>
                <strong>เบอร์โทร:</strong> {contactNumber || "ไม่ระบุ"}
              </p>
              <p>
                <strong>facebook:</strong> {facebook || "ไม่ระบุ"}
              </p>
            </div>
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
            placeholder="ชื่อสัตว์เลี้ยง"
          />

          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">อายุ (ปี)</p>
              <input
                type="text"
                value={year}
                disabled
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
                placeholder="กรอกอายุ (ปี)"
              />
            </div>
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">อายุ (เดือน)</p>
              <input
                type="text"
                value={month}
                disabled
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
                placeholder="กรอกอายุ (เดือน)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">เพศ</p>
              <input
                value={gender}
                disabled
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
                placeholder="เพศ"
              />
            </div>
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">ประเภท</p>
              <input
                value={selectedType}
                disabled
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
                placeholder="ประเภทสัตว์"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">สายพันธุ์</p>
              <input
                value={breed}
                disabled
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
                placeholder="สายพันธุ์"
              />
            </div>
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">ทำหมัน</p>
              <input
                value={sterilized}
                disabled
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
                placeholder="สถานะการทำหมัน"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 mb-2">
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
              placeholder="ลักษณะเด่นหรือรอยตำหนิ"
            />
          </div>

          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">รายละเอียด (สัตว์เลี้ยง)</p>
            <input
              value={description}
              disabled
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
              placeholder="รายละเอียดสัตว์เลี้ยง"
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
                placeholder="วันที่หาย"
              />
            </div>
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">สถานที่หาย</p>
              <input
                value={missingLocation}
                disabled
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
                placeholder="สถานที่หาย"
              />
            </div>
          </div>

          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">รายละเอียดการหาย</p>
            <input
              value={missingDetail}
              disabled
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
              placeholder="รายละเอียดการหาย"
            />
          </div>

          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">เงินรางวัล</p>
            <input
              value={reward.toLocaleString()}
              disabled
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
              placeholder="จำนวนเงินรางวัล (ถ้ามี)"
            />
          </div>

          <div className="flex flex-col mb-20">
            <p className="sm:text-lg xl:text-xl">สถานะ</p>
            <input
              value={statusLabels[status] || status}
              disabled
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
              placeholder="สถานะปัจจุบัน"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col mb-10 2xl:mr-40 xl:mr-32 lg:mr-28 lg:ml-10 md:mr-20 sm:mr-18 mr-10">
        <div className="relative">
          <p className="sm:text-lg xl:text-xl mb-2">สถานที่หาย : {location}</p>
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
            placeholder="ชื่อเจ้าของ"
          />

          <div className="flex flex-col my-3">
            <p className="sm:text-lg xl:text-xl">เบอร์ติดต่อ</p>
            <input
              value={contactNumber}
              disabled
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
              placeholder="เบอร์โทรศัพท์"
            />
          </div>

          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">Facebook</p>
            <input
              value={facebook}
              disabled
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 bg-gray-100 opacity-50 cursor-not-allowed"
              placeholder="ลิงก์ Facebook"
            />
          </div>
        </div>

        {/* Enhanced Clues Section */}
        <div className="mt-10 mb-5">
          <div className="flex items-center gap-3">
            <Eye className="text-blue-600" size={24} />
            <p className="sm:text-xl xl:text-2xl font-bold text-gray-800">เบาะแส</p>
            <div className="h-1 flex-1 bg-gradient-to-r from-blue-600 to-transparent rounded"></div>
          </div>
        </div>

        <div className="flex flex-col w-full mb-10">
          {clues.length > 0 ? (
            <div className="space-y-6">
              {clues.map((clue, index) => (
                <div
                  key={clue.id}
                  className="bg-white border-l-4 border-blue-500 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800">
                            เบาะแสที่ {index + 1}
                          </h3>
                          <p className="text-sm text-gray-600">
                            โดย: {clue.witnessName || clue.user?.name || "ไม่ระบุชื่อ"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <Calendar size={16} />
                          <span>
                            {new Date(clue.createdAt).toLocaleDateString("th-TH", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(clue.createdAt).toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Contact Details */}
                    {clue.contactDetails && (
                      <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Phone className="text-green-600" size={16} />
                          <span className="font-medium text-green-800">ข้อมูลติดต่อ</span>
                        </div>
                        <p className="text-green-700 ml-6">{clue.contactDetails}</p>
                      </div>
                    )}

                    {/* Clue Content */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-800 mb-2">รายละเอียดการพบเห็น:</h4>
                      <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-gray-700 leading-relaxed">{clue.content}</p>
                      </div>
                    </div>

                    {/* Location */}
                    {clue.location && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="text-blue-600" size={16} />
                          <span className="font-medium text-blue-800">สถานที่พบเห็น</span>
                        </div>
                        <p className="text-blue-700 ml-6">{clue.location}</p>
                        {clue.lat != null && clue.lng != null && (
                          <p className="text-xs text-blue-600 ml-6 mt-1">
                            พิกัด: {clue.lat.toFixed(6)}, {clue.lng.toFixed(6)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Images */}
                    {clue.images.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <ImageIcon className="text-purple-600" size={16} />
                          <span className="font-medium text-purple-800">รูปภาพประกอบ</span>
                          <span className="text-sm text-gray-500">({clue.images.length} รูป)</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {clue.images.map((image, imageIndex) => (
                            <div
                              key={imageIndex}
                              className="relative group cursor-pointer"
                              onClick={() => openImageModal(image.url)}
                            >
                              <img
                                src={image.url}
                                alt={`clue-image-${imageIndex}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200 transition-transform duration-200 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                                <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" size={20} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          คลิกที่รูปภาพเพื่อดูขนาดใหญ่
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Eye className="text-gray-400" size={32} />
              </div>
              <p className="text-gray-500 text-lg font-medium">ยังไม่มีเบาะแสสำหรับสัตว์เลี้ยงนี้</p>
              <p className="text-gray-400 text-sm mt-2">
                หากท่านพบเห็นสัตว์เลี้ยงตัวนี้ กรุณาติดต่อเจ้าของ
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}