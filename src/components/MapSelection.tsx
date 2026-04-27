'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import useSocket from '@/lib/sockets/socket';
import { useAuthContext } from '@/contexts/AuthContext';

interface MapComponentProps {
  onPositionChange: (lat: number, lng: number) => void;
  initialLat?: string | number;
  initialLng?: string | number;
  onLocationSelect?: () => void;
  startLocation?: { lat: number; lng: number } | null;
  endLocation?: { lat: number; lng: number } | null;
  showRoute?: boolean;
}

type Location = { lat: number; lng: number } | null;
type RouteInfo = { distance: string; duration: string } | null;

export default function MapComponent({
  onPositionChange,
  initialLat,
  initialLng,
  onLocationSelect,
  startLocation,
  endLocation,
  showRoute = false,
}: MapComponentProps) {
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
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo>(null);
  const [isTrafficEnabled, setIsTrafficEnabled] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain' | 'hybrid'>('roadmap');
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  // Initialize Google Maps services
  useEffect(() => {
    if (isLoaded && window.google) {
      directionsServiceRef.current = new window.google.maps.DirectionsService();
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        draggable: true,
        panel: null,
        polylineOptions: {
          strokeColor: '#4285f4',
          strokeWeight: 4,
          strokeOpacity: 0.8,
        },
      });
      trafficLayerRef.current = new window.google.maps.TrafficLayer();
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      
      // Initialize session token for search quality
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
    }
  }, [isLoaded]);

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

  // Handle route calculation when start/end locations are provided
  useEffect(() => {
    if (showRoute && startLocation && endLocation && directionsServiceRef.current && directionsRendererRef.current) {
      calculateRoute(startLocation, endLocation);
    } else if (!showRoute && directionsRendererRef.current) {
      clearRoute();
    }
  }, [startLocation, endLocation, showRoute]);

  // Enhanced location selection handler with smooth transitions
  const handleLocationSelect = useCallback((lat: number, lng: number, placeName?: string) => {
    setMarkerPosition({ lat, lng });
    setZoom(17); // Better zoom for precise location selection
    onPositionChange(lat, lng);

    if (placeName) {
      setSearchValue(placeName);
      setSelectedPlace({ name: placeName } as any);
    }

    // Auto-close dialog after location selection with slight delay
    if (onLocationSelect) {
      setTimeout(() => onLocationSelect(), 500);
    }
  }, [onPositionChange, onLocationSelect]);

  // Calculate and display route
  const calculateRoute = useCallback((origin: Location, destination: Location) => {
    if (!origin || !destination || !directionsServiceRef.current || !directionsRendererRef.current) return;

    const request: google.maps.DirectionsRequest = {
      origin,
      destination,
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false,
    };

    directionsServiceRef.current.route(request, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK && result) {
        directionsRendererRef.current?.setDirections(result);

        // Extract route information
        if (result.routes[0] && result.routes[0].legs[0]) {
          const leg = result.routes[0].legs[0];
          const distance = leg.distance?.text || '';
          const duration = leg.duration?.text || '';
          setRouteInfo({ distance, duration });
        }

        // Auto-fit map to show the entire route
        if (result.routes[0].bounds && mapRef.current) {
          mapRef.current.fitBounds(result.routes[0].bounds);
        }
      } else {
        console.error('Directions request failed due to: ' + status);
        setRouteInfo(null);
      }
    });
  }, []);

  // Clear route
  const clearRoute = useCallback(() => {
    try {
      if (directionsRendererRef.current && 
          directionsRendererRef.current.setDirections && 
          window.google?.maps) {
        directionsRendererRef.current.setDirections({ routes: [] } as any);
      }
    } catch (error) {
      console.error('Error clearing route:', error);
    } finally {
      setRouteInfo(null);
    }
  }, []);

  // Search functionality with TRUE Google Maps level quality
  const handleSearch = useCallback((query: string) => {
    setSearchValue(query);

    if (query.length < 2 || !autocompleteServiceRef.current) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Create session token for Google-quality search
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
    }

    const request: google.maps.places.AutocompletionRequest = {
      input: query,
      sessionToken: sessionTokenRef.current,
      types: ['geocode', 'establishment'], // Include shops, streets, landmarks
      componentRestrictions: { country: ['pk'] },
    };

    // Add map bounds bias for smart local search
    if (mapRef.current) {
      const bounds = mapRef.current.getBounds();
      if (bounds) {
        request.bounds = bounds;
      }
    }

    autocompleteServiceRef.current.getPlacePredictions(
      request,
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSearchSuggestions(predictions);
          setShowSuggestions(true);
        } else {
          setSearchSuggestions([]);
          setShowSuggestions(false);
        }
      },
    );
  }, []);

  // Handle suggestion selection with session token reset
  const handleSuggestionSelect = useCallback((prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesServiceRef.current || !mapRef.current) return;

    const request: google.maps.places.PlaceDetailsRequest = {
      placeId: prediction.place_id,
      fields: ['place_id', 'geometry', 'name', 'formatted_address', 'types'],
      sessionToken: sessionTokenRef.current || undefined,
    };

    placesServiceRef.current.getDetails(
      request,
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          handleLocationSelect(lat, lng, place.formatted_address || place.name);
          setShowSuggestions(false);
          setSearchSuggestions([]);
          
          // Reset session token after selection (Google best practice)
          sessionTokenRef.current = null;
        }
      },
    );
  }, [handleLocationSelect]);

  // Toggle traffic layer
  const toggleTrafficLayer = useCallback(() => {
    if (!trafficLayerRef.current || !mapRef.current) return;

    if (isTrafficEnabled) {
      trafficLayerRef.current.setMap(null);
    } else {
      trafficLayerRef.current.setMap(mapRef.current);
    }
    setIsTrafficEnabled(!isTrafficEnabled);
  }, [isTrafficEnabled]);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const location = { lat, lng };
        setCurrentLocation(location);
        // Update marker position without triggering location selection
        setMarkerPosition({ lat, lng });
        setZoom(17);
        onPositionChange(lat, lng);
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, [onPositionChange]);

  // Initialize Places service when map loads
  useEffect(() => {
    if (mapRef.current && isLoaded && window.google) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(mapRef.current);
    }
  }, [mapRef.current, isLoaded]);

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
  }, [handleLocationSelect]);

  // Map loaded handler
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;

    // Initialize DirectionsRenderer
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(map);
    }

    // Initialize Places service
    if (placesServiceRef.current) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(map);
    }
  }, []);

  // Google Maps red location pin icon
  const googleMarkerIcon = useMemo(() => ({
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="redPinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#f44336;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#d32f2f;stop-opacity:1" />
          </linearGradient>
        </defs>
        <path d="M20 5C12 5 5 12 5 20C5 28 20 40 20 40S35 28 35 20C35 12 28 5 20 5Z" fill="url(#redPinGradient)" stroke="#fff" stroke-width="2"/>
        <circle cx="20" cy="20" r="6" fill="#fff"/>
        <circle cx="20" cy="20" r="3" fill="#d32f2f"/>
      </svg>
    `),
    scaledSize: new window.google.maps.Size(40, 40),
    anchor: new window.google.maps.Point(20, 40),
  }), []);

  const startMarkerIcon = useMemo(() => ({
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="greenPinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#4caf50;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#388e3c;stop-opacity:1" />
          </linearGradient>
        </defs>
        <path d="M20 5C12 5 5 12 5 20C5 28 20 40 20 40S35 28 35 20C35 12 28 5 20 5Z" fill="url(#greenPinGradient)" stroke="#fff" stroke-width="2"/>
        <text x="20" y="24" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">S</text>
      </svg>
    `),
    scaledSize: new window.google.maps.Size(40, 40),
    anchor: new window.google.maps.Point(20, 40),
  }), []);

  const endMarkerIcon = useMemo(() => ({
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="redEndPinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#f44336;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#d32f2f;stop-opacity:1" />
          </linearGradient>
        </defs>
        <path d="M20 5C12 5 5 12 5 20C5 28 20 40 20 40S35 28 35 20C35 12 28 5 20 5Z" fill="url(#redEndPinGradient)" stroke="#fff" stroke-width="2"/>
        <text x="20" y="24" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">E</text>
      </svg>
    `),
    scaledSize: new window.google.maps.Size(40, 40),
    anchor: new window.google.maps.Point(20, 40),
  }), []);

  if (!isLoaded) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          textAlign: 'center',
          zIndex: 10,
          position: 'relative',
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255,255,255,0.1)',
            borderTop: '4px solid #fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          }}></div>
          <p style={{
            color: '#fff',
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            fontWeight: '600',
            marginTop: '20px',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}>Loading Smart Route Planner...</p>
        </div>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
        }}></div>
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
      boxSizing: 'border-box',
    }}>
      {/* Google Maps-like Search Bar */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        width: '360px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.08)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: '12px', color: '#5f6368' }}>
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor" />
          </svg>
          <input
            type="text"
            placeholder="Search Location"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => {
              setShowSuggestions(true);
              // Create new session token when user focuses
              if (!sessionTokenRef.current) {
                sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
              }
            }}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              padding: '12px 0',
              fontFamily: 'Roboto, Arial, sans-serif',
              backgroundColor: 'transparent',
            }}
          />
        </div>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <div style={{
            borderTop: '1px solid #e0e0e0',
            maxHeight: '300px',
            overflowY: 'auto',
          }}>
            {searchSuggestions.map((prediction, index) => (
              <div
                key={prediction.place_id}
                onClick={() => handleSuggestionSelect(prediction)}
                style={{
                  padding: '12px 12px 12px 44px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: 'Roboto, Arial, sans-serif',
                  color: '#3c4043',
                  borderBottom: '1px solid #f1f3f4',
                  transition: 'background-color 0.1s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '12px',
                    color: '#D32F2F',
                  }}
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
                </svg>
                <div style={{ fontWeight: '500' }}>
                  {prediction.structured_formatting.main_text}
                </div>
                <div style={{ fontSize: '12px', color: '#5f6368', marginTop: '2px' }}>
                  {prediction.structured_formatting.secondary_text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map Type Control - Small Icon Box */}
      <div style={{
        position: 'absolute',
        top: '75px',
        left: '20px',
        zIndex: 999,
        width: '44px',
        height: '44px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.08)',
      }}>
        <button
          onClick={() => {
            const newType = mapType === 'roadmap' ? 'terrain' : 'roadmap';
            setMapType(newType);
            if (mapRef.current && window.google) {
              mapRef.current.setMapTypeId(window.google.maps.MapTypeId[newType.toUpperCase() as keyof typeof window.google.maps.MapTypeId]);
            }
          }}
          style={{
            width: '100%',
            height: '100%',
            padding: '10px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8f9fa';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: '#5f6368' }}>
            <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Traffic Control - Small Icon Box */}
      <div style={{
        position: 'absolute',
        top: '125px',
        left: '20px',
        zIndex: 999,
        width: '44px',
        height: '44px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.08)',
      }}>
        <button
          onClick={toggleTrafficLayer}
          style={{
            width: '100%',
            height: '100%',
            padding: '10px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8f9fa';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: isTrafficEnabled ? '#4285f4' : '#5f6368' }}>
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" fill="currentColor" opacity={isTrafficEnabled ? 1 : 0.5} />
          </svg>
        </button>
      </div>

      {/* Current Location Button */}
      <button
        onClick={getCurrentLocation}
        disabled={isLocating}
        style={{
          position: 'absolute',
          bottom: '30px',
          left: '20px',
          width: '48px',
          height: '48px',
          backgroundColor: 'white',
          borderRadius: '50%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          transition: 'all 0.2s ease',
          border: '1px solid rgba(0,0,0,0.08)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        }}
      >
        {isLocating ? (
          <div style={{
            width: '24px',
            height: '24px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #4285f4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}></div>
        ) : (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" fill="#D32F2F" />
          </svg>
        )}
      </button>

      <GoogleMap
        mapContainerStyle={{
          width: '100%',
          height: '100%',
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
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'poi.business',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'poi.park',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'landscape',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'administrative',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'administrative.land_parcel',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'administrative.neighborhood',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'road',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'road.local',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'transit',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'water',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }],
            },
          ],
          mapTypeId: window.google?.maps?.MapTypeId[mapType.toUpperCase() as keyof typeof window.google.maps.MapTypeId] || window.google?.maps?.MapTypeId.ROADMAP,
        }}
      >
        {/* Start Marker */}
        {showRoute && startLocation && (
          <Marker
            position={startLocation}
            draggable
            icon={startMarkerIcon}
            onDragEnd={(e) => {
              if (e.latLng) {
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                onPositionChange(lat, lng);
              }
            }}
          />
        )}

        {/* End Marker */}
        {showRoute && endLocation && (
          <Marker
            position={endLocation}
            draggable
            icon={endMarkerIcon}
            onDragEnd={(e) => {
              if (e.latLng) {
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                onPositionChange(lat, lng);
              }
            }}
          />
        )}

        {/* Default marker for single selection mode */}
        {!showRoute && (
          <Marker
            position={markerPosition}
            draggable
            icon={googleMarkerIcon}
            onDragEnd={(e) => {
              if (e.latLng) {
                handleMarkerDragEnd(e as any);
              }
            }}
          />
        )}
      </GoogleMap>

      {/* Route Information Panel */}
      {routeInfo && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '20px',
          backgroundColor: 'white',
          padding: '14px 18px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 1000,
          minWidth: '240px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0,0,0,0.08)',
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#202124',
            marginBottom: '12px',
            fontFamily: 'Roboto, Arial, sans-serif',
          }}>
             {/* Route Details */}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}>
            <span style={{ fontSize: '14px', color: '#5f6368', fontFamily: 'Roboto, Arial, sans-serif' }}>Distance :</span>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#1967d2', fontFamily: 'Roboto, Arial, sans-serif' }}>{routeInfo.distance}</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '14px', color: '#5f6368', fontFamily: 'Roboto, Arial, sans-serif' }}>Duration :</span>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#188038', fontFamily: 'Roboto, Arial, sans-serif' }}>{routeInfo.duration}</span>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}