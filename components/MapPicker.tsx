'use client';

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { useEffect } from 'react';
import '@/lib/fix-leaflet-icon';
type Props = {
  cityCenter: [number, number];
  latLon: [number, number] | null;
  setLatLon: (latLon: [number, number]) => void;
};

function LocationMarker({ setLatLon }: { setLatLon: (latLon: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setLatLon([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function MapPicker({ cityCenter, latLon, setLatLon }: Props) {
  return (
    <MapContainer
      center={cityCenter}
      zoom={13}
      scrollWheelZoom
      className="h-full w-full rounded"
    >
      <MapUpdater center={cityCenter} />
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker setLatLon={setLatLon} />
      {latLon && <Marker position={latLon} />}
    </MapContainer>
  );
}
