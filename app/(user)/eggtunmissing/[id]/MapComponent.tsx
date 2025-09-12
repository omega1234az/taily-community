import React, { useRef, useEffect } from "react";
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

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        dragging: true,
        scrollWheelZoom: true,
      }).setView([coords.lat, coords.lng], 17);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(mapRef.current);

      // สร้าง Marker
      

      // สร้าง Circle
      circleRef.current = L.circle([coords.lat, coords.lng], {
        radius: 200,
        color: "red",
        fillColor: "red",
        fillOpacity: 0.2,
      }).addTo(mapRef.current);
    }

    // อัปเดตตำแหน่ง Marker และ Circle ถ้า coords เปลี่ยน
    if (markerRef.current) {
      markerRef.current.setLatLng([coords.lat, coords.lng]);
    }
    if (circleRef.current) {
      circleRef.current.setLatLng([coords.lat, coords.lng]);
    }

    // อัปเดต view ของ map
    if (mapRef.current) {
      mapRef.current.setView([coords.lat, coords.lng], mapRef.current.getZoom());
    }
  }, [coords.lat, coords.lng]);

  return <div ref={mapContainerRef} className="w-full h-[500px]" />;
};

export default MapComponent;
