
"use client";

import Link from "next/link";
import React, { useState } from "react";

interface FoundPetCardProps {
  id: number;
  species: string;
  age: string | null;
  imageSrc: string;
  gender: string;
  breed: string;
  foundDate: string;
  foundLocation: string;
  finderName: string;
  status: string;
  createdAt: string;
  onDelete?: () => void;
}

const FoundPetCard: React.FC<FoundPetCardProps> = ({
  id,
  species,
  age,
  imageSrc,
  gender,
  breed,
  foundDate,
  foundLocation,
  finderName,
  status,
  createdAt,
  onDelete,
}) => {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportType, setReportType] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [reportMessage, setReportMessage] = useState("");

  // Format date to Thai format (e.g., "14/09/2568")
  const formatThaiDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    const thaiYear = date.getFullYear() + 543;
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${thaiYear}`;
  };

  // Calculate days until expiration (14-day expiration)
  const getDaysUntilExpiration = () => {
    if (status === "expired") {
      return "หมดอายุแล้ว";
    }
    if (!createdAt) return "ไม่มีข้อมูลวันที่";
    const createdDate = new Date(createdAt);
    if (isNaN(createdDate.getTime())) return "วันที่ไม่ถูกต้อง";
    const now = new Date();
    const expirationDate = new Date(createdDate.getTime() + 14 * 24 * 60 * 60 * 1000);
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

  // Check if post is expired
  const isExpired = () => {
    if (status === "expired") return true;
    if (!createdAt) return false;
    const createdDate = new Date(createdAt);
    if (isNaN(createdDate.getTime())) return false;
    const now = new Date();
    const expirationDate = new Date(createdDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    return now >= expirationDate;
  };

  // Handle Renew button click
  const handleRenew = async () => {
    try {
      const res = await fetch(`/api/foundpet/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "finding",
          createdAt: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      alert(data.message || "ต่ออายุโพสต์สำเร็จ");
      location.reload();
    } catch (err) {
      console.error("Error:", err);
      alert("ไม่สามารถต่ออายุโพสต์ได้");
    }
  };

  const handleSubmitReport = async () => {
    if (!reportType) {
      alert("กรุณาเลือกเหตุผลก่อนลบโพสต์");
      return;
    }

    let statusToUpdate = "closed";
    if (reportType === "พบเจ้าของแล้ว") statusToUpdate = "closed";
    if (reportType === "โพสต์ซ้ำ,โพสต์ผิด") statusToUpdate = "fake";
    if (reportType === "ไม่ต้องการเผยแพร่แล้ว") statusToUpdate = "closed";
    if (reportType === "อื่นๆ") statusToUpdate = "closed";

    try {
      const res = await fetch(`/api/foundpet/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusToUpdate }),
      });

      const data = await res.json();
      alert(data.message);

      if (onDelete) onDelete();
      location.reload();
    } catch (err) {
      console.error("Error:", err);
      alert("ไม่สามารถลบโพสต์ได้");
    }

    setIsReportOpen(false);
    setReportType("");
    setReportMessage("");
    setShowOtherInput(false);
  };

  return (
    <div
      className={`flex flex-col sm:flex-row gap-4 p-4 rounded-xl shadow-lg min-w-[280px] max-w-[500px] w-full transition-transform duration-200 transform hover:scale-105 ${
        isExpired() || status === "expired"
          ? "bg-gray-200 opacity-75"
          : "bg-[#E5EEFF] hover:bg-gray-200"
      }`}
    >
      {/* Image */}
      <div className="w-full sm:w-1/2 h-48 sm:h-56 rounded-xl overflow-hidden relative">
        <img
          src={imageSrc}
          alt={species}
          className="w-full h-full object-cover"
        />
        {(isExpired() || status === "expired") && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
            หมดอายุ
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between w-full sm:w-1/2">
        <div className="space-y-1 text-[13px] sm:text-[14px] lg:text-[15px]">
          <p>
            <strong>สัตว์:</strong> {species}
          </p>
          
          <p>
            <strong>เพศ:</strong> {gender}
          </p>
          <p>
            <strong>สายพันธุ์:</strong> {breed}
          </p>
          <p>
            <strong>พบวันที่:</strong> {foundDate}
          </p>
          <p>
            <strong>สถานที่พบ:</strong> {foundLocation}
          </p>
        
          <p>
            <strong>สถานะ:</strong> {getDaysUntilExpiration()}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-3">
          <Link href={`/foundpet/${id}`}>
            <button className="rounded-xl shadow-md bg-[#EAD64D] text-black text-[13px] sm:text-[14px] px-4 py-1.5 hover:bg-yellow-200 transition duration-300 cursor-pointer">
              รายละเอียด
            </button>
          </Link>
          {(isExpired() || status === "expired") && (
            <button
              className="rounded-xl shadow-md bg-blue-500 text-white text-[13px] sm:text-[14px] px-4 py-1.5 hover:bg-blue-400 transition duration-300 cursor-pointer"
              onClick={handleRenew}
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

      {/* Delete Popup */}
      {isReportOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white w-full max-w-md sm:max-w-lg rounded-md shadow-lg p-4 m-4 relative">
            <button
              onClick={() => setIsReportOpen(false)}
              className="absolute top-3 right-3 text-xl text-black cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold">ลบโพสต์</h2>
            <div className="mt-4 space-y-2">
              {[
                "พบเจ้าของแล้ว",
                "โพสต์ซ้ำ,โพสต์ผิด",
                "ไม่ต้องการเผยแพร่แล้ว",
                "อื่นๆ",
              ].map((text) => (
                <label
                  key={text}
                  className={`flex items-center text-sm px-3 py-2 rounded-md transition cursor-pointer ${
                    reportType === text
                      ? "bg-red-200 text-red-800 font-semibold"
                      : "bg-transparent hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setReportType(text);
                    setShowOtherInput(text === "อื่นๆ");
                    if (text !== "อื่นๆ") {
                      setReportMessage("");
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    readOnly
                    checked={reportType === text}
                    className="mr-2 w-4 h-4 accent-red-500 cursor-pointer"
                  />
                  {text}
                </label>
              ))}
            </div>
            {showOtherInput && (
              <textarea
                placeholder="กรุณาระบุเหตุผลเพิ่มเติม..."
                className="w-full mt-4 border border-gray-300 rounded-md p-2 text-sm resize-none"
                rows={4}
                value={reportMessage}
                onChange={(e) => setReportMessage(e.target.value)}
              />
            )}
            <button
              onClick={handleSubmitReport}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm cursor-pointer"
            >
              ลบโพสต์
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoundPetCard;
