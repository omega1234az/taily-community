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
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 pr-10 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
                  disabled={!isEditing}
                />
                <svg
                  width="21"
                  height="24"
                  viewBox="0 0 21 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pb-1 text-gray-500 cursor-pointer ${
                    !isEditing ? "pointer-events-none" : ""
                  }`}
                  onClick={toggleDropdown}
                >
                  <path
                    d="M9.552 23.864C8.88 23.864 8.256 23.512 7.68 22.808C7.104 22.136 6.656 21.32 6.336 20.36C6.272 20.136 5.792 18.808 4.896 16.376C3.232 12.056 2.096 8.904 1.488 6.92C1.296 6.216 1.072 5.592 0.816 5.048C0.464 4.12 0.288 3.464 0.288 3.08C0.288 2.536 0.528 2.04 1.008 1.592C1.52 1.144 2.08 0.919998 2.688 0.919998C3.168 0.919998 3.632 1.064 4.08 1.352C4.56 1.64 4.896 2.104 5.088 2.744C5.28 3.32 5.632 4.52 6.144 6.344C6.848 8.808 7.456 10.904 7.968 12.632C8.512 14.36 9.104 16.072 9.744 17.768L12.384 11.432L15.312 4.52C15.472 4.232 15.712 3.784 16.032 3.176C16.352 2.568 16.688 2.136 17.04 1.88C17.392 1.624 17.824 1.496 18.336 1.496C18.944 1.496 19.472 1.656 19.92 1.976C20.368 2.296 20.592 2.76 20.592 3.368C20.592 3.912 20.496 4.408 20.304 4.856C20.144 5.304 19.856 5.96 19.44 6.824C19.024 7.56 18.768 8.04 18.672 8.264L13.152 20.072C12.672 21.32 12.176 22.264 11.664 22.904C11.152 23.544 10.448 23.864 9.552 23.864Z"
                    fill="currentColor"
                  />
                </svg>
                {isDropdownVisible && (
                  <div className="absolute right-3 top-12 w-32 mt-2 bg-white shadow-lg rounded-md border border-gray-300 z-50">
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
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">เพศ</p>
              <input
                name="neutered"
                value={formData.neutered}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
                disabled={!isEditing}
              />
            </div>

            {/* ช่องกรอกสี */}
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">สี</p>
              <input
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
                disabled={!isEditing}
              />
            </div>
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
