"use client";

import React, { useState, useRef ,useEffect} from "react";
import dynamic from "next/dynamic";
import { getSession } from "next-auth/react";
import {
  FacebookShareButton,
  LineShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  LineIcon,
  TwitterIcon,
  WhatsappIcon,
} from "react-share";
// โหลด component แบบ dynamic เพื่อป้องกัน SSR error
const PetMap = dynamic(() => import("./PetMap"), { ssr: false });

type LostPet = {
  id: string;
  name: string;
  age: string;
  gender: string;
  type: string;
  breed: string;
  sterilized: string;
  color: string;
  marks: string;
  description: string;
  lostDate: string;
  lostDetail: string;
  lostLocation: string;
  reward?: string;
  mainImage: string;
  images: string[];
  ownerName?: string;
  phone?: string;
  facebook?: string;
  missingLocation?: string;
  lat?: number;
  lng?: number;
};

type Props = {
  pet: LostPet;
};

export default function LostPetDetails({ pet }: Props) {
  const [mainImage, setMainImage] = useState(pet.images[0]);
  const images = [pet.mainImage, ...pet.images];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isClueOpen, setIsClueOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Clue form states
  const [witnessName, setWitnessName] = useState("");
  const [contactDetail, setContactDetail] = useState("");
  const [sightingDetail, setSightingDetail] = useState("");
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  // Loading and error states
  const [isSubmittingClue, setIsSubmittingClue] = useState(false);
  const [clueError, setClueError] = useState("");
  const [clueSuccess, setClueSuccess] = useState("");

  const [name, setName] = useState(pet.ownerName || "ไม่ระบุ");
  const [phone, setPhone] = useState(pet.phone || "ไม่ระบุ");
  const [facebook, setFacebook] = useState(pet.facebook || "ไม่ระบุ");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [reportType, setReportType] = useState<string>("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href); // ✅ ใช้ URL ปัจจุบัน
    }
  }, []);

  const title = "ช่วยตามหาสัตว์เลี้ยงของฉันด้วยนะ!";
