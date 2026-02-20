'use client';

import React, { useRef, useState, useEffect } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import useSocket from '@/lib/sockets/socket';
import { useAuthContext } from '@/contexts/AuthContext';

const MapComponent = ({ onPositionChange, initialLat, initialLng, onLocationSelect }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { token } = useAuthContext();
  const socket = useSocket(token);

  const [markerPosition, setMarkerPosition] = useState({
    lat: initialLat && Number.isFinite(Number(initialLat)) ? Number(initialLat) : 33.6844,
    lng: initialLng && Number.isFinite(Number(initialLng)) ? Number(initialLng) : 73.0479,
  });

  const [zoom, setZoom] = useState(initialLat && initialLng ? 15 : 12);

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
    
    // Emit socket event for real-time updates
    if (socket) {
      socket.emit('location-selected', {
        lat,
        lng,
        timestamp: Date.now()
      });
    }
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
  }, [handleLocationSelect]);

  // Marker drag handler
  const handleMarkerDragEnd = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    handleLocationSelect(lat, lng);
  };

  // Map click handler for direct location selection
  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    handleLocationSelect(lat, lng);
  };

  return (
    <div style={{
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
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true
        }}
      >
        <Marker
          position={markerPosition}
          draggable
          onDragEnd={handleMarkerDragEnd}
        />
      </GoogleMap>
    </div>
  );
};

export default MapComponent;
