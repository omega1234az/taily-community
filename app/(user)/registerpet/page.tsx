"use client";

import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPet() {
  const router = useRouter();

  // ตัวแปรสำหรับจัดการ dropdown
  const [isGenderDropdownVisible, setGenderDropdownVisible] = useState(false);
  const [isNeuteredDropdownVisible, setNeuteredDropdownVisible] =
    useState(false);
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  // ตัวแปรสำหรับรูปภาพ
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);
  const mainInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  // ตัวแปรสำหรับ dropdown สี
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // ตัวแปรสีทั้งหมด
  const colors = [
    { name: "ขาว", code: "bg-white" },
    { name: "เหลือง", code: "bg-yellow-300" },
    { name: "เทา", code: "bg-gray-500" },
    { name: "น้ำตาล", code: "bg-[#866261]" },
    { name: "ชมพู", code: "bg-[#e68181]" },
    { name: "น้ำเงิน", code: "bg-blue-800" },
    { name: "แดง", code: "bg-red-600" },
    { name: "เขียว", code: "bg-green-600" },
    { name: "ฟ้า", code: "bg-sky-400" },
    { name: "ส้ม", code: "bg-orange-500" },
    { name: "ไม่มีขน", code: "bg-pink-200" },
    { name: "ม่วง", code: "bg-fuchsia-500" },
    { name: "ดำ", code: "bg-black" },
  ];

  // กำหนดสถานะฟอร์ม
  const [isEditing, setIsEditing] = useState(true);
  const [selectedType, setSelectedType] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    type: "",
    breed: "",
    neutered: "",
    color: "",
    mark: "",
    details: "",
  });

  useEffect(() => {
    if (formData.color) {
      const parsed = formData.color
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
      setSelectedColors(parsed);
    }
  }, [formData.color]);

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const handleGalleryImageClick = (index: number) => {
    if (isEditing) {
      galleryInputRefs[index]?.current?.click();
    } else {
      setGalleryImages((prev) => {
        const newGallery = [...prev];
        const temp = newGallery[index];
        newGallery[index] = mainImage;
        setMainImage(temp);
        return newGallery;
      });
    }
  };

  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (mainImage) URL.revokeObjectURL(mainImage);
      setMainImage(URL.createObjectURL(file));
    }
  };

  const handleGalleryImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (galleryImages[index]) URL.revokeObjectURL(galleryImages[index]!);
      const newImages = [...galleryImages];
      newImages[index] = URL.createObjectURL(file);
      setGalleryImages(newImages);
    }
  };

  const handleSelectGender = (gender: string) => {
    setFormData((prevData) => ({ ...prevData, gender }));
    setGenderDropdownVisible(false);
  };

  const handleSelectNeutered = (neutered: string) => {
    const value = neutered === "ทำหมันแล้ว" ? "1" : "0";
    setFormData((prevData) => ({ ...prevData, neutered: value }));
    setNeuteredDropdownVisible(false);
  };

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    setFormData((prevData) => ({ ...prevData, type }));
    setDropdownVisible(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "age" && !/^\d*$/.test(value)) return;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // เพิ่มบังคับกรอกข้อมูล
  const fieldLabels: Record<string, string> = {
    name: "ชื่อ",
    age: "อายุ",
    gender: "เพศ",
    type: "ประเภท",
    breed: "สายพันธุ์",
    neutered: "สถานะการทำหมัน",
    mark: "ลักษณะเด่น",
    details: "รายละเอียด",
  };

  const validateForm = () => {
    const requiredFields = [
      "name",
      "age",
      "gender",
      "type",
      "breed",
      "neutered",
      "mark",
      "details",
    ];

    for (const field of requiredFields) {
      const value = formData[field as keyof typeof formData];
      if (!value || value.trim() === "") {
        alert(`กรุณากรอกข้อมูล: ${fieldLabels[field]}`);
        return false;
      }
    }

    if (selectedColors.length === 0) {
      alert("กรุณาเลือกสีของสัตว์เลี้ยงอย่างน้อย 1 สี");
      return false;
    }

    if (!mainInputRef.current?.files?.[0]) {
      alert("กรุณาเลือกรูปภาพหลักของสัตว์เลี้ยง");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("breed", formData.breed);
      form.append("gender", formData.gender);
      form.append("age", formData.age);
      form.append("description", formData.details);
      form.append("markings", formData.mark);
      form.append("isNeutered", formData.neutered === "1" ? "1" : "0");
      form.append("color", JSON.stringify(selectedColors));
      form.append("type", formData.type); // ✅ ส่งประเภท
      form.append(
        "sterilized",
        formData.neutered === "1" ? "ทำหมันแล้ว" : "ยังไม่ได้ทำหมัน"
      ); // ✅ ส่งสถานะการทำหมัน

      const speciesMapping: Record<string, number> = {
        แมว: 1,
        สุนัข: 2,
        นก: 3,
        หนู: 4,
        ชูก้าไรเดอร์: 5,
        เฟอร์ริต: 6,
        เม่นแคระ: 7,
        กระรอก: 8,
        กระต่าย: 9,
        งู: 10,
        อื่นๆ: 11,
      };

      const speciesId = speciesMapping[formData.type];
      form.append("speciesId", speciesId.toString());
      form.append("color", JSON.stringify(selectedColors));

      const files: File[] = [];
      if (mainInputRef.current?.files?.length) {
        files.push(mainInputRef.current.files[0]);
      }
      galleryInputRefs.forEach((ref) => {
        if (ref.current?.files?.length) {
          files.push(ref.current.files[0]);
        }
      });
      files.forEach((file) => form.append("images", file));

      const res = await fetch("/api/pets", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const err = await res.json();
        alert("เกิดข้อผิดพลาด: " + err.message);
        return;
      }

      const savedPet = await res.json();
      const encoded = encodeURIComponent(JSON.stringify(savedPet));
      router.push("/pet");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedColors([]);
    setFormData({
      name: "",
      age: "",
      gender: "",
      type: "",
      breed: "",
      neutered: "",
      color: "",
      mark: "",
      details: "",
    });
    router.push("/pet");
  };

  return (
    <div className="">
      <h1 className="text-2xl font-semibold">
        <span className="bg-[#EAD64D] py-5 pl-3 sm:py-7 sm:pl-5 xl:py-9 xl:pl-7 rounded-full">
          ลง
        </span>
        ทะเบียนสัตว์เลี้ยง
      </h1>

      <div className="flex flex-col lg:flex-row 2xl:gap-56 xl:gap-44 lg:gap-24 md:gap-5 sm:gap-8 lg:pl-12 md:pl-28 sm:pl-20 pl-7 pt-12">
        {/* รูปภาพ */}
        <div className="lg:pl-0 md:pl-28 sm:pl-24 pl-20 pb-5">
          <div className="your-container">
            {/* ปุ่มกดรูปหลัก */}
            <img
              src={mainImage || "/all/image.png"}
              alt="main"
              onClick={() => {
                if (isEditing) mainInputRef.current?.click();
              }}
              className="2xl:w-72 2xl:h-80 xl:w-64 xl:h-72 lg:w-60 lg:h-64 md:w-56 md:h-60 sm:w-48 sm:h-52 w-36 h-40 object-cover rounded-2xl cursor-pointer overflow-hidden"
            />
            <input
              ref={mainInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleMainImageChange}
            />

            {/* ปุ่มเลือกรูป gallery 3 ช่อง */}
            <div className="flex gap-2 pt-3">
              {[0, 1, 2].map((index) => (
                <div key={index}>
                  <img
                    src={galleryImages[index] || "/all/image.png"}
                    alt={`gallery-${index}`}
                    onClick={() => handleGalleryImageClick(index)}
                    className="2xl:w-22 2xl:h-22 xl:w-20 xl:h-20 lg:w-18 lg:h-18 md:w-17 md:h-17 sm:w-14 sm:h-14 w-11 h-11 object-cover cursor-pointer rounded-md"
                  />
                  <input
                    ref={galleryInputRefs[index]}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleGalleryImageChange(e, index)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ฟอร์มการลงทะเบียนสัตว์ */}
        <div className="flex flex-col w-full md:max-w-md sm:max-w-sm max-w-xs mb-2">
          <p className="sm:text-lg xl:text-xl text-md">ชื่อ</p>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full mt-1 sm:text-md xl:text-lg text-sm p-2 px-3 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
            disabled={!isEditing}
          />

          <div className="grid grid-cols-2 gap-4 mb-2">
            {/* ช่องกรอกอายุ */}
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl text-md">อายุ</p>
              <input
                type="text"
                className="w-full mt-1 sm:text-md xl:text-lg text-sm p-2 px-3 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
                disabled={!isEditing}
                value={formData.age}
                onChange={handleChange}
                name="age"
              />
            </div>

            {/* ช่องกรอกเพศ */}
            <div className="flex flex-col relative">
              <p className="sm:text-lg xl:text-xl text-md">เพศ</p>
              <input
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full mt-1  pr-10 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100  sm:text-md xl:text-lg text-sm p-2 px-3"
                disabled={!isEditing}
                onClick={() => {
                  if (isEditing)
                    setGenderDropdownVisible(!isGenderDropdownVisible);
                }}
                readOnly
              />
              <svg
                className={`absolute right-2 top-8  w-8 h-8 sm:w-10 sm:h-10 text-gray-500 cursor-pointer ${
                  !isEditing ? "pointer-events-none" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
                onClick={() =>
                  setGenderDropdownVisible(!isGenderDropdownVisible)
                }
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 
           1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              {isGenderDropdownVisible && (
                <div className="absolute top-20 left-0 z-10 w-full mt-1 xl:mt-2 bg-white shadow-md rounded-md border border-gray-300">
                  <ul>
                    {["เพศผู้", "เพศเมีย"].map((gender) => (
                      <li
                        key={gender}
                        className="px-4 py-2 text-xs sm:text-sm xl:text-base cursor-pointer hover:bg-gray-200 border-gray-300 border-b"
                        onClick={() => handleSelectGender(gender)}
                      >
                        {gender}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-2">
            {/* ช่องกรอกประเภท */}
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl text-md">ประเภท</p>
              <div className="relative w-full">
                <input
                  name="type"
                  value={formData.type}
                  readOnly // ✅ ห้ามพิมพ์
                  onClick={toggleDropdown}
                  className="w-full mt-1 sm:text-md xl:text-lg text-sm p-2 px-3 pr-10 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
                  disabled={!isEditing}
                />
                <svg
                  className={`absolute right-2 top-1 w-8 h-8 sm:w-10 sm:h-10 text-gray-500 cursor-pointer ${
                    !isEditing ? "pointer-events-none" : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  onClick={toggleDropdown}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 
       1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                {isDropdownVisible && (
                  <div className="absolute top-12 w-full z-10 mt-1 xl:mt-2 bg-white shadow-lg rounded-md border border-gray-300">
                    <ul>
                      {[
                        "แมว",
                        "สุนัข",
                        "นก",
                        "หนู",
                        "ชูก้าไรเดอร์",
                        "เฟอร์ริต",
                        "เม่นแคระ",
                        "กระรอก",
                        "กระต่าย",
                        "งู",
                        "อื่นๆ",
                      ].map((type) => (
                        <li
                          key={type}
                          className="px-4 py-2 text-sm cursor-pointer border-b border-gray-300 hover:bg-gray-200"
                          onClick={() => handleSelectType(type)}
                        >
                          {type}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* ช่องกรอกสายพันธุ์ */}
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl text-md">สายพันธุ์</p>
              <input
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                className="w-full mt-1 sm:text-md xl:text-lg text-sm p-2 px-3 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* ช่องกรอกทำหมัน */}
          <div className="grid  gap-4 mb-2">
            <div className="flex flex-col relative">
              <p className="sm:text-lg xl:text-xl">ทำหมัน</p>
              <input
                name="neutered"
                value={
                  formData.neutered === "1"
                    ? "ทำหมันแล้ว"
                    : formData.neutered === "0"
                    ? "ยังไม่ได้ทำหมัน"
                    : ""
                }
                onChange={handleChange}
                className="w-full mt-1 sm:text-md xl:text-lg text-sm p-2 px-3 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100 "
                disabled={!isEditing}
                onClick={() => {
                  if (isEditing)
                    setNeuteredDropdownVisible(!isNeuteredDropdownVisible);
                }}
                readOnly
              />
              <svg
                className={`absolute right-2 top-8  w-8 h-8 sm:w-10 sm:h-10 text-gray-500 cursor-pointer ${
                  !isEditing ? "pointer-events-none" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
                onClick={() =>
                  setNeuteredDropdownVisible(!isNeuteredDropdownVisible)
                }
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 
           1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>

              {isNeuteredDropdownVisible && (
                <div className="absolute top-20 left-0 z-10 mt-1 xl:mt-2 w-full bg-white shadow-md rounded-md border border-gray-300">
                  <ul>
                    {["ทำหมันแล้ว", "ยังไม่ได้ทำหมัน"].map((neutered) => (
                      <li
                        key={neutered}
                        className="px-4 py-2 text-xs sm:text-sm xl:text-base cursor-pointer hover:bg-gray-200 border-gray-300 border-b"
                        onClick={() => handleSelectNeutered(neutered)}
                      >
                        {neutered}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ช่องกรอกสี */}
            <div className="flex flex-wrap gap-3">
              {colors.map((color, idx) => {
                const isSelected = selectedColors.includes(color.name);
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (!isEditing) return;
                      setSelectedColors((prev) =>
                        prev.includes(color.name)
                          ? prev.filter((c) => c !== color.name)
                          : [...prev, color.name]
                      );
                      setFormData((prevData) => ({
                        ...prevData,
                        color: isSelected
                          ? selectedColors
                              .filter((c) => c !== color.name)
                              .join(",")
                          : [...selectedColors, color.name].join(","),
                      }));
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer ${
                      isSelected ? "bg-gray-400" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full  ${color.code}`}
                    ></div>
                    <span className="text-sm">{color.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ช่องกรอกลักษณะเด่น */}
          <p className="sm:text-lg xl:text-xl text-md">ลักษณะเด่น</p>
          <input
            name="mark"
            value={formData.mark}
            onChange={handleChange}
            className="w-full mt-1 sm:text-md xl:text-lg text-sm p-2 px-3 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
            disabled={!isEditing}
          />

          {/* ช่องกรอกรายละเอียด */}
          <p className="sm:text-lg xl:text-xl text-md">รายละเอียด</p>
          <textarea
            name="details"
            value={formData.details}
            onChange={handleChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md resize-none min-h-[110px] disabled:bg-gray-100"
            disabled={!isEditing}
          />

          {/* ปุ่ม */}
          <div className="flex justify-end ml-20 mt-5 mb-10">
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
          </div>
        </div>
      </div>
    </div>
  );
}
