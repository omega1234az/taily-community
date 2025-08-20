"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import PetCard from "@/app/component/PetCard";
import PetModal from "@/app/component/PetModal";
import { useRouter } from "next/navigation";

interface Disease {
  id?: number;
  name: string;
  date: string;
}

interface Vaccine {
  id?: number;
  name: string;
  date: string;
  nextdate: string;
}

interface Treatment {
  id?: number;
  name: string;
  date: string;
  description?: string;
}

interface Pet {
  id: number;
  ownerName?: string;
  name: string;
  images?: { id: number; url: string; petId: number; mainImage: boolean }[];
  history?: string;
  disease?: string;
  vaccine?: string;
  age?: string;
  gender?: string;
  speciesId?: number;
  breed?: string;
  isNeutered?: number;
  color?: string[] | string;
  markings?: string;
  description?: string;
  phone?: string;
  facebook?: string;
  diseaseData?: Disease[];
  vaccineData?: Vaccine[];
  treatmentData?: Treatment[];
}

export default function Pet() {
  const [showModal, setShowModal] = useState(false);
  const [isRegistered, setIsRegistered] = useState(true);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [activeSection, setActiveSection] = useState<
    "history" | "disease" | "vaccine" | "treatment"
  >("history");
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);

  // โหลดข้อมูลสัตว์เลี้ยง
  const fetchPets = async () => {
    try {
      const res = await fetch("/api/pets/me");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error("โหลดข้อมูลสัตว์เลี้ยงล้มเหลว");
      const data: Pet[] = await res.json();
      setPets(data);
      console.log("Pets data:", data);
      setIsRegistered(data.length > 0);
    } catch (error) {
      console.error(error);
      setIsRegistered(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  // เพิ่มสัตว์เลี้ยงใหม่
  const createPet = async (pet: Omit<Pet, "id">) => {
    try {
      const res = await fetch("/api/pets/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pet),
      });
      if (!res.ok) throw new Error("เพิ่มสัตว์เลี้ยงไม่สำเร็จ");
      await fetchPets();
    } catch (error) {
      console.error(error);
    }
  };

  // แก้ไขข้อมูลสัตว์เลี้ยง
  const updatePet = async (id: number, pet: Partial<Pet>) => {
    try {
      const res = await fetch(`/api/pets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pet),
      });
      if (!res.ok) throw new Error("แก้ไขสัตว์เลี้ยงไม่สำเร็จ");
      await fetchPets();
    } catch (error) {
      console.error(error);
    }
  };

  // ลบสัตว์เลี้ยง
  const deletePet = async (id: number) => {
    try {
      const res = await fetch(`/api/pets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("ลบสัตว์เลี้ยงไม่สำเร็จ");
      await fetchPets();
    } catch (error) {
      console.error(error);
    }
  };

  // ดึงข้อมูลโรคประจำตัวของสัตว์เลี้ยง
  const fetchDiseases = async (petId: number): Promise<Disease[]> => {
    const res = await fetch(`/api/pets/chronicDiseases?petId=${petId}`);
    if (!res.ok) throw new Error("โหลดโรคประจำตัวล้มเหลว");
    return res.json();
  };

  // เพิ่มโรคประจำตัว
  const addDisease = async (disease: Disease & { petId: number }) => {
    const res = await fetch(`/api/pets/chronicDiseases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(disease),
    });
    if (!res.ok) throw new Error("เพิ่มโรคไม่สำเร็จ");
  };

  // แก้ไขโรคประจำตัว
  const updateDisease = async (id: number, disease: Partial<Disease>) => {
    const res = await fetch(`/api/pets/chronicDiseases/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(disease),
    });
    if (!res.ok) throw new Error("แก้ไขโรคไม่สำเร็จ");
  };

  // ลบโรคประจำตัว
  const deleteDisease = async (id: number) => {
    const res = await fetch(`/api/pets/chronicDiseases/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("ลบโรคไม่สำเร็จ");
  };

  // ดึงข้อมูลวัคซีน
  const fetchVaccines = async (petId: number): Promise<Vaccine[]> => {
    const res = await fetch(`/api/pets/vaccine-records?petId=${petId}`);
    if (!res.ok) throw new Error("โหลดวัคซีนล้มเหลว");
    return res.json();
  };

  // เพิ่มวัคซีน
  const addVaccine = async (vaccine: Vaccine & { petId: number }) => {
    const res = await fetch(`/api/pets/vaccine-records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vaccine),
    });
    if (!res.ok) throw new Error("เพิ่มวัคซีนไม่สำเร็จ");
  };

  // แก้ไขวัคซีน
  const updateVaccine = async (id: number, vaccine: Partial<Vaccine>) => {
    const res = await fetch(`/api/pets/vaccine-records/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vaccine),
    });
    if (!res.ok) throw new Error("แก้ไขวัคซีนไม่สำเร็จ");
  };

  // ลบวัคซีน
  const deleteVaccine = async (id: number) => {
    const res = await fetch(`/api/pets/vaccine-records/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("ลบวัคซีนไม่สำเร็จ");
  };

  const handlePetClick = (pet: Pet) => {
    setSelectedPet(pet);
    setShowModal(true);
  };

  if (!isRegistered) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow mt-10">
        <h1 className="text-xl font-bold text-center mb-6">สัตว์เลี้ยงหาย</h1>
        <p className="text-center mb-6 text-gray-600">
          กรุณาลงทะเบียนสัตว์เลี้ยง
        </p>
        <div className="relative w-96 h-64 mb-6">
          <Image
            src="/all/cat.png"
            alt="Cute cat"
            fill
            className="object-contain"
            priority
          />
        </div>
        <Link
          href="/registerpet"
          className="rounded-full shadow-md bg-[#EAD64D] text-black text-lg py-2 px-7 hover:bg-yellow-200 transition duration-300 cursor-pointer"
        >
          ลงทะเบียน
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2">
        <svg
          width="19"
          height="15"
          viewBox="0 0 19 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-2.5 h-2.5 sm:w-3 sm:h-3 xl:w-3.5 xl:h-3.5 2xl:w-6 2xl:h-10"
        >
          <ellipse cx="9.5" cy="9" rx="9.5" ry="9" fill="#7CBBEB" />
        </svg>
        <h1 className="sm:text-xl xl:text-2xl  font-bold">สัตว์เลี้ยง</h1>
      </div>

      {/* Pet Cards */}
      <div className="flex flex-wrap py-5 2xl:gap-18 xl:gap-14 lg:gap-12 md:gap-12 sm:gap-8 gap-5">
        {pets.map((pet) => {
          // เลือกภาพที่มี mainImage: true หรือภาพแรกถ้าไม่มี mainImage
          const mainImage =
            pet.images?.find((img) => img.mainImage) || pet.images?.[0];
          return (
            <div
              key={pet.id}
              onClick={() => handlePetClick(pet)}
              className="cursor-pointer"
            >
              <PetCard
                imageSrc={mainImage?.url || "/default.png"}
                name={pet.name}
              />
            </div>
          );
        })}

        {/* Register Button */}
        <div className="group cursor-pointer hover:bg-gray-200 lg:mb-10 sm:mb-7 mb-5  flex justify-center items-center flex-col md:flex-row gap-6  rounded-2xl shadow-lg bg-[#E5EEFF] w-full  2xl:h-[315px] xl:h-[288px] lg:h-[257px] md:h-[248px] sm:h-[220px] h-[160px] 2xl:max-w-[230px] xl:max-w-[225px] lg:max-w-[200px] md:max-w-[195px] sm:max-w-[176px] max-w-[128px] transition-transform duration-200 transform hover:scale-105">
          <Link
            href="/registerpet"
            className="w-full h-full flex justify-center items-center"
          >
            <div className="bg-[#7CBBEB] group-hover:bg-[#addbf7] transition-colors duration-200 rounded-full p-2 flex justify-center items-center">
              <svg
                className="2xl:w-20 2xl:h-20 xl:w-[65px] xl:h-[65px] lg:w-14 lg:h-14 md:w-14 md:h-14 sm:w-12 sm:h-12 w-10 h-10"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
              >
                <path
                  d="M50 20V80M20 50H80"
                  stroke="white"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </Link>
        </div>
      </div>

      {/* Modal */}
      <PetModal
        showModal={showModal}
        setShowModal={setShowModal}
        selectedPet={selectedPet}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
    </div>
  );
}