const handleSubmitReport = async () => {
  // เช็ค session ของผู้ใช้ก่อน
  const session = await getSession();

  if (!session) {
    alert("คุณต้องเข้าสู่ระบบก่อนที่จะรายงาน");
    return;
  }

  // ถ้าไม่มีการเลือกประเภทเหตุผล
  if (!reportType) {
    alert("กรุณาเลือกเหตุผลในการรายงาน");
    return;
  }

  const reportData = {
    referenceType: "lost_pet",
    referenceId: parseInt(pet.id),
    reason: reportType === "อื่นๆ" ? reportMessage : reportType,
  };

  try {
    const response = await fetch("/api/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reportData),
    });

    const result = await response.json();

    if (response.ok) {
      alert("ส่งรายงานสำเร็จ!");
      setIsReportOpen(false);
      setReportType("");
      setReportMessage("");
      setShowOtherInput(false);
    } else {
      alert(result.error || "เกิดข้อผิดพลาดในการส่งรายงาน");
    }
  } catch (error) {
    console.error("Error submitting report:", error);
    alert("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่");
  }
};
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length > 4) {
      setClueError("สามารถอัปโหลดรูปได้ไม่เกิน 4 รูป");
      return;
    }

    setSelectedImages(files);
    
    // สร้าง preview images
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
    setClueError(""); // ล้าง error
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Reset form function
  const resetClueForm = () => {
    setWitnessName("");
    setContactDetail("");
    setSightingDetail("");
    setLocation("");
    setLat("");
    setLng("");
    setSelectedImages([]);
    setImagePreviews([]);
    setClueError("");
    setClueSuccess("");
  };

  console.log("LostPetDetails render with pet:", pet);

  const handleSubmit = async () => {
    // Validate form
    

 
    if (!witnessName.trim() || !contactDetail.trim() || !sightingDetail.trim()) {
      setClueError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setIsSubmittingClue(true);
    setClueError("");
    setClueSuccess("");

    try {
      // สร้าง FormData
      const formData = new FormData();
      formData.append("witnessName", witnessName.trim());
      formData.append("contactDetails", contactDetail.trim());
      formData.append("sightingDetails", sightingDetail.trim());
      
      if (location.trim()) {
        formData.append("location", location.trim());
      }
      
      if (lat.trim()) {
        formData.append("lat", lat.trim());
      }
      
      if (lng.trim()) {
        formData.append("lng", lng.trim());
      }

      // เพิ่มรูปภาพ
      selectedImages.forEach((image) => {
        formData.append("images", image);
      });

      // ส่งข้อมูลไปยัง API
      const response = await fetch(`/api/lostpet/${pet.id}/clues`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setClueSuccess("เพิ่มเบาะแสสำเร็จ!");
        setTimeout(() => {
          setIsClueOpen(false);
          resetClueForm();
        }, 2000);
      } else {
        setClueError(result.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
      }
    } catch (error) {
      console.error("Error submitting clue:", error);
      setClueError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmittingClue(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="lg:text-3xl text_SHADER: text-2xl font-semibold mb-5">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50">
          <div className="bg-white p-6 xl:mt-10 sm:mt-20 rounded-2xl shadow-lg xl:w-[600px] xl:max-h-[90vh] lg:w-[550px] lg:max-h-[85vh] md:w-[500px] md:max-h-[85vh] sm:w-[450px] sm:max-h-[85vh] w-full h-full max-h-full relative overflow-y-auto">
            <span className="absolute top-[-36px] left-1 w-52 h-28 bg-[#7CBBEB] rounded-b-full z-0"></span>
            <span className="absolute top-4 left-64 w-10 h-10 bg-[#EAD64D] rounded-full z-0 -translate-x-1/2"></span>
            <span className="absolute top-5 left-120 w-18 h-18 bg-[#7CBBEB] rounded-full z-0"></span>

            <div className="relative z-10 flex justify-center mb-4">
              <h2 className="text-lg lg:text-xl font-semibold text-center">
                แจ้งเบาะแส
              </h2>
            </div>

            {/* แสดงข้อความ Error/Success */}
            {clueError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm relative z-10">
                {clueError}
              </div>
            )}
            
            {clueSuccess && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm relative z-10">
                {clueSuccess}
              </div>
            )}

            <div className="relative z-10 space-y-4">
              <div>
                <p className="mb-1 text-sm lg:text-md">ชื่อผู้พบเห็น *</p>
                <input
                  type="text"
                  value={witnessName}
                  onChange={(e) => setWitnessName(e.target.value)}
                  className="w-full border rounded-md p-2 text-sm"
                  disabled={isSubmittingClue}
                />
              </div>

              <div>
                <p className="mb-1 text-sm lg:text-md">รายละเอียดการติดต่อ *</p>
                <input
                  type="text"
                  value={contactDetail}
                  onChange={(e) => setContactDetail(e.target.value)}
                  placeholder="เบอร์โทร, อีเมล, หรือ Facebook"
                  className="w-full border rounded-md p-2 text-sm"
                  disabled={isSubmittingClue}
                />
              </div>

              <div>
                <p className="mb-1 text-sm lg:text-md">รายละเอียดการพบเห็น *</p>
                <textarea
                  value={sightingDetail}
                  onChange={(e) => setSightingDetail(e.target.value)}
                  placeholder="อธิบายรายละเอียดการพบเห็นสัตว์เลี้ยง..."
                  className="w-full border rounded-md p-2 text-sm h-20 resize-none"
                  disabled={isSubmittingClue}
                />
              </div>

              

              <div>
                <p className="mb-2 text-sm lg:text-md">รูปภาพ (ไม่เกิน 4 รูป)</p>
                
                {/* แสดง Preview รูปภาพ */}
                {imagePreviews.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`preview-${index}`}
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          disabled={isSubmittingClue}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={isSubmittingClue}
                />
                <button
                  type="button"
                  onClick={handleButtonClick}
                  className="px-4 py-2 rounded-lg bg-[#AFDAFB] hover:bg-[#b7ccf5] text-sm lg:text-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmittingClue || selectedImages.length >= 4}
                >
                  {selectedImages.length >= 4 ? "ครบ 4 รูปแล้ว" : "เลือกรูปภาพ"}
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  รองรับไฟล์ JPEG, PNG, WebP ขนาดไม่เกิน 5MB ต่อรูป
                </p>
              </div>
            </div>

            <div className="relative z-10 flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setIsClueOpen(false);
                  resetClueForm();
                }}
                className="px-6 py-2 text-sm lg:text-md rounded-md bg-[#D9D9D9] hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmittingClue}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-2 text-sm lg:text-md rounded-md bg-[#AFDAFB] hover:bg-[#b7ccf5] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={isSubmittingClue}
              >
                {isSubmittingClue && (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                )}
                {isSubmittingClue ? "กำลังส่ง..." : "ส่ง"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup รายงาน */}
      {isReportOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50  bg-opacity-50">
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
              className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!reportType || (showOtherInput && !reportMessage.trim())}
            >
              ส่งรายงาน
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:gap-6 gap-4 lg:pt-14 pt-8">
        {/* ส่วนแสดงรูปเรียงแบบเลื่อนแนวนอน */}
        <div className="flex overflow-x-auto scrollbar-hide pl-6">
          <div className="flex gap-6">
            {pet.images.slice(0, 4).map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${pet.name}-${idx}`}
                className="2xl:w-[600px] 2xl:h-[420px] xl:w-[500px] xl:h-[350px] lg:w-[400px] lg:h-[300px] sm:w-[300px] sm:h-[200px] w-[287px] h-[180px] object-cover flex-shrink-0"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:mt-2 text-lg lg:text-xl space-y-8">
        <div className="mt-10 flex flex-col sm:grid grid-cols-3 gap-5 md:gap-10 lg:gap-28 xl:gap-40 2xl:gap-52">
          <div className="mt-2 xl:mt-5 text-lg lg:text-2xl space-y-6">
            <p>
              <span className="text-lg lg:text-2xl">อายุ:</span>{" "}
              <span className="text-[16px] lg:text-xl">{pet.age}</span>
            </p>
            <p>
              <span className="text-lg lg:text-2xl">เพศ:</span>{" "}
              <span className="text-[16px] lg:text-xl">{pet.gender}</span>
            </p>
            <p>
              <span className="text-lg lg:text-2xl">ประเภท:</span>{" "}
              <span className="text-[16px] lg:text-xl">{pet.type}</span>
            </p>
            <p>
              <span className="text-lg lg:text-2xl">สายพันธุ์:</span>{" "}
              <span className="text-[16px] lg:text-xl">{pet.breed}</span>
            </p>
            <p>
              <span className="text-lg lg:text-2xl">ทำหมัน:</span>{" "}
              <span className="text-[16px] lg:text-xl">{pet.sterilized}</span>
            </p>
            <p>
              <span className="text-lg lg:text-2xl">สี:</span>{" "}
              <span className="text-[16px] lg:text-xl">{pet.color}</span>
            </p>
          </div>

          <div className="mt-2 xl:mt-5 space-y-1">
            <h2 className="text-lg lg:text-2xl">รอยตำหนิ</h2>
            <p className="text-[16px] lg:text-lg mb-10">{pet.marks}</p>

            

            <h2 className="text-lg lg:text-2xl">วันที่หาย</h2>
            <p className="text-[16px] lg:text-lg">{pet.lostDate}</p>
          </div>

          <div className="mt-2 xl:mt-5 text-lg lg:text-xl space-y-1">
            <h2 className="text-lg lg:text-2xl">รายละเอียดการหาย</h2>
            <p className="text-[16px] lg:text-lg mb-10">{pet.lostDetail}</p>

            <h2 className="text-lg lg:text-2xl">เงินรางวัล</h2>
            <p className="text-[16px] lg:text-lg">
              {pet.reward ? `${pet.reward} บาท` : "ไม่มีระบุ"}
            </p>
          </div>
        </div>

        <div className="flex row space-x-3 lg:mt-8 mt-2">
      {/* Facebook */}
      <FacebookShareButton url={shareUrl} hashtag={`#${title}` }>
        <FacebookIcon size={48} round /> 
      </FacebookShareButton>

      {/* Line */}
      <LineShareButton url={shareUrl} title={title}>
        <LineIcon size={48} round />
      </LineShareButton>

      {/* Twitter (X) */}
      <TwitterShareButton url={shareUrl} title={title}>
        <TwitterIcon size={48} round />
      </TwitterShareButton>

      {/* WhatsApp (แทน ch.png) */}
     
    </div>

        <h2 className="text-lg lg:text-2xl lg:mt-8 mt-2">สถานที่หาย</h2>
        <p className="text-[16px] lg:text-xl mb-5">{pet.missingLocation} </p>
        <p className="text-[16px] lg:text-xl mb-5">{pet.lostLocation}</p>

        <PetMap lat={pet.lat} lng={pet.lng} zoom={15} />

        <p className="text-lg lg:text-2xl lg:my-8 my-5 sm:my-5">
          ช่องทางการติดต่อ
        </p>
        <div className="inline-flex gap-8 sm:gap-12 xl:p-8 p-5 bg-[#AFDAFB] rounded-xl items-center sm:mb-20 mb-10 w-auto">
          <div className="flex justify-center items-start">
            <img
              src="/all/owen.png"
              alt="logo"
              className="lg:w-32 lg:h-32 xl:w-36 xl:h-36 2xl:w-40 2xl:h-40 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover"
            />
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[16px] lg:text-lg mb-1">ชื่อ</p>
              <input
                type="text"
                value={name}
                readOnly
                className="w-full bg-white border border-gray-300 rounded-xl lg:px-4 px-2 lg:py-2 py-1.5 lg:text-[16px] sm:text-sm text-xs"
              />
            </div>

            <div>
              <p className="text-[16px] lg:text-lg mb-1">เบอร์ติดต่อ</p>
              <input
                type="tel"
                value={phone}
                readOnly
                className="w-full bg-white border border-gray-300 rounded-xl lg:px-4 px-2 lg:py-2 py-1.5 lg:text-[16px] sm:text-sm text-xs"
              />
            </div>

            <div>
              <p className="text-[16px] lg:text-lg mb-1">Facebook</p>
              <input
                type="text"
                value={facebook}
                readOnly
                className="w-full bg-white border border-gray-300 rounded-xl lg:px-4 px-2 lg:py-2 py-1.5 lg:text-[16px] sm:text-sm text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}