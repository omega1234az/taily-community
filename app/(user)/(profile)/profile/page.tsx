"use client";

import React, { useState, useEffect } from "react";
import InputField from "@/app/component/InputField";
import { useSession, signIn } from "next-auth/react";
import { getUserProfile, saveProfile } from "@/app/utils/Profiles";

// Interface สำหรับข้อมูลจังหวัด อำเภอ ตำบล
interface Province {
  id: number;
  name_th: string;
  name_en: string;
  amphure: Amphure[];
}

interface Amphure {
  id: number;
  name_th: string;
  name_en: string;
  province_id: number;
  tambon: Tambon[];
}

interface Tambon {
  id: number;
  name_th: string;
  name_en: string;
  amphure_id: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State สำหรับจัดการ Province, Amphure, Tambon
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [amphures, setAmphures] = useState<Amphure[]>([]);
  const [tambons, setTambons] = useState<Tambon[]>([]);
  const [selectedIds, setSelectedIds] = useState({
    province_id: undefined as number | undefined,
    amphure_id: undefined as number | undefined,
    tambon_id: undefined as number | undefined,
  });

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
    houseNumber: "",
    street: "",
    image: "",
    village: "",
    subDistrict: "",
    district: "",
    province: "",
  });



  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      signIn();
      return;
    }

    fetchUserData();
  }, [status]);

  // ฟังก์ชันหาจังหวัด อำเภอ ตำบล จากชื่อ
  const findLocationIds = (
    provinceName: string,
    districtName: string,
    subDistrictName: string
  ) => {
    const province = provinces.find((p) => p.name_th === provinceName);
    if (!province)
      return {
        province_id: undefined,
        amphure_id: undefined,
        tambon_id: undefined,
      };

    const amphure = province.amphure.find((a) => a.name_th === districtName);
    if (!amphure)
      return {
        province_id: province.id,
        amphure_id: undefined,
        tambon_id: undefined,
      };

    const tambon = amphure.tambon.find((t) => t.name_th === subDistrictName);

    return {
      province_id: province.id,
      amphure_id: amphure.id,
      tambon_id: tambon ? tambon.id : undefined,
    };
  };

  const fetchUserData = async () => {
    try {
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
          houseNumber: userData.houseNumber || "",
          street: userData.street || "",
          village: userData.village || "",
          subDistrict: userData.subDistrict || "",
          district: userData.district || "",
          province: userData.province || "",
        });

        if (
          provinces.length > 0 &&
          userData.province &&
          userData.district &&
          userData.subDistrict
        ) {
          const ids = findLocationIds(
            userData.province,
            userData.district,
            userData.subDistrict
          );
          setSelectedIds(ids);

          const province = provinces.find((p) => p.id === ids.province_id);
          if (province) {
            setAmphures(province.amphure);

            const amphure = province.amphure.find(
              (a) => a.id === ids.amphure_id
            );
            if (amphure) {
              setTambons(amphure.tambon);
            }
          }
        }

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

  // เรียก useEffect เมื่อ provinces หรือ user เปลี่ยน
  useEffect(() => {
    if (provinces.length > 0 && user) {
      const ids = findLocationIds(
        formData.province,
        formData.district,
        formData.subDistrict
      );
      setSelectedIds(ids);

      const province = provinces.find((p) => p.id === ids.province_id);
      if (province) {
        setAmphures(province.amphure);

        const amphure = province.amphure.find((a) => a.id === ids.amphure_id);
        if (amphure) {
          setTambons(amphure.tambon);
        }
      }
    }
  }, [provinces, user]);

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
    };

  // จัดการ dropdown จังหวัด อำเภอ ตำบล (เหมือนเดิม)
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = e.target.value ? Number(e.target.value) : undefined;

    setAmphures([]);
    setTambons([]);
    setSelectedIds({
      province_id: provinceId,
      amphure_id: undefined,
      tambon_id: undefined,
    });

    if (provinceId) {
      const province = provinces.find((p) => p.id === provinceId);
      if (province) {
        setAmphures(province.amphure);
        setFormData((prev) => ({
          ...prev,
          province: province.name_th,
          district: "",
          subDistrict: "",
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        province: "",
        district: "",
        subDistrict: "",
      }));
    }
  };

  const handleAmphureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const amphureId = e.target.value ? Number(e.target.value) : undefined;

    setTambons([]);
    setSelectedIds((prev) => ({
      ...prev,
      amphure_id: amphureId,
      tambon_id: undefined,
    }));

    if (amphureId) {
      const amphure = amphures.find((a) => a.id === amphureId);
      if (amphure) {
        setTambons(amphure.tambon);
        setFormData((prev) => ({
          ...prev,
          district: amphure.name_th,
          subDistrict: "",
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        district: "",
        subDistrict: "",
      }));
    }
  };

  const handleTambonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tambonId = e.target.value ? Number(e.target.value) : undefined;

    setSelectedIds((prev) => ({
      ...prev,
      tambon_id: tambonId,
    }));

    if (tambonId) {
      const tambon = tambons.find((t) => t.id === tambonId);
      if (tambon) {
        setFormData((prev) => ({
          ...prev,
          subDistrict: tambon.name_th,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        subDistrict: "",
      }));
    }
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
        houseNumber: user.houseNumber || "",
        street: user.street || "",
        village: user.village || "",
        subDistrict: user.subDistrict || "",
        district: user.district || "",
        province: user.province || "",
      });

      if (provinces.length > 0) {
        const ids = findLocationIds(
          user.province,
          user.district,
          user.subDistrict
        );
        setSelectedIds(ids);

        const province = provinces.find((p) => p.id === ids.province_id);
        if (province) {
          setAmphures(province.amphure);

          const amphure = province.amphure.find((a) => a.id === ids.amphure_id);
          if (amphure) {
            setTambons(amphure.tambon);
          }
        }
      }

      setImagePreview(user.image || "");
      setImageFile(null);
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // เตรียม formData สำหรับส่งข้อมูลแบบ multipart/form-data
      const data = new FormData();
      data.append("name", formData.name);
      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("phone", formData.phone);
      data.append("houseNumber", formData.houseNumber);
      data.append("street", formData.street);
      data.append("village", formData.village);
      data.append("subDistrict", formData.subDistrict);
      data.append("district", formData.district);
      data.append("province", formData.province);

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
          houseNumber: formData.houseNumber,
          street: formData.street,
          village: formData.village,
          subDistrict: formData.subDistrict,
          district: formData.district,
          province: formData.province,
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

  // Component Dropdown
  const DropdownField = ({
    label,
    value,
    onChange,
    options,
    disabled = false,
    placeholder = "เลือก...",
  }: {
    label: string;
    value: number | undefined;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { id: number; name_th: string; name_en: string }[];
    disabled?: boolean;
    placeholder?: string;
  }) => (
    <div className="flex flex-col items-start xl:w-[40%] w-[70%]">
      <p className="mb-2 sm:text-lg xl:text-xl">{label}</p>
      <select
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className={`w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 ${
          disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name_th}
          </option>
        ))}
      </select>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
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
      <div className="flex  gap-3 mt-6 ml-5 sm:ml-10 md:ml-10 lg:mr-10 xl:ml-14 2xl:ml-20">
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
