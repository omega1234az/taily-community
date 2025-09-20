"use client";

import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";
// Remove the direct Leaflet imports and CSS import from the top

interface Species {
  id: number;
  name: string;
}

export default function FoundPetRegistration() {
  const [species, setSpecies] = useState<Species[]>([]);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<(File | null)[]>([
    null,
    null,
    null,
  ]);
  const [galleryPreviews, setGalleryPreviews] = useState<(string | null)[]>([
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
  const router = useRouter();
  const mapRef = useRef<any>(null); // Changed from L.Map to any
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 13.736717,
    lng: 100.523186,
  });

  // Dropdowns visibility
  const [isSpeciesDropdownVisible, setSpeciesDropdownVisible] = useState(false);
  const [isGenderDropdownVisible, setGenderDropdownVisible] = useState(false);
  const [isStatusDropdownVisible, setStatusDropdownVisible] = useState(false);

  const [formData, setFormData] = useState({
    description: "",
    speciesId: "",
    breed: "",
    gender: "",
    color: [] as string[],
    phone: "",
    facebook: "",
    finderName: "",
    distinctive: "",
    status: "finding",
    foundDate: "",
  });

  // Fetch species data
  useEffect(() => {
    fetchSpecies();
    initializeMap();

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const fetchSpecies = async () => {
    try {
      const response = await fetch("/api/pets/species");
      if (response.ok) {
        const data = await response.json();
        setSpecies(data);
      }
    } catch (error) {
      console.error("Error fetching species:", error);
    }
  };

  // Initialize Leaflet map with dynamic import
  const initializeMap = async () => {
    // Check if we're in the browser
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    try {
      // Dynamic import of Leaflet to ensure it only runs on client side
      const L = (await import("leaflet")).default;

      // Import Leaflet CSS dynamically

      // Clean up existing map instance before creating a new one
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // ฟังก์ชันสร้าง map เพื่อลดการเขียนโค้ดซ้ำ
      const createMap = (lat: number, lng: number, zoom: number) => {
        if (!mapContainerRef.current) return;

        mapRef.current = L.map(mapContainerRef.current, {
          zoomControl: true,
          dragging: true,
          scrollWheelZoom: true,
        }).setView([lat, lng], zoom);

        // เพิ่ม tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
        }).addTo(mapRef.current);

        // วงกลม 200 เมตร
        const circle = L.circle([lat, lng], {
          radius: 200,
          color: "red",
          fillColor: "red",
          fillOpacity: 0.2,
        }).addTo(mapRef.current);

        // ฟังก์ชันอัปเดต coords เมื่อลาก map
        const updateCenterCoords = () => {
          const center = mapRef.current?.getCenter();
          if (center) {
            setCoords({ lat: center.lat, lng: center.lng });
            circle.setLatLng(center); // ย้ายวงกลมตามตำแหน่งใหม่
          }
        };

        // เพิ่ม event listener
        mapRef.current.on("move", updateCenterCoords);

        // อัปเดต coords เริ่มต้น
        setCoords({ lat, lng });
      };

      // ใช้ GPS ถ้าอนุญาต
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            createMap(userLat, userLng, 17);
          },
          (err) => {
            console.error("ไม่สามารถเข้าถึง GPS:", err);
            // fallback เป็นค่า default (กรุงเทพฯ)
            createMap(13.736717, 100.523186, 13);
          }
        );
      } else {
        // fallback หาก browser ไม่รองรับ geolocation
        createMap(13.736717, 100.523186, 13);
      }
    } catch (error) {
      console.error("Error loading Leaflet:", error);
    }
  };

  // Rest of your component code remains the same...
  const handleGalleryImageClick = (index: number) => {
    galleryInputRefs[index]?.current?.click();
  };

  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const newImages = [...galleryImages];
      const newPreviews = [...galleryPreviews];
      newImages[index] = file;
      newPreviews[index] = URL.createObjectURL(file);
      setGalleryImages(newImages);
      setGalleryPreviews(newPreviews);
    }
  };

  const handleSelectSpecies = (speciesItem: Species) => {
    setFormData((prev) => ({ ...prev, speciesId: speciesItem.id.toString() }));
    setSpeciesDropdownVisible(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "phone" && !/^\+?\d*$/.test(value)) {
      return; // อนุญาตเฉพาะตัวเลขและเครื่องหมาย +
    }

    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Color options
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

  const handleColorToggle = (colorName: string) => {
    setFormData((prev) => ({
      ...prev,
      color: prev.color.includes(colorName)
        ? prev.color.filter((c) => c !== colorName)
        : [...prev.color, colorName],
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validation
      if (!formData.description || !formData.speciesId || !formData.phone) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน (รายละเอียด, ประเภท, เบอร์ติดต่อ)");
        return;
      }

      if (!mainImage) {
        alert("กรุณาเลือกรูปภาพอย่างน้อย 1 รูป");
        return;
      }

      if (formData.foundDate && new Date(formData.foundDate) > new Date()) {
        alert("วันที่พบต้องไม่เป็นวันในอนาคต");
        return;
      }

      

      const formDataToSend = new FormData();

      // Add form data
      formDataToSend.append("description", formData.description);
      formDataToSend.append("speciesId", formData.speciesId);
      formDataToSend.append("breed", formData.breed);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("color", JSON.stringify(formData.color));
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("facebook", formData.facebook);
      formDataToSend.append("finderName", formData.finderName);
      formDataToSend.append("distinctive", formData.distinctive);
      formDataToSend.append("status", formData.status);

      // Add location data
      formDataToSend.append("lat", coords.lat.toString());
      formDataToSend.append("lng", coords.lng.toString());

      // Add found date if provided
      if (formData.foundDate) {
        formDataToSend.append(
          "foundDate",
          new Date(formData.foundDate).toISOString()
        );
      }

      // Add images
      if (mainImage) {
        formDataToSend.append("images", mainImage);
      }

      galleryImages.forEach((image) => {
        if (image) {
          formDataToSend.append("images", image);
        }
      });

      const response = await fetch("/api/foundpet", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.json();
        alert("ลงทะเบียนสัตว์พบเจอสำเร็จ!");

        // Reset form
        setFormData({
          description: "",
          speciesId: "",
          breed: "",
          gender: "",
          color: [],
          phone: "",
          facebook: "",
          finderName: "",
          distinctive: "",
          status: "finding",
          foundDate: "",
        });

        setMainImage(null);
        setMainImagePreview(null);
        setGalleryImages([null, null, null]);
        setGalleryPreviews([null, null, null]);
        router.push(`/announcement`);
      } else {
        const error = await response.json();
        alert(`เกิดข้อผิดพลาด: ${error.message}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const selectedSpecies = species.find(
    (s) => s.id.toString() === formData.speciesId
  );

  return (
    <div>
      <title>ลงทะเบียนหาเจ้าของ</title>
      <h1 className="text-xl font-semibold">
        <span className="bg-[#EAD64D] py-5 pl-3 sm:py-7 sm:pl-5 xl:py-9 xl:pl-7 rounded-full">
          ลง
        </span>
        ทะเบียนหาเจ้าของ
      </h1>

      <div className="flex flex-col lg:flex-row 2xl:gap-56 xl:gap-44 lg:gap-24 md:gap-5 sm:gap-8 lg:pl-12 md:pl-28 sm:pl-20 pl-7 pt-18">
        {/* Image Section */}
        <div className="lg:pl-0 md:pl-28 sm:pl-24 pl-20 pb-5">
          <div className="your-container">
            <img
              src={mainImagePreview || "/all/image.png"}
              alt="main"
              onClick={() => mainInputRef.current?.click()}
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
                    src={galleryPreviews[index] || "/all/image.png"}
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

        {/* Form Section */}
        <div className="flex flex-col w-full 2xl:max-w-xl xl:max-w-lg md:max-w-md sm:max-w-sm max-w-xs mb-2">
          {/* Species and Breed */}
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">ประเภท</p>
              <div className="relative w-full">
                <input
                  value={selectedSpecies?.name || ""}
                  onClick={() =>
                    setSpeciesDropdownVisible(!isSpeciesDropdownVisible)
                  }
                  readOnly
                  className="w-full mt-1 p-2 pr-10 border border-gray-300 rounded-md mb-3 cursor-pointer"
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-7 h-7 pb-1 text-gray-500 cursor-pointer"
                  onClick={() =>
                    setSpeciesDropdownVisible(!isSpeciesDropdownVisible)
                  }
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M7 10l5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                {isSpeciesDropdownVisible && (
                  <div className="absolute top-12 w-full mt-2 bg-white shadow-lg rounded-md border border-gray-300 z-10">
                    <ul>
                      {species.map((speciesItem) => (
                        <li
                          key={speciesItem.id}
                          className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-200 border-b border-gray-300 last:border-b-0"
                          onClick={() => handleSelectSpecies(speciesItem)}
                        >
                          {speciesItem.name}
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
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3"
              />
            </div>
          </div>

          {/* Gender */}
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">เพศ</p>
              <div className="relative w-full">
                <input
                  value={formData.gender}
                  readOnly
                  onClick={() =>
                    setGenderDropdownVisible(!isGenderDropdownVisible)
                  }
                  className="w-full mt-1 p-2 pr-10 border border-gray-300 rounded-md cursor-pointer"
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-500 cursor-pointer"
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
                      {["เพศผู้", "เพศเมีย", "ไม่ทราบ"].map((option) => (
                        <li
                          key={option}
                          className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-200 border-b border-gray-300 last:border-b-0"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              gender: option,
                            }));
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

          {/* Colors */}
          <div className="mb-4">
            <p className="sm:text-lg xl:text-xl mb-2">สี</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((color, idx) => {
                const isSelected = formData.color.includes(color.name);
                return (
                  <div
                    key={idx}
                    onClick={() => handleColorToggle(color.name)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer text-sm ${
                      isSelected
                        ? "bg-blue-200 border-2 border-blue-400"
                        : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full ${color.code} border border-gray-400`}
                    ></div>
                    <span>{color.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Distinctive marks */}
          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">รอยตำหนิ/ลักษณะเด่น</p>
            <input
              name="distinctive"
              value={formData.distinctive}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">รายละเอียด</p>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3"
              rows={3}
            />
          </div>

          {/* Found Date */}
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="flex flex-col">
              <p className="sm:text-lg xl:text-xl">วันที่พบ</p>
              <input
                type="date"
                name="foundDate"
                value={formData.foundDate}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3"
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col mb-20">
            {/* สามารถเพิ่ม UI สำหรับเลือก status ได้ถ้าต้องการ */}
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="flex flex-col mb-10 2xl:mr-40 xl:mr-32 lg:mr-28 lg:ml-10 md:mr-20 sm:mr-18 mr-10">
        <div className="relative">
          <div
            ref={mapContainerRef}
            id="map"
            className="w-full h-[500px] relative"
          />
          <img
            src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
            width="40"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full z-[999] pointer-events-none"
            alt="location pin"
          />
          <div className="mt-3 text-sm">
            Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-10 mb-5">
          <p className="sm:text-lg xl:text-xl">การติดต่อ</p>
        </div>

        <div className="flex flex-col w-full xl:max-w-xl md:max-w-md sm:max-w-sm max-w-xs mb-2">
          

          <div className="flex flex-col my-3">
            <p className="sm:text-lg xl:text-xl">เบอร์ติดต่อ</p>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3"
            />
          </div>

          <div className="flex flex-col mb-2">
            <p className="sm:text-lg xl:text-xl">Facebook</p>
            <input
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end ml-20 mt-5 lg:mb-8 mb-5">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#7CBBEB] text-white hover:bg-sky-600 shadow-md rounded-xl px-6 py-1 sm:text-lg xl:text-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "กำลังบันทึก..." : "ตกลง"}
          </button>
        </div>
      </div>
    </div>
  );
}
