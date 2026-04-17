// app/(dashboard)/su-admin/driver/[driverId]/page.tsx

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
} from "@mui/material";
import { ArrowLeft as ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { User as UserIcon } from "@phosphor-icons/react/dist/ssr/User";
import { Car as CarIcon } from "@phosphor-icons/react/dist/ssr/Car";
import { Buildings as SchoolIcon } from "@phosphor-icons/react/dist/ssr/Buildings"; // School icon nahi hai, Buildings use kiya
import { useRouter, useParams } from "next/navigation";
import { config } from "@/config";
import { SUADMIN } from "@/api/endpoint";
import axios from "@/api/axios";

export default function DriverDetailPage(): React.JSX.Element {
  const router = useRouter();
  const params = useParams();
  const driverId = params.driverId as string;

  useEffect(() => {
    document.title = `${config.site.name} | Driver Details (Super Admin)`;
  }, []);

  // State for driver data
  const [driver, setDriver] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  // Fetch driver details
  const fetchDriverDetails = React.useCallback(async () => {
    if (!driverId) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/van/getDriverById/${driverId}`);
      
      if (response.data?.data) {
        setDriver(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching driver details:', error);
      setDriver(null);
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  // Fetch driver details on component mount
  useEffect(() => {
    fetchDriverDetails();
  }, [fetchDriverDetails]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "success";
      case "inactive": return "error";
      case "inActive": return "error";
      default: return "default";
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <Typography>Loading driver details...</Typography>
      </Box>
    );
  }

  if (!driver) {
    return (
      <Box sx={{ p: 4 }}>
        <Button startIcon={<ArrowLeftIcon />} onClick={() => router.back()}>
          Back to Drivers
        </Button>
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="h6" color="error">
            Driver not found
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Button startIcon={<ArrowLeftIcon />} onClick={() => router.back()}>
        Back to Drivers
      </Button>

      <Stack spacing={3} mt={3}>
        {/* Main Driver Card */}
        <Card sx={{ p: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar src={driver?.image || undefined} sx={{ width: 56, height: 56 }}>
                  {!driver?.image && driver?.fullname?.split(' ').map((w) => w[0]?.toUpperCase()).join('')}
                </Avatar>
                <Box>
                  <Typography variant="h6">{driver?.fullname || 'Driver Name N/A'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Phone: {driver?.phoneNo || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email: {driver?.email || 'N/A'}
                  </Typography>
                </Box>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={driver?.status?.charAt(0).toUpperCase() + driver?.status?.slice(1) || 'Inactive'}
                  color={getStatusColor(driver?.status) as any}
                  size="small"
                />
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Driver Information Card */}
        <Card>
          <CardHeader avatar={<Avatar><UserIcon /></Avatar>} title="Driver Information" />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Full Name</Typography>
                <Typography variant="body1">{driver?.fullname || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">CNIC</Typography>
                <Typography variant="body1">{driver?.cnic || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">License Number</Typography>
                <Typography variant="body1">{driver?.licenseNumber || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">License Expiry</Typography>
                <Typography variant="body1">{driver?.licenseExpiry || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Phone</Typography>
                <Typography variant="body1">{driver?.phoneNo || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Email</Typography>
                <Typography variant="body1">{driver?.email || '—'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" color="text.secondary">Address</Typography>
                <Typography variant="body1">{driver?.address || '—'}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* School Assignment Card */}
        <Card>
          <CardHeader avatar={<Avatar><SchoolIcon /></Avatar>} title="School Assignment" />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle1" color="text.secondary">School Name</Typography>
                <Typography variant="body1">{driver?.schoolName || 'Not Assigned'}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle1" color="text.secondary">User Type</Typography>
                <Typography variant="body1">{driver?.userType || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle1" color="text.secondary">Notification Toggle</Typography>
                <Typography variant="body1">{driver?.notificationToggle ? 'Enabled' : 'Disabled'}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* System Information Card */}
        {/* <Card>
          <CardHeader title="System Information" />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Verified</Typography>
                <Typography variant="body1">{driver?.isVerified ? 'Yes' : 'No'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">FCM Token</Typography>
                <Typography variant="body1">{driver?.fcmToken ? 'Active' : 'Inactive'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Deleted</Typography>
                <Typography variant="body1">{driver?.isDelete ? 'Yes' : 'No'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Created At</Typography>
                <Typography variant="body1">
                  {driver?.createdAt ? new Date(driver.createdAt).toLocaleDateString() : '—'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Updated At</Typography>
                <Typography variant="body1">
                  {driver?.updatedAt ? new Date(driver.updatedAt).toLocaleDateString() : '—'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card> */}
      </Stack>
    </Box>
  );
}