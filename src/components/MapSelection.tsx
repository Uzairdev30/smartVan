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

  // Load Google Maps API with places library for autocomplete
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  console.log('Google Maps API Key:', apiKey ? 'Present' : 'Missing');
  console.log('API Key length:', apiKey.length);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places'], // Ensure the places library is loaded
  });

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

  // Autocomplete logic with proper loading check
  useEffect(() => {
    console.log('Autocomplete useEffect triggered');
    console.log('isLoaded:', isLoaded);
    console.log('inputRef.current:', inputRef.current);
    console.log('window.google:', window.google);

    if (!isLoaded || !inputRef.current || !window.google) {
      console.log('Skipping autocomplete initialization - missing dependencies');
      return;
    }

    console.log('Initializing autocomplete...');
    
    try {
      // Remove all previous autocomplete instances
      if (inputRef.current) {
        // Clear any existing autocomplete
        inputRef.current.removeEventListener('keydown', () => {});
      }

      const autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['geocode'],
          fields: ['place_id', 'geometry', 'name', 'formatted_address'],
          componentRestrictions: { country: ['pk'] } // Restrict to Pakistan
        }
      );

      console.log('Autocomplete created successfully');

      autocomplete.addListener('place_changed', () => {
        console.log('Place changed event triggered');
        const place = autocomplete.getPlace();
        console.log('Selected place:', place);

        if (place.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          console.log('Location selected:', { lat, lng });

          handleLocationSelect(lat, lng);
          
          // Clear input after selection
          if (inputRef.current) {
            inputRef.current.value = place.name || place.formatted_address || '';
          }
        } else {
          console.log('No geometry found for selected place');
        }
      });

      console.log('Place changed listener added');

      // Cleanup function
      return () => {
        console.log('Cleaning up autocomplete listeners');
        if (window.google?.maps?.event) {
          window.google.maps.event.clearInstanceListeners(autocomplete);
        }
      };
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
    }
  }, [isLoaded, handleLocationSelect]);

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

  if (!isLoaded) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #4285f4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#666', fontFamily: 'Arial, sans-serif' }}>Loading Google Maps...</p>
        </div>
      </div>
    );
  }

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
      {/* Google Maps Search Input */}
      <input
        ref={inputRef}
        type="text"
        placeholder="Search for a location..."
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          padding: '12px 16px',
          width: '350px',
          borderRadius: '8px',
          border: '1px solid #ddd',
          fontSize: '14px',
          fontFamily: 'Arial, sans-serif',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          backgroundColor: 'white',
          outline: 'none',
          transition: 'all 0.2s ease',
        }}
        onFocus={(e) => {
          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
          e.target.style.borderColor = '#4285f4';
        }}
        onBlur={(e) => {
          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
          e.target.style.borderColor = '#ddd';
        }}
      />
      
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