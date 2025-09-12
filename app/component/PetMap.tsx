"use client";

import { MapContainer, TileLayer, Circle, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Configure default Leaflet icon options (ยังคงไว้ได้ แม้จะไม่ใช้ Marker)
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Map({ lat = 13.736717, lng = 100.523186, zoom = 15 }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Any additional Leaflet initialization can go here if needed
    }
  }, []);

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* วงกลมรอบตำแหน่งที่หาย */}
      <Circle
        center={[lat, lng]}
        radius={200} // 200 เมตร
        pathOptions={{ color: "red", fillColor: "red", fillOpacity: 0.2 }}
      >
        <Popup>พื้นที่รัศมี 200 เมตร</Popup>
      </Circle>
    </MapContainer>
  );
}
