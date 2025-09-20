"use client";

import Link from "next/link";
import React, { useState } from "react";

interface FoundPet {
  id: number;
  description: string;
  location: string;
  foundDate: string;
  breed: string;
  gender: string;
  color: string[];
  age: number;
  distinctive: string;
  status: string;
  species: {
    id: number;
    name: string;
  };
  user: {
    id: string;
    firstName: string;
    province: string;
  };
  images: Array<{
    url: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface FoundPetCardProps {
  id: number;
  species: string;
  age: string;
  imageSrc: string;
  gender: string;
  breed: string;
  foundDate: string;
  foundLocation: string;
  finderName: string;
  status: string;
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
  onDelete,
}) => {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportType, setReportType] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [reportMessage, setReportMessage] = useState("");

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
    <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl shadow-lg bg-[#E5EEFF] 2xl:w-[500px] 2xl:h-[320px] xl:w-[430px] xl:h-[300px] lg:w-[350px] lg:h-[290px] md:w-[450px] md:h-[290px] sm:w-[380px] sm:h-[290px] w-[280px] h-[420px] hover:bg-gray-200 transition-transform duration-200 transform hover:scale-105">
      {/* Image */}
      <div className="mt-2 mx-auto 2xl:w-[370px] 2xl:h-[200px] xl:w-[370px] xl:h-[230px] lg:w-[300px] lg:h-[195px] md:w-[300px] md:h-[210px] sm:w-[320px] sm:h-[195px] w-[110px] h-[140px] rounded-xl overflow-hidden">
        <img
          src={imageSrc}
          alt={species}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between w-full">
        <div className="pt-5 sm:space-y-2 space-y-2 text-[13px] sm:text-[14px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px] sm:pl-0 pl-5 xl:pl-3">
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
          
        </div>

        {/* Buttons */}
        <div className="flex justify-center md:justify-start items-center  text-center md:text-left gap-4">
          <Link href={`/foundpet/${id}`}>
            <button className="rounded-xl shadow-md bg-[#EAD64D] text-black text-[13px] sm:text-[14px]   px-4 py-1.5 hover:bg-yellow-200 transition duration-300 cursor-pointer">
              รายละเอียด
            </button>
          </Link>
          <button
            className="rounded-xl shadow-md bg-red-500 text-white text-[13px] sm:text-[14px]   px-6 py-1.5 hover:bg-red-400 transition duration-300 cursor-pointer"
            onClick={() => setIsReportOpen(true)}
          >
            ลบโพสต์
          </button>

          {/* Delete Popup */}
          {isReportOpen && (
            <div className="fixed inset-0 flex justify-center items-center z-50 bg-opacity-50">
              <div className="bg-white lg:w-[500px] sm:w-[400px] w-full h-full sm:h-auto rounded-md shadow-lg p-4 relative">
                <button
                  onClick={() => setIsReportOpen(false)}
                  className="absolute top-5 right-5 text-2xl text-black cursor-pointer"
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
                      className={`flex items-center text-sm px-3 py-2 rounded-md transition ${
                        reportType === text
                          ? "bg-red-200 text-red-800 font-semibold"
                          : "bg-transparent"
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
      </div>
    </div>
  );
};

export default FoundPetCard;
