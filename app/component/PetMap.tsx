"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Configure default Leaflet icon options
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Map({ lat = 13.736717, lng = 100.523186, zoom = 13 }) {
  // Ensure Leaflet is only accessed on the client side
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
      <Marker position={[lat, lng]}>
        <Popup>หายตรงนี้</Popup>
      </Marker>
    </MapContainer>
  );
}