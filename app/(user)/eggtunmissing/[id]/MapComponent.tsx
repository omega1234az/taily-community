import React, { useRef, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  coords: { lat: number; lng: number };
}

const MapComponent: React.FC<MapComponentProps> = ({ coords }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        touchZoom: false,
      }).setView([coords.lat, coords.lng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    // Update map view when coords change
    if (mapRef.current) {
      mapRef.current.setView([coords.lat, coords.lng], 13);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [coords.lat, coords.lng]);

  return (
    <div className="relative">
      <div
        ref={mapContainerRef}
        id="map"
        className="w-full h-[500px] relative"
      ></div>
      <img
        id="pin"
        src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
        width="40"
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full z-[999] pointer-events-none"
      />
    </div>
  );
};

export default MapComponent;