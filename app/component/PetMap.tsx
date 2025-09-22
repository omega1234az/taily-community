"use client";

import {
  MapContainer,
  TileLayer,
  Circle,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect } from "react";

// ตั้งค่า default icon ของ Leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ✅ ควบคุม lock/unlock
function MapInteractionController({ interactive }: { interactive: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (interactive) {
      map.dragging.enable();
      map.scrollWheelZoom.enable();
    } else {
      map.dragging.disable();
      map.scrollWheelZoom.disable();
    }
  }, [interactive, map]);
  return null;
}

// ✅ ปุ่มกดกลับไปยังวง พร้อมซูมเข้า
function RecenterButton({
  lat,
  lng,
  zoomLevel = 17,
}: {
  lat: number;
  lng: number;
  zoomLevel?: number;
}) {
  const map = useMap();
  return (
    <button
      onClick={() => {
        map.setView([lat, lng], zoomLevel, { animate: true });
      }}
      className="absolute top-12 right-2 z-[1000] bg-white px-3 py-1 rounded shadow text-sm font-semibold"
    >
      📍 กลับไปที่วง
    </button>
  );
}

export default function Map({
  lat = 13.736717,
  lng = 100.523186,
  zoom = 15,
}) {
  const [interactive, setInteractive] = useState(false);

  return (
    <div className="relative w-full h-[500px]">
      {/* ปุ่ม toggle lock/unlock */}
      <button
        onClick={() => setInteractive(!interactive)}
        className="absolute top-2 right-2 z-[1000] bg-white px-3 py-1 rounded shadow text-sm font-semibold"
      >
        {interactive ? "🔓 ปลดล็อกแล้ว" : "🔒 ล็อกอยู่"}
      </button>

      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapInteractionController interactive={interactive} />

        {/* ✅ ปุ่มกลับไปที่วง (ซูมเข้า) */}
        <RecenterButton lat={lat} lng={lng} zoomLevel={17} />

        {/* วงกลม */}
        <Circle
          center={[lat, lng]}
          radius={200}
          pathOptions={{ color: "red", fillColor: "red", fillOpacity: 0.2 }}
        >
          <Popup>พื้นที่รัศมี 200 เมตร</Popup>
        </Circle>
      </MapContainer>
    </div>
  );
}
