// app/(dashboard)/su-admin/van/[vanId]/page.tsx

"use client";

import * as React from "react";
import { useEffect } from "react";
import { 
  Avatar, 
  Box, 
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
import { Car as CarIcon } from "@phosphor-icons/react/dist/ssr/Car";
import { User as UserIcon } from "@phosphor-icons/react/dist/ssr/User";
import { School as SchoolIcon } from "@phosphor-icons/react/dist/ssr/School";
import { useRouter, useParams } from "next/navigation";
import { config } from "@/config";

export default function VanDetailPage(): React.JSX.Element {
  const router = useRouter();
  const params = useParams();
  const vanId = params.vanId as string;

  // Set document title
  useEffect(() => {
    document.title = `${config.site.name} | Van Details (Super Admin)`;
  }, []);

  // Mock van data
  const van = {
    id: vanId,
    carNumber: "ABC-123",
    model: "Suzuki Bolan",
    year: "2022",
    color: "White",
    capacity: 30,
    chassisNumber: "MBLHA123456789012",
    engineNumber: "HA123E456789",
    registrationExpiry: "2025-12-31",
    insuranceExpiry: "2025-06-30",
    status: "active",
    assignedDriver: {
      name: "Muhammad Ahmed",
      phone: "0300-1234567",
      licenseNumber: "DL-123456"
    },
    school: {
      name: "ABC School",
      code: "SCH-001",
      city: "Karachi"
    },
    routes: [
      {
        name: "Route A - North Nazimabad",
        stops: 15,
        students: 25,
        timing: "7:00 AM - 8:00 AM"
      }
    ],
    maintenance: {
      lastService: "2024-01-15",
      nextService: "2024-04-15",
      serviceType: "Regular Maintenance"
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      case "maintenance":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Button startIcon={<ArrowLeftIcon />} onClick={() => router.back()}>
        Back to Vans
      </Button>

      <Stack spacing={3} mt={3}>
        {/* Main Van Card */}
        <Card sx={{ p: 2 }}>
          <CardContent>
            {/* Top: Icon + Van Info + Status */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              {/* Left: Icon + Info */}
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ width: 56, height: 56 }} bgcolor="primary.main">
                  <CarIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6">{van?.carNumber || 'Van Number N/A'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {van?.model} ({van?.year}) | {van?.color}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Capacity: {van?.capacity} seats
                  </Typography>
                </Box>
              </Box>

              {/* Right: Status Display */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={van?.status?.charAt(0).toUpperCase() + van?.status?.slice(1) || 'Inactive'}
                  color={getStatusColor(van?.status) as any}
                  size="small"
                />
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Vehicle Information Card */}
        <Card>
          <CardHeader avatar={<Avatar><CarIcon /></Avatar>} title="Vehicle Information" />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Car Number</Typography>
                <Typography variant="body1">{van?.carNumber || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Model</Typography>
                <Typography variant="body1">{van?.model || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Year</Typography>
                <Typography variant="body1">{van?.year || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Color</Typography>
                <Typography variant="body1">{van?.color || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Seating Capacity</Typography>
                <Typography variant="body1">{van?.capacity || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Chassis Number</Typography>
                <Typography variant="body1">{van?.chassisNumber || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Engine Number</Typography>
                <Typography variant="body1">{van?.engineNumber || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Registration Expiry</Typography>
                <Typography variant="body1">{van?.registrationExpiry || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Insurance Expiry</Typography>
                <Typography variant="body1">{van?.insuranceExpiry || '—'}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Driver Assignment Card */}
        <Card>
          <CardHeader avatar={<Avatar><UserIcon /></Avatar>} title="Driver Assignment" />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Driver Name</Typography>
                <Typography variant="body1">{van?.assignedDriver?.name || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Driver Phone</Typography>
                <Typography variant="body1">{van?.assignedDriver?.phone || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">License Number</Typography>
                <Typography variant="body1">{van?.assignedDriver?.licenseNumber || '—'}</Typography>
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
                <Typography variant="body1">{van?.school?.name || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">School Code</Typography>
                <Typography variant="body1">{van?.school?.code || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">City</Typography>
                <Typography variant="body1">{van?.school?.city || '—'}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Route Details Card */}
        <Card>
          <CardHeader title="Assigned Routes" />
          <CardContent>
            <Stack spacing={2}>
              {van?.routes?.map((route: any, index: number) => (
                <Box
                  key={index}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    p: 2,
                    bgcolor: '#f5f5f5'
                  }}
                >
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {route.name}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Total Stops:</strong> {route.stops}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Total Students:</strong> {route.students}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Timing:</strong> {route.timing}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Stack>
                </Box>
              ))}
              
              {!van?.routes?.length && (
                <Typography color="text.secondary">No routes assigned</Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Maintenance History Card */}
        <Card>
          <CardHeader title="Maintenance History" />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Last Service Date</Typography>
                <Typography variant="body1">{van?.maintenance?.lastService || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Next Service Date</Typography>
                <Typography variant="body1">{van?.maintenance?.nextService || '—'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" color="text.secondary">Service Type</Typography>
                <Typography variant="body1">{van?.maintenance?.serviceType || '—'}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
