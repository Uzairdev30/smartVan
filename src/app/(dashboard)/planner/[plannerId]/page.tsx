"use client";

import * as React from "react";
import { useEffect } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  Typography,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";

import { ArrowLeft as ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { House as HouseIcon } from "@phosphor-icons/react/dist/ssr/House";
import { MapPin as MapPinIcon } from "@phosphor-icons/react/dist/ssr/MapPin";
import { Clock as ClockIcon } from "@phosphor-icons/react/dist/ssr/Clock";
import { Van as VanIcon } from "@phosphor-icons/react/dist/ssr/Van";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { useRouter } from "next/navigation";
import { getRouteById } from "@/store/reducers/route-slice";
import { config } from "@/config";

/* =========================
   Helpers
========================= */

// ISO → AM/PM
const formatTimeToAMPM = (time?: string) => {
  if (!time) return "—";
  return new Date(time).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Address cleaner
const formatAddress = (address: string) => {
  if (!address) return { line1: "—", line2: "", line3: "" };

  const parts = address.split(",");

  return {
    line1: parts[0]?.trim(),
    line2: parts.slice(1, 3).join(", ").trim(),
    line3: parts.slice(-1)[0]?.trim(),
  };
};

// Reverse geocode
const getAddressFromLatLng = async (lat: number, lng: number) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await res.json();
    return data.display_name || "Unknown location";
  } catch {
    return "Unknown location";
  }
};

/* =========================
   UI Components
========================= */

const AddressCard = ({ title, address }: any) => {
  const formatted = formatAddress(address);

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid #e0e0e0",
        background: "#fafafa",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
        <MapPinIcon size={18} color="#1976d2" />
        <Typography variant="subtitle2" fontWeight={600}>
          {title}
        </Typography>
      </Stack>

      {/* Address */}
      <Typography variant="body1" fontWeight={600}>
        {formatted.line1}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        {formatted.line2}
      </Typography>

      <Typography variant="caption" color="text.secondary" mb={2}>
        {formatted.line3}
      </Typography>

      {/* CENTER BUTTON */}
      <Box sx={{ mt: "auto", display: "flex", justifyContent: "center" }}>
        <Typography
          variant="caption"
          onClick={() =>
            window.open(`https://www.google.com/maps?q=${address}`, "_blank")
          }
          sx={{
            color: "#1976d2",
            fontWeight: 600,
            cursor: "pointer",
            px: 2,
            py: 0.5,
            borderRadius: 1,
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.08)",
            },
          }}
        >
          View on map
        </Typography>
      </Box>
    </Box>
  );
};

const TripDaysUI = ({ days }: { days: string[] }) => {
  if (!days?.length) return <Typography>—</Typography>;

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {days.map((day) => (
        <Chip
          key={day}
          label={day.slice(0, 3)}
          sx={{
            background: "#e3f2fd",
            color: "#1976d2",
            fontWeight: 600,
          }}
        />
      ))}
    </Box>
  );
};

/* =========================
   Page
========================= */

export default function PlannerDetailPage({
  params,
}: {
  params: { plannerId: string };
}) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const plannerId = params.plannerId;

  const { routeDetails, loading } = useSelector(
    (s: RootState) => s.route
  );

  const [startAddress, setStartAddress] = React.useState("Loading...");
  const [endAddress, setEndAddress] = React.useState("Loading...");

  useEffect(() => {
    document.title = `${config.site.name} | Route Details`;
  }, []);

  // Fetch route
  useEffect(() => {
    if (plannerId) dispatch(getRouteById(plannerId));
  }, [plannerId, dispatch]);

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (routeDetails?.startPoint) {
        const addr = await getAddressFromLatLng(
          routeDetails.startPoint.lat,
          routeDetails.startPoint.long
        );
        setStartAddress(addr);
      }

      if (routeDetails?.endPoint) {
        const addr = await getAddressFromLatLng(
          routeDetails.endPoint.lat,
          routeDetails.endPoint.long
        );
        setEndAddress(addr);
      }
    };

    fetchAddresses();
  }, [routeDetails]);

  const tripDays =
    routeDetails?.tripDays &&
    Object.entries(routeDetails.tripDays)
      .filter(([k, v]) => v && k !== "_id")
      .map(([d]) => d);

  if (loading && !routeDetails)
    return <CircularProgress sx={{ m: 4 }} />;

  if (!routeDetails)
    return (
      <Box p={4}>
        <Typography>Route not found</Typography>
      </Box>
    );

  return (
    <Box sx={{ p: 4 }}>
      <Button startIcon={<ArrowLeftIcon />} onClick={() => router.back()}>
        Back
      </Button>

      <Stack spacing={3} mt={2}>
        {/* HEADER */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between">
              <Box display="flex" gap={2} alignItems="center">
                <Avatar sx={{ bgcolor: "#1976d2" }}>
                  <HouseIcon size={20} />
                </Avatar>

                <Box>
                  <Typography variant="h6">
                    {routeDetails.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {routeDetails.driverName}
                  </Typography>
                </Box>
              </Box>

              <Chip label={routeDetails.tripType?.toUpperCase()} />
            </Box>
          </CardContent>
        </Card>

        <Card>
  <CardHeader title="Trip Information" />
  <CardContent>
    <Grid container spacing={3}>

      {/* Start Time */}
      <Grid item xs={12} sm={4}>
        <Typography variant="subtitle2" color="text.secondary">
          Start Time
        </Typography>

        <Typography variant="body1" fontWeight={600}>
          {formatTimeToAMPM(routeDetails.startTime)}
        </Typography>
      </Grid>

      {/* Route / B to A */}
      <Grid item xs={12} sm={4}>
        <Typography variant="subtitle2" color="text.secondary">
          Route
        </Typography>

        <Typography variant="body1" fontWeight={600}>
          B → A
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {routeDetails.driverName || "—"}
        </Typography>
      </Grid>

      {/* Drop */}
      <Grid item xs={12} sm={4}>
        <Typography variant="subtitle2" color="text.secondary">
          Trip Type
        </Typography>

        <Chip
          label={routeDetails.tripType?.toUpperCase() || "DROP"}
          color={routeDetails.tripType === "morning" ? "warning" : "info"}
          size="small"
          sx={{ mt: 0.5 }}
        />
      </Grid>

    </Grid>
  </CardContent>
</Card>

        {/* VEHICLE */}
        <Card>
          <CardHeader title="Vehicle Info" />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Typography color="text.secondary">
                  Car Number
                </Typography>
                <Typography>{routeDetails.carNumber}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography color="text.secondary">
                  Driver
                </Typography>
                <Typography>{routeDetails.driverName}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ROUTE POINTS */}
        <Card>
          <CardHeader title="Route Points" />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <AddressCard
                  title="Start Point"
                  address={startAddress}
                />
              </Grid>

              <Grid item xs={6}>
                <AddressCard
                  title="End Point"
                  address={endAddress}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}