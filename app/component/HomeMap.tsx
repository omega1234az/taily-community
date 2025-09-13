"use client";

import React, { useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

// Dynamically import react-leaflet components with SSR disabled
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const ZoomControl = dynamic(
  () => import("react-leaflet").then((mod) => mod.ZoomControl),
  { ssr: false }
);

// Interfaces
interface LostPetImage {
  url: string;
  mainImage?: boolean;
}

interface LostPet {
  id: number;
  title: string;
  location: string;
  lat?: number;
  lng?: number;
  lostDate: string;
  reward?: number;
  pet: {
    images: LostPetImage[];
  };
}

interface FoundPet {
  id: number;
  species: { name: string };
  location: string;
  lat?: number;
  lng?: number;
  foundDate: string;
  images: { url: string; mainImage?: boolean }[];
}

// Custom marker icon function with SSR fallback
const createCustomIcon = (imageUrl?: string, isLostPet: boolean = true) => {
  if (typeof window === "undefined") {
    return null; // SSR fallback
  }

  const L = require("leaflet");

  const markerHtml = `
    <div style="
      position: relative;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: 4px solid ${isLostPet ? "#ef4444" : "#3b82f6"};
      background: white;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
      overflow: hidden;
      transform: translate(-50%, -50%);
      transition: transform 0.3s ease;
    ">
      <img 
        src="${imageUrl || "/images/default_pet.png"}" 
        style="
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          transition: transform 0.3s ease;
        "
        onerror="this.src='/images/default_pet.png'"
      />
      <div style="
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-top: 14px solid ${isLostPet ? "#ef4444" : "#3b82f6"};
        filter: drop-shadow(0 3px 5px rgba(0,0,0,0.2));
      "></div>
      <div style="
        position: absolute;
        top: -10px;
        right: -10px;
        width: 24px;
        height: 24px;
        background: ${isLostPet ? "#ef4444" : "#3b82f6"};
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: white;
        font-weight: bold;
        box-shadow: 0 3px 10px rgba(0,0,0,0.25);
      ">
        ${isLostPet ? "!" : "✓"}
      </div>
    </div>
  `;

  return L.divIcon({
    html: markerHtml,
    iconSize: [64, 64],
    iconAnchor: [32, 64],
    popupAnchor: [0, -64],
    className: "custom-pet-marker",
  });
};

interface HomeMapProps {
  userLocation: [number, number] | null;
  currentMapPets: (LostPet | FoundPet)[];
  showLostPets: boolean;
  mapRef: React.MutableRefObject<any>;
  filterLocation: string;
  setFilterLocation: (value: string) => void;
}

const HomeMap: React.FC<HomeMapProps> = ({
  userLocation,
  currentMapPets,
  showLostPets,
  mapRef,
  filterLocation,
  setFilterLocation,
}) => {
  const mapCenter = userLocation || [16.4707, 99.5367];

  const handleGoToMyLocation = useCallback(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.setView([userLocation[0], userLocation[1]], 12);
    }
  }, [mapRef, userLocation]);

  return (
    <div className="w-full flex justify-center mt-8">
      <div className="relative flex flex-col mb-10 mt-5 2xl:ml-20 xl:mr-20 lg:mr-20 lg:ml-10 md:mr-20 sm:mr-10 mr-auto w-full max-w-7xl">
        <p className="sm:text-xl xl:text-lg mb-4 font-semibold text-gray-800">
          สถานที่{showLostPets ? "หาย" : "พบ"}
        </p>
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:gap-4 z-10 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              placeholder="ค้นหาตามสถานที่..."
              className="w-full text-sm sm:text-base py-3 px-4 pr-10 border-2 border-gray-200 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white/90 backdrop-blur-sm"
            />
          </div>
          <button
            onClick={handleGoToMyLocation}
            className="w-full sm:w-auto bg-[#EAD64D] text-black text-sm sm:text-base py-3 px-6 rounded-lg hover:bg-yellow-200 transition duration-300 shadow-md flex items-center justify-center gap-2"
          >
            ตำแหน่งของฉัน
          </button>
        </div>
        <div className="relative h-[500px] sm:h-[600px] md:h-[700px] w-full rounded-3xl overflow-hidden shadow-xl border-2 border-gradient-to-r from-blue-200 to-amber-200 bg-white/80 backdrop-blur-sm">
          <MapContainer
            center={mapCenter}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <ZoomControl position="topright" />
            {currentMapPets.map((pet) =>
              pet.lat && pet.lng ? (
                <Marker
                  key={pet.id}
                  position={[pet.lat, pet.lng]}
                  icon={createCustomIcon(
                    showLostPets
                      ? (pet as LostPet).pet.images.find((image) => image.mainImage)?.url ||
                        (pet as LostPet).pet.images[0]?.url
                      : (pet as FoundPet).images.find((image) => image.mainImage)?.url ||
                        (pet as FoundPet).images[0]?.url,
                    showLostPets
                  )}
                >
                  <Popup>
                    <div>
                      <h3>{showLostPets ? (pet as LostPet).title : (pet as FoundPet).species.name}</h3>
                      <p>{pet.location}</p>
                    </div>
                  </Popup>
                </Marker>
              ) : null
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default HomeMap;
