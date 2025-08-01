"use client";

import React, { useEffect, useState, useRef, ChangeEvent } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type Pet = {
  id: number;
  ownerName?: string;
  name: string;
  images?: { id: number; url: string; petId: number }[]; // Updated to match API
  history?: string;
  disease?: string;
  vaccine?: string;
  age?: string;
  gender?: string;
  speciesId?: number; // Changed to number to match API
  breed?: string;
  isNeutered?: number;
  color?: string[] | string; // Support both array and string
  markings?: string;
  description?: string;
  phone?: string;
  facebook?: string;
  diseaseData?: Disease[];
  vaccineData?: Vaccine[];
  treatmentData?: Treatment[];
};

type PetDetailsModalProps = {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  selectedPet: Pet | null;
  activeSection: "history" | "disease" | "vaccine" | "treatment";
  setActiveSection: React.Dispatch<
    React.SetStateAction<"history" | "disease" | "vaccine" | "treatment">
  >;
};

type Vaccine = { name: string; date: string; nextdate: string };
type Disease = { name: string; date: string };
type Treatment = { name: string; date: string };

type Species = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export default function PetDetailsModal({
  showModal,
  setShowModal,
  selectedPet,
  activeSection,
  setActiveSection,
}: PetDetailsModalProps) {
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sterilizedDropdownVisible, setSterilizedDropdownVisible] = useState(false);
  const [genderDropdownVisible, setGenderDropdownVisible] = useState(false);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]); // Array for up to 4 image URLs
  const [isEditing, setIsEditing] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [owner, setOwner] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [breed, setBreed] = useState("");
  const [sterilized, setSterilized] = useState<string>("");
  const [color, setColor] = useState("");
  const [markings, setMarkings] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [facebook, setFacebook] = useState("");
  const [editableVaccineData, setEditableVaccineData] = useState<Vaccine[]>([]);
  const [editableDiseaseData, setEditableDiseaseData] = useState<Disease[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState<(File | null)[]>([
    null,
    null,
    null,
  ]);

  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const pdfRef = useRef<HTMLDivElement>(null);

  // Fetch species data from API
  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const response = await fetch("/api/pets/species");
        if (!response.ok) throw new Error("Failed to fetch species");
        const data = await response.json();
        setSpeciesList(data);
      } catch (error) {
        console.error("Error fetching species:", error);
      }
    };
    fetchSpecies();
  }, []);

  // Initialize pet details when selectedPet changes
  useEffect(() => {
    if (!selectedPet) return;
    setActiveSection("history");
    console.log("Selected pet:", selectedPet);
    // Initialize images from selectedPet.images
    const petImages = selectedPet.images
      ? selectedPet.images.map((img) => img.url).slice(0, 4)
      : [];
    // Fill remaining slots with empty strings up to 4
    while (petImages.length < 4) {
      petImages.push("");
    }
    setImages(petImages);
    setMainImage(petImages[0] || "/all/bgprint4.png"); // Fallback to placeholder

    setOwner(selectedPet.ownerName || "");
    setName(selectedPet.name || "");
    setAge(selectedPet.age || "");
    setGender(selectedPet.gender || "");
    const species = speciesList.find((s) => s.id === selectedPet.speciesId);
    setSelectedType(species?.name || "");
    setBreed(selectedPet.breed || "");
    const isNeuteredValue = selectedPet.isNeutered ?? 0;
    setSterilized(isNeuteredValue.toString());
    console.log("Initial isNeutered:", isNeuteredValue);

    // Handle colors
    let parsedColors: string[] = [];
    if (Array.isArray(selectedPet.color)) {
      parsedColors = selectedPet.color;
    } else if (typeof selectedPet.color === "string") {
      parsedColors = selectedPet.color
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
    }
    setSelectedColors(parsedColors);
    setColor(parsedColors.join(", "));

    setMarkings(selectedPet.markings || "");
    setDescription(selectedPet.description || "");
    setPhone(selectedPet.phone || "");
    setFacebook(selectedPet.facebook || "");
    setEditableVaccineData(selectedPet.vaccineData || []);
    setEditableDiseaseData(selectedPet.diseaseData || []);
    setIsEditing(false);
    setIsDropdownVisible(false);
    setCurrentPage(1);
    // Reset image files
    setMainImageFile(null);
    setGalleryImageFiles([null, null, null]);
  }, [selectedPet, setActiveSection, speciesList]);

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
      galleryInputRefs[index - 1]?.current?.click();
    } else {
      if (index === 0 || !images[index]) return;
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
    setMainImageFile(file);
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
    setGalleryImageFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index - 1] = file;
      return newFiles;
    });
  };

  const calculateTotalPages = (data: any[]) => {
    return Math.ceil(data.length / rowsPerPage) || 1;
  };

  const vaccineTotalPages = calculateTotalPages(editableVaccineData);
  const diseaseTotalPages = calculateTotalPages(editableDiseaseData);

  const handleVaccineChange = (
    index: number,
    field: "name" | "date" | "nextdate",
    value: string
  ) => {
    setEditableVaccineData((prev) => {
      const newData = [...prev];
      const globalIndex = (currentPage - 1) * rowsPerPage + index;
      while (newData.length <= globalIndex) {
        newData.push({ name: "", date: "", nextdate: "" });
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
      const newData = [...prev];
      while (newData.length <= index) {
        newData.push({ name: "", date: "" });
      }
      newData[index] = { ...newData[index], [field]: value };
      return newData;
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
      const species = speciesList.find((s) => s.id === selectedPet.speciesId);
      setSelectedType(species?.name || "");
      setBreed(selectedPet.breed || "");
      const isNeuteredValue = selectedPet.isNeutered || 0;
      setSterilized(isNeuteredValue.toString());
      let parsedColors: string[] = [];
      if (Array.isArray(selectedPet.color)) {
        parsedColors = selectedPet.color;
      } else if (typeof selectedPet.color === "string") {
        parsedColors = selectedPet.color
          .split(",")
          .map((c) => c.trim())
          .filter((c) => c.length > 0);
      }
      setSelectedColors(parsedColors);
      setColor(parsedColors.join(", "));
      setMarkings(selectedPet.markings || "");
      setDescription(selectedPet.description || "");
      setPhone(selectedPet.phone || "");
      setFacebook(selectedPet.facebook || "");
      const petImages = selectedPet.images
        ? selectedPet.images.map((img) => img.url).slice(0, 4)
        : [];
      while (petImages.length < 4) {
        petImages.push("");
      }
      setImages(petImages);
      setMainImage(petImages[0] || "all/bgprint4.png.jpg");
      setEditableVaccineData(selectedPet.vaccineData || []);
      setEditableDiseaseData(selectedPet.diseaseData || []);
      setMainImageFile(null);
      setGalleryImageFiles([null, null, null]);
    }
  };

  const handleSave = async () => {
    if (!selectedPet) return;
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("age", age);
      formData.append("gender", gender);
      const species = speciesList.find((s) => s.name === selectedType);
      formData.append("speciesId", species?.id.toString() || "");
      formData.append("breed", breed);
      formData.append("isNeutered", sterilized);
      formData.append("color", JSON.stringify(selectedColors));
      formData.append("markings", markings);
      formData.append("description", description);
      formData.append("phone", phone);
      formData.append("facebook", facebook);
      // Append vaccine and disease data
      formData.append("vaccines", JSON.stringify(editableVaccineData.filter(v => v.name)));
      formData.append("chronicDiseases", JSON.stringify(editableDiseaseData.filter(d => d.name)));
      // Append images
      if (mainImageFile) {
        formData.append("images", mainImageFile);
      }
      galleryImageFiles.forEach((file, index) => {
        if (file) {
          formData.append("images", file);
        }
      });
      // Log FormData for debugging
      console.log("FormData entries:");
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      const response = await fetch(`/api/pets/${selectedPet.id}`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update pet");
      }
      alert("บันทึกข้อมูลสำเร็จ");
      window.location.reload(); // Reload to reflect changes
      setIsEditing(false);
      setIsDropdownVisible(false);
      setShowModal(false);
    } catch (error) {
      console.error("Save error:", error);
      alert("ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  function toggleColor(color: string) {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  }

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

  const handlePrint = () => {
    if (!pdfRef.current) return;
    html2canvas(pdfRef.current, {
      scale: 2,
      useCORS: true,
      logging: true,
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = 210;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("pet-details.pdf");
      })
      .catch((err) => {
        console.error("PDF error:", err);
        alert("เกิดข้อผิดพลาดในการพิมพ์");
      });
  };

  if (!showModal || !selectedPet) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-full h-full md:mt-16 sm:mt-8 sm:w-[530px] sm:h-[530px] md:w-[600px] md:h-[530px] lg:w-[750px] lg:h-[620px] xl:w-[900px] xl:h-[650px] 2xl:w-[1000px] 2xl:h-[700px] sm:p-6 shadow-xl relative flex flex-col overflow-y-auto rounded-lg">
        <button
          onClick={handleClose}
          className="absolute top-4 right-6 text-black hover:text-gray-500 text-4xl sm:text-5xl font-bold z-50 cursor-pointer"
          aria-label="Close modal"
        >
          &times;
        </button>
        <h1 className="font-bold xl:text-3xl text-2xl lg:ml-64 mt-5 sm:mt-0">
          <span className="absolute lg:top-4 top-5 xl:right-[270px] lg:right-[220px] right-[310px] lg:w-8 lg:h-8 w-6 h-6 bg-[#EAD64D] rounded-full z-0 -translate-x-1/2"></span>
          <div className="relative z-10 flex justify-center mb-4">
            {activeSection === "history"
              ? "ประวัติ"
              : activeSection === "disease"
              ? "โรคประจำตัว"
              : activeSection === "treatment"
              ? "การรักษา"
              : "วัคซีน"}
          </div>
        </h1>
        <div className="flex flex-col lg:flex-row justify-center 2xl:gap-24 xl:gap-20 lg:gap-20 items-center lg:items-start pt-2 sm:px-10 px-5">
          {/* Background decorations */}
          <span className="absolute top-[-36px] left-[-14px] lg:w-72 lg:h-44 w-56 h-40 bg-[#EAD64D] rounded-b-full z-0"></span>
          <span className="absolute top-40 left-8 w-7 h-7 bg-[#EAD64D] rounded-full z-0 -translate-x-1/2"></span>
          <span className="absolute top-20 right-0 lg:w-36 lg:h-72 w-28 h-56 bg-[#7CBBEB] rounded-l-full z-0"></span>
          <span className="absolute top-[460px] right-0 w-10 h-10 bg-[#EAD64D] rounded-full z-0 -translate-x-1/2"></span>
          <span className="absolute top-[660px] lg:top-[650px] lg:right-3 md:right-12 sm:right-5 right-4 w-7 h-7 bg-[#7CBBEB] rounded-full z-0 -translate-x-1/2"></span>
          <span className="absolute top-[860px] right-0 w-5 h-5 lg:w-0 lg:h-0 bg-[#EAD64D] rounded-full z-0 -translate-x-1/2"></span>
          <span className="absolute top-[380px] lg:top-[580px] left-0 w-10 h-10 bg-[#EAD64D] rounded-full z-0 -translate-x-1/2"></span>
          <span className="absolute top-[580px] lg:top-[328px] left-12 lg:left-16 w-7 h-7 bg-[#7CBBEB] rounded-full z-0 -translate-x-1/2"></span>
          <span className="absolute top-[780px] left-0 w-5 h-5 lg:w-0 lg:h-0 bg-[#EAD64D] rounded-full z-0 -translate-x-1/2"></span>
          <div className="pb-5 flex flex-col items-center lg:items-start relative z-10">
            <img
              src={mainImage || "all/bgprint4.png.jpg"}
              alt={name || "Pet"}
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
            <span className="absolute top-[340px] left-5 lg:w-8 lg:h-8 w-0 h-0 bg-[#EAD64D] rounded-full z-0 -translate-x-1/2"></span>
            <span className="absolute top-[350px] left-28 lg:w-28 lg:h-28 w-0 h-0 bg-[#7CBBEB] rounded-full z-0 -translate-x-1/2"></span>
            <div className="grid grid-cols-3 gap-2 pt-3">
              {images.slice(1).map((img, idx) => (
                <div key={idx}>
                  <img
                    src={img || "/all/bgprint4.png"}
                    alt={`${name || "Pet"}-${idx + 1}`}
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
          <div className="w-full flex flex-col gap-4 relative z-10">
            <div className="w-full flex flex-col lg:gap-4">
              <div className="mx-auto min-h-[100px]">
                {activeSection === "history" && (
                  <div className="grid grid-cols-2 gap-4 w-full 2xl:max-w-lg xl:max-w-md lg:max-w-md md:max-w-sm sm:max-w-sm max-w-xs">
                    <div className="flex flex-col">
                      <p className="sm:text-md xl:text-lg">ชื่อ</p>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={!isEditing}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                      />
                    </div>
                    <div className="flex flex-col">
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
                    <div className="flex flex-col relative">
                      <p className="sm:text-md xl:text-lg">เพศ</p>
                      <div
                        className="relative w-full"
                        onClick={() =>
                          isEditing && setGenderDropdownVisible(!genderDropdownVisible)
                        }
                      >
                        <input
                          value={gender}
                          readOnly
                          disabled={!isEditing}
                          className="w-full mt-1 p-2 pr-10 border border-gray-300 rounded-md disabled:bg-gray-100 cursor-pointer"
                        />
                        <svg
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-7 h-7 text-gray-500 ${
                            !isEditing ? "pointer-events-none" : "cursor-pointer"
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M7 10l5 5 5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                      {genderDropdownVisible && isEditing && (
                        <div className="absolute top-20 w-full bg-white border border-gray-300 rounded-md shadow-md z-10">
                          {["เพศผู้", "เพศเมีย"].map((g) => (
                            <div
                              key={g}
                              className="px-4 py-2 hover:bg-gray-200 cursor-pointer border-b border-gray-300 last:border-b-0 text-xs sm:text-sm xl:text-md"
                              onClick={() => {
                                setGender(g);
                                setGenderDropdownVisible(false);
                              }}
                            >
                              {g}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
                          <div className="absolute top-12 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-300 z-10">
                            <ul>
                              {speciesList.map((species) => (
                                <li
                                  key={species.id}
                                  className="px-4 py-2 text-xs sm:text-sm xl:text-md cursor-pointer hover:bg-gray-200 border-b border-gray-300 last:border-b-0"
                                  onClick={() => handleSelectType(species.name)}
                                >
                                  {species.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <p className="sm:text-md xl:text-lg">สายพันธุ์</p>
                      <input
                        value={breed}
                        onChange={(e) => setBreed(e.target.value)}
                        disabled={!isEditing}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                      />
                    </div>
                    <div className="flex flex-col relative">
                      <p className="sm:text-md xl:text-lg">ทำหมัน</p>
                      <div
                        className="relative w-full"
                        onClick={() =>
                          isEditing && setSterilizedDropdownVisible(!sterilizedDropdownVisible)
                        }
                      >
                        <input
                          value={sterilized === "1" ? "ทำหมันแล้ว" : "ยังไม่ได้ทำหมัน"}
                          readOnly
                          disabled={!isEditing}
                          className="w-full mt-1 p-2 pr-10 border border-gray-300 rounded-md disabled:bg-gray-100 cursor-pointer"
                        />
                        <svg
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-7 h-7 text-gray-500 ${
                            !isEditing ? "pointer-events-none" : "cursor-pointer"
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M7 10l5 5 5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                      {sterilizedDropdownVisible && isEditing && (
                        <div className="absolute top-20 w-full bg-white border border-gray-300 rounded-md shadow-md z-10">
                          {[
                            { label: "ทำหมันแล้ว", value: "1" },
                            { label: "ยังไม่ได้ทำหมัน", value: "0" },
                          ].map((status) => (
                            <div
                              key={status.value}
                              className="px-4 py-2 hover:bg-gray-200 cursor-pointer border-b border-gray-300 last:border-b-0 text-xs sm:text-sm xl:text-md"
                              onClick={() => {
                                setSterilized(status.value);
                                setSterilizedDropdownVisible(false);
                              }}
                            >
                              {status.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col col-span-2">
                      <div className="flex flex-wrap gap-3">
                        {colors.map((color, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              if (!isEditing) return;
                              toggleColor(color.name);
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer ${
                              selectedColors.includes(color.name)
                                ? "bg-gray-400"
                                : "bg-gray-300"
                            }`}
                          >
                            <div
                              className={`w-6 h-6 rounded-full ${color.code}`}
                            ></div>
                            <span className="text-sm">{color.name}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col mt-4">
                        <p className="sm:text-md xl:text-lg">รอยตำหนิ</p>
                        <input
                          value={markings}
                          onChange={(e) => setMarkings(e.target.value)}
                          disabled={!isEditing}
                          className="w-full mt-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                        />
                      </div>
                    </div>
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
                          <th className="py-3 px-9 sm:px-10 md:px-12 lg:px-10 xl:px-12 border-black border-r text-left">
                            วัคซีน
                          </th>
                          <th className="py-3 px-2 sm:px-3 md:px-5 lg:px-4 xl:px-8 border-black border-r text-left">
                            วันที่ได้รับวัคซีน
                          </th>
                          <th className="py-3 px-2 sm:px-3 md:px-5 lg:px-4 xl:px-8 border-black border-r text-left">
                            วัคซีนครั้งต่อไป
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
                              className={index % 2 === 0 ? "bg-white" : "bg-[#7CBBEB]"}
                            >
                              <td className="py-2 px-2 border-black border-r text-sm">
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
                                    className="w-full border border-gray-300 rounded"
                                  />
                                ) : (
                                  vaccine.name
                                )}
                              </td>
                              <td className="py-2 px-4 border-black border-r">
                                {isEditing ? (
                                  <input
                                    type="date"
                                    value={vaccine.date}
                                    onChange={(e) =>
                                      handleVaccineChange(
                                        (currentPage - 1) * rowsPerPage + index,
                                        "date",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300 rounded"
                                  />
                                ) : (
                                  vaccine.date
                                )}
                              </td>
                              <td className="py-2 px-4">
                                {isEditing ? (
                                  <input
                                    type="date"
                                    value={vaccine.nextdate || ""}
                                    onChange={(e) =>
                                      handleVaccineChange(
                                        (currentPage - 1) * rowsPerPage + index,
                                        "nextdate",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300 rounded"
                                  />
                                ) : (
                                  vaccine.nextdate
                                )}
                              </td>
                            </tr>
                          ))}
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
                          const emptyRow = editableVaccineData[emptyIndex] || {
                            name: "",
                            date: "",
                            nextdate: "",
                          };
                          return (
                            <tr
                              key={"empty-" + i}
                              className={
                                emptyIndex % 2 === 0 ? "bg-white" : "bg-[#7CBBEB]"
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
                              <td className="py-2 px-6 border-black border-r">
                                {isEditing ? (
                                  <input
                                    type="date"
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
                              <td className="py-2 px-6">
                                {isEditing ? (
                                  <input
                                    type="date"
                                    value={emptyRow.nextdate}
                                    onChange={(e) =>
                                      handleVaccineChange(
                                        emptyIndex,
                                        "nextdate",
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
                    <div className="flex justify-center items-center space-x-5 pt-5">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                          <th className="py-3 px-11 sm:px-12 md:px-16 lg:px-14 xl:px-18 border-black border-r text-left">
                            โรคประจำตัว
                          </th>
                          <th className="py-3 px-10 sm:px-12 md:px-14 lg:px-12 xl:px-18 border-black border-r text-left">
                            วันที่พบแพทย์
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: rowsPerPage }).map((_, index) => {
                          const globalIndex = (currentPage - 1) * rowsPerPage + index;
                          const row = editableDiseaseData[globalIndex] || {
                            name: "",
                            date: "",
                          };
                          return (
                            <tr
                              key={"row-" + index}
                              className={globalIndex % 2 === 0 ? "bg-white" : "bg-[#EAD64D]"}
                            >
                              <td className="py-3 px-6 border-black border-r">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={row.name}
                                    onChange={(e) =>
                                      handleDiseaseChange(globalIndex, "name", e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded"
                                  />
                                ) : (
                                  row.name
                                )}
                              </td>
                              <td className="py-3 px-6">
                                {isEditing ? (
                                  <input
                                    type="date"
                                    value={row.date}
                                    onChange={(e) =>
                                      handleDiseaseChange(globalIndex, "date", e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded"
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
                    <div className="flex justify-center items-center space-x-5 pt-5">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                {activeSection === "treatment" && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border rounded-lg shadow-md">
                      <thead>
                        <tr className="bg-[#90ee90] text-black text-base">
                          <th className="py-3 px-14 sm:px-16 md:px-18 lg:px-16 xl:px-22 border-black border-r text-left">
                            การรักษา
                          </th>
                          <th className="py-3 px-12 sm:px-14 md:px-18 lg:px-16 xl:px-20 border-black border-r text-left">
                            วันที่รักษา
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: rowsPerPage }).map((_, index) => {
                          const globalIndex = (currentPage - 1) * rowsPerPage + index;
                          const row = selectedPet.treatmentData?.[globalIndex] || {
                            name: "",
                            date: "",
                          };
                          return (
                            <tr
                              key={"row-" + index}
                              className={globalIndex % 2 === 0 ? "bg-white" : "bg-[#90ee90]"}
                            >
                              <td className="py-3 px-6 border-black border-r">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={row.name}
                                    onChange={(e) =>
                                      handleDiseaseChange(globalIndex, "name", e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded"
                                  />
                                ) : (
                                  row.name
                                )}
                              </td>
                              <td className="py-3 px-6">
                                {isEditing ? (
                                  <input
                                    type="date"
                                    value={row.date}
                                    onChange={(e) =>
                                      handleDiseaseChange(globalIndex, "date", e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded"
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
                    <div className="flex justify-center items-center space-x-5 pt-5">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
              <div className="flex justify-center xl:gap-6 lg:gap-4 sm:gap-6 gap-4 mx-auto mt-5 sm:mt-5 lg:mt-0">
                <div
                  onClick={() => setActiveSection("history")}
                  className={`flex flex-col items-center xl:px-6 py-2 lg:px-4.5 md:px-5.5 sm:px-4 px-4.5 rounded-xl w-fit cursor-pointer border-3 ${
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
                  <p className="text-center font-bold xl:text-xs lg:text-[10px] md:text-sm text-[10px] xl:mt-2 sm:mt-1 mt-2">
                    ประวัติ
                  </p>
                </div>
                <div
                  onClick={() => setActiveSection("disease")}
                  className={`flex flex-col items-center xl:px-4 py-1 lg:px-3 md:px-3 sm:px-3 px-2.5 rounded-xl w-fit cursor-pointer border-3 ${
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
                  <p className="text-center font-bold xl:text-xs lg:text-[10px] md:text-sm text-[10px] xl:mt-1 md:mt-2 mt-1">
                    โรคประจำตัว
                  </p>
                </div>
                <div
                  onClick={() => setActiveSection("vaccine")}
                  className={`flex flex-col items-center xl:px-6 py-2 lg:px-4.5 md:px-5.5 sm:px-4 px-4.5 rounded-xl w-fit cursor-pointer border-3 ${
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
                  <p className="text-center font-bold xl:text-xs lg:text-[10px] md:text-sm text-[10px] xl:mt-2 sm:mt-1 mt-2">
                    วัคซีน
                  </p>
                </div>
                <div
                  onClick={() => setActiveSection("treatment")}
                  className={`flex flex-col items-center xl:px-6 py-2 lg:px-4.5 md:px-5.5 sm:px-4 px-4 rounded-xl w-fit cursor-pointer border-3 ${
                    activeSection === "treatment"
                      ? "bg-[#90ee90] border-[#4caf50]"
                      : "bg-[#d6f5d6] border-transparent hover:bg-[#b3e6b3] hover:border-[#80c080]"
                  }`}
                >
                  <img
                    src="/all/treatment.png"
                    alt="Treatment"
                    className="lg:w-10 lg:h-10 xl:w-12 xl:h-12 md:w-10 md:h-12 sm:w-10 sm:h-10 w-8 h-8 object-cover"
                  />
                  <p className="text-center font-bold xl:text-xs lg:text-[10px] md:text-sm text-[10px] xl:mt-2 sm:mt-1 mt-2">
                    การรักษา
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-between xl:gap-40 lg:gap-24 2xl:mx-14 xl:mx-6 lg:mx-2 md:mx-2 sm:mx-2 mx-6 mb-5">
              {!isEditing ? (
                <>
                  <button
                    onClick={handlePrint}
                    className="bg-[#EAD64D] border-[#edd017] hover:bg-[#ffef8a] hover:border-[#e0d37a] text-white sm:text-lg xl:text-xl px-6 py-1 rounded-xl cursor-pointer"
                  >
                    พิมพ์
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-[#7CBBEB] text-white hover:bg-sky-600 shadow-md rounded-xl px-6 py-1 sm:text-lg xl:text-xl cursor-pointer"
                  >
                    แก้ไข
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
        {/* PDF content */}
        <div
          ref={pdfRef}
          style={{
            position: "absolute",
            top: "-10000px",
            left: "-10000px",
            width: "210mm",
            height: "297mm",
            backgroundColor: "white",
            padding: "20px",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <div className="mx-auto bg-white h-full">
            <img
              src="/all/bgprint.png"
              alt="bg"
              className="w-40 h-14 object-cover ml-28 mt-[-20px] mb-[-20px]"
            />
            <img
              src="/all/bgprint2.png"
              alt="bg"
              className="w-8 h-8 object-cover ml-[-28] mb-[-20px] mt-[-32px]"
            />
            <div className="py-5 flex gap-0">
              <div className="flex flex-col border-r-4 relative z-10 border-[#c5b3a2]">
                <div className="pr-5 pl-3 relative z-10 w-[350px] h-[400px]">
                  <img
                    src="/all/bgprint2.png"
                    alt="bg"
                    className="absolute right-0 mt-40 w-44 h-40 object-cover z-0"
                  />
                  <img
                    src="/all/bgprint2.png"
                    alt="bg"
                    className="absolute right-3 mt-10 w-5 h-5 object-cover z-0"
                  />
                  <img
                    src="/all/bgprint2.png"
                    alt="bg"
                    className="absolute left-0 mt-28 w-10 h-10 object-cover z-0"
                  />
                  <img
                    src="/all/bgprint2.png"
                    alt="bg"
                    className="absolute left-[-20px] mt-56 w-5 h-5 object-cover z-0"
                  />
                  <img
                    src="/all/bgprint4.png"
                    alt="bg"
                    className="object-cover absolute ml-[-160px] mt-80 w-36 h-36"
                  />
                  <img
                    src="/all/bgprint2.png"
                    alt="bg"
                    className="object-cover absolute mt-96 w-3 h-3"
                  />
                  <img
                    src={images[0] || "/all/bgprint4.png"}
                    alt="pet"
                    className="w-[350px] h-[400px] object-cover relative z-10"
                  />
                </div>
                <div className="border-b-4 border-[#c5b3a2] w-full my-5"></div>
                <div className="mt-5 px-2 relative flex-1 flex flex-col justify-start">
                  <img
                    src="/all/bgprint2.png"
                    alt="bg"
                    className="absolute mt-[-30px] right-64 w-3 h-3 object-cover"
                  />
                  <div className="relative flex items-center gap-2 mb-4 pl-8 z-10">
                    <img
                      src="/all/print2.png"
                      alt="History"
                      className="relative z-10 -mr-9 w-24 h-16 object-cover"
                    />
                    <img
                      src="/all/bgprint2.png"
                      alt="bg"
                      className="absolute right-32 mb-10 w-6 h-6 object-cover z-0"
                    />
                    <img
                      src="/all/bgprint2.png"
                      alt="bg"
                      className="absolute left-[-10px] mt-10 w-4 h-4 object-cover z-0"
                    />
                    <h2 className="text-2xl font-bold pb-5 pl-9 pr-10 border-3 rounded-3xl border-[#c77932] relative z-0">
                      ประวัติ
                    </h2>
                  </div>
                  <div className="text-xl">
                    <img
                      src="/all/bgprint3.png"
                      alt="bg"
                      className="absolute ml-[-20px] w-56 h-40 object-cover z-0"
                    />
                    <p className="pb-3 relative z-10 pl-4">
                      ชื่อเจ้าของ: {owner || "-"}
                    </p>
                    <p className="pb-3 relative z-10 pl-4">
                      ชื่อสัตว์เลี้ยง: {name || "-"}
                    </p>
                    <img
                      src="/all/bgprint2.png"
                      alt="bg"
                      className="absolute ml-32 w-5 h-5 object-cover z-0"
                    />
                    <p className="pb-3 relative z-10 pl-4">
                      อายุ: {age || "-"}
                    </p>
                    <img
                      src="/all/bgprint2.png"
                      alt="bg"
                      className="absolute ml-[-20px] w-2 h-2 object-cover z-0"
                    />
                    <p className="pb-3 z-10 pl-4">
                      สายพันธุ์: {breed || "-"}
                    </p>
                    <img
                      src="/all/bgprint2.png"
                      alt="bg"
                      className="absolute mb-20 ml-56 w-10 h-10 object-cover z-0"
                    />
                    <p className="pb-3 z-10 pl-4">
                      ทำหมัน: {sterilized === "1" ? "ทำหมันแล้ว" : "ยังไม่ได้ทำหมัน"}
                    </p>
                    <img
                      src="/all/bgprint4.png"
                      alt="bg"
                      className="absolute ml-[-140px] w-36 h-36 object-cover z-0"
                    />
                    <img
                      src="/all/bgprint2.png"
                      alt="bg"
                      className="absolute mb-20 ml-20 w-4 h-4 object-cover z-0"
                    />
                    <p className="pb-3 z-10 pl-4">
                      รอยตำหนิ: {markings || "-"}
                    </p>
                    <img
                      src="/all/bgprint2.png"
                      alt="bg"
                      className="absolute ml-40 w-5 h-5 object-cover z-0"
                    />
                    <p className="pb-3 z-10 pl-4">
                      รายละเอียด: {description || "-"}
                    </p>
                    <img
                      src="/all/bgprint2.png"
                      alt="bg"
                      className="absolute ml-5 w-2 h-2 object-cover z-0"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col flex-1 relative z-10">
                <div className="pl-5 pb-5">
                  <img
                    src="/all/bgprint2.png"
                    alt="bg"
                    className="absolute w-10 h-10 object-cover -top-20 right-40 z-0"
                  />
                  <img
                    src="/all/bgprint2.png"
                    alt="bg"
                    className="absolute w-3 h-3 object-cover -top-10 right-10 z-0"
                  />
                  <img
                    src="/all/bgprint2.png"
                    alt="bg"
                    className="absolute w-5 h-5 object-cover top-40 -right-6 z-0"
                  />
                  <img
                    src="/all/bgprint4.png"
                    alt="bg"
                    className="absolute w-56 h-48 object-cover right-0 z-0"
                  />
                  <img
                    src="/all/bgprint2.png"
                    alt="bg"
                    className="absolute w-5 h-5 object-cover top-0 right-72 z-0"
                  />
                  <img
                    src="/all/bgprint2.png"
                    alt="bg"
                    className="absolute w-10 h-10 object-cover top-11 right-80 z-0"
                  />
                  <img
                    src="/all/bgprint2.png"
                    alt="bg"
                    className="absolute w-3 h-3 object-cover top-40 right-72 z-0"
                  />
                  <img
                    src="/all/bgprint2.png"
                    alt="bg"
                    className="absolute w-7 h-7 object-cover top-[420px] right-64 z-0"
                  />
                  <img
                    src="/all/bgprint2.png"
                    alt="bg"
                    className="absolute w-5 h-6 object-cover top-[290px] right-36 z-0"
                  />
                  <img
                    src="/all/bgprint2.png"
                    alt="bg"
                    className="absolute w-4 h-4 object-cover top-[250px] right-10 z-0"
                  />
                  <img
                    src="/all/bgprint2.png"
                    alt="bg"
                    className="absolute w-7 h-7 object-cover top-[210px] right-[200px] z-0"
                  />
                  <img
                    src="/all/bgprint2.png"
                    alt="bg"
                    className="absolute w-3 h-3 object-cover top-[360px] right-[360px] z-0"
                  />
                  <img
                    src="/all/bgprint2.png"
                    alt="bg"
                    className="absolute w-10 h-10 object-cover top-[340px] right-10 z-0"
                  />
                  <img
                    src="/all/bgprint5.png"
                    alt="bg"
                    className="absolute w-48 h-52 object-cover top-[420px] -right-5 z-0"
                  />
                  <div className="flex items-center space-x-2 mb-5 relative z-10">
                    <h1 className="text-5xl font-semibold">
                      {name || "ไข่ตุ๋น"}
                    </h1>
                    <img
                      src="/all/foot.png"
                      alt="Foot"
                      className="w-14 h-14 object-cover mt-5"
                    />
                  </div>
                  <div className="text-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <img
                        src="/all/call.png"
                        alt="Call"
                        className="w-6 h-6"
                      />
                      <span className="pb-5">
                        {phone || "เบอร์โทร"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <img
                        src="/all/face.png"
                        alt="Facebook"
                        className="w-6 h-6"
                      />
                      <span className="pb-5">
                        {facebook || "Facebook"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="border-b-4 border-[#c5b3a2] relative z-20 w-full"></div>
                <div className="p-5 mb-5">
                  <div className="relative flex items-center gap-2 mb-4 mt-4 space-y-2 pl-3 z-10">
                    <img
                      src="/all/print1.png"
                      alt="Disease"
                      className="relative z-10 -mr-9 w-24 h-16 object-cover"
                    />
                    <h2 className="text-2xl font-bold pb-5 pl-9 pr-10 border-3 rounded-3xl relative z-0">
                      โรคประจำตัว
                    </h2>
                  </div>
                  <table className="min-w-full border-2 shadow-md mb-0 relative z-10">
                    <thead>
                      <tr className="text-black text-base border-2">
                        <th className="py-2 px-4 border-black border-2 border-r text-center text-xl">
                          โรคประจำตัว
                        </th>
                        <th className="py-2 px-4 border-black border-2 border-r text-center text-xl">
                          วันที่พบแพทย์
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {editableDiseaseData.length ? (
                        editableDiseaseData.map((d, index) => (
                          <tr key={index}>
                            <td className="py-2 px-4 border-black border-2 border-r border-b">
                              {d.name}
                            </td>
                            <td className="py-2 px-4 border-black border-2 border-b">
                              {d.date}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="text-center py-2">
                            ไม่มีข้อมูล
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="border-b-4 border-[#c5b3a2] relative z-20 w-full"></div>
                <div className="p-5">
                  <div className="relative grid grid-cols-[auto_64px] items-center mt-2 pl-20 pr-0">
                    <h2 className="text-2xl font-bold pb-5 px-16 border-3 border-[#bfb2a6] rounded-3xl relative z-0">
                      วัคซีน
                    </h2>
                    <img
                      src="/all/print3.png"
                      alt="Vaccine"
                      className="w-16 h-24 object-cover relative z-10 -ml-8"
                    />
                  </div>
                  <table className="min-w-full border-2 shadow-md mt-3 mb-5">
                    <thead>
                      <tr className="text-black text-base border-2">
                        <th className="py-2 px-2 pb-2 border-black border-2 border-r border-b text-md text-center">
                          วัคซีน
                        </th>
                        <th className="py-2 px-2 border-black border-2 border-r border-b text-md text-center">
                          วันที่ได้รับวัคซีน
                        </th>
                        <th className="py-2 px-2 border-black border-2 border-r border-b text-md text-center">
                          วัคซีนครั้งต่อไป
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {editableVaccineData.length ? (
                        editableVaccineData.map((v, index) => (
                          <tr key={index}>
                            <td className="py-2 px-2 border-black border-2 border-r border-b">
                              {v.name}
                            </td>
                            <td className="py-2 px-2 border-black border-2 border-b">
                              {v.date}
                            </td>
                            <td className="py-2 px-2 border-black border-2 border-b">
                              {v.nextdate}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="text-center py-2">
                            ไม่มีข้อมูล
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="border-b-4 border-[#c5b3a2] relative z-20 w-full"></div>
                <div className="p-5">
                  <div className="relative flex items-center gap-2 mb-4 mt-4 space-y-2 pl-6 z-10">
                    <img
                      src="/all/print4.png"
                      alt="Treatment"
                      className="relative z-10 -mr-14 w-24 h-20 object-cover"
                    />
                    <h2 className="text-2xl font-bold pb-5 pl-12 pr-10 border-3 rounded-3xl relative z-0">
                      การรักษา
                    </h2>
                  </div>
                  <table className="min-w-full border-2 shadow-md mt-3 mb-10">
                    <thead>
                      <tr className="text-black text-base border-2">
                        <th className="py-2 px-2 border-black border-2 border-r border-b text-md text-center">
                          การรักษา
                        </th>
                        <th className="py-2 px-2 border-black border-2 border-b text-md text-center">
                          วันที่รักษา
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPet.treatmentData?.length ? (
                        selectedPet.treatmentData.map((t, index) => (
                          <tr key={index}>
                            <td className="py-2 px-2 border-black border-2 border-r border-b">
                              {t.name}
                            </td>
                            <td className="py-2 px-2 border-black border-2 border-b">
                              {t.date}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="text-center py-2">
                            ไม่มีข้อมูล
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <img
              src="/all/bgprint2.png"
              alt="bg"
              className="absolute bottom-10 ml-10 w-7 h-7 object-cover z-0"
            />
            <img
              src="/all/bgprint4.png"
              alt="bg"
              className="absolute -bottom-20 ml-20 w-56 h-40 object-cover z-0"
            />
            <img
              src="/all/bgprint2.png"
              alt="bg"
              className="absolute bottom-1 ml-[490px] w-9 h-9 object-cover z-0"
            />
            <img
              src="/all/bgprint2.png"
              alt="bg"
              className="absolute bottom-24 ml-[560px] w-5 h-5 object-cover z-0"
            />
            <img
              src="/all/bgprint2.png"
              alt="bg"
              className="absolute -bottom-4 ml-[380px] w-7 h-7 object-cover z-0"
            />
            <img
              src="/all/bgprint2.png"
              alt="bg"
              className="absolute -bottom-1 ml-[620px] w-3 h-3 object-cover z-0"
            />
            <img
              src="/all/bgprint4.png"
              alt="bg"
              className="absolute -bottom-32 -right-24 w-40 h-40 object-cover z-0"
            />
            <img
              src="/all/bgprint4.png"
              alt="bg"
              className="absolute bottom-20 -right-24 w-64 h-52 object-cover z-0"
            />
            <img
              src="/all/bgprint2.png"
              alt="bg"
              className="absolute bottom-[310px] right-16 w-10 h-10 object-cover z-0"
            />
            <img
              src="/all/bgprint2.png"
              alt="bg"
              className="absolute bottom-[255px] right-64 w-3 h-3 object-cover z-0"
            />
            <img
              src="/all/bgprint2.png"
              alt="bg"
              className="absolute bottom-[360px] right-56 w-6 h-6 object-cover z-0"
            />
            <img
              src="/all/bgprint2.png"
              alt="bg"
              className="absolute bottom-[445px] right-32 w-6 h-6 object-cover z-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}