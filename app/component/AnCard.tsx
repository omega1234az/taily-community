"use client";

import Link from "next/link";
import React, { useState } from "react";
import Swal from 'sweetalert2'; // Import SweetAlert2

interface Pet {
  id: number;
  name: string;
  species: {
    name: string;
  };
  breed: string;
  age: number;
  gender: string;
  color: string[];
  description: string;
  markings: string;
  images: Array<{
    url: string;
    mainImage: boolean;
  }>;
}

interface AnCardProps {
  id: number;
  name: string;
  age: string;
  imageSrc: string;
  gender: string;
  breed: string;
  lostDate: string;
  lostLocation: string;
  reward: string;
  status?: string;
  daysSinceLost?: number;
  ownerName?: string;
  species?: string;
  createdAt?: string;
  color?: string[] | string;
  pet: Pet;
  onDelete?: () => void;
}

const PetCard: React.FC<AnCardProps> = ({
  id,
  pet,
  name,
  age,
  gender,
  breed,
  lostDate,
  lostLocation,
  reward,
  status,
  createdAt,
  onDelete,
}) => {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportType, setReportType] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [reportMessage, setReportMessage] = useState("");

  // Select the image with mainImage: true, or fall back to the first image
  const imageSrc =
    pet.images.find((image) => image.mainImage)?.url ||
    pet.images[0]?.url ||
    "/default-image.jpg";

  // Calculate days until expiration (assuming 14-day expiration)
  const getDaysUntilExpiration = () => {
    if (status === "expired") {
      return "หมดอายุแล้ว";
    }
    if (!createdAt) return "ไม่มีข้อมูลวันที่";
    const createdDate = new Date(createdAt);
    if (isNaN(createdDate.getTime())) return "วันที่ไม่ถูกต้อง";
    const now = new Date();
    const expirationDate = new Date(
      createdDate.getTime() + 14 * 24 * 60 * 60 * 1000
    );
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
    if (diffDays > 0) {
      return `หมดอายุในอีก ${diffDays} วัน`;
    } else if (diffDays === 0) {
      return "หมดอายุวันนี้";
    } else {
      return "หมดอายุแล้ว";
    }
  };

  const handleRenewPost = async () => {
    try {
      const res = await fetch(`/api/lostpet/${id}/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          createdAt: new Date().toISOString(),
          status: "lost" // เปลี่ยนสถานะกลับเป็น lost เมื่อต่ออายุ
        }),
      });
      const data = await res.json();
      await Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: data.message || "ต่ออายุโพสต์สำเร็จ",
        confirmButtonText: 'ตกลง',
      });
      location.reload();
    } catch (err) {
      console.error("Error:", err);
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: "ไม่สามารถต่ออายุโพสต์ได้",
        confirmButtonText: 'ตกลง',
      });
    }
  };

  const handleSubmitReport = async () => {
    if (!reportType) {
      await Swal.fire({
        icon: 'warning',
        title: 'กรุณาเลือกเหตุผล',
        text: "กรุณาเลือกเหตุผลก่อนลบโพสต์",
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    let statusToUpdate = "closed";
    if (reportType === "พบสัตว์เลี้ยง,พบเจ้าของแล้ว") statusToUpdate = "closed";
    if (reportType === "โพสต์ซ้ำ,โพสต์ผิด") statusToUpdate = "fake";
    if (reportType === "ไม่ต้องการเผยแพร่แล้ว") statusToUpdate = "closed";
    if (reportType === "อื่นๆ") statusToUpdate = "closed";

    try {
      const res = await fetch(`/api/lostpet/${id}/me`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusToUpdate }),
      });
      const data = await res.json();
      await Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: "ลบโพสต์สำเร็จ",
        confirmButtonText: 'ตกลง',
      });
      if (onDelete) onDelete();
      location.reload();
    } catch (err) {
      console.error("Error:", err);
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: "ไม่สามารถลบโพสต์ได้",
        confirmButtonText: 'ตกลง',
      });
    }

    setIsReportOpen(false);
    setReportType("");
    setReportMessage("");
    setShowOtherInput(false);
  };

  const formatThaiDate = (dateString: string) => {
    const date = new Date(dateString);
    const thaiYear = date.getFullYear() + 543;
    return `${date.getDate()}/${date.getMonth() + 1}/${thaiYear}`;
  };

  return (
    <>
      <div
        className={`flex flex-col sm:flex-row gap-4 p-4 rounded-xl shadow-lg min-w-[280px] max-w-[500px] w-full transition-transform duration-200 transform hover:scale-105 ${
          status === "expired"
            ? "bg-gray-200 opacity-75"
            : "bg-[#E5EEFF] hover:bg-gray-200"
        }`}
      >
        {/* รูปภาพ */}
        <div className="w-full sm:w-1/2 h-48 sm:h-56 rounded-xl overflow-hidden relative">
          <img src={imageSrc} alt={name} className="w-full h-full object-cover" />
          {status === "expired" && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
              หมดอายุ
            </div>
          )}
        </div>

        {/* เนื้อหา */}
        <div className="flex flex-col justify-between w-full sm:w-1/2">
          <div className="space-y-1 text-[13px] sm:text-[14px] lg:text-[15px]">
            <p>
              <strong>ชื่อ:</strong> {name}
            </p>
            <p>
              <strong>อายุ:</strong>{" "}
              {(() => {
                const totalMonths = Number(age);
                const years = Math.floor(totalMonths / 12);
                const months = totalMonths % 12;

                if (years > 0 && months > 0) return `${years} ปี ${months} เดือน`;
                if (years > 0) return `${years} ปี`;
                return `${months} เดือน`;
              })()}
            </p>
            <p>
              <strong>เพศ:</strong> {gender}
            </p>
            <p>
              <strong>สายพันธุ์:</strong> {breed}
            </p>
            <p>
              <strong>หายวันที่:</strong> {lostDate}
            </p>
            <p>
              <strong>สถานที่หาย:</strong> {lostLocation}
            </p>
            <p>
              <strong>วันที่โพสต์:</strong>{" "}
              {createdAt ? formatThaiDate(createdAt) : "-"}
            </p>
            <p>
              <strong>เงินรางวัล:</strong>{" "}
              {reward ? `${Number(reward).toLocaleString()} บาท` : "ไม่มีระบุ"}
            </p>
            <p>
              <strong>สถานะ:</strong> {getDaysUntilExpiration()}
            </p>
          </div>

          {/* ปุ่ม */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-3">
            <Link href={`/eggtunmissing/${id}`}>
              <button className="rounded-xl shadow-md bg-[#EAD64D] text-black text-[13px] sm:text-[14px] px-4 py-1.5 hover:bg-yellow-200 transition duration-300 cursor-pointer">
                รายละเอียด
              </button>
            </Link>
            {status === "expired" && (
              <button
                className="rounded-xl shadow-md bg-blue-500 text-white text-[13px] sm:text-[14px] px-4 py-1.5 hover:bg-blue-400 transition duration-300 cursor-pointer"
                onClick={handleRenewPost}
              >
                ต่ออายุ
              </button>
            )}
            <button
              className="rounded-xl shadow-md bg-red-500 text-white text-[13px] sm:text-[14px] px-6 py-1.5 hover:bg-red-400 transition duration-300 cursor-pointer"
              onClick={() => setIsReportOpen(true)}
            >
              ลบโพสต์
            </button>
          </div>
        </div>
      </div>

      {/* Modal ลบโพสต์ */}
      {isReportOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50 backdrop-blur-sm"
          onClick={(e) => {
            // ปิด modal เมื่อคลิกที่พื้นหลัง
            if (e.target === e.currentTarget) {
              setIsReportOpen(false);
            }
          }}
        >
          <div 
            className="relative bg-white w-full max-w-md mx-4 rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // ป้องกันการปิด modal เมื่อคลิกใน modal
          >
            {/* ปุ่มปิด */}
            <button
              onClick={() => setIsReportOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="ปิด"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* หัวเรื่อง */}
            <h2 className="text-xl font-semibold text-gray-800 mb-6 pr-8">ลบโพสต์</h2>
            
            {/* ตัวเลือก */}
            <div className="space-y-3">
              {[
                "พบสัตว์เลี้ยง,พบเจ้าของแล้ว",
                "โพสต์ซ้ำ,โพสต์ผิด",
                "ไม่ต้องการเผยแพร่แล้ว",
                "อื่นๆ",
              ].map((option) => (
                <label
                  key={option}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    reportType === option
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setReportType(option);
                    setShowOtherInput(option === "อื่นๆ");
                    if (option !== "อื่นๆ") {
                      setReportMessage("");
                    }
                  }}
                >
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    reportType === option
                      ? "border-red-500 bg-red-500"
                      : "border-gray-300"
                  }`}>
                    {reportType === option && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-sm font-medium">{option}</span>
                </label>
              ))}
            </div>

            {/* ช่องใส่ข้อความเพิ่มเติม */}
            {showOtherInput && (
              <div className="mt-4">
                <textarea
                  placeholder="กรุณาระบุเหตุผลเพิ่มเติม..."
                  className="w-full border-2 border-gray-200 rounded-lg p-3 text-sm resize-none focus:border-red-500 focus:outline-none transition-colors duration-200"
                  rows={4}
                  value={reportMessage}
                  onChange={(e) => setReportMessage(e.target.value)}
                />
              </div>
            )}

            {/* ปุ่มยืนยัน */}
            <button
              onClick={handleSubmitReport}
              disabled={!reportType}
              className={`mt-6 w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
                reportType
                  ? "bg-red-500 hover:bg-red-600 active:bg-red-700 cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              ยืนยันการลบโพสต์
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PetCard;