// app/(dashboard)/su-admin/van/[vanId]/page.tsx

"use client";

import * as React from "react";
import { useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import axios from "@/api/axios";
import { config } from "@/config";
import { useRouter, useParams } from "next/navigation";

import { ArrowLeft as ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { Car as CarIcon } from "@phosphor-icons/react/dist/ssr/Car";
import { User as UserIcon } from "@phosphor-icons/react/dist/ssr/User";

const GET_VAN_DETAIL = (id: string) => `/van/getVanById/${id}`;

export default function VanDetailPage(): React.JSX.Element {
  const router = useRouter();
  const { vanId } = useParams<{ vanId: string }>();
  const resolvedId = Array.isArray(vanId) ? vanId[0] : vanId;

  const [van, setVan] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    document.title = `${config.site.name} | Van Details`;
  }, []);

  const fetchVanDetails = React.useCallback(async () => {
    if (!resolvedId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(GET_VAN_DETAIL(resolvedId));
      setVan(response.data?.data || null);
    } catch (error) {
      console.error("Error fetching van:", error);
      setVan(null);
    } finally {
      setLoading(false);
    }
  }, [resolvedId]);

  useEffect(() => {
    fetchVanDetails();
  }, [fetchVanDetails]);

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":      return "success";
      case "inactive":    return "error";
      case "maintenance": return "warning";
      default:            return "default";
    }
  };

  const formatStatus = (status?: string) =>
    status ? status.charAt(0).toUpperCase() + status.slice(1) : "Inactive";

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>Loading van details...</Typography>
      </Box>
    );
  }

  if (!resolvedId) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="error">Invalid URL: Van ID missing</Typography>
        <Button sx={{ mt: 2 }} startIcon={<ArrowLeftIcon />} onClick={() => router.back()}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!van) {
    return (
      <Box sx={{ p: 4 }}>
        <Button startIcon={<ArrowLeftIcon />} onClick={() => router.back()}>Back</Button>
        <Typography mt={3} textAlign="center" color="error">Van not found</Typography>
      </Box>
    );
  }

  // ✅ API response is FLAT — all fields at top level:
  // numberPlate, vehicleType, capacity, driverName, driverPhone, driverEmail, driverCnic, driverPicture, routes[]

  return (
    <Box sx={{ p: 4 }}>
      <Button startIcon={<ArrowLeftIcon />} onClick={() => router.back()}>
        Back to Vans
      </Button>

      <Stack spacing={3} mt={3}>

        {/* HEADER */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" gap={2} alignItems="center">
                <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>
                  <CarIcon size={28} />
                </Avatar>
                <Box>
                  <Typography variant="h6">{van.numberPlate || "N/A"}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Device ID: {van.deviceId ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Capacity: {van.capacity ?? "N/A"}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={formatStatus(van.status)}
                color={getStatusColor(van.status) as any}
              />
            </Box>
          </CardContent>
        </Card>

        {/* VEHICLE INFO */}
        <Card>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: "primary.main" }}><CarIcon /></Avatar>}
            title="Vehicle Information"
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">Number Plate</Typography>
                <Typography variant="body1" fontWeight={500}>{van.numberPlate || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">Vehicle Type</Typography>
                <Typography variant="body1" fontWeight={500}>{van.vehicleType || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">Capacity</Typography>
                <Typography variant="body1" fontWeight={500}>{van.capacity ?? "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">Condition</Typography>
                <Typography variant="body1" fontWeight={500}>{van.condition || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">Own Van</Typography>
                <Typography variant="body1" fontWeight={500}>{van.ownVan ? "Yes" : "No"}</Typography>
              </Grid>
              {van.route && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Assigned Route</Typography>
                  <Typography variant="body1" fontWeight={500}>{van.route}</Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* DRIVER */}
        <Card>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: "secondary.main" }}><UserIcon /></Avatar>}
            title="Driver Information"
          />
          <CardContent>
            {van.driverId ? (
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={2}>
                  {van.driverPicture ? (
                    <img
                      src={van.driverPicture}
                      alt={van.driverName}
                      style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <Avatar sx={{ width: 64, height: 64, bgcolor: "#1976d2" }}>
                      {van.driverName?.[0]?.toUpperCase() || "D"}
                    </Avatar>
                  )}
                </Grid>
                <Grid item xs={12} sm={10}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography variant="body1" fontWeight={500}>{van.driverName || "N/A"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1" fontWeight={500}>{van.driverPhone || "N/A"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1" fontWeight={500}>{van.driverEmail || "N/A"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">CNIC</Typography>
                      <Typography variant="body1" fontWeight={500}>{van.driverCnic || "N/A"}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            ) : (
              <Typography color="text.secondary">No driver assigned</Typography>
            )}
          </CardContent>
        </Card>

        {/* ROUTES */}
        <Card>
          <CardHeader title={`Assigned Routes (${van.routes?.length ?? 0})`} />
          <CardContent>
            <Stack spacing={2}>
              {van.routes?.length ? (
                van.routes.map((route: any) => (
                  <Box
                    key={route.id}
                    sx={{
                      p: 2,
                      border: "1px solid #ddd",
                      borderRadius: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography fontWeight={600}>{route.routeName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Type: {route.tripType}
                      </Typography>
                      {route.startTime && (
                        <Typography variant="body2" color="text.secondary">
                          Start: {new Date(route.startTime).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={route.tripType}
                      color={route.tripType === "pick" ? "success" : "warning"}
                      size="small"
                    />
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">No routes assigned</Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

      </Stack>
    </Box>
  );
}