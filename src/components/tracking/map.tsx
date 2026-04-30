"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  MarkerF,
  PolylineF,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Box } from "@mui/material";
import { connectSocket } from "@/socket/socket";

const containerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "400px",
};

export function Map({ selectedLocations = [], currentVehicle, status }: any) {
  const tripId = currentVehicle?.tripId;

  const [livePath, setLivePath] = useState(selectedLocations);
  const socketRef = useRef<any>(null);
  const prevSelectedLocationsRef = useRef<any>(selectedLocations);

  /** Sync locations ONLY when prop changes */
  useEffect(() => {
    if (
      JSON.stringify(selectedLocations) !==
      JSON.stringify(prevSelectedLocationsRef.current)
    ) {
      setLivePath(selectedLocations);
      prevSelectedLocationsRef.current = selectedLocations;
    }
  }, [selectedLocations]);

  /** SOCKET LISTENER */
  useEffect(() => {
    if (status !== "ongoing" || !tripId) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    if (!socketRef.current) {
      socketRef.current = connectSocket(token);
    }

    const socket = socketRef.current;

    console.log("Socket Connection Attempt:", {
      tripId,
      status,
      socketId: socket.id,
      token: token ? "Present" : "Missing"
    });

    socket.emit("joinTrip", { tripId });

    socket.on("joinedTrip", (response: any) => {
      console.log("Successfully joined trip:", response);
    });
    
    socket.on("joinTripError", (error: any) => {
      console.error("Failed to join trip:", error);
    });

    const handleLiveUpdate = (loc: any) => {
      console.log("Location Update Received:", {
        location: loc,
        timestamp: new Date().toISOString(),
        totalPoints: livePath.length + 1
      });
      setLivePath((prev) => [
        ...prev,
        {
          lat: loc.location.lat,
          long: loc.location.long,
          userId: loc.userId,
          at: loc.at,
        },
      ]);
    };

    socket.on("locationUpdated", handleLiveUpdate);

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("connect_error", (error: any) => {
      console.error("Socket connection error:", error);
    });

    return () => {
      if (socket) {
        console.log("Cleaning up socket listeners...");
        socket.off("locationUpdated", handleLiveUpdate);
        socket.off("joinedTrip");
        socket.off("joinTripError");
        socket.off("connect");
        socket.off("disconnect");
        socket.off("connect_error");
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [tripId, status]);

  // Convert to GM path
  const path = livePath.map((loc: any) => ({
    lat: loc.lat,
    lng: loc.long,
  }));

  const center = path[0] || { lat: 24.8607, lng: 67.0011 };

  // Debug: Log path data
  console.log("Map Debug Info:", {
    livePathLength: livePath.length,
    pathLength: path.length,
    livePath: livePath.slice(0, 3), // First 3 points
    path: path.slice(0, 3), // First 3 points
    center,
    status,
    tripId
  });

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {path.length > 1 && (
          <PolylineF
            path={path}
            options={{
              strokeColor: "#1FA959",
              strokeOpacity: 1,
              strokeWeight: 4,
            }}
          />
        )}

        {path[0] && (
          <MarkerF
            position={path[0]}
            label="A"
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
            }}
          />
        )}

        {/* Removed intermediate yellow markers - only show start and end points */}

        {path[path.length - 1] && (
          <MarkerF
            position={path[path.length - 1]}
            icon={{
              url: "/assets/van-marker.svg",
              scaledSize: new google.maps.Size(40, 40),
            }}
          />
        )}
      </GoogleMap>
    </Box>
  );
}
