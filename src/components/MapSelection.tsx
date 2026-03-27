'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import useSocket from '@/lib/sockets/socket';
import { useAuthContext } from '@/contexts/AuthContext';

interface MapComponentProps {
  onPositionChange: (lat: number, lng: number) => void;
  initialLat?: string | number;
  initialLng?: string | number;
  onLocationSelect?: () => void;
}

export default function MapComponent({ onPositionChange, initialLat, initialLng, onLocationSelect }: MapComponentProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { token } = useAuthContext();
  // const socket = useSocket(token || undefined); // Commented out to avoid type errors

  const [markerPosition, setMarkerPosition] = useState({
    lat: initialLat && Number.isFinite(Number(initialLat)) ? Number(initialLat) : 24.8607,
    lng: initialLng && Number.isFinite(Number(initialLng)) ? Number(initialLng) : 67.0011,
  });

  const [zoom, setZoom] = useState(initialLat && initialLng ? 15 : 12);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Update marker position when initial values change
  useEffect(() => {
    if (initialLat && initialLng && Number.isFinite(Number(initialLat)) && Number.isFinite(Number(initialLng))) {
      setMarkerPosition({
        lat: Number(initialLat),
        lng: Number(initialLng),
      });
      setZoom(15);
    }
  }, [initialLat, initialLng]);

  // Enhanced location selection handler with smooth transitions
  const handleLocationSelect = (lat: number, lng: number) => {
    setMarkerPosition({ lat, lng });
    setZoom(17); // Better zoom for precise location selection
    onPositionChange(lat, lng);
    
    // Auto-close dialog after location selection with slight delay
    if (onLocationSelect) {
      setTimeout(() => onLocationSelect(), 500);
    }
    
    // Emit socket event for real-time updates (commented out)
    // if (socket) {
    //   socket.emit('location-selected', {
    //     lat,
    //     lng,
    //     timestamp: Date.now()
    //   });
    // }
  };  

  // Autocomplete logic (NO loader here)
  useEffect(() => {
    if (!inputRef.current || !window.google) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current
    );

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();

      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        handleLocationSelect(lat, lng);
      }
    });
  }, []);

  // Marker drag handler
  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      handleLocationSelect(lat, lng);
    }
  };

  // Map click handler for direct location selection
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      handleLocationSelect(lat, lng);
    }
  }, []);

  // Map loaded handler
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Get current location
  const handleGetCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          handleLocationSelect(lat, lng);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);


  return (
    <div style={{
      position: 'relative',
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      padding: '0',
      boxSizing: 'border-box'
    }}>
      <GoogleMap
        mapContainerStyle={{
          width: '100%',
          height: '100%'
        }}
        center={markerPosition}
        zoom={zoom}
        onClick={handleMapClick}
        onLoad={onMapLoad}
        options={{
          disableDefaultUI: false,
          clickableIcons: true,
          scrollwheel: true,
          draggable: true,
          keyboardShortcuts: true,
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          fullscreenControl: true,
          gestureHandling: 'auto',
        }}
      >
        <Marker
          position={markerPosition}
          draggable
          onDragEnd={(e) => {
            if (e.latLng) {
              handleMarkerDragEnd(e as any);
            }
          }}
        />
      </GoogleMap>

      {/* CSS for loading spinner */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}