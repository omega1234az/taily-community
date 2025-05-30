"use client";

import React, { useEffect, useState, useRef, ChangeEvent } from "react";

type Pet = {
  name: string;
  imageSrc: string;
  history?: string;
  disease?: string;
  vaccine?: string;
  additionalImages?: string[];
  age?: string;
  gender?: string;
  type?: string;
  breed?: string;
  sterilized?: string;
  color?: string;
  markings?: string;
  description?: string;
  diseaseData?: Disease[];
  vaccineData?: Vaccine[];
};

type PetDetailsModalProps = {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  selectedPet: Pet | null;
  activeSection: "history" | "disease" | "vaccine";
  setActiveSection: React.Dispatch<
    React.SetStateAction<"history" | "disease" | "vaccine">
  >;
};

type Vaccine = { name: string; date: string };
type Disease = { name: string; date: string };

export default function PetDetailsModal({
  showModal,
  setShowModal,
  selectedPet,
  activeSection,
  setActiveSection,
}: PetDetailsModalProps) {
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [breed, setBreed] = useState("");
  const [sterilized, setSterilized] = useState("");
  const [color, setColor] = useState("");
  const [markings, setMarkings] = useState("");
  const [description, setDescription] = useState("");
  const [editableVaccineData, setEditableVaccineData] = useState<Vaccine[]>([]);
  const [editableDiseaseData, setEditableDiseaseData] = useState<Disease[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;
  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (!selectedPet) return;
    setActiveSection("history");
    setMainImage(selectedPet.imageSrc);
    setImages([
      selectedPet.imageSrc,
      ...(selectedPet.additionalImages?.slice(0, 3) || []),
    ]);
    setName(selectedPet.name || "");
    setAge(selectedPet.age || "");
    setGender(selectedPet.gender || "");
    setSelectedType(selectedPet.type || "");
    setBreed(selectedPet.breed || "");
    setSterilized(selectedPet.sterilized || "");
    setColor(selectedPet.color || "");
    setMarkings(selectedPet.markings || "");
    setDescription(selectedPet.description || "");
    setEditableVaccineData(selectedPet.vaccineData || []);
    setEditableDiseaseData(selectedPet.diseaseData || []);
    setIsEditing(false);
    setIsDropdownVisible(false);
    setCurrentPage(1);
  }, [selectedPet, setActiveSection]);

  const toggleDropdown = () => {
    if (isEditing) setIsDropdownVisible((prev) => !prev);
  };
  const handleSelectType = (type: string) => {
    setSelectedType(type);
    setIsDropdownVisible(false);
  };
  const handleMainImageClick = () => {
    if (isEditing) mainInputRef.current?.click();
  };
  const handleThumbnailClick = (index: number) => {
    if (isEditing) {
      if (index > 0) galleryInputRefs[index - 1]?.current?.click();
    } else {
      if (index === 0) return;
      setImages((prev) => {
        const newImages = [...prev];
        [newImages[0], newImages[index]] = [newImages[index], newImages[0]];
        return newImages;
      });
      setMainImage(images[index]);
    }
  };
  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newUrl = URL.createObjectURL(file);
    setImages((prev) => [newUrl, ...prev.slice(1)]);
    setMainImage(newUrl);
  };
  const handleGalleryImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newUrl = URL.createObjectURL(file);
    setImages((prev) => {
      const newImages = [...prev];
      newImages[index] = newUrl;
      return newImages;
    });
  };
  const calculateTotalPages = (data: any[]) => {
    const pageCount = Math.ceil(data.length / rowsPerPage);
    const lastPageItems = data.slice((pageCount - 1) * rowsPerPage);
    return lastPageItems.length < rowsPerPage ? pageCount : pageCount + 1;
  };
  const vaccineTotalPages = calculateTotalPages(editableVaccineData);
  const diseaseTotalPages = calculateTotalPages(editableDiseaseData);
  const handleVaccineChange = (
    index: number,
    field: "name" | "date",
    value: string
  ) => {
    setEditableVaccineData((prev) => {
      const newData = [...prev];
      const globalIndex = (currentPage - 1) * rowsPerPage + index;
      const allowedLength = rowsPerPage * (vaccineTotalPages - 1);
      if (globalIndex >= allowedLength + rowsPerPage) return prev;
      while (newData.length <= globalIndex) {
        newData.push({ name: "", date: "" });
      }
      newData[globalIndex] = { ...newData[globalIndex], [field]: value };
      return newData;
    });
  };
  const handleDiseaseChange = (
    index: number,
    field: "name" | "date",
    value: string
  ) => {
    setEditableDiseaseData((prev) => {
      const updated = [...prev];
      if (!updated[index]) updated[index] = { name: "", date: "" };
      updated[index][field] = value;
      return updated;
    });
  };
  const handleClose = () => {
    setShowModal(false);
    setIsEditing(false);
  };
  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
    setIsDropdownVisible(false);
  };
  const handleCancel = () => {
    setIsEditing(false);
    if (selectedPet) {
      setName(selectedPet.name || "");
      setAge(selectedPet.age || "");
      setGender(selectedPet.gender || "");
      setSelectedType(selectedPet.type || "");
      setBreed(selectedPet.breed || "");
      setSterilized(selectedPet.sterilized || "");
      setColor(selectedPet.color || "");
      setMarkings(selectedPet.markings || "");
      setDescription(selectedPet.description || "");
      setImages([
        selectedPet.imageSrc,
        ...(selectedPet.additionalImages?.slice(0, 3) || []),
      ]);
      setEditableVaccineData(selectedPet.vaccineData || []);
      setEditableDiseaseData(selectedPet.diseaseData || []);
    }
  };
  const handleSave = () => {
    setIsEditing(false);
    setIsDropdownVisible(false);
  };

  if (!showModal || !selectedPet) return null;

  return (
    <div className="fixed inset-0 k bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-full h-full md:mt-16 sm:mt-14 sm:w-[500px] sm:h-[530px] md:w-[600px] md:h-[530px] lg:w-[700px] lg:h-[450px] xl:w-[800px] xl:h-[600px]  sm:p-6 shadow-xl relative flex flex-col overflow-y-auto rounded-lg">
        {/* ปุ่มปิด */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-6 text-black hover:text-gray-500 text-4xl sm:text-5xl font-bold z-50 cursor-pointer"
          aria-label="Close modal"
        >
          &times;
        </button>

        <h1 className="font-bold xl:text-3xl text-2xl   lg:ml-64 mt-5 sm:mt-0 ">
          <span className="absolute lg:top-4 top-5 xl:right-[270px] lg:right-[220px] right-[310px] lg:w-8 lg:h-8 w-6 h-6 bg-[#EAD64D] rounded-full z-0 -translate-x-1/2"></span>
          <div className="relative z-10 flex justify-center mb-4">
            {activeSection === "history"
              ? "ประวัติ"
              : activeSection === "disease"
              ? "โรคประจำตัว"
              : "วัคซีน"}
          </div>
        </h1>

        <div className="flex flex-col lg:flex-row justify-center 2xl:gap-16 xl:gap-20 lg:gap-20  items-center lg:items-start pt-2 sm:px-10 px-5">
          <span className="absolute top-[-36px]  left-[-14px] lg:w-72 lg:h-44 w-56 h-40 bg-[#EAD64D] rounded-b-full z-0"></span>
          <span className="absolute top-40 left-8 w-7 h-7 bg-[#EAD64D] rounded-full z-0 -translate-x-1/2"></span>
          <span className="absolute top-20 right-0 lg:w-36 lg:h-72 w-28 h-56 bg-[#7CBBEB] rounded-l-full z-0 "></span>
          <span className="absolute top-[460px] right-0 w-10 h-10 bg-[#EAD64D] rounded-full z-0 -translate-x-1/2"></span>
          <span className="absolute top-[660px] lg:top-[650px] lg:right-3 md:right-12 sm:right-5  right-4 w-7 h-7 bg-[#7CBBEB] rounded-full z-0 -translate-x-1/2"></span>
          <span className="absolute top-[860px] right-0 w-5 h-5 lg:w-0 lg:h-0 bg-[#EAD64D] rounded-full z-0 -translate-x-1/2"></span>

          <span className="absolute top-[380px] lg:top-[580px]  left-0 w-10 h-10  bg-[#EAD64D] rounded-full z-0 -translate-x-1/2"></span>
          <span className="absolute top-[580px] lg:top-[328px]  left-12 lg:left-16 w-7 h-7   bg-[#7CBBEB] rounded-full z-0 -translate-x-1/2"></span>
          <span className="absolute top-[780px] left-0 w-5 h-5 lg:w-0 lg:h-0 bg-[#EAD64D] rounded-full z-0 -translate-x-1/2"></span>
          {/* ซ้าย: รูปภาพ */}
          <div className="pb-5 flex flex-col items-center  lg:items-start relative z-10">
            {/* รูปหลัก */}
            <img
              src={images[0]}
              alt={name}
              className="2xl:w-72 2xl:h-56 xl:w-64 xl:h-52 lg:w-56 lg:h-48 md:w-64 md:h-60 sm:w-52 sm:h-48 w-48 h-48 object-cover rounded-xl cursor-pointer"
              onClick={handleMainImageClick}
            />
            <input
              ref={mainInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleMainImageChange}
            />

            {/* รูปย่อย */}
            <span className="absolute top-[340px] left-5 lg:w-8 lg:h-8 w-0 h-0 bg-[#EAD64D] rounded-full z-0 -translate-x-1/2"></span>
            <span className="absolute top-[350px] left-28 lg:w-28 lg:h-28 w-0 h-0 bg-[#7CBBEB] rounded-full z-0 -translate-x-1/2"></span>
            <div className="grid grid-cols-3 gap-2 pt-3">
              {images.slice(1).map((img, idx) => (
                <div key={idx + 1}>
                  <img
                    src={img}
                    alt={`${name}-${idx + 1}`}
                    className="cursor-pointer 2xl:w-36 2xl:h-20 xl:w-32 xl:h-16 lg:w-32 lg:h-16 md:w-20 md:h-20 sm:w-16 sm:h-16 w-14 h-14 object-cover rounded-md"
                    onClick={() => handleThumbnailClick(idx + 1)}
                  />
                  <input
                    ref={galleryInputRefs[idx]}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleGalleryImageChange(e, idx + 1)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ขวา: ปุ่ม section + ข้อมูล + ปุ่มแก้ไข */}
          <div className="w-full flex flex-col gap-4 relative z-10">
            {/* เนื้อหา */}
            <div className="w-full flex flex-col lg:gap-4">
              <div className="mx-auto   min-h-[100px] ">
                {activeSection === "history" && (
                  <div className="grid grid-cols-2 gap-4  w-full 2xl:max-w-md xl:max-w-md lg:max-w-md md:max-w-sm sm:max-w-sm max-w-xs">
                    {/* ชื่อ */}
                    <div className="flex flex-col ">
                      <p className="sm:text-md xl:text-lg">ชื่อ</p>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={!isEditing}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                      />
                    </div>

                    {/* อายุ */}
                    <div className="flex flex-col ">
                      <p className="sm:text-md xl:text-lg">อายุ</p>
                      <input
                        type="text"
                        value={age}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d*$/.test(value)) setAge(value);
                        }}
                        disabled={!isEditing}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                      />
                    </div>

                    {/* เพศ */}
                    <div className="flex flex-col">
                      <p className="sm:text-md xl:text-lg">เพศ</p>
                      <input
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        disabled={!isEditing}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                      />
                    </div>

                    {/* ประเภท */}
                    <div className="flex flex-col">
                      <p className="sm:text-md xl:text-lg">ประเภท</p>
                      <div className="relative w-full">
                        <input
                          value={selectedType}
                          onClick={toggleDropdown}
                          readOnly
                          disabled={!isEditing}
                          className="w-full mt-1 p-2 pr-10 border border-gray-300 rounded-md disabled:bg-gray-100 cursor-pointer"
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
                          <div className="absolute right-3 top-12 w-32 mt-1 bg-white shadow-lg rounded-md border border-gray-300 z-10">
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

                    {/* สายพันธุ์ */}
                    <div className="flex flex-col">
                      <p className="sm:text-md xl:text-lg">สายพันธุ์</p>
                      <input
                        value={breed}
                        onChange={(e) => setBreed(e.target.value)}
                        disabled={!isEditing}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                      />
                    </div>

                    {/* ทำหมัน */}
                    <div className="flex flex-col">
                      <p className="sm:text-md xl:text-lg">ทำหมัน</p>
                      <input
                        value={sterilized}
                        onChange={(e) => setSterilized(e.target.value)}
                        disabled={!isEditing}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                      />
                    </div>

                    {/* สี */}
                    <div className="flex flex-col">
                      <p className="sm:text-md xl:text-lg">สี</p>
                      <input
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        disabled={!isEditing}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                      />
                    </div>

                    {/* รอยตำหนิ */}
                    <div className="flex flex-col ">
                      <p className="sm:text-md xl:text-lg">รอยตำหนิ</p>
                      <input
                        value={markings}
                        onChange={(e) => setMarkings(e.target.value)}
                        disabled={!isEditing}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                      />
                    </div>

                    {/* รายละเอียด */}
                    <div className="flex flex-col col-span-2">
                      <p className="sm:text-md xl:text-lg">รายละเอียด</p>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={!isEditing}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                )}

                {activeSection === "vaccine" && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border rounded-lg shadow-md">
                      <thead>
                        <tr className="bg-[#7CBBEB] text-black text-base">
                          <th className="py-3 px-6 border-black border-r text-left">
                            วัคซีน
                          </th>
                          <th className="py-3 px-6 border-black border-r text-left">
                            วันที่ได้รับวัคซีน
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {editableVaccineData
                          .slice(
                            (currentPage - 1) * rowsPerPage,
                            currentPage * rowsPerPage
                          )
                          .map((vaccine, index) => (
                            <tr
                              key={index}
                              className={
                                index % 2 === 0 ? "bg-white" : "bg-[#7CBBEB]"
                              }
                            >
                              <td className="py-2 px-6 border-black border-r">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={vaccine.name}
                                    onChange={(e) =>
                                      handleVaccineChange(
                                        (currentPage - 1) * rowsPerPage + index,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300 rounded px-2 py-1"
                                  />
                                ) : (
                                  vaccine.name
                                )}
                              </td>
                              <td className="py-2 px-6">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={vaccine.date}
                                    onChange={(e) =>
                                      handleVaccineChange(
                                        (currentPage - 1) * rowsPerPage + index,
                                        "date",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300 rounded px-2 py-1"
                                  />
                                ) : (
                                  vaccine.date
                                )}
                              </td>
                            </tr>
                          ))}

                        {/* เติมแถวว่างให้ครบ rowsPerPage */}
                        {Array.from({
                          length:
                            rowsPerPage -
                            editableVaccineData.slice(
                              (currentPage - 1) * rowsPerPage,
                              currentPage * rowsPerPage
                            ).length,
                        }).map((_, i) => {
                          const emptyIndex =
                            (currentPage - 1) * rowsPerPage +
                            editableVaccineData.slice(
                              (currentPage - 1) * rowsPerPage,
                              currentPage * rowsPerPage
                            ).length +
                            i;

                          // Ensure the editableVaccineData[emptyIndex] exists
                          const emptyRow = editableVaccineData[emptyIndex] || {
                            name: "",
                            date: "",
                          };

                          return (
                            <tr
                              key={"empty-" + i}
                              className={
                                emptyIndex % 2 === 0
                                  ? "bg-white"
                                  : "bg-[#7CBBEB]"
                              }
                            >
                              <td className="py-3 px-6 border-black border-r">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={emptyRow.name}
                                    onChange={(e) =>
                                      handleVaccineChange(
                                        emptyIndex,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300 rounded px-2 py-1"
                                  />
                                ) : (
                                  ""
                                )}
                              </td>
                              <td className="py-1 px-6">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={emptyRow.date}
                                    onChange={(e) =>
                                      handleVaccineChange(
                                        emptyIndex,
                                        "date",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300 rounded px-2 py-1"
                                  />
                                ) : (
                                  ""
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex justify-center items-center space-x-5 pt-5">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="flex items-center justify-center bg-[#D9D9D9] rounded sm:p-2.5 p-2 disabled:opacity-50 cursor-pointer"
                      >
                        <img
                          src="/home/arrow.svg"
                          alt="prev"
                          className="w-4 h-4"
                        />
                      </button>
                      <span className="bg-[#D9D9D9] rounded px-4 py-1">
                        {currentPage}
                      </span>
                      <span className="text-center px-2">ถึง</span>
                      <span className="bg-[#D9D9D9] rounded px-4 py-1">
                        {vaccineTotalPages}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, vaccineTotalPages)
                          )
                        }
                        disabled={currentPage === vaccineTotalPages}
                        className="flex items-center justify-center bg-[#D9D9D9] rounded sm:p-2.5 p-2 disabled:opacity-50 cursor-pointer"
                      >
                        <img
                          src="/home/arrow.svg"
                          alt="next"
                          className="w-4 h-4 rotate-180"
                        />
                      </button>
                    </div>
                  </div>
                )}

                {activeSection === "disease" && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border rounded-lg shadow-md">
                      <thead>
                        <tr className="bg-[#EAD64D] text-black text-base">
                          <th className="py-3 px-6 border-black border-r text-left">
                            โรคประจำตัว
                          </th>
                          <th className="py-3 px-6 border-black border-r text-left">
                            วันที่พบโรค
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: rowsPerPage }).map((_, index) => {
                          const globalIndex =
                            (currentPage - 1) * rowsPerPage + index;
                          const row = editableDiseaseData[globalIndex] || {
                            name: "",
                            date: "",
                          };

                          return (
                            <tr
                              key={"row-" + index}
                              className={
                                globalIndex % 2 === 0
                                  ? "bg-white"
                                  : "bg-[#EAD64D]"
                              }
                            >
                              <td className="py-2 px-6 border-black border-r">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={row.name}
                                    onChange={(e) =>
                                      handleDiseaseChange(
                                        globalIndex,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300 rounded px-2 py-2"
                                  />
                                ) : (
                                  row.name
                                )}
                              </td>
                              <td className="py-3 px-6">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={row.date}
                                    onChange={(e) =>
                                      handleDiseaseChange(
                                        globalIndex,
                                        "date",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300 rounded px-2 py-2"
                                  />
                                ) : (
                                  row.date
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex justify-center items-center space-x-5 pt-5">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="flex items-center justify-center bg-[#D9D9D9] rounded sm:p-2.5 p-2 disabled:opacity-50 cursor-pointer"
                      >
                        <img
                          src="/home/arrow.svg"
                          alt="prev"
                          className="w-4 h-4"
                        />
                      </button>
                      <span className="bg-[#D9D9D9] rounded px-4 py-1">
                        {currentPage}
                      </span>
                      <span className="text-center px-2">ถึง</span>
                      <span className="bg-[#D9D9D9] rounded px-4 py-1">
                        {diseaseTotalPages}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, diseaseTotalPages)
                          )
                        }
                        disabled={currentPage === diseaseTotalPages}
                        className="flex items-center justify-center bg-[#D9D9D9] rounded sm:p-2.5 p-2 disabled:opacity-50 cursor-pointer"
                      >
                        <img
                          src="/home/arrow.svg"
                          alt="next"
                          className="w-4 h-4 rotate-180"
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ปุ่มเลือก section */}
              <div className="flex justify-center xl:gap-6 lg:gap-4 sm:gap-6 gap-4 mx-auto mt-5 sm:mt-5 lg:mt-0 ">
                {/* กล่องที่ 1 */}
                <div
                  onClick={() => setActiveSection("history")}
                  className={`flex flex-col items-center xl:px-6 py-2 lg:px-4.5 sm:px-6 px-6.5  rounded-xl w-fit cursor-pointer border-3 ${
                    activeSection === "history"
                      ? "bg-[#FFCD95] border-[#f4b56e]"
                      : "bg-[#f7e4cc] border-transparent hover:bg-[#fcd5a8] hover:border-[#eebd84c6]"
                  }`}
                >
                  <img
                    src="/all/history.png"
                    alt="History"
                    className="lg:w-10 lg:h-10 xl:w-12 xl:h-12 md:w-12 md:h-12 sm:w-10 sm:h-10 w-8 h-8 object-cover"
                  />
                  <p className="text-center font-bold xl:text-xs lg:text-[10px] text-sm xl:mt-2 sm:mt-1 mt-2">
                    ประวัติ
                  </p>
                </div>

                {/* กล่องที่ 2 */}
                <div
                  onClick={() => setActiveSection("disease")}
                  className={`flex flex-col items-center xl:px-4 py-1 lg:px-3 md:px-3 sm:px-2 px-1.5 rounded-xl w-fit cursor-pointer border-3 ${
                    activeSection === "disease"
                      ? "bg-[#F6DE3C] border-[#edd017]"
                      : "bg-[#faf5a5] border-transparent hover:bg-[#ffef8a] hover:border-[#e0d37a]"
                  }`}
                >
                  <img
                    src="/all/Disease.png"
                    alt="Disease"
                    className="lg:w-10 lg:h-10 xl:w-14 xl:h-14 md:w-12 md:h-12 sm:w-11 sm:h-11 w-10 h-10 pt-1 object-cover"
                  />
                  <p className="text-center font-bold xl:text-xs lg:text-[10px] text-sm  xl:mt-1 md:mt-2 mt-1">
                    โรคประจำตัว
                  </p>
                </div>

                {/* กล่องที่ 3 */}
                <div
                  onClick={() => setActiveSection("vaccine")}
                  className={`flex flex-col items-center xl:px-6 py-2 lg:px-4.5 sm:px-6 px-6.5 rounded-xl w-fit cursor-pointer border-3 ${
                    activeSection === "vaccine"
                      ? "bg-[#7CBBEB] border-[#3e95d8]"
                      : "bg-[#b7d3f0] border-transparent hover:bg-[#99c4e4] hover:border-[#70a5cd]"
                  }`}
                >
                  <img
                    src="/all/Vaccine.png"
                    alt="Vaccine"
                    className="lg:w-10 lg:h-10 xl:w-12 xl:h-12 md:w-12 md:h-12 sm:w-10 sm:h-10 w-8 h-8 object-cover"
                  />
                  <p className="text-center font-bold xl:text-xs lg:text-[10px] text-sm xl:mt-2 sm:mt-1 mt-2">
                    วัคซีน
                  </p>
                </div>
              </div>
            </div>

            {/* ปุ่มแก้ไข/บันทึก/ยกเลิก */}
            <div className="flex justify-end lg:mr-0 md:mr-14 sm:mr-5 mb-5">
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
    </div>
  );
}
