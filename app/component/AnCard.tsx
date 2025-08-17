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
  }>;
}
interface AnCardProps {
  id: number;
  imageSrc: string;
  name: string;
  age: string;
  gender: string;
  breed: string;
  lostDate: string;
  lostLocation: string;
  reward: string;
  status?: string;
  daysSinceLost?: number;
  ownerName?: string;
  species?: string;
  color?: string[] | string;
  pet: Pet;
  onDelete?: () => void; // ✅ callback จาก parent
}

const PetCard: React.FC<AnCardProps> = ({
  id,
  imageSrc,
  pet,
  name,
  age,
  gender,
  breed,
  lostDate,
  lostLocation,
  reward,
  onDelete, // ✅ รับเข้ามา
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

  // mapping เหตุผล -> status ที่จะส่งไป API
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
    location.reload();// refresh list หรือ remove card
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
    <div className="flex flex-col  md:flex-row  gap-6 p-6 rounded-2xl shadow-lg bg-[#E5EEFF] w-full 2xl:max-w-md xl:max-w-md lg:max-w-md md:max-w-md  sm:max-w-[300px] max-w-[240px]  hover:bg-gray-200 ml-4  sm:ml-10 md:ml-0">
      {/* รูปภาพ */}
      <div className="mx-auto xl:w-[300px] xl:h-[250px] md:w-[250px] md:h-[200px] sm:w-[150px] sm:h-[180px] w-[100px] h-[120px] rounded-xl overflow-hidden">
        <img src={imageSrc} alt={name} className="w-full h-full object-cover" />
      </div>

      {/* เนื้อหา */}
      <div className="flex flex-col justify-between  w-full ">
        <div className="sm:space-y-2 space-y-2 text-[10px]  sm:text-sm   sm:pl-12 pl-10 md:pl-0">
          <p>
            <strong>ชื่อ:</strong> {name}
          </p>
          <p>
            <strong>อายุ:</strong> {age}
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
            <strong>เงินรางวัล:</strong>{" "}
            {reward ? `${reward} บาท` : "ไม่มีระบุ"}
          </p>
        </div>

        {/* ปุ่ม */}
        <div className="flex justify-center md:justify-start items-center mt-3 text-center md:text-left gap-4">
          <Link href="/eggtunmissing">
            <button className="rounded-xl shadow-md bg-[#EAD64D] text-black text-[10px] sm:text-sm sm:px-4 sm:py-2 px-4 py-1.5 hover:bg-yellow-200 transition duration-300 cursor-pointer">
              รายละเอียด
            </button>
          </Link>
          {/* ปุ่มลบ */}
          <button
            className="rounded-xl shadow-md bg-red-500 text-white text-[10px] sm:text-sm sm:px-4 sm:py-2 px-4 py-1.5 hover:bg-red-400 transition duration-300 cursor-pointer"
            onClick={() => setIsReportOpen(true)}
          >
            ลบโพสต์
          </button>

          {/* Popup ลบโพสต์ */}
          {isReportOpen && (
            <div className="fixed inset-0 flex justify-center items-center z-50  bg-opacity-50">
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
                    "พบสัตว์เลี้ยง,พบเจ้าของแล้ว",
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

export default PetCard;
