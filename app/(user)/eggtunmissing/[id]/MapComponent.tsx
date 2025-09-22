import React, { useRef, useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  coords: { lat: number; lng: number };
}

const MapComponent: React.FC<MapComponentProps> = ({ coords }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [interactive, setInteractive] = useState(false); // ✅ state สำหรับ lock/unlock

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        dragging: interactive,
        scrollWheelZoom: interactive,
      }).setView([coords.lat, coords.lng], 17);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(mapRef.current);

      // Marker
      markerRef.current = L.marker([coords.lat, coords.lng]).addTo(mapRef.current);

      // Circle
      circleRef.current = L.circle([coords.lat, coords.lng], {
        radius: 200,
        color: "red",
        fillColor: "red",
        fillOpacity: 0.2,
      }).addTo(mapRef.current);
    }

    if (mapRef.current) {
      if (interactive) {
        mapRef.current.dragging.enable();
        mapRef.current.scrollWheelZoom.enable();
      } else {
        mapRef.current.dragging.disable();
        mapRef.current.scrollWheelZoom.disable();
      }

      mapRef.current.setView([coords.lat, coords.lng], mapRef.current.getZoom());
    }

    // update marker/circle
    if (markerRef.current) {
      markerRef.current.setLatLng([coords.lat, coords.lng]);
    }
    if (circleRef.current) {
      circleRef.current.setLatLng([coords.lat, coords.lng]);
    }
  }, [coords.lat, coords.lng, interactive]);

  // ✅ ฟังก์ชันกดกลับไปยังวง (พร้อมซูมเข้า)
  const recenterMap = () => {
    if (mapRef.current) {
      mapRef.current.setView([coords.lat, coords.lng], 17, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-[500px]">
      {/* ✅ ปุ่ม toggle lock/unlock */}
      <button
        onClick={() => setInteractive(!interactive)}
        className="absolute top-2 right-2 z-[1000] bg-white px-3 py-1 rounded shadow text-sm font-semibold"
      >
        {interactive ? "🔓 ปลดล็อกแล้ว" : "🔒 ล็อกอยู่"}
      </button>

      {/* ✅ ปุ่มกลับไปยังวง */}
      <button
        onClick={recenterMap}
        className="absolute top-12 right-2 z-[1000] bg-white px-3 py-1 rounded shadow text-sm font-semibold"
      >
        📍 กลับไปที่วง
      </button>

      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default MapComponent;
