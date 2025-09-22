"use client";

import React, { useState, useEffect } from "react";
import InputField from "@/app/component/InputField";
import { useSession, signIn } from "next-auth/react";
import { getUserProfile, saveProfile } from "@/app/utils/Profiles";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // สำหรับเก็บไฟล์รูปภาพที่อัปโหลดใหม่ และ preview URL
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    image: "",
  });

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      signIn();
      return;
    }

    fetchUserData();
  }, [status]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const userData = await getUserProfile();
      if (userData) {
        setUser(userData);
        setFormData({
          name: userData.name || "",
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          image: userData.image || "",
          phone: userData.phone || "",
        });
        if (userData.image) {
          setImagePreview(userData.image);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
    };

  // จัดการการเปลี่ยนรูปภาพ
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        image: user.image || "",
        phone: user.phone || "",
      });
      setImagePreview(user.image || "");
      setImageFile(null);
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("phone", formData.phone);
      if (imageFile) {
        data.append("image", imageFile);
      }

      const result = await saveProfile(data);

      if (result.success) {
        const updatedUser = {
          ...user,
          name: formData.name,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          image: imageFile ? imagePreview : user.image,
        };
        setUser(updatedUser);
        setIsEditing(false);
        window.location.reload();
      } else {
        alert(result.message || "บันทึกข้อมูลไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse p-5">
        {/* Header Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
          <div className="h-6 bg-gray-300 rounded w-32"></div>
        </div>

        {/* Profile Image Skeleton */}
        <div className="flex flex-col items-start mb-6">
          <div className="h-6 bg-gray-300 rounded w-24 mb-2"></div>
          <div className="w-28 h-28 rounded-full bg-gray-300"></div>
        </div>

        {/* Form Fields Skeleton */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-start xl:w-[40%] w-[70%]">
            <div className="h-6 bg-gray-300 rounded w-24 mb-2"></div>
            <div className="w-full h-10 bg-gray-300 rounded"></div>
          </div>
          <div className="lg:flex justify-between gap-6 md:w-full">
            <div className="flex flex-col items-start xl:w-[40%] w-[70%]">
              <div className="h-6 bg-gray-300 rounded w-24 mb-2"></div>
              <div className="w-full h-10 bg-gray-300 rounded"></div>
            </div>
            <div className="flex flex-col items-start xl:w-[40%] w-[70%]">
              <div className="h-6 bg-gray-300 rounded w-24 mb-2"></div>
              <div className="w-full h-10 bg-gray-300 rounded"></div>
            </div>
          </div>
          <div className="lg:flex justify-between gap-6 md:w-full">
            <div className="flex flex-col items-start xl:w-[40%] w-[70%]">
              <div className="h-6 bg-gray-300 rounded w-24 mb-2"></div>
              <div className="w-full h-10 bg-gray-300 rounded"></div>
            </div>
            <div className="flex flex-col items-start xl:w-[40%] w-[70%]">
              <div className="h-6 bg-gray-300 rounded w-24 mb-2"></div>
              <div className="w-full h-10 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>

        {/* Buttons Skeleton */}
        <div className="flex gap-3 mt-6">
          <div className="h-10 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">กรุณาเข้าสู่ระบบเพื่อดูข้อมูลโปรไฟล์</p>
      </div>
    );
  }

  return (
    <div>
      <title>ประวัติส่วนตัว</title>
      <div className="flex items-center gap-2">
        <svg
          width="19"
          height="15"
          viewBox="0 0 19 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-2.5 h-2.5 sm:w-3 sm:h-3 xl:w-3.5 xl:h-3.5 2xl:w-6 2xl:h-10"
        >
          <ellipse cx="9.5" cy="7.5" rx="9.5" ry="7.5" fill="#7CBBEB" />
        </svg>
        <h1 className="sm:text-lg xl:text-2xl font-bold">ประวัติส่วนตัว</h1>
      </div>

      <div className="ml-5 sm:ml-10 md:ml-10 lg:mr-10 xl:ml-14 2xl:ml-20 mt-6 flex flex-col gap-6 sm:text-md xl:text-xl">
        {/* รูปโปรไฟล์ */}
        <div className="mt-4 flex flex-col items-start">
          <p className="mb-2 sm:text-lg xl:text-xl">รูปโปรไฟล์</p>
          <div className="flex items-center gap-4">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border border-gray-300"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 border border-gray-300">
                ไม่มีรูป
              </div>
            )}
            {isEditing && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isSaving}
              />
            )}
          </div>
        </div>
        {/* ชื่อเต็ม */}
        <InputField
          label="ชื่อเล่น"
          value={formData.name}
          onChange={handleChange("name")}
          disabled={!isEditing || isSaving}
        />

        <div className="lg:flex justify-between gap-6 md:w-full">
          <InputField
            label="ชื่อ"
            value={formData.firstName}
            onChange={handleChange("firstName")}
            disabled={!isEditing || isSaving}
          />
          <InputField
            label="สกุล"
            value={formData.lastName}
            onChange={handleChange("lastName")}
            disabled={!isEditing || isSaving}
          />
        </div>

        <div className="lg:flex justify-between gap-6 md:w-full">
          <InputField
            label="อีเมล"
            type="email"
            value={formData.email}
            disabled={true}
            onChange={() => {}}
          />
          <InputField
            label="เบอร์โทร"
            type="tel"
            value={formData.phone}
            onChange={handleChange("phone")}
            disabled={!isEditing || isSaving}
          />
        </div>
      </div>

      {/* ปุ่มแก้ไข/บันทึก/ยกเลิก */}
      <div className="flex gap-3 mt-6 ml-5 sm:ml-10 md:ml-10 lg:mr-10 xl:ml-14 2xl:ml-20">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-[#7CBBEB] text-white hover:bg-sky-600 shadow-md rounded-xl px-6 py-1 sm:text-lg xl:text-xl cursor-pointer"
          >
            แก้ไข
          </button>
        ) : (
          <>
            <button
              className={`bg-green-500 text-white py-2 px-6 rounded-md hover:bg-green-600 transition ${
                isSaving ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            <button
              className="bg-gray-400 text-white py-2 px-6 rounded-md hover:bg-gray-500 transition"
              onClick={handleCancel}
              disabled={isSaving}
            >
              ยกเลิก
            </button>
          </>
        )}
      </div>
    </div>
  );
}