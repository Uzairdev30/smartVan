// app/(dashboard)/driver/[driverId]/page.tsx

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
  Divider, 
  Grid, 
  Stack, 
  Typography,
  CircularProgress,
} from "@mui/material";
import { ArrowLeft as ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { Car as CarIcon } from "@phosphor-icons/react/dist/ssr/Car";
import { useRouter, useParams } from "next/navigation";
import { config } from "@/config";
import { CheckCircleIcon, MinusIcon } from "@/components/icons";
import { getDriverById, changeDriverStatus } from "@/services/driver.api";

export default function DriverDetailPage(): React.JSX.Element {
  const router = useRouter();
  const params = useParams<{ driverId: string }>();
  const driverId = params?.driverId;

  useEffect(() => {
    document.title = `${config.site.name} | Driver Details`;
  }, []);

  const [driver, setDriver] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [updatingStatus, setUpdatingStatus] = React.useState(false);

  const fetchDriver = async () => {
    if (!driverId) return;
    setLoading(true);
    try {
      const response = await getDriverById(driverId);
      if (response?.data) {
        setDriver(response.data.data || response.data);
      }
    } catch (error) {
      console.error("Error fetching driver details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriver();
  }, [driverId]);

  // Same logic as list page
  const handleStatusToggle = async () => {
    if (!driver || updatingStatus) return;

    const id = driver?._id || driver?.id;
    const currentStatus = (driver?.status || "inActive").toLowerCase();
    const newStatus = currentStatus === "active" ? "inActive" : "active";

    // Optimistic update
    setDriver((prev: any) => ({ ...prev, status: newStatus }));
    setUpdatingStatus(true);

    try {
      await changeDriverStatus({ driverIds: [id], status: newStatus });
      // Refresh from server
      fetchDriver();
    } catch (err) {
      console.error("Status update failed:", err);
      // Revert on error
      fetchDriver();
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const rawStatus = (driver?.status || "inActive").toLowerCase();
  const isActive = rawStatus === "active";

  return (
    <Box sx={{ p: 4 }}>
      <Button startIcon={<ArrowLeftIcon />} onClick={() => router.back()}>
        Back to Drivers
      </Button>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : driver ? (
        <Stack spacing={3} mt={3}>

          {/* Main Driver Card */}
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                {/* Left: Avatar + Info */}
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    src={driver?.image || undefined}
                    sx={{ width: 56, height: 56 }}
                  >
                    {!driver?.image &&
                      driver?.fullname
                        ?.split(" ")
                        .map((w: string) => w[0]?.toUpperCase())
                        .join("")}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {driver?.fullname || "Driver Name N/A"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phone: {driver?.phoneNo || "N/A"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Email: {driver?.email || "N/A"}
                    </Typography>
                  </Box>
                </Box>

                {/* Right: Status Chip (clickable — same as list page) */}
                <Stack direction="row" spacing={1} alignItems="center">
                  {driver?.isVerified && (
                    <Chip label="Verified" size="small" color="info" variant="outlined" />
                  )}
                  <Chip
                    icon={
                      isActive ? (
                        <CheckCircleIcon
                          color="var(--mui-palette-success-main)"
                          weight="fill"
                        />
                      ) : (
                        <MinusIcon color="var(--mui-palette-error-main)" />
                      )
                    }
                    label={
                      updatingStatus
                        ? "Updating..."
                        : isActive
                        ? "Active"
                        : "InActive"
                    }
                    size="small"
                    color={isActive ? "success" : "error"}
                    variant="outlined"
                    onClick={handleStatusToggle}
                    disabled={updatingStatus}
                    sx={{ cursor: updatingStatus ? "not-allowed" : "pointer" }}
                  />
                </Stack>
              </Box>
            </CardContent>
          </Card>

          {/* Driver Information Card */}
          <Card>
            <CardHeader title="Driver Information" />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">Full Name</Typography>
                  <Typography variant="body1">{driver?.fullname || "—"}</Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">CNIC</Typography>
                  <Typography variant="body1">{driver?.NIC || "—"}</Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">License Number</Typography>
                  <Typography variant="body1">{driver?.licenseNumber || "—"}</Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">License Expiry</Typography>
                  <Typography variant="body1">{driver?.licenseExpiry || "—"}</Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{driver?.phoneNo || "—"}</Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{driver?.email || "—"}</Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">School</Typography>
                  <Typography variant="body1">{driver?.schoolName || "—"}</Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">Joined</Typography>
                  <Typography variant="body1">{formatDate(driver?.createdAt)}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" color="text.secondary">Address</Typography>
                  <Typography variant="body1">{driver?.address || "—"}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

        </Stack>
      ) : (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h6">Driver not found</Typography>
          <Button variant="outlined" onClick={() => router.push("/driver")} sx={{ mt: 2 }}>
            Back to All Drivers
          </Button>
        </Box>
      )}
    </Box>
  );
}