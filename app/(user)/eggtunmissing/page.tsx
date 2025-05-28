"use client";

import React, { useState, useRef, ChangeEvent } from "react";

type PetData = {
  name: string;
  age: string;
  gender: string;
  breed: string;
  type: string;
  sterilized: string;
  color: string;
  markings: string;
  description: string;
  missingDate: string;
  postedDate: string;
  missingLocation: string;
  missingDetail: string;
};

export default function Missing() {
  // ตั้งค่ารูปเริ่มต้น
  const [mainImage, setMainImage] = useState<string>("/home/eggtun2.png");
  const [galleryImages, setGalleryImages] = useState<string[]>([
    "/home/eggtun3.png",
    "/home/eggtun4.png",
    "/home/eggtun5.png",
  ]);

  const mainInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  const [isEditing, setIsEditing] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleSelectType = (selectedType: string) => {
    setType(selectedType);
    setIsDropdownVisible(false);
  };

  // ตัวอย่างข้อมูลอื่น ๆ เหมือนเดิม
  const [name, setName] = useState<string>("ไข่ตุ๋น");
  const [age, setAge] = useState<string>("2 ปี");
  const [gender, setGender] = useState<string>("ตัวผู้");
  const [breed, setBreed] = useState<string>("บริติช ช็อตแฮร์");
  const [sterilized, setSterilized] = useState<string>("ทำหมันแล้ว");
  const [type, setType] = useState<string>("แมว");
  const [color, setColor] = useState<string>("สีส้ม");
  const [markings, setMarkings] = useState<string>("มีสีขาวตรงคอ");
  const [description, setDescription] = useState<string>(
    "แมวเป็นมิตร ขี้อ้อน หายไปจากบ้านตอนเย็น"
  );
  const [missingDate, setMissingDate] = useState<string>("2025-02-05");
  const [postedDate, setPostedDate] = useState<string>("2025-02-07");
  const [missingLocation, setMissingLocation] = useState<string>(
    "บ้านหนองอึ่งพัฒนา อ.เมือง จ.กำแพงเพชร"
  );
  const [missingDetail, setMissingDetail] = useState<string>(
    "หายจากบริเวณหน้าบ้าน"
  );
  const [reward, setReward] = useState<string>("5,000");
  const [ownerName, setOwnerName] = useState<string>("ราเชน");
  const [contactNumber, setContactNumber] = useState<string>("0302455632");
  const [facebook, setFacebook] = useState<string>("rachan");

  const [originalValues, setOriginalValues] = useState<PetData>({
    name,
    age,
    gender,
    breed,
    type,
    sterilized,
    color,
    markings,
    description,
    missingDate,
    postedDate,
    missingLocation,
    missingDetail,
  });

  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setMainImage(URL.createObjectURL(file));
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

  const handleSave = () => {
    if (new Date(missingDate) > new Date(postedDate)) {
      alert("วันที่ห้ามากกว่าวันที่ประกาศ");
      return;
    }
    console.log("Data saved:", {
      name,
      age,
      gender,
      breed,
      type,
      sterilized,
      color,
      markings,
      description,
      missingDate,
      postedDate,
      missingLocation,
      missingDetail,
      reward,
      ownerName,
      contactNumber,
      facebook,
      mainImage,
      galleryImages,
    });

    setIsEditing(false);
    setOriginalValues({
      name,
      age,
      gender,
      type,
      breed,
      sterilized,
      color,
      markings,
      description,
      missingDate,
      postedDate,
      missingLocation,
      missingDetail,
    });
  };

  const handleCancel = () => {
    setName(originalValues.name);
    setAge(originalValues.age);
    setGender(originalValues.gender);
    setType(originalValues.type);
    setBreed(originalValues.breed);
    setSterilized(originalValues.sterilized);
    setColor(originalValues.color);
    setMarkings(originalValues.markings);
    setDescription(originalValues.description);
    setMissingDate(originalValues.missingDate);
    setPostedDate(originalValues.postedDate);
    setMissingLocation(originalValues.missingLocation);
    setMissingDetail(originalValues.missingDetail);
    setIsEditing(false);
  };

  return (
    <div className="">
      <h1 className="text-xl font-semibold">
        <span className="bg-[#EAD64D] py-5 pl-3 sm:py-7 sm:pl-5 xl:py-9 xl:pl-7 rounded-full">
          ลง
        </span>
        ทะเบียนสัตว์เลี้ยงหาย
      </h1>

      <div className="flex flex-col lg:flex-row 2xl:gap-56 xl:gap-44 lg:gap-24 md:gap-5 sm:gap-8 lg:pl-12 md:pl-28 sm:pl-20 pl-7 pt-18">
        <div className="lg:pl-0 md:pl-28 sm:pl-24 pl-20 pb-5">
          <img
            src={mainImage}
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

          <div className="flex gap-2 mt-3">
            {galleryImages.map((img, index) => (
              <div key={index}>
                <img
                  src={img}
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

        <div className="flex flex-col w-full 2xl:max-w-xl xl:max-w-lg md:max-w-md sm:max-w-sm max-w-xs mb-2">
          {/* ชื่อ */}
          <p className="sm:text-lg xl:text-xl">ชื่อ</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isEditing}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
          />

          {/* อายุ / เพศ */}
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">อายุ</p>
              <input
                type="text"
                value={age}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    // ตรวจสอบว่าเป็นตัวเลขเท่านั้น
                    setAge(value);
                  }
                }}
                disabled={!isEditing}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
              />
            </div>
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">เพศ</p>
              <input
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={!isEditing}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* ประเภท / สายพันธุ์ */}
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">ประเภท</p>
              <div className="relative w-full">
                <input
                  value={type}
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
                  <div className="absolute right-3 top-12 w-32 mt-2 bg-white shadow-lg rounded-md border border-gray-300 z-10">
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
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">สายพันธุ์</p>
              <input
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                disabled={!isEditing}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* ทำหมัน / สี */}
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">ทำหมัน</p>
              <input
                value={sterilized}
                onChange={(e) => setSterilized(e.target.value)}
                disabled={!isEditing}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
              />
            </div>
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">สี</p>
              <input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={!isEditing}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* รอยตำหนิ */}
          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">รอยตำหนิ</p>
            <input
              value={markings}
              onChange={(e) => setMarkings(e.target.value)}
              disabled={!isEditing}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
            />
          </div>

          {/* รายละเอียด */}
          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">รายละเอียด</p>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isEditing}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
            />
          </div>

          {/* วันที่หาย / วันที่ประกาศ */}
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">วันที่หาย</p>
              <input
                type="date"
                value={missingDate}
                onChange={(e) => setMissingDate(e.target.value)}
                disabled={!isEditing}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
              />
            </div>
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">วันที่ประกาศ</p>
              <input
                type="date"
                value={postedDate}
                onChange={(e) => setPostedDate(e.target.value)}
                disabled={!isEditing}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* รายละเอียดการหาย */}
          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">รายละเอียดการหาย</p>
            <input
              value={missingDetail}
              onChange={(e) => setMissingDetail(e.target.value)}
              disabled={!isEditing}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
            />
          </div>

          {/* รายละเอียดเงินรางวัล */}
          <div className="flex flex-col mb-20">
            <p className="sm:text-lg xl:text-xl">เงินรางวัล</p>
            <input
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              disabled={!isEditing}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col mb-10 2xl:mr-40 xl:mr-32 lg:mr-28 lg:ml-10 md:mr-20 sm:mr-18 mr-10">
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
