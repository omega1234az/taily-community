"use client";

import React, { useState, useRef } from "react";

type OwnerPet = {
  id: string;
  name: string;
  images: string[];
  gender: string;
  breed: string;
  lostDate: string;
  color: string;
  type: string;
  marks?: string;
  description?: string;
  lostLocation?: string;
};

type Props = {
  pet: OwnerPet;
};

export default function OwnerPetDetails({ pet }: Props) {
  const [mainImage, setMainImage] = useState(pet.images[0]);

  const [isClueOpen, setIsClueOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const [witnessName, setWitnessName] = useState("");
  const [contactDetail, setContactDetail] = useState("");
  const [sightingDetail, setSightingDetail] = useState("");

  const [name, setName] = useState("คาราเมล");
  const [phone, setPhone] = useState("000000000");
  const [facebook, setFacebook] = useState("คาราเมล10000");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>("/all/image.png");

  const [reportType, setReportType] = useState<string>("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [reportMessage, setReportMessage] = useState("");

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setImagePreview(imageURL);
    }
  };

  const handleSubmit = () => {
    console.log("ส่งข้อมูล:", {
      witnessName,
      contactDetail,
      sightingDetail,
    });
    setIsClueOpen(false);
  };

  const handleSubmitReport = () => {
    console.log(
      "ข้อความรายงาน:",
      reportType === "อื่นๆ" ? reportMessage : reportType
    );
    setIsReportOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold mb-5">
          <span className="bg-[#EAD64D] lg:py-6 lg:pl-6 sm:py-5 sm:pl-5 py-3 pl-4 rounded-full">
            {pet.name.slice(0, 2)}
          </span>
          {pet.name.slice(2)}
        </h1>

        <div className="flex gap-3">
          {/* ปุ่มแจ้งเบาะแส */}
          <div
            onClick={() => setIsClueOpen(true)}
            className="cursor-pointer border-2 border-gray-400 rounded-lg p-1.5 flex flex-col items-center w-fit"
          >
            <img
              src="/home/jang.png"
              alt="แจ้งเบาะแส"
              className="lg:w-11 lg:h-9 sm:w-9 sm:h-7 w-8 h-6 object-cover"
            />
            <p className="lg:text-[10px] sm:text-[9px] text-[8px]">
              แจ้งเบาะแส
            </p>
          </div>

          {/* ปุ่มรายงาน */}
          <div
            className="flex justify-center items-center cursor-pointer"
            onClick={() => setIsReportOpen(true)}
          >
            <img
              src="/all/report.png"
              alt="report"
              className="lg:w-11 lg:h-9 sm:w-9 sm:h-7 w-8 h-6 object-cover"
            />
          </div>
        </div>
      </div>

      {/* Popup แจ้งเบาะแส */}
      {isClueOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white p-8 xl:mt-10 sm:mt-20 rounded-2xl shadow-lg xl:w-[600px] xl:h-[600px] lg:w-[550px] lg:h-[550px] md:w-[500px] md:h-[550px] sm:w-[450px] sm:h-[550px] w-full h-full relative overflow-hidden">
            <span className="absolute top-[-36px] left-1 w-52 h-28 bg-[#7CBBEB] rounded-b-full z-0"></span>
            <span className="absolute top-4 left-64 w-10 h-10 bg-[#EAD64D] rounded-full z-0 -translate-x-1/2"></span>
            <span className="absolute top-5 left-120 w-18 h-18 bg-[#7CBBEB] rounded-full z-0"></span>

            <div className="relative z-10 flex justify-center mb-4">
              <h2 className="text-lg lg:text-xl font-semibold text-center">
                แจ้งเบาะแส
              </h2>
            </div>

            <p className="mb-1 z-10 text-sm lg:text-md">ชื่อผู้พบเห็น</p>
            <input
              type="text"
              value={witnessName}
              onChange={(e) => setWitnessName(e.target.value)}
              className="mb-4 w-full border rounded-md p-2 text-sm relative z-10"
            />

            <p className="mb-1 text-sm lg:text-md">รายละเอียดการติดต่อ</p>
            <input
              type="text"
              value={contactDetail}
              onChange={(e) => setContactDetail(e.target.value)}
              className="mb-4 w-full border rounded-md p-2 text-sm"
            />

            <p className="mb-1 text-sm lg:text-md">รายละเอียดการพบเห็น</p>
            <textarea
              value={sightingDetail}
              onChange={(e) => setSightingDetail(e.target.value)}
              className="mb-4 w-full border rounded-md p-2 text-sm"
            />

            <p className="sm:mb-2 z-10 mb-4">รูป</p>
            <div className="relative mb-2">
              <span className="absolute top-14 left-8 w-24 h-24 bg-[#EAD64D] rounded-full z-0 -translate-x-1/2"></span>
              <span className="absolute top-[-30] right-[-50] w-36 h-56 bg-[#EAD64D] rounded-l-full z-0 "></span>

              <img
                src={imagePreview}
                alt="preview"
                className="lg:w-40 lg:h-24 sm:w-36 sm:h-20 w-48 h-28 object-cover relative mb-2"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <button
                onClick={handleButtonClick}
                className="relative z-10 text-sm lg:text-md px-5 py-1 rounded-lg bg-[#AFDAFB] hover:bg-[#b7ccf5] cursor-pointer"
              >
                อัปโหลด
              </button>
            </div>

            <div className="absolute bottom-6 right-6 flex gap-3">
              <button
                onClick={() => setIsClueOpen(false)}
                className="px-6 py-1 text-sm lg:text-md rounded-md bg-[#D9D9D9] hover:bg-gray-100 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-1 text-sm lg:text-md rounded-md bg-[#AFDAFB] hover:bg-[#b7ccf5] cursor-pointer"
              >
                ส่ง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup รายงาน */}
      {isReportOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div className="bg-white lg:w-[500px] sm:w-[400px] w-full h-full sm:h-auto rounded-md shadow-lg p-4 relative">
            <button
              onClick={() => setIsReportOpen(false)}
              className="absolute top-5 right-5 text-2xl text-black cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold">รายงาน</h2>

            <div className="mt-4 space-y-2">
              {[
                "ฉันถูกใส่ความหรือถูกหมิ่นประมาทให้เสื่อมเสียชื่อเสียง",
                "ประกาศนี้มีเนื้อหาไม่เหมาะสม",
                "งานอันมีลิขสิทธิ์ของฉันถูกเผยแพร่โดยไม่ได้รับอนุญาต",
                "อื่นๆ",
              ].map((text) => (
                <label
                  key={text}
                  className={`block cursor-pointer text-sm px-3 py-1 rounded-md 
              ${
                reportType === text
                  ? "bg-red-200 text-red-800 font-semibold "
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
              ส่งรายงาน
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row  items-start gap-10 xl:gap-16 pt-8 xl:pt-10">
        <div className="ml-20 sm:ml-0">
          {/* รูปหลัก */}
          <img
            src={mainImage}
            alt={pet.name}
            className="2xl:w-72 2xl:h-80 xl:w-64 xl:h-72 lg:w-60 lg:h-64 md:w-56 md:h-60 sm:w-48 sm:h-56 w-36 h-48 object-cover rounded-2xl overflow-hidden"
          />

          {/* รูปเล็ก (thumbnail) */}
          <div className="grid grid-cols-3 gap-2 pt-3">
            {pet.images
              .filter((img) => img !== mainImage)
              .map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${pet.name} ${idx + 1}`}
                  onClick={() => setMainImage(img)}
                  className="2xl:w-22 2xl:h-22 xl:w-20 xl:h-20 lg:w-18 lg:h-18 md:w-17 md:h-17 sm:w-14 sm:h-14 w-11 h-12 object-cover cursor-pointer rounded-md"
                />
              ))}
          </div>
        </div>

        <div className="flex flex-col  mt-2 xl:mt-5 text-lg lg:text-xl space-y-6">
          <p>เพศ: {pet.gender}</p>
          <p>สายพันธุ์: {pet.breed}</p>
          <p>ประเภท: {pet.type}</p>
          <p>สี: {pet.color}</p>
          <p>พบวันที่: {pet.lostDate}</p>
        </div>
      </div>
      <div className="mt-10">
        <h2 className="text-lg lg:text-xl">รอยตำหนิ</h2>
        <p className="text-sm lg:text-md mb-5">{pet.marks}</p>

        <h2 className="text-lg lg:text-xl">รายละเอียด</h2>
        <p className="text-sm lg:text-md mb-5">{pet.description}</p>
      </div>
      <div className="flex row space-x-3 mt-8">
        <img
          src="/home/f.png"
          alt="image"
          className="lg:w-11 sm:w-10 w-8 h-auto object-cover"
        />
        <img
          src="/home/l.png"
          alt="image"
          className="lg:w-11 sm:w-10 w-8 h-auto object-cover"
        />
        <img
          src="/home/x.png"
          alt="image"
          className="lg:w-11 sm:w-10 w-8 h-auto object-cover"
        />
        <img
          src="/home/ch.png"
          alt="image"
          className="lg:w-11 sm:w-10 w-8 h-auto object-cover"
        />
      </div>

      <h2 className="text-lg lg:text-xl mt-8">สถานที่หาย</h2>
      <p className="text-sm lg:text-md mb-5">{pet.lostLocation}</p>

      <img
        src="/home/map2.png"
        alt="map"
        className="w-full h-auto object-contain"
      />

      <p className="text-lg lg:text-xl lg:my-8 my-5 sm:my-5 ">
        ช่องทางการติดต่อ
      </p>
      <div className="inline-flex gap-5 xl:p-8 p-5 bg-[#AFDAFB] rounded-xl items-center mb-10">
        <div className="flex justify-center items-start">
          <img
            src="/all/owen.png"
            alt="logo"
            className="lg:w-32 lg:h-32 xl:w-36 xl:h-36 2xl:w-40 2xl:h-40 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover"
          />
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm lg:text-md mb-1">ชื่อ</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl lg:px-4 px-2 lg:py-2 py-1.5 lg:text-sm sm:text-xs"
            />
          </div>

          <div>
            <p className="text-sm lg:text-md mb-1">เบอร์ติดต่อ</p>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl lg:px-4 px-2 lg:py-2 py-1.5 lg:text-sm sm:text-xs"
            />
          </div>

          <div>
            <p className="text-sm lg:text-md mb-1">Facebook</p>
            <input
              type="text"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl lg:px-4 px-2 lg:py-2 py-1.5 lg:text-sm sm:text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
