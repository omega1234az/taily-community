"use client";

import React, { useState } from 'react';

type PetData = {
  name: string;
  age: string;
  gender: string;
  breed: string;
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
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState<string>("ไข่ตุ๋น");
  const [age, setAge] = useState<string>("2ปี");
  const [gender, setGender] = useState<string>("ตัวผู้");
  const [breed, setBreed] = useState<string>("บริติช ช็อตแฮร์");
  const [sterilized, setSterilized] = useState<string>("ทำหมันแล้ว");
  const [color, setColor] = useState<string>("ส้ม");
  const [markings, setMarkings] = useState<string>("มีสีขาวตรงคอ");
  const [description, setDescription] = useState<string>("");
  const [missingDate, setMissingDate] = useState<string>("");
  const [postedDate, setPostedDate] = useState<string>("");
  const [missingLocation, setMissingLocation] = useState<string>("");
  const [missingDetail, setMissingDetail] = useState<string>("");

  const [originalValues, setOriginalValues] = useState<PetData>({
    name,
    age,
    gender,
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

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    setDropdownVisible(false);
  };

  const handleSave = () => {
    // ตรวจสอบว่าค่าวันที่หายไม่สามารถเกินวันที่ประกาศได้
    if (new Date(missingDate) > new Date(postedDate)) {
      alert("วันที่ห้ามากกว่าวันที่ประกาศ");
      return;
    }

    // บันทึกข้อมูล
    console.log('Data saved:', {
      name,
      age,
      gender,
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
    setIsEditing(false);
    setOriginalValues({
      name,
      age,
      gender,
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
    // รีเซ็ตข้อมูลกลับไปยังค่าที่บันทึกไว้
    setName(originalValues.name);
    setAge(originalValues.age);
    setGender(originalValues.gender);
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
    <div>
      <h1 className="text-xl font-semibold">
        <span className="bg-[#EAD64D] py-5 pl-3 sm:py-7 sm:pl-5 xl:py-9 xl:pl-7 rounded-full">ลง</span>ทะเบียนสัตว์เลี้ยง
      </h1>

      <div className="flex flex-col lg:flex-row 2xl:gap-56 xl:gap-44 lg:gap-24 md:gap-5 sm:gap-8 lg:pl-12 md:pl-28 sm:pl-20 pl-7 pt-18">
        <div className="lg:pl-0 md:pl-28 sm:pl-24 pl-20 pb-5">
          <img
            src="/home/eggtun2.png"
            alt="image"
            className="2xl:w-72 xl:w-64 lg:w-60 md:w-56 sm:w-48 w-36 h-auto object-cover"
          />
          <div className="lg:grid grid-cols-3 flex gap-2 pt-3">
            <img src="/home/eggtun3.png" alt="image" className="2xl:w-22 xl:w-20 lg:w-18 md:w-17 sm:w-14 w-11 h-auto object-cover" />
            <img src="/home/eggtun4.png" alt="image" className="2xl:w-22 xl:w-20 lg:w-18 md:w-17 sm:w-14 w-11 h-auto object-cover" />
            <img src="/home/eggtun5.png" alt="image" className="2xl:w-22 xl:w-20 lg:w-18 md:w-17 sm:w-14 w-11 h-auto object-cover" />
          </div>
        </div>

        <div className="flex flex-col w-full md:max-w-md sm:max-w-sm max-w-xs mb-2">
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
                  if (/^\d*$/.test(value)) { // ตรวจสอบว่าเป็นตัวเลขเท่านั้น
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
                  value={selectedType}
                  onClick={toggleDropdown}
                  readOnly
                  disabled={!isEditing}
                  className="w-full mt-1 p-2 pr-10 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
                />
                <svg
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-7 h-7 pb-1 text-gray-500 cursor-pointer ${!isEditing ? 'pointer-events-none' : ''}`}
                  onClick={toggleDropdown}
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" />
                </svg>
                {isDropdownVisible && (
                  <div className="absolute right-3 top-12 w-32 mt-2 bg-white shadow-lg rounded-md border border-gray-300 z-10">
                    <ul>
                      {["แมว", "สุนัข", "นก", "หนู", "ชูก้าไรเดอร์", "เฟอร์ริต", "เม่นแคระ", "กระรอก", "กระต่าย"].map((type) => (
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

          {/* สถานที่หาย */}
          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">สถานที่หาย</p>
            <input
              value={missingLocation}
              onChange={(e) => setMissingLocation(e.target.value)}
              disabled={!isEditing}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
            />
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

          {/* ปุ่ม */}
          <div className="flex justify-end ml-20 mt-5 mb-10">
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
    </div>
  );
}
