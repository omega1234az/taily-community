"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamic import for PetMap to avoid SSR issues
const PetMap = dynamic(() => import("../../../component/PetMap"), {
  ssr: false,
});

type User = { id: string; name: string; image: string };
type Species = { id: number; name: string };
type Image = { id: number; url: string };

type FoundPet = {
  id: string;
  description: string;
  location: string;
  lat: number;
  lng: number;
  foundDate: string;
  speciesId: number;
  breed: string;
  gender: string;
  color: string[];

  distinctive: string;
  status: string;
  userId: string;
  views: number;
  createdAt: string;
  updatedAt: string;
  facebook?: string;
  phone?: string;
  images: Image[];
  user: User;
  species: Species;
};

export default function FoundPetPage() {
  const { id } = useParams();
  const router = useRouter();
  const [pet, setPet] = useState<FoundPet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
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
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmittingClue, setIsSubmittingClue] = useState(false);
  const [clueError, setClueError] = useState("");
  const [clueSuccess, setClueSuccess] = useState("");

  // Report form states
  const [reportType, setReportType] = useState<string>("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [reportMessage, setReportMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchPet() {
      try {
        setLoading(true);
        const res = await fetch(`/api/foundpet/${id}`);
        if (!res.ok) throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลสัตว์");
        const data = await res.json();
        setPet(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPet();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("คุณแน่ใจว่าจะลบสัตว์นี้?")) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/foundpet/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "ลบข้อมูลไม่สำเร็จ");
      alert("ลบข้อมูลสำเร็จ");
      router.push("/");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
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
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
    setClueError("");
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

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

  const handleSubmitClue = async () => {
    if (
      !witnessName.trim() ||
      !contactDetail.trim() ||
      !sightingDetail.trim()
    ) {
      setClueError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    setIsSubmittingClue(true);
    setClueError("");
    setClueSuccess("");
    try {
      const formData = new FormData();
      formData.append("witnessName", witnessName.trim());
      formData.append("contactDetails", contactDetail.trim());
      formData.append("sightingDetails", sightingDetail.trim());
      if (location.trim()) formData.append("location", location.trim());
      if (lat.trim()) formData.append("lat", lat.trim());
      if (lng.trim()) formData.append("lng", lng.trim());
      selectedImages.forEach((image) => formData.append("images", image));

      const response = await fetch(`/api/foundpet/${id}/clues`, {
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
      setClueError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่");
    } finally {
      setIsSubmittingClue(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportType) {
      alert("กรุณาเลือกเหตุผลในการรายงาน");
      return;
    }
    const reportData = {
      referenceType: "found_pet",
      referenceId: parseInt(id as string),
      reason: reportType === "อื่นๆ" ? reportMessage : reportType,
    };
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  if (loading) return <p className="p-4 text-center">กำลังโหลดข้อมูล...</p>;
  if (error) return <p className="p-4 text-center text-red-500">{error}</p>;
  if (!pet) return <p className="p-4 text-center">ไม่พบข้อมูลสัตว์</p>;

  return (
    <div className=" mx-auto p-4 space-y-6">
      {/* Header */}
      <title>หาเจ้าของ</title>
      <div className="flex items-center justify-between">
        <h1 className="lg:text-3xl text-2xl font-semibold">
          <span className="bg-[#EAD64D] lg:py-6 lg:pl-6 sm:py-5 sm:pl-5 py-3 pl-4 rounded-full">
            {pet.species.name.slice(0, 2)}
          </span>
          {pet.species.name.slice(2)}
        </h1>
        <div className="flex gap-3">
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

      {/* Report Popup */}
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
                    if (text !== "อื่นๆ") setReportMessage("");
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
              disabled={
                !reportType || (showOtherInput && !reportMessage.trim())
              }
            >
              ส่งรายงาน
            </button>
          </div>
        </div>
      )}

      {/* Image Gallery */}
      <div className="flex flex-col sm:gap-6 gap-4 lg:pt-14 pt-8">
        <div className="flex overflow-x-auto scrollbar-hide pl-6">
          <div className="flex gap-6">
            {pet.images.slice(0, 4).map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt={pet.description}
                className="2xl:w-[600px] 2xl:h-[420px] xl:w-[500px] xl:h-[350px] lg:w-[400px] lg:h-[300px] sm:w-[300px] sm:h-[200px] w-[287px] h-[180px] object-cover flex-shrink-0"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Pet Details */}
      <div className="flex flex-col lg:mt-2 text-lg lg:text-xl space-y-8">
        <div className="mt-10 flex flex-col sm:grid grid-cols-3 gap-5 md:gap-10 lg:gap-28 xl:gap-40 2xl:gap-52">
          <div className="mt-2 xl:mt-5 text-lg lg:text-2xl space-y-6">
            <p>
              <span className="text-lg lg:text-2xl">เพศ:</span>{" "}
              <span className="text-[16px] lg:text-xl">{pet.gender}</span>
            </p>
            <p>
              <span className="text-lg lg:text-2xl">ประเภท:</span>{" "}
              <span className="text-[16px] lg:text-xl">{pet.species.name}</span>
            </p>
            <p>
              <span className="text-lg lg:text-2xl">สายพันธุ์:</span>{" "}
              <span className="text-[16px] lg:text-xl">{pet.breed}</span>
            </p>
            <p>
              <span className="text-lg lg:text-2xl">สี:</span>{" "}
              <span className="text-[16px] lg:text-xl">
                {pet.color.join(", ")}
              </span>
            </p>
          </div>
          <div className="mt-2 xl:mt-5 space-y-1">
            <h2 className="text-lg lg:text-2xl">ลักษณะเด่น</h2>
            <p className="text-[16px] lg:text-lg mb-10">{pet.distinctive}</p>
            <h2 className="text-lg lg:text-2xl">วันที่พบ</h2>
            <p className="text-[16px] lg:text-lg">
              {new Date(pet.foundDate).toLocaleDateString()}
            </p>
          </div>
          <div className="mt-2 xl:mt-5 space-y-1">
            <h2 className="text-lg lg:text-2xl">สถานะ</h2>
            <p className="text-[16px] lg:text-lg mb-10 text-blue-600">
              {pet.status}
            </p>
            <h2 className="text-lg lg:text-2xl">ผู้เข้าชม</h2>
            <p className="text-[16px] lg:text-lg">{pet.views}</p>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="flex row space-x-3 lg:mt-8 mt-2">
          <img
            src="/home/f.png"
            alt="facebook"
            className="lg:w-14 sm:w-12 w-10 h-auto object-cover"
          />
          <img
            src="/home/l.png"
            alt="line"
            className="lg:w-14 sm:w-12 w-10 h-auto object-cover"
          />
          <img
            src="/home/x.png"
            alt="x"
            className="lg:w-14 sm:w-12 w-10 h-auto object-cover"
          />
          <img
            src="/home/ch.png"
            alt="chat"
            className="lg:w-14 sm:w-12 w-10 h-auto object-cover"
          />
        </div>

        {/* Location and Map */}
        <h2 className="text-lg lg:text-2xl lg:mt-8 mt-2">สถานที่พบ</h2>
        <p className="text-[16px] lg:text-xl mb-5">{pet.description}</p>
        <p className="text-[16px] lg:text-xl mb-5">{pet.location}</p>
        <PetMap lat={pet.lat} lng={pet.lng} zoom={15} />

        {/* Contact Section */}
        <p className="text-lg lg:text-2xl lg:my-8 my-5 sm:my-5">
          ช่องทางการติดต่อ
        </p>
        <div className="inline-flex gap-8 sm:gap-12 xl:p-8 p-5 bg-[#AFDAFB] rounded-xl items-center sm:mb-20 mb-10 w-auto">
          <div className="flex justify-center items-start">
            <img
              src={pet.user.image}
              alt={pet.user.name}
              className="lg:w-32 lg:h-32 xl:w-36 xl:h-36 2xl:w-40 2xl:h-40 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover"
            />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[16px] lg:text-lg mb-1">ชื่อ</p>
              <input
                type="text"
                value={pet.user.name}
                readOnly
                className="w-full bg-white border border-gray-300 rounded-xl lg:px-4 px-2 lg:py-2 py-1.5 lg:text-[16px] sm:text-sm text-xs"
              />
            </div>
            <div>
              <p className="text-[16px] lg:text-lg mb-1">เบอร์ติดต่อ</p>
              <input
                type="tel"
                value={pet.phone || "ไม่ระบุ"}
                readOnly
                className="w-full bg-white border border-gray-300 rounded-xl lg:px-4 px-2 lg:py-2 py-1.5 lg:text-[16px] sm:text-sm text-xs"
              />
            </div>
            <div>
              <p className="text-[16px] lg:text-lg mb-1">Facebook</p>
              <input
                type="text"
                value={pet.facebook || "ไม่ระบุ"}
                readOnly
                className="w-full bg-white border border-gray-300 rounded-xl lg:px-4 px-2 lg:py-2 py-1.5 lg:text-[16px] sm:text-sm text-xs"
              />
            </div>
          </div>
        </div>

        {/* Delete Button */}
      </div>
      {/* ส่วนโปสเตอร์ประกาศ (ซ่อนจากหน้าจอ แต่ยังอยู่ใน DOM สำหรับ print) */}
    </div>
  );
}
