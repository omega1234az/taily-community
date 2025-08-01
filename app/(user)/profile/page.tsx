"use client";

import type React from "react";

import { useState, useEffect } from "react";
import InputField from "@/app/component/InputField";
import { useSession, signIn } from "next-auth/react";
import { getUserProfile, saveProfile } from "@/app/utils/Profiles"; // import ฟังก์ชันจาก Profiles.ts

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
    tambon_id: undefined as number | undefined
  });

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

  // โหลดข้อมูลจังหวัดจาก API
  useEffect(() => {
    const loadProvinceData = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province_with_amphure_tambon.json"
        );
        const result = await response.json();
        setProvinces(result);
      } catch (error) {
        console.error("Failed to fetch province data:", error);
      }
    };

    loadProvinceData();
  }, []);

  useEffect(() => {
    if (status === "loading") return; // ยังโหลด session อยู่

    if (status === "unauthenticated") {
      signIn(); // redirect ไปหน้า login
      return;
    }

    // เมื่อ authenticated แล้วจึงเรียกข้อมูลผู้ใช้
    fetchUserData();
  }, [status]);

  // ฟังก์ชันหาจังหวัด อำเภอ ตำบล จากชื่อ
  const findLocationIds = (provinceName: string, districtName: string, subDistrictName: string) => {
    const province = provinces.find(p => p.name_th === provinceName);
    if (!province) return { province_id: undefined, amphure_id: undefined, tambon_id: undefined };

    const amphure = province.amphure.find(a => a.name_th === districtName);
    if (!amphure) return { province_id: province.id, amphure_id: undefined, tambon_id: undefined };

    const tambon = amphure.tambon.find(t => t.name_th === subDistrictName);
    
    return {
      province_id: province.id,
      amphure_id: amphure.id,
      tambon_id: tambon ? tambon.id : undefined
    };
  };

  // ย้ายฟังก์ชัน fetchUserData ออกมาจาก useEffect
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

        // ตั้งค่า dropdown ตามข้อมูลที่มีอยู่
        if (provinces.length > 0 && userData.province && userData.district && userData.subDistrict) {
          const ids = findLocationIds(userData.province, userData.district, userData.subDistrict);
          setSelectedIds(ids);
          
          // ตั้งค่า amphures และ tambons
          const province = provinces.find(p => p.id === ids.province_id);
          if (province) {
            setAmphures(province.amphure);
            
            const amphure = province.amphure.find(a => a.id === ids.amphure_id);
            if (amphure) {
              setTambons(amphure.tambon);
            }
          }
        }
      }
      console.log(userData);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // เรียกใช้ fetchUserData เมื่อ provinces โหลดเสร็จ
  useEffect(() => {
    if (provinces.length > 0 && user) {
      const ids = findLocationIds(formData.province, formData.district, formData.subDistrict);
      setSelectedIds(ids);
      
      const province = provinces.find(p => p.id === ids.province_id);
      if (province) {
        setAmphures(province.amphure);
        
        const amphure = province.amphure.find(a => a.id === ids.amphure_id);
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

  // ฟังก์ชันจัดการ dropdown สำหรับ จังหวัด อำเภอ ตำบล
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = e.target.value ? Number(e.target.value) : undefined;
    
    // รีเซ็ต amphure และ tambon
    setAmphures([]);
    setTambons([]);
    setSelectedIds({
      province_id: provinceId,
      amphure_id: undefined,
      tambon_id: undefined
    });

    if (provinceId) {
      const province = provinces.find(p => p.id === provinceId);
      if (province) {
        setAmphures(province.amphure);
        setFormData(prev => ({
          ...prev,
          province: province.name_th,
          district: "",
          subDistrict: ""
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        province: "",
        district: "",
        subDistrict: ""
      }));
    }
  };

  const handleAmphureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const amphureId = e.target.value ? Number(e.target.value) : undefined;
    
    // รีเซ็ต tambon
    setTambons([]);
    setSelectedIds(prev => ({
      ...prev,
      amphure_id: amphureId,
      tambon_id: undefined
    }));

    if (amphureId) {
      const amphure = amphures.find(a => a.id === amphureId);
      if (amphure) {
        setTambons(amphure.tambon);
        setFormData(prev => ({
          ...prev,
          district: amphure.name_th,
          subDistrict: ""
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        district: "",
        subDistrict: ""
      }));
    }
  };

  const handleTambonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tambonId = e.target.value ? Number(e.target.value) : undefined;
    
    setSelectedIds(prev => ({
      ...prev,
      tambon_id: tambonId
    }));

    if (tambonId) {
      const tambon = tambons.find(t => t.id === tambonId);
      if (tambon) {
        setFormData(prev => ({
          ...prev,
          subDistrict: tambon.name_th
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        subDistrict: ""
      }));
    }
  };

  const handleCancel = () => {
    // รีเซ็ตข้อมูลกลับไปเป็นค่าเริ่มต้น
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

      // รีเซ็ต dropdown selections
      if (provinces.length > 0) {
        const ids = findLocationIds(user.province, user.district, user.subDistrict);
        setSelectedIds(ids);
        
        const province = provinces.find(p => p.id === ids.province_id);
        if (province) {
          setAmphures(province.amphure);
          
          const amphure = province.amphure.find(a => a.id === ids.amphure_id);
          if (amphure) {
            setTambons(amphure.tambon);
          }
        }
      }
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

  // Component สำหรับ Dropdown
  const DropdownField = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  placeholder = "เลือก..."
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
        {/* แถวที่ 1: บ้านเลขที่ และถนน */}
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
        
        {/* แถวที่ 2: หมู่ และตำบล */}
        <div className="lg:flex justify-between gap-6 md:w-full">
          <InputField
            label="หมู่"
            value={formData.village}
            onChange={handleChange("village")}
            disabled={!isEditing || isSaving}
          />
          <DropdownField
            label="ตำบล"
            value={selectedIds.tambon_id}
            onChange={handleTambonChange}
            options={tambons}
            disabled={!isEditing || isSaving || !selectedIds.amphure_id}
            placeholder={!selectedIds.amphure_id ? "เลือกอำเภอก่อน" : "เลือกตำบล"}
          />
        </div>
        
        {/* แถวที่ 3: อำเภอ และจังหวัด */}
        <div className="lg:flex justify-between gap-6 md:w-full">
          <DropdownField
            label="อำเภอ"
            value={selectedIds.amphure_id}
            onChange={handleAmphureChange}
            options={amphures}
            disabled={!isEditing || isSaving || !selectedIds.province_id}
            placeholder={!selectedIds.province_id ? "เลือกจังหวัดก่อน" : "เลือกอำเภอ"}
          />
          <DropdownField
            label="จังหวัด"
            value={selectedIds.province_id}
            onChange={handleProvinceChange}
            options={provinces}
            disabled={!isEditing || isSaving}
            placeholder="เลือกจังหวัด"
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