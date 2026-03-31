"use client";

import * as React from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  Typography,
  Divider,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Link,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { useRouter } from "next/navigation";
import { ArrowLeft as ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { House as HouseIcon } from "@phosphor-icons/react/dist/ssr/House";
import { PencilSimple as EditIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { MapPin as MapPinIcon } from "@phosphor-icons/react/dist/ssr/MapPin";
import { Clock as ClockIcon } from "@phosphor-icons/react/dist/ssr/Clock";
import { Van as VanIcon } from "@phosphor-icons/react/dist/ssr/Van";
import { User as UserIcon } from "@phosphor-icons/react/dist/ssr/User";

import { getRouteById } from "@/store/reducers/route-slice";
import { paths } from "@/paths";

// 🔹 Simple DetailItem
function DetailItem({ label, value }: { label: string; value: any }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle1" fontWeight={600}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

export default function PlannerDetailPage({ params }: { params: { plannerId: string } }): React.JSX.Element {
  const router = useRouter();
  const plannerId = params.plannerId;

  console.log('🔴 Route Detail Page - plannerId:', plannerId);
  console.log('🔴 Full params:', params);

  const dispatch = useDispatch<AppDispatch>();
  const { routeDetails, loading } = useSelector((s: RootState) => s.route);

  console.log('🔴 Redux routeDetails:', routeDetails);
  console.log('🔴 Loading state:', loading);

  React.useEffect(() => {
    console.log('🔍 useEffect - About to dispatch with plannerId:', plannerId);
    if (plannerId) {
      console.log('✅ Dispatching getRouteById with ID:', plannerId);
      dispatch(getRouteById(plannerId));
    } else {
      console.error('❌ plannerId is undefined or empty!');
    }
  }, [plannerId, dispatch]);

  const tripDays =
    routeDetails?.tripDays &&
    Object.entries(routeDetails.tripDays)
      .filter(([key, value]) => value && key !== "_id")
      .map(([day]) => day);

  const getTripTypeColor = (type: string) => {
    return type === "morning" ? "warning" : "info";
  };

  if (loading && !routeDetails) return <LinearProgress sx={{ mb: 2 }} />;

  if (!routeDetails)
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" mb={2}>
          Route not found
        </Typography>
        <Button variant="outlined" onClick={() => router.back()}>
          Back to Routes
        </Button>
      </Box>
    );

  return (
    <Box sx={{ p: 4 }}>
      {/* Back Button */}
      <Button 
        startIcon={<ArrowLeftIcon />} 
        onClick={() => router.back()}
        sx={{ mb: 3 }}
      >
        Back to Routes
      </Button>

      <Stack spacing={3}>
        {/* Main Route Card */}
        <Card sx={{ p: 2 }}>
          <CardContent>
            {/* Top: Avatar + Route Info + Status */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              {/* Left: Avatar + Info */}
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  sx={{ 
                    width: 56, 
                    height: 56, 
                    bgcolor: '#1976d2',
                    color: '#fff'
                  }}
                >
                  <HouseIcon size={24} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {routeDetails.title || 'Untitled Route'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Route ID: {routeDetails._id}
                  </Typography>
                </Box>
              </Box>

              {/* Right: Status + Actions */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={routeDetails.tripType?.toUpperCase() || 'UNKNOWN'}
                  color={getTripTypeColor(routeDetails.tripType)}
                  size="small"
                />
                {/* <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<EditIcon />}
                  onClick={() => router.push(`${paths.dashboard.planner}/edit/${plannerId}`)}
                >
                  Edit
                </Button> */}
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Trip Information Card */}
        <Card>
          <CardHeader 
            title="Trip Information" 
            // avatar={<ClockIcon color="#1976d2" />}
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={6}>
                <Typography variant="subtitle1" color="text.secondary">Start Time</Typography>
                <Typography variant="body1">{routeDetails.startTime || '—'}</Typography>
              </Grid>
              {/* <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Trip Type</Typography>
                <Chip
                  label={routeDetails.tripType || '—'}
                  color={getTripTypeColor(routeDetails.tripType)}
                  size="small"
                />
              </Grid> */}
              <Grid item xs={12} sm={6} md={6}>
                <Typography variant="subtitle1" color="text.secondary">Trip Days</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {tripDays?.length > 0 ? (
                    tripDays.map((day: string) => (
                      <Box
                        key={day}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: '#e3f2fd',
                          border: '1px solid #2196f3',
                          minWidth: '45px',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: '#1976d2',
                            fontSize: '0.75rem',
                            textTransform: 'capitalize',
                          }}
                        >
                          {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2">—</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Vehicle Information Card */}
        <Card>
          <CardHeader 
            title="Vehicle Information" 
            // avatar={<VanIcon color="#1976d2" />}
          />
          <CardContent>
            <Grid container spacing={3}>
              {/* <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Van ID</Typography>
                <Typography variant="body1">{routeDetails.vanId || '—'}</Typography>
              </Grid> */}
              <Grid item xs={12} sm={6} md={6}>
                <Typography variant="subtitle1" color="text.secondary">Car Number</Typography>
                <Typography variant="body1">{routeDetails.carNumber || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <Typography variant="subtitle1" color="text.secondary">Driver Name</Typography>
                <Typography variant="body1">{routeDetails.driverName || '—'}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Route Points Card */}
        <Card>
          <CardHeader 
            title="Route Points" 
            // avatar={<MapPinIcon color="#1976d2" />}
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Start Point</Typography>
                <Box>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                    {routeDetails.startPoint
                      ? `${routeDetails.startPoint.lat}, ${routeDetails.startPoint.long}`
                      : "—"}
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ fontStyle: 'italic' }}>
                    {routeDetails.startPoint?.areaName || 'Loading area name...'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">End Point</Typography>
                <Box>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                    {routeDetails.endPoint
                      ? `${routeDetails.endPoint.lat}, ${routeDetails.endPoint.long}`
                      : "—"}
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ fontStyle: 'italic' }}>
                    {routeDetails.endPoint?.areaName || 'Loading area name...'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* System Information Card */}
        {/* <Card>
          <CardHeader 
            title="System Information" 
            // avatar={<UserIcon color="#1976d2" />}
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Created At</Typography>
                <Typography variant="body2">
                  {routeDetails.createdAt
                    ? new Date(routeDetails.createdAt).toLocaleString()
                    : "—"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Updated At</Typography>
                <Typography variant="body2">
                  {routeDetails.updatedAt
                    ? new Date(routeDetails.updatedAt).toLocaleString()
                    : "—"}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card> */}

        {/* Action Buttons */}
        {/* <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button variant="outlined" onClick={() => router.back()}>
            Back
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => router.push(`${paths.dashboard.planner}/edit/${plannerId}`)}
          >
            Edit Route
          </Button>
        </Stack> */}
      </Stack>
    </Box>
  );
}
