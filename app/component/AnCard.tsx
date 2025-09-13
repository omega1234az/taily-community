"use client";

import Link from "next/link";
import React, { useState } from "react";

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
  createdAt,
  onDelete,
}) => {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportType, setReportType] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [reportMessage, setReportMessage] = useState("");

  // Select the image with mainImage: true, or fall back to the first image
  const imageSrc =
    pet.images.find((image) => image.mainImage)?.url || pet.images[0]?.url || "/default-image.jpg";

  // Calculate if the post is within 7 days from createdAt
  const isWithin7Days = () => {
    if (!createdAt) return true;
    const createdDate = new Date(createdAt);
    if (isNaN(createdDate.getTime())) return true;
    const now = new Date();
    const diffTime = now.getTime() - createdDate.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    return diffDays > 7;
  };

  // Calculate days until expiration (assuming 7-day expiration)
  const getDaysUntilExpiration = () => {
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

  const handleRenewPost = async () => {
    try {
      const res = await fetch(`/api/lostpet/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ createdAt: new Date().toISOString() }),
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
    if (reportType === "พบสัตว์เลี้ยง,พบเจ้าของแล้ว") statusToUpdate = "closed";
    if (reportType === "โพสต์ซ้ำ,โพสต์ผิด") statusToUpdate = "fake";
    if (reportType === "ไม่ต้องการเผยแพร่แล้ว") statusToUpdate = "closed";
    if (reportType === "อื่นๆ") statusToUpdate = "closed";

    try {
      const res = await fetch(`/api/lostpet/${id}`, {
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

  const formatThaiDate = (dateString: string) => {
    const date = new Date(dateString);
    const thaiYear = date.getFullYear() + 543;
    return `${date.getDate()}/${date.getMonth() + 1}/${thaiYear}`;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl shadow-lg bg-[#E5EEFF] min-w-[280px] max-w-[500px] w-full hover:bg-gray-200 transition-transform duration-200 transform hover:scale-105">
      {/* รูปภาพ */}
      <div className="w-full sm:w-1/2 h-48 sm:h-56 rounded-xl overflow-hidden">
        <img src={imageSrc} alt={name} className="w-full h-full object-cover" />
      </div>

      {/* เนื้อหา */}
      <div className="flex flex-col justify-between w-full sm:w-1/2">
        <div className="space-y-1 text-[13px] sm:text-[14px] lg:text-[15px]">
          <p><strong>ชื่อ:</strong> {name}</p>
          <p><strong>อายุ:</strong> {age}</p>
          <p><strong>เพศ:</strong> {gender}</p>
          <p><strong>สายพันธุ์:</strong> {breed}</p>
          <p><strong>หายวันที่:</strong> {lostDate}</p>
          <p><strong>สถานที่หาย:</strong> {lostLocation}</p>
          <p><strong>วันที่โพสต์:</strong> {createdAt ? formatThaiDate(createdAt) : '-'}</p>
          
          <p><strong>เงินรางวัล:</strong> {reward ? `${Number(reward).toLocaleString()} บาท` : "ไม่มีระบุ"}</p>

          <p><strong>สถานะ:</strong> {getDaysUntilExpiration()}</p>
        </div>

        {/* ปุ่ม */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
          <Link href={`/eggtunmissing/${id}`}>
            <button className="rounded-xl shadow-md bg-[#EAD64D] text-black text-[13px] sm:text-[14px] px-4 py-1.5 hover:bg-yellow-200 transition duration-300">
              รายละเอียด
            </button>
          </Link>
          {isWithin7Days() && (
            <button
              className="rounded-xl shadow-md bg-green-500 text-white text-[13px] sm:text-[14px] px-4 py-1.5 hover:bg-green-400 transition duration-300"
              onClick={handleRenewPost}
            >
              ต่ออายุ
            </button>
          )}
          <button
            className="rounded-xl shadow-md bg-red-500 text-white text-[13px] sm:text-[14px] px-4 py-1.5 hover:bg-red-400 transition duration-300"
            onClick={() => setIsReportOpen(true)}
          >
            ลบโพสต์
          </button>
        </div>
      </div>

      {/* Popup ลบโพสต์ */}
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
                "พบสัตว์เลี้ยง,พบเจ้าของแล้ว",
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

export default PetCard;