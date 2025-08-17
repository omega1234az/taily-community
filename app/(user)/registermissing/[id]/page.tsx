"use client";

import React, { useRef, useState, useEffect, ChangeEvent } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useParams } from 'next/navigation';

type PetData = {
  name: string;
  age: string;
  gender: string;
  breed: string;
  sterilized: string;
  neutered?: string;
  color: string;
  markings: string;
  description: string;
  missingDate: string;
  postedDate: string;
  missingLocation: string;
  missingDetail: string;
  reward?: string;
};

export default function RegisterMissing() {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const params = useParams<{ id: string }>();
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [breed, setBreed] = useState<string>("");
  const [sterilized, setSterilized] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [markings, setMarkings] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [missingDate, setMissingDate] = useState<string>("");
  const [postedDate, setPostedDate] = useState<string>("");
  const [missingLocation, setMissingLocation] = useState<string>("");
  const [missingDetail, setMissingDetail] = useState<string>("");
  const [reward, setReward] = useState<string>("");
  const [ownerName, setOwnerName] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [facebook, setFacebook] = useState<string>("");
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 13.736717,
    lng: 100.523186,
  });

  const [mainImage, setMainImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<(string | null)[]>([null, null, null]);

  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mainInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  const [isGenderDropdownVisible, setGenderDropdownVisible] = useState(false);
  const [isNeuteredDropdownVisible, setNeuteredDropdownVisible] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

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

  // Fetch pet data from API
  useEffect(() => {
    const fetchPetData = async () => {
      if (params.id) {
        try {
          const response = await fetch(`http://localhost:3000/api/pets/${params.id}`);
          const data = await response.json();

          // Update state with API data
          setName(data.name || "");
          setAge(data.age ? data.age.toString() : "");
          setGender(data.gender || "");
          setBreed(data.breed || "");
          setSterilized(data.isNeutered === 1 ? "ทำหมันแล้ว" : "ยังไม่ได้ทำหมัน");
          setColor(data.color || "");
          setSelectedColors(data.color ? data.color.split(",") : []);
          setMarkings(data.markings || "");
          setDescription(data.description || "");
          setOwnerName(data.user?.name || "");
          setContactNumber(data.user?.phone || "");
          setSelectedType(data.species?.name || "");

          // Set images
          const mainImg = data.images?.find((img: any) => img.mainImage)?.url || null;
          const galleryImgs = data.images
            ?.filter((img: any) => !img.mainImage)
            ?.map((img: any) => img.url)
            .slice(0, 3); // Limit to 3 gallery images
          setMainImage(mainImg);
          setGalleryImages([
            galleryImgs?.[0] || null,
            galleryImgs?.[1] || null,
            galleryImgs?.[2] || null,
          ]);

          // Initialize missing fields (not provided by API)
          setMissingDate("");
          setPostedDate("");
          setMissingLocation("");
          setMissingDetail("");
          setReward("");
          setFacebook("");

          // Update originalValues for cancel functionality
          setOriginalValues({
            name: data.name || "",
            age: data.age ? data.age.toString() : "",
            gender: data.gender || "",
            breed: data.breed || "",
            sterilized: data.isNeutered === 1 ? "ทำหมันแล้ว" : "ยังไม่ได้ทำหมัน",
            color: data.color || "",
            markings: data.markings || "",
            description: data.description || "",
            missingDate: "",
            postedDate: "",
            missingLocation: "",
            missingDetail: "",
          });
        } catch (error) {
          console.error("Error fetching pet data:", error);
        }
      }
    };

    fetchPetData();
  }, [params.id]);

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

  const handleSelectGender = (gender: string) => {
    setGender(gender);
    setGenderDropdownVisible(false);
  };

  const handleSelectNeutered = (value: string) => {
    setSterilized(value);
    setNeuteredDropdownVisible(false);
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

  const [formData, setFormData] = useState<PetData>({
    name: "",
    age: "",
    gender: "",
    breed: "",
    sterilized: "",
    color: "",
    markings: "",
    description: "",
    missingDate: "",
    postedDate: "",
    missingLocation: "",
    missingDetail: "",
    reward: "",
  });

  const [originalValues, setOriginalValues] = useState<PetData>({
    name: "",
    age: "",
    gender: "",
    breed: "",
    sterilized: "",
    color: "",
    markings: "",
    description: "",
    missingDate: "",
    postedDate: "",
    missingLocation: "",
    missingDetail: "",
  });

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    setDropdownVisible(false);
  };

  const handleSave = () => {
    if (new Date(missingDate) > new Date(postedDate)) {
      alert("วันที่หายมากกว่าวันที่ประกาศ");
      return;
    }

    console.log("Data saved:", {
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
      reward,
      ownerName,
      contactNumber,
      facebook,
      coords,
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

  // Initialize Leaflet map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(
        [13.736717, 100.523186],
        13
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(mapRef.current);

      const updateCenterCoords = () => {
        const center = mapRef.current?.getCenter();
        if (center) {
          setCoords({
            lat: center.lat,
            lng: center.lng,
          });
        }
      };

      mapRef.current.on("move", updateCenterCoords);
      updateCenterCoords();

      return () => {
        mapRef.current?.remove();
        mapRef.current = null;
      };
    }
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold">
        <span className="bg-[#EAD64D] py-5 pl-3 sm:py-7 sm:pl-5 xl:py-9 xl:pl-7 rounded-full">
          ลง
        </span>
        ทะเบียนสัตว์เลี้ยงหาย
      </h1>

      <div className="flex flex-col lg:flex-row 2xl:gap-56 xl:gap-44 lg:gap-24 md:gap-5 sm:gap-8 lg:pl-12 md:pl-28 sm:pl-20 pl-7 pt-18">
        <div className="lg:pl-0 md:pl-28 sm:pl-24 pl-20 pb-5">
          <div className="your-container">
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

        <div className="flex flex-col w-full 2xl:max-w-xl xl:max-w-lg md:max-w-md sm:max-w-sm max-w-xs mb-2">
          <p className="sm:text-lg xl:text-xl">ชื่อ</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isEditing}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
          />

          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">อายุ</p>
              <input
                type="text"
                value={age}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setAge(value);
                  }
                }}
                disabled={!isEditing}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
              />
            </div>
            <div className="flex flex-col">
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
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
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
                  <div className="absolute top-12 w-full mt-2 bg-white shadow-lg rounded-md border border-gray-300 z-10">
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

          <div className="flex flex-col gap-4 mb-2">
            <div className="flex flex-col relative mb-4">
              <p className="sm:text-lg xl:text-xl">ทำหมัน</p>
              <div className="relative w-full">
                <input
                  name="neutered"
                  value={sterilized}
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
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
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

            <div className="flex flex-wrap gap-3 mb-2">
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
                      setColor(
                        selectedColors.includes(color.name)
                          ? selectedColors
                              .filter((c) => c !== color.name)
                              .join(",")
                          : [...selectedColors, color.name].join(",")
                      );
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer ${
                      isSelected ? "bg-gray-400" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full ${color.code}`}
                    ></div>
                    <span className="text-sm">{color.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">รอยตำหนิ</p>
            <input
              value={markings}
              onChange={(e) => setMarkings(e.target.value)}
              disabled={!isEditing}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
            />
          </div>

          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">รายละเอียด</p>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isEditing}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
            />
          </div>

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

          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">รายละเอียดการหาย</p>
            <input
              value={missingDetail}
              onChange={(e) => setMissingDetail(e.target.value)}
              disabled={!isEditing}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
            />
          </div>

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
        <div className="mt-2">
          <p className="sm:text-lg xl:text-xl">สถานที่หาย</p>
          <input
            value={missingLocation}
            onChange={(e) => setMissingLocation(e.target.value)}
            disabled={!isEditing}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
          />
        </div>

        <div className="relative">
          <div
            ref={mapContainerRef}
            id="map"
            className="w-full h-[500px] relative"
          ></div>
          <img
            id="pin"
            src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
            width="40"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full z-[999] pointer-events-none"
          />
          <div className="mt-3 text-sm">
            Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}
          </div>
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
            <p className="sm:text-lg xl:text-xl">Facebook</p>
            <input
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              disabled={!isEditing}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
            />
          </div>
        </div>

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