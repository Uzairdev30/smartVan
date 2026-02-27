"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Stack } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { Calendar } from "@phosphor-icons/react/dist/ssr/Calendar";
import { Truck } from "@phosphor-icons/react/dist/ssr/Truck";
import { Users as CustomerService } from "@phosphor-icons/react/dist/ssr/Users";
import { Student } from "@phosphor-icons/react/dist/ssr/Student";
import { RoadHorizon } from "@phosphor-icons/react/dist/ssr/RoadHorizon";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { StatsCard, Alert, TripCard } from "@/components/overview";
import { getDashboardStats } from "@/store/reducers/dashboard-slice";
import { getAllTrips } from "@/store/reducers/trip-slice";
import { RootState, AppDispatch } from "@/store";
import { TripAPI } from "@/components/overview/TripCard"; // Same type reuse
import { Map } from "@/components/tracking"; // Directly use Map here
import { Option } from "@/components/core/option";

export default function Page(): React.JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Dashboard state
  const { stats, loading: statsLoading } = useSelector(
    (state: RootState) => state.dashboard
  );

  // Trips state
  const { trips, loading: tripLoading } = useSelector(
    (state: RootState) => state.trip
  );

  const [filterType, setFilterType] = useState<"yearly" | "monthly">("yearly");
  const [status, setStatus] = useState<"" | "start" | "ongoing" | "end">("");

  // Selected Trip state
  const [selectedTrip, setSelectedTrip] = useState<TripAPI | null>(null);

  // Load Dashboard Stats
  useEffect(() => {
    dispatch(getDashboardStats({ filterType }));
  }, [dispatch, filterType]);

  // Load Trips
  useEffect(() => {
    dispatch(getAllTrips({ page: 1, limit: 10, status }));
  }, [dispatch, status]);

  // Set the first trip if no trip is selected
  useEffect(() => {
    if (!tripLoading && trips && trips.length > 0 && !selectedTrip) {
      setSelectedTrip(trips[0] as TripAPI);
    }
  }, [trips, tripLoading, selectedTrip]);

  const handleFilterChange = (type: "yearly" | "monthly") => {
    setFilterType(type);
  };

  const handleStatusChange = (newStatus: "" | "start" | "ongoing" | "end") => {
    setStatus(newStatus);
    setSelectedTrip(null); // Reset selected trip on status change
  };

  // TripCard selection
  const handleSelectTrip = (trip: TripAPI) => {
    setSelectedTrip(trip);
  };

  // Map se marker click pe id aayegi
  const handleVehicleSelectFromMap = (id: string) => {
    const found = (trips || []).find(
      (t: any) => String(t._id ?? t.id) === String(id)
    );
    if (found) {
      setSelectedTrip(found as TripAPI);
    }
  };

  // Prepare the vehicle data and locations
  const vehicles = trips.map((trip: any) => {
    const lastLocation = trip.locations?.length
      ? trip.locations[trip.locations.length - 1]
      : trip.tripEnd
      ? { lat: trip.tripEnd.lat, long: trip.tripEnd.long }
      : trip.tripStart
      ? { lat: trip.tripStart.lat, long: trip.tripStart.long }
      : null;

    return {
      id: String(trip._id),
      name: trip.driver?.fullname || trip.driverName || 'Unknown Driver',
      avatar: trip.driver?.image || trip?.driverImage || '/assets/avatar-placeholder.png',
      vehicleModel: trip.van?.vehicleType || trip.carNumber || '',
      plate: trip.van?.carNumber || trip.carNumber || '',
      status: trip.status || 'unknown',
      latitude: lastLocation?.lat || 0,
      longitude: lastLocation?.long || 0,
      tripStart: trip?.tripStart?.startTime ? new Date(trip?.tripStart?.startTime) : undefined,
      driverId: trip?.driver?._id || trip?.driverId,
      tripId: trip?._id,
      driverName: trip.driver?.fullname || trip?.driverName,
      locations: trip?.locations || [],
      carName: trip.van?.vehicleType || trip.carName || '',
      routeTitle: trip.route?.title || trip.routeTitle || '',
      routeTripType: trip.route?.tripType || trip.routeTripType || ''
    };
  });

  return (
    <Box sx={{ p: "var(--Content-padding)", width: "var(--Content-width)" }}>
      <Stack spacing={2}>
        {/* First Row: 4 Stats Cards */}
        <Grid container spacing={2}>
          <Grid size={{ md: 3, xs: 6 }}>
            <StatsCard
              value={stats?.counts?.vans || 0}
              icon={Truck}
              title="Total Vans"
              variant="active"
              onClick={() => router.push("/van")}
            />
          </Grid>
          <Grid size={{ md: 3, xs: 6 }}>
            <StatsCard
              value={stats?.counts?.drivers || 0}
              icon={CustomerService}
              title="Total Drivers"
              variant="delayed"
              onClick={() => router.push("/van")}
            />
          </Grid>
          <Grid size={{ md: 3, xs: 6 }}>
            <StatsCard
              value={stats?.counts?.kids || 0}
              icon={Student}
              title="Total Students"
              variant="missed"
              onClick={() => router.push("/student")}
            />
          </Grid>
          <Grid size={{ md: 3, xs: 6 }}>
            <StatsCard
              value={stats?.counts?.trips || 0}
              icon={RoadHorizon}
              title="Total Trips"
              variant="active"
              onClick={() => router.push("/tracking")}
            />
          </Grid>
        </Grid>

        {/* Second Row: Yearly Trip Stats (col-8) and Tickets & Complaints (col-4) */}
        <Grid container spacing={2}>
          <Grid size={{ lg: 8, xs: 12 }}>
            <Card sx={{ height: 380, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ pb: 2, flexGrow: 1 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar
                      sx={{
                        "--Avatar-size": "48px",
                        bgcolor: "var(--mui-palette-background-paper)",
                        boxShadow: "var(--mui-shadows-8)",
                        color: "var(--mui-palette-text-primary)",
                      }}
                    >
                      <Calendar fontSize="var(--icon-fontSize-lg)" />
                    </Avatar>
                    <Typography variant="body1">
                      {filterType === "yearly"
                        ? "Yearly Trip Stats"
                        : "Monthly Trip Stats"}
                    </Typography>
                  </Stack>

                  <Select
                    name="filterType"
                    value={filterType}
                    onChange={(e) =>
                      handleFilterChange(e.target.value as "yearly" | "monthly")
                    }
                    sx={{ width: 140 }}
                  >
                    <Option value="yearly">Yearly</Option>
                    <Option value="monthly">Monthly</Option>
                  </Select>
                </Stack>

                <Box sx={{ height: 250, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats?.graph || []}
                      margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tickLine={false} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        fill="#3B82F6"
                        radius={[6, 6, 0, 0]}
                        barSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ lg: 4, xs: 12 }}>
            <Alert />
          </Grid>
        </Grid>

        {/* Third Row: Map and TripCard */}
        <Grid container spacing={2}>
          {/* ─── Map Section ─────────────── */}
          <Grid size={{ lg: 8, xs: 12 }}>
            <Box sx={{ height: 520 }}>
              {/* Pass the vehicles and selected trip data directly to the Map */}
              {selectedTrip && (
                <Map
                  vehicles={vehicles}
                  currentVehicleId={selectedTrip?._id}
                  onVehicleSelect={handleVehicleSelectFromMap}
                  selectedLocations={selectedTrip.locations || []} // Pass selected trip's locations
                />
              )}
            </Box>
          </Grid>

          {/* ─── TripCard Section ─────────────── */}
          <Grid size={{ lg: 4, xs: 12 }}>
            <TripCard
              trips={trips || []}
              status={status}
              onStatusChange={handleStatusChange}
              loading={tripLoading}
              selectedTrip={selectedTrip}
              onSelectTrip={handleSelectTrip}
            />
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}
