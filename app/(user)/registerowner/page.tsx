"use client";

import React, { useState, useRef, ChangeEvent } from "react";

export default function Registerowner() {
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);

  const mainInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef(null),
    useRef(null),
  ];
  const handleGalleryImageClick = (index: number) => {
    if (isEditing) {
      // กดตอนแก้ไข ให้เปิด input รูปย่อยอันนั้น
      galleryInputRefs[index]?.current?.click();
    } else {
      // ตอนไม่แก้ไข ให้สลับรูปหลักกับรูปย่อย
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
    if (file) setMainImage(URL.createObjectURL(file));
  };

  const handleGalleryImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const newImages = [...galleryImages];
      newImages[index] = URL.createObjectURL(file);
      setGalleryImages(newImages);
    }
  };

  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [isEditing, setIsEditing] = useState(true);
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

  // เพิ่ม state สำหรับข้อมูลเพิ่มเติม
  const [missingLocation, setMissingLocation] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [facebook, setFacebook] = useState("");

  const toggleDropdown = () => {
    if (!isEditing) return; // ป้องกันเปิด dropdown ตอนไม่แก้ไข
    setDropdownVisible(!isDropdownVisible);
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

    if (name === "age" && !/^\d*$/.test(value)) {
      return;
    }

    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const [isNeuteredDropdownVisible, setNeuteredDropdownVisible] =
    useState(false);
  const handleSelectNeutered = (neutered: string) => {
    setFormData((prevData) => ({
      ...prevData,
      neutered: neutered === "ทำหมันแล้ว" ? "1" : "0",
    }));
    setNeuteredDropdownVisible(false);
  };

  const [gender, setGender] = useState<string>("");
  const [isGenderDropdownVisible, setGenderDropdownVisible] = useState(false);

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
  const handleSave = () => {
    setIsEditing(false);
    console.log("ข้อมูลที่บันทึก:", {
      formData,
      missingLocation,
      ownerName,
      contactNumber,
      facebook,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
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
    setMissingLocation("");
    setOwnerName("");
    setContactNumber("");
    setFacebook("");
  };

  return (
    <div>
      <h1 className="text-xl font-semibold">
        <span className="bg-[#EAD64D] py-5 pl-3 sm:py-7 sm:pl-5 xl:py-9 xl:pl-7 rounded-full">
          ลง
        </span>
        ทะเบียนหาเจ้าของ
      </h1>

      <div className="flex flex-col lg:flex-row 2xl:gap-56 xl:gap-44 lg:gap-24 md:gap-5 sm:gap-8 lg:pl-12 md:pl-28 sm:pl-20 pl-7 pt-18">
        {/* รูปภาพ */}
        <div className="lg:pl-0 md:pl-28 sm:pl-24 pl-20 pb-5">
          {/* รูปหลัก */}
          <div className="your-container">
            {/* ปุ่มกดรูปหลัก */}
            <img
              src={mainImage || "/all/image.png"}
              alt="main"
              onClick={() => {
                if (isEditing) mainInputRef.current?.click();
              }}
              className="2xl:w-72 2xl:h-80 xl:w-64 xl:h-72 lg:w-60 lg:h-64 md:w-56 md:h-60 sm:w-48 sm:h-56 w-36 h-48 object-cover rounded-2xl cursor-pointer overflow-hidden"
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
          <div className="grid grid-cols-2 gap-4 mb-2">
            {/* ช่องกรอกประเภท */}
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">ประเภท</p>
              <div className="relative w-full">
                <input
                  value={selectedType}
                  onClick={toggleDropdown}
                  readOnly
                  disabled={!isEditing}
                  className="w-full mt-1 p-2 pr-10 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
                />
                <svg
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-7 h-7 pb-1 text-gray-500 cursor-pointer ${
                    !isEditing ? "pointer-events-none" : ""
                  }`}
                  onClick={toggleDropdown}
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M7 10l5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                {isDropdownVisible && (
                  <div className="absolute  top-12 w-full mt-2 bg-white shadow-lg rounded-md border border-gray-300 z-10">
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
                          className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-200 border-b border-gray-300 last:border-b-0"
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
              <p className="sm:text-lg xl:text-xl">สายพันธุ์</p>
              <input
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* ช่องกรอกเพศ */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* ช่องทำหมัน */}
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">ทำหมัน</p>
              <div className="relative w-full">
                <input
                  name="neutered"
                  value={
                    formData.neutered === "1"
                      ? "ทำหมันแล้ว"
                      : formData.neutered === "0"
                      ? "ยังไม่ได้ทำหมัน"
                      : ""
                  }
                  readOnly
                  disabled={!isEditing}
                  onClick={() => {
                    if (isEditing)
                      setNeuteredDropdownVisible(!isNeuteredDropdownVisible);
                  }}
                  className="w-full mt-1 p-2 pr-10 border border-gray-300 rounded-md disabled:bg-gray-100 cursor-pointer"
                />
                <svg
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-500 cursor-pointer ${
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
                  <div className="absolute top-full left-0 mt-1 w-full bg-white shadow-md rounded-md border border-gray-300 z-10">
                    <ul>
                      {["ทำหมันแล้ว", "ยังไม่ได้ทำหมัน"].map((neutered) => (
                        <li
                          key={neutered}
                          className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-200 border-b border-gray-300 last:border-b-0"
                          onClick={() => handleSelectNeutered(neutered)}
                        >
                          {neutered}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* ช่องเพศ */}
            <div className="flex flex-col ">
              <p className="sm:text-lg xl:text-xl">เพศ</p>
              <div className="relative w-full">
                <input
                  name="gender"
                  value={gender}
                  readOnly
                  disabled={!isEditing}
                  onClick={() => {
                    if (isEditing)
                      setGenderDropdownVisible(!isGenderDropdownVisible);
                  }}
                  className="w-full mt-1 p-2 pr-10 border border-gray-300 rounded-md disabled:bg-gray-100 cursor-pointer"
                />
                <svg
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-500 cursor-pointer ${
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
                  <div className="absolute top-full left-0 mt-1 w-full bg-white shadow-md rounded-md border border-gray-300 z-10">
                    <ul>
                      {["เพศผู้", "เพศเมีย"].map((option) => (
                        <li
                          key={option}
                          className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-200 border-b border-gray-300 last:border-b-0"
                          onClick={() => {
                            setGender(option);
                            setGenderDropdownVisible(false);
                          }}
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ช่องกรอกสี */}
          <div className="flex flex-wrap gap-3  mb-6">
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
                  <div className={`w-6 h-6 rounded-full  ${color.code}`}></div>
                  <span className="text-sm">{color.name}</span>
                </div>
              );
            })}
          </div>

          {/* ช่องกรอกรอยตำหนิ */}
          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">รอยตำหนิ</p>
            <input
              name="mark"
              value={formData.mark}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
              disabled={!isEditing}
            />
          </div>

          {/* ช่องกรอกรายละเอียด */}
          <p className="sm:text-lg xl:text-xl">รายละเอียด</p>
          <textarea
            name="details"
            value={formData.details}
            onChange={handleChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
            disabled={!isEditing}
          ></textarea>
        </div>
      </div>

      <div className="flex flex-col my-10 2xl:mr-40 xl:mr-32 lg:mr-28 lg:ml-10 md:mr-20 sm:mr-18 mr-10">
        {/* สถานที่หาย */}
        <div className="mt-2">
          <p className="sm:text-lg xl:text-xl">สถานที่หาย</p>
          <input
            value={missingLocation}
            onChange={(e) => setMissingLocation(e.target.value)}
            disabled={!isEditing}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
          />
        </div>

        <div>
          <img
            src="/all/map.png"
            alt="image"
            className="w-full  h-auto object-cover"
          />
        </div>

        <div className="mt-10 mb-5">
          <p className="sm:text-lg xl:text-xl">การติดต่อ</p>
        </div>

        <div className="flex flex-col w-full xl:max-w-xl md:max-w-md sm:max-w-sm max-w-xs mb-2">
          <p className="sm:text-lg xl:text-xl">ชื่อเจ้าของ</p>
          <input
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            disabled={!isEditing}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
          />

          <div className="flex flex-col my-3">
            <p className="sm:text-lg xl:text-xl">เบอร์ติดต่อ</p>
            <input
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              disabled={!isEditing}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
            />
          </div>

          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">facebook</p>
            <input
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              disabled={!isEditing}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* ปุ่ม */}
        <div className="flex justify-end ml-20 mt-5 lg:mb-8 mb-5">
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
    </div>
  );
}
