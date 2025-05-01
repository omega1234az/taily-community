"use client";

import InputField from '@/app/component/InputField';
import { useState } from "react";

export default function EditButtons() {
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    houseNumber: "",
    street: "",
    village: "",
    subDistrict: "",
    district: "",
    province: ""
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    console.log("ข้อมูลที่บันทึก:", formData);
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <svg width="19" height="15" viewBox="0 0 19 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 sm:w-3 sm:h-3 xl:w-3.5 xl:h-3.5 2xl:w-6 2xl:h-10">
          <ellipse cx="9.5" cy="7.5" rx="9.5" ry="7.5" fill="#7CBBEB" />
        </svg>
        <h1 className="sm:text-lg xl:text-2xl font-bold">ประวัติส่วนตัว</h1>
      </div>

      <div className="ml-5 sm:ml-10 md:ml-10 lg:mr-10 xl:ml-14 2xl:ml-20 mt-6 flex flex-col gap-6 sm:text-md xl:text-xl">
        <div className="lg:flex justify-between gap-6 md:w-full">
          <InputField label="ชื่อ" value={formData.firstName} onChange={handleChange("firstName")} disabled={!isEditing} />
          <InputField label="สกุล" value={formData.lastName} onChange={handleChange("lastName")} disabled={!isEditing} />
        </div>
        <div className="lg:flex justify-between gap-6 md:w-full">
          <InputField label="อีเมล" type="email" value={formData.email} onChange={handleChange("email")} disabled={!isEditing} />
          <InputField label="เบอร์โทร" type="tel" value={formData.phone} onChange={handleChange("phone")} disabled={!isEditing} />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-6">
        <svg width="19" height="15" viewBox="0 0 19 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 sm:w-3 sm:h-3 xl:w-3.5 xl:h-3.5 2xl:w-6 2xl:h-10">
          <ellipse cx="9.5" cy="7.5" rx="9.5" ry="7.5" fill="#7CBBEB" />
        </svg>
        <h1 className="sm:text-lg xl:text-2xl font-bold">ที่อยู่</h1>
      </div>

      <div className="ml-5 sm:ml-10 md:ml-10 lg:mr-10 xl:ml-14 2xl:ml-20 mt-6 flex flex-col gap-4 sm:text-md xl:text-xl">
        <div className="lg:flex justify-between gap-6 md:w-full">
          <InputField label="บ้านเลขที่" value={formData.houseNumber} onChange={handleChange("houseNumber")} disabled={!isEditing} />
          <InputField label="ถนน" value={formData.street} onChange={handleChange("street")} disabled={!isEditing} />
        </div>
        <div className="lg:flex justify-between gap-6 md:w-full">
          <InputField label="หมู่" value={formData.village} onChange={handleChange("village")} disabled={!isEditing} />
          <InputField label="ตำบล" value={formData.subDistrict} onChange={handleChange("subDistrict")} disabled={!isEditing} />
        </div>
        <div className="lg:flex justify-between gap-6 md:w-full">
          <InputField label="อำเภอ" value={formData.district} onChange={handleChange("district")} disabled={!isEditing} />
          <InputField label="จังหวัด" value={formData.province} onChange={handleChange("province")} disabled={!isEditing} />
        </div>
      </div>

      <div className="ml-20 mt-5">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-[#7CBBEB] text-white hover:bg-sky-600 shadow-md rounded-xl px-6 py-1 sm:text-lg xl:text-xl cursor-pointer"
          >
            แก้ไข
          </button>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={handleCancel}
              className="bg-gray-400 text-white hover:bg-gray-600 shadow-md rounded-xl px-6 py-1 sm:text-lg xl:text-xl cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              className="bg-[#7CBBEB] text-white hover:bg-sky-600 shadow-md rounded-xl px-6 py-1 sm:text-lg xl:text-xl cursor-pointer"
            >
              บันทึก
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
