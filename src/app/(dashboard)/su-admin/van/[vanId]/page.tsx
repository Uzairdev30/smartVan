// app/(dashboard)/su-admin/van/[vanId]/page.tsx

"use client";

import * as React from "react";
import { useEffect } from "react";
import { 
  Avatar, 
  Box, 
  Button,  // ✅ Button import add kiya (pehle missing tha)
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
import { Buildings as SchoolIcon } from "@phosphor-icons/react/dist/ssr/Buildings"; 
import { useRouter, useParams } from "next/navigation";
import { config } from "@/config";
import axios from "@/api/axios";

export default function VanDetailPage(): React.JSX.Element {
  const router = useRouter();
  const params = useParams();
  const vanId = params.vanId as string;

  useEffect(() => {
    document.title = `${config.site.name} | Van Details (Super Admin)`;
  }, []);

  // State for van data
  const [van, setVan] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  // Fetch van details
  const fetchVanDetails = React.useCallback(async () => {
    if (!vanId) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/van/getVanById/${vanId}`);
      
      if (response.data?.data) {
        setVan(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching van details:', error);
      setVan(null);
    } finally {
      setLoading(false);
    }
  }, [vanId]);

  // Fetch van details on component mount
  useEffect(() => {
    fetchVanDetails();
  }, [fetchVanDetails]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "success";
      case "inactive": return "error";
      case "maintenance": return "warning";
      default: return "default";
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <Typography>Loading van details...</Typography>
      </Box>
    );
  }

  if (!van) {
    return (
      <Box sx={{ p: 4 }}>
        <Button startIcon={<ArrowLeftIcon />} onClick={() => router.back()}>
          Back to Vans
        </Button>
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="h6" color="error">
            Van not found
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Button startIcon={<ArrowLeftIcon />} onClick={() => router.back()}>
        Back to Vans
      </Button>

      <Stack spacing={3} mt={3}>
        {/* Main Van Card */}
        <Card sx={{ p: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>
                  <CarIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{van?.numberPlate || 'Van Number N/A'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {van?.vehicleType} | Capacity: {van?.capacity} seats
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Condition: {van?.condition || 'N/A'}
                  </Typography>
                </Box>
              </Box>
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
                <Typography variant="subtitle1" color="text.secondary">Number Plate</Typography>
                <Typography variant="body1">{van?.numberPlate || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Vehicle Type</Typography>
                <Typography variant="body1">{van?.vehicleType || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Condition</Typography>
                <Typography variant="body1">{van?.condition || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Capacity</Typography>
                <Typography variant="body1">{van?.capacity || '—'} seats</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Device ID</Typography>
                <Typography variant="body1">{van?.deviceId || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Status</Typography>
                <Typography variant="body1">{van?.status || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Own Van</Typography>
                <Typography variant="body1">{van?.ownVan ? 'Yes' : 'No'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Route</Typography>
                <Typography variant="body1">{van?.route || '—'}</Typography>
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
                <Typography variant="body1">{van?.driverName || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Driver Phone</Typography>
                <Typography variant="body1">{van?.driverPhone || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Driver Email</Typography>
                <Typography variant="body1">{van?.driverEmail || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Driver CNIC</Typography>
                <Typography variant="body1">{van?.driverCnic || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Driver ID</Typography>
                <Typography variant="body1">{van?.driverId || '—'}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* School Assignment Card */}
        <Card>
          <CardHeader avatar={<Avatar><SchoolIcon /></Avatar>} title="School Assignment" />
          <CardContent>
            <Grid container spacing={3}>
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
                  key={route.id || index}
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, bgcolor: 'background.default' }}
                >
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {route.routeName}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          Trip Type: {route.tripType}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          Start Time: {route.startTime ? new Date(route.startTime).toLocaleString() : '—'}
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

      </Stack>
    </Box>
  );
}