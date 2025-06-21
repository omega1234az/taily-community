"use client";

import type React from "react";

import { useState, useEffect } from "react";
import InputField from "@/app/component/InputField";
import { useSession, signIn } from "next-auth/react";
import { getUserProfile, saveProfile } from "@/app/utils/Profiles"; // import ฟังก์ชันจาก Profiles.ts

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    houseNumber: "",
    street: "",
    village: "",
    subDistrict: "",
    district: "",
    province: "",
  });

  useEffect(() => {
    if (status === "loading") return; // ยังโหลด session อยู่

    if (status === "unauthenticated") {
      signIn(); // redirect ไปหน้า login
      return;
    }

    // เมื่อ authenticated แล้วจึงเรียกข้อมูลผู้ใช้
    fetchUserData();
  }, [status]);

  // ย้ายฟังก์ชัน fetchUserData ออกมาจาก useEffect
  const fetchUserData = async () => {
    try {
      const userData = await getUserProfile();
      if (userData) {
        setUser(userData);

        setFormData({
          name : userData.name || "",
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          houseNumber: userData.houseNumber || "",
          street: userData.street || "",
          village: userData.village || "",
          subDistrict: userData.subDistrict || "",
          district: userData.district || "",
          province: userData.province || "",
        });
      }
      console.log(userData);
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

  const handleCancel = () => {
    // รีเซ็ตข้อมูลกลับไปเป็นค่าเริ่มต้น
    if (user) {
      const nameParts = user.name ? user.name.split(" ") : ["", ""];

      setFormData({
        name: user.name || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        houseNumber: user.houseNumber || "",
        street: user.street || "",
        village: user.village || "",
        subDistrict: user.subDistrict || "",
        district: user.district || "",
        province: user.province || "",
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await saveProfile(formData);
      if (result.success) {
        // อัปเดตข้อมูล user ในหน้าจอเมื่อบันทึกสำเร็จ
        const updatedUser = {
          ...user,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
          houseNumber: formData.houseNumber,
          street: formData.street,
          village: formData.village,
          subDistrict: formData.subDistrict,
          district: formData.district,
          province: formData.province,
        };
        setUser(updatedUser);
        setIsEditing(false);
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

  // แสดงหน้าโหลดขณะดึงข้อมูล
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  // แสดงข้อความเมื่อไม่พบข้อมูลผู้ใช้
  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">กรุณาเข้าสู่ระบบเพื่อดูข้อมูลโปรไฟล์</p>
      </div>
    );
  }

  return (
    <div>
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
            onChange={handleChange("email")}
            disabled={true}
          />{" "}
          {/* email ไม่ให้แก้ไข */}
          <InputField
            label="เบอร์โทร"
            type="tel"
            value={formData.phone}
            onChange={handleChange("phone")}
            disabled={!isEditing || isSaving}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-6">
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
        <h1 className="sm:text-lg xl:text-2xl font-bold">ที่อยู่</h1>
      </div>

      <div className="ml-5 sm:ml-10 md:ml-10 lg:mr-10 xl:ml-14 2xl:ml-20 mt-6 flex flex-col gap-4 sm:text-md xl:text-xl">
        <div className="lg:flex justify-between gap-6 md:w-full">
          <InputField
            label="บ้านเลขที่"
            value={formData.houseNumber}
            onChange={handleChange("houseNumber")}
            disabled={!isEditing || isSaving}
          />
          <InputField
            label="ถนน"
            value={formData.street}
            onChange={handleChange("street")}
            disabled={!isEditing || isSaving}
          />
        </div>
        <div className="lg:flex justify-between gap-6 md:w-full">
          <InputField
            label="หมู่"
            value={formData.village}
            onChange={handleChange("village")}
            disabled={!isEditing || isSaving}
          />
          <InputField
            label="ตำบล"
            value={formData.subDistrict}
            onChange={handleChange("subDistrict")}
            disabled={!isEditing || isSaving}
          />
        </div>
        <div className="lg:flex justify-between gap-6 md:w-full">
          <InputField
            label="อำเภอ"
            value={formData.district}
            onChange={handleChange("district")}
            disabled={!isEditing || isSaving}
          />
          <InputField
            label="จังหวัด"
            value={formData.province}
            onChange={handleChange("province")}
            disabled={!isEditing || isSaving}
          />
        </div>
      </div>

      <div className="ml-20 mt-5">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-[#7CBBEB] text-white hover:bg-sky-600 shadow-md rounded-xl px-6 py-1 sm:text-lg xl:text-xl cursor-pointer"
            disabled={isSaving}
          >
            แก้ไข
          </button>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={handleCancel}
              className="bg-gray-400 text-white hover:bg-gray-600 shadow-md rounded-xl px-6 py-1 sm:text-lg xl:text-xl cursor-pointer"
              disabled={isSaving}
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              className="bg-[#7CBBEB] text-white hover:bg-sky-600 shadow-md rounded-xl px-6 py-1 sm:text-lg xl:text-xl cursor-pointer"
              disabled={isSaving}
            >
              {isSaving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
