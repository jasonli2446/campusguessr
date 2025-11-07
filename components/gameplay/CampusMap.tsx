'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), {
  ssr: false,
});

const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), {
  ssr: false,
});

const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), {
  ssr: false,
});

import 'leaflet/dist/leaflet.css';
import { CWRU_CENTER, CWRU_BOUNDS } from '@/lib/coordinate-utils';

// Map configuration
const DEFAULT_ZOOM = 16;
const MIN_ZOOM = 14; // Prevent zooming too far out
const MAX_ZOOM = 18; // Prevent zooming too far in

// Convert CWRU_CENTER to leaflet tuple format
const CENTER_TUPLE: [number, number] = [CWRU_CENTER.lat, CWRU_CENTER.lng];

interface CampusMapProps {
  onPinDrop?: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number } | null;
  className?: string;
  triggerResize?: number; // Change this value to trigger map resize
}

// Create a dynamic component that handles map events and resizing
const MapEventsComponent = dynamic(() =>
  import('react-leaflet').then((mod) => {
    const { useMapEvents } = mod;

    return function MapEventHandler({
      onPinDrop,
      triggerResize
    }: {
      onPinDrop: (lat: number, lng: number) => void;
      triggerResize?: number;
    }) {
      const map = useMapEvents({
        click: (e: { latlng: { lat: number; lng: number } }) => {
          const { lat, lng } = e.latlng;
          console.log('Pin dropped at coordinates:', { lat, lng });
          onPinDrop(lat, lng);
        },
      });

      // Initial map size fix on mount
      React.useEffect(() => {
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      }, [map]);

      // Invalidate map size when triggerResize changes
      React.useEffect(() => {
        if (triggerResize !== undefined && triggerResize > 0) {
          setTimeout(() => {
            map.invalidateSize();
          }, 350); // Slightly longer delay to let CSS transition complete
        }
      }, [triggerResize, map]);

      return null;
    };
  }),
  { ssr: false }
);

export function CampusMap({ onPinDrop, selectedLocation, className = '', triggerResize }: CampusMapProps) {
  const [mounted, setMounted] = useState(false);
  const [pinPosition, setPinPosition] = useState<[number, number] | null>(null);
  const [L, setL] = useState<typeof import('leaflet') | null>(null);

  useEffect(() => {
    setMounted(true);

    import('leaflet').then((leaflet) => {
      setL(leaflet.default);

      if ('_getIconUrl' in leaflet.default.Icon.Default.prototype) {
        delete leaflet.default.Icon.Default.prototype._getIconUrl;
      }
      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
    });
  }, []);

  // Update pin position when selectedLocation changes
  useEffect(() => {
    if (selectedLocation) {
      setPinPosition([selectedLocation.lat, selectedLocation.lng]);
    }
  }, [selectedLocation]);

  const handlePinDrop = (lat: number, lng: number) => {
    setPinPosition([lat, lng]);
    onPinDrop?.(lat, lng);
  };

  if (!mounted || !L) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={CENTER_TUPLE}
        zoom={DEFAULT_ZOOM}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        maxBounds={[
          [CWRU_BOUNDS.south, CWRU_BOUNDS.west],
          [CWRU_BOUNDS.north, CWRU_BOUNDS.east]
        ]}
        maxBoundsViscosity={0.5}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg border-2 border-gray-300"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={MAX_ZOOM}
          tileSize={256}
          keepBuffer={2}
        />

        <MapEventsComponent onPinDrop={handlePinDrop} triggerResize={triggerResize} />

        {pinPosition && (
          <Marker position={pinPosition} />
        )}
      </MapContainer>

    </div>
  );
}

// Also export as default for backward compatibility
export default CampusMap;