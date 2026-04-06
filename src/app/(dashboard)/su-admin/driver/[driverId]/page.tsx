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
import { School as SchoolIcon } from "@phosphor-icons/react/dist/ssr/School";
import { useRouter, useParams } from "next/navigation";
import { config } from "@/config";

export default function DriverDetailPage(): React.JSX.Element {
  const router = useRouter();
  const params = useParams();
  const driverId = params.driverId as string;

  // Set document title
  useEffect(() => {
    document.title = `${config.site.name} | Driver Details (Super Admin)`;
  }, []);

  // Mock driver data
  const driver = {
    id: driverId,
    fullname: "Muhammad Ahmed",
    email: "muhammad.ahmed@email.com",
    phone: "0300-1234567",
    cnic: "42101-1234567-1",
    licenseNumber: "DL-123456",
    licenseExpiry: "2025-12-31",
    address: "House #123, Street 45, Gulshan-e-Iqbal, Karachi",
    status: "active",
    image: "/assets/avatar.png",
    assignedVan: {
      carNumber: "ABC-123",
      model: "Suzuki Bolan",
      year: "2022",
      color: "White"
    },
    school: {
      name: "ABC School",
      code: "SCH-001",
      city: "Karachi"
    },
    route: {
      name: "Route A - North Nazimabad",
      stops: 15,
      students: 25
    },
    emergencyContact: {
      name: "Ahmed Khan",
      relationship: "Brother",
      phone: "0311-9876543"
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Button startIcon={<ArrowLeftIcon />} onClick={() => router.back()}>
        Back to Drivers
      </Button>

      <Stack spacing={3} mt={3}>
        {/* Main Driver Card */}
        <Card sx={{ p: 2 }}>
          <CardContent>
            {/* Top: Avatar + Driver Info + Status */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              {/* Left: Avatar + Info */}
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={driver?.image || undefined}
                  sx={{ width: 56, height: 56 }}
                >
                  {!driver?.image && driver?.fullname?.split(' ').map((w) => w[0]?.toUpperCase()).join('')}
                </Avatar>
                <Box>
                  <Typography variant="h6">{driver?.fullname || 'Driver Name N/A'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    License: {driver?.licenseNumber || 'N/A'} | Phone: {driver?.phone || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email: {driver?.email || 'N/A'}
                  </Typography>
                </Box>
              </Box>

              {/* Right: Status Display */}
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
                <Typography variant="body1">{driver?.phone || '—'}</Typography>
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
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">School Name</Typography>
                <Typography variant="body1">{driver?.school?.name || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">School Code</Typography>
                <Typography variant="body1">{driver?.school?.code || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">City</Typography>
                <Typography variant="body1">{driver?.school?.city || '—'}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Vehicle & Route Assignment Card */}
        <Card>
          <CardHeader avatar={<Avatar><CarIcon /></Avatar>} title="Vehicle & Route Assignment" />
          <CardContent>
            <Grid container spacing={3}>
              {/* Van Details */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Car Number</Typography>
                <Typography variant="body1">{driver?.assignedVan?.carNumber || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Model</Typography>
                <Typography variant="body1">{driver?.assignedVan?.model || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Year</Typography>
                <Typography variant="body1">{driver?.assignedVan?.year || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Color</Typography>
                <Typography variant="body1">{driver?.assignedVan?.color || '—'}</Typography>
              </Grid>
              
              <Divider sx={{ my: 2, gridColumn: '1 / -1' }} />
              
              {/* Route Details */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Route Name</Typography>
                <Typography variant="body1">{driver?.route?.name || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Total Stops</Typography>
                <Typography variant="body1">{driver?.route?.stops || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Total Students</Typography>
                <Typography variant="body1">{driver?.route?.students || '—'}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Emergency Contact Card */}
        <Card>
          <CardHeader title="Emergency Contact" />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Contact Name</Typography>
                <Typography variant="body1">{driver?.emergencyContact?.name || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Relationship</Typography>
                <Typography variant="body1">{driver?.emergencyContact?.relationship || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Phone</Typography>
                <Typography variant="body1">{driver?.emergencyContact?.phone || '—'}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
