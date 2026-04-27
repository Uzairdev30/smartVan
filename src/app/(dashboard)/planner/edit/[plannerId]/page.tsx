"use client";

import * as React from "react";
import { useEffect } from "react";
import {
  Box,
  Card,
  Stack,
  Typography,
  TextField,
  Grid,
  Button,
  CircularProgress,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  getRouteById,
  updateRoute,
  clearRouteStatus,
} from "@/store/reducers/route-slice";
import { getAllSchoolVans } from "@/store/reducers/van-slice";
import { useRouter, useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import MapComponent from "@/components/MapSelection";
import useSocket from "@/lib/sockets/socket";
import { useAuthContext } from "@/contexts/AuthContext";
import { config } from "@/config";

type FormValues = {
  vanId: string;
  driverId?: string;
  title: string;
  startTime: string;
  tripType: "pick" | "drop";
  tripDays: Record<string, boolean>;
  startLat: string;
  startLong: string;
  endLat: string;
  endLong: string;
};

type Location = { lat: number; lng: number } | null;

export default function UpdateRouteForm(): React.JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Set document title
  useEffect(() => {
    document.title = `${config.site.name} | Edit Route`;
  }, []);
  const params = useParams();
  const { token } = useAuthContext();
  const socket = useSocket(token);

  const routeId = params?.plannerId as string;

  const { routeDetails, loading, success, error } = useSelector(
    (state: RootState) => state.route
  );
  const { vans, loading: vansLoading } = useSelector(
    (state: RootState) => state.van
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      vanId: "",
      driverId: "",
      title: "",
      startTime: "",
      tripType: "Pick",
      tripDays: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      startLat: "",
      startLong: "",
      endLat: "",
      endLong: "",
    },
  });

  const tripDays = watch("tripDays");

  const [showStartMap, setShowStartMap] = React.useState(false);
  const [showEndMap, setShowEndMap] = React.useState(false);
  const [startLocation, setStartLocation] = React.useState<Location>(null);
  const [endLocation, setEndLocation] = React.useState<Location>(null);

  // Fetch vans and route details
  React.useEffect(() => {
    dispatch(getAllSchoolVans({ page: 1, limit: 50 })).unwrap().catch(console.error);
    if (routeId) dispatch(getRouteById(routeId)).unwrap().catch(console.error);
  }, [dispatch, routeId]);

  // Prefill form when routeDetails loaded
  React.useEffect(() => {
    if (routeDetails) {
      reset({
        routeId: routeDetails?._id,
        vanId: routeDetails.vanId || "",
        driverId: routeDetails.driverId || "",
        title: routeDetails.title || "",
        startTime: routeDetails.startTime
        ? routeDetails.startTime.slice(11, 16)
        : "",
        tripType: routeDetails.tripType || "pick",
        tripDays: routeDetails.tripDays || {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false,
        },
        startLat: routeDetails.startPoint?.lat?.toString() || "",
        startLong: routeDetails.startPoint?.long?.toString() || "",
        endLat: routeDetails.endPoint?.lat?.toString() || "",
        endLong: routeDetails.endPoint?.long?.toString() || "",
      });
    }
  }, [routeDetails, reset]);
const formatToISO = (time: string) => {
  const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
  return new Date(`${today}T${time}`).toISOString();
};

  // Update locations when form values change
  React.useEffect(() => {
    const startLat = watch('startLat');
    const startLong = watch('startLong');
    const endLat = watch('endLat');
    const endLong = watch('endLong');

    if (startLat && startLong) {
      setStartLocation({
        lat: parseFloat(startLat),
        lng: parseFloat(startLong)
      });
    } else {
      setStartLocation(null);
    }

    if (endLat && endLong) {
      setEndLocation({
        lat: parseFloat(endLat),
        lng: parseFloat(endLong)
      });
    } else {
      setEndLocation(null);
    }
  }, [watch('startLat'), watch('startLong'), watch('endLat'), watch('endLong')]);
  const onSubmit = async (data: FormValues) => {
    const payload = {
      routeId: routeDetails?._id,
      vanId: data.vanId,
      title: data.title,
      startTime: formatToISO(data.startTime),
      tripType: data.tripType,
      tripDays: data.tripDays,
      startPoint: {
        lat: parseFloat(data.startLat),
        long: parseFloat(data.startLong),
      },
      endPoint: {
        lat: parseFloat(data.endLat),
        long: parseFloat(data.endLong),
      },
    };

    await dispatch(updateRoute(payload));
  };

  // Handle success
  React.useEffect(() => {
    if (success) {
      dispatch(clearRouteStatus());
      router.push("/planner");
    }
  }, [success, dispatch, router]);

  // Clear error after showing
  React.useEffect(() => {
    if (error) dispatch(clearRouteStatus());
  }, [error, dispatch]);

  const handleDayChange = (day: string) => {
    setValue(`tripDays.${day}`, !tripDays[day]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Typography variant="h5">Update Route</Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              {/* Van selection */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="vanId"
                  control={control}
                  rules={{ required: "Van is required" }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.vanId}>
                      <InputLabel id="van-select-label">Select Van</InputLabel>
                      <Select
                        labelId="van-select-label"
                        {...field}
                        label="Select Van"
                        MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                      >
                        {vans?.length > 0 ? (
                          vans.map((v) => (
                            <MenuItem key={v.van?.id} value={v.van?.id}>
                              {v.van.vehicleType} - {v.van.carNumber} ({v.driver.fullname || "No driver"})
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>No vans available</MenuItem>
                        )}
                      </Select>
                      {errors.vanId && <FormHelperText>{errors.vanId.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Title */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: "Title is required" }}
                  render={({ field }) => (
                    <TextField
                      label="Title"
                      fullWidth
                      {...field}
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                  )}
                />
              </Grid>

              {/* Start Time */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="startTime"
                  control={control}
                  rules={{ required: "Start Time is required" }}
                  render={({ field }) => (
                    <TextField
                      label="Start Time"
                      type="time"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      {...field}
                      error={!!errors.startTime}
                      helperText={errors.startTime?.message}
                    />
                  )}
                />
              </Grid>

              {/* Trip Type */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="tripType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Trip Type</InputLabel>
                      <Select {...field} label="Trip Type">
                        <MenuItem value="pick">Pick</MenuItem>
                        <MenuItem value="drop">Drop</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Trip Days */}
              <Grid item xs={12}>
                <FormControl component="fieldset" fullWidth>
                  <InputLabel>Trip Days</InputLabel>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                      color: '#2c3e50',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                  </Typography>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)', md: 'repeat(7, 1fr)' },
                      gap: 1,
                      p: 2,
                    }}
                  >
                    {Object.keys(tripDays).filter(day => day !== '_id').map((day) => (
                      <Box
                        key={day}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 1,
                          borderRadius: 1,
                          backgroundColor: tripDays[day as keyof typeof tripDays] ? '#e3f2fd' : 'transparent',
                          border: tripDays[day as keyof typeof tripDays] ? '2px solid #2196f3' : '1px solid #dee2e6',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                            transform: 'translateY(-1px)'
                          }
                        }}
                        onClick={() => handleDayChange(day)}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={tripDays[day as keyof typeof tripDays]}
                              onChange={() => handleDayChange(day)}
                              sx={{
                                color: '#2196f3',
                                '&.Mui-checked': {
                                  color: '#2196f3',
                                }
                              }}
                            />
                          }
                          label={
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: tripDays[day as keyof typeof tripDays] ? 600 : 400,
                                color: tripDays[day as keyof typeof tripDays] ? '#1976d2' : '#6c757d'
                              }}
                            >
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </Typography>
                          }
                          sx={{ margin: 0 }}
                        />
                      </Box>
                    ))}
                  </Box>
                </FormControl>
              </Grid>

              {/* Start Location */}
              <Grid item xs={12} sm={6}>
                <Button 
                  variant="text" 
                  color="primary"
                  onClick={() => setShowStartMap(!showStartMap)}
                  sx={{ mb: showStartMap ? 2 : 0, justifyContent: 'space-between' }}
                  endIcon={showStartMap ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                >
                  {showStartMap ? 'Hide Start Location Map' : 'Pick Start Location on Map'}
                </Button>
              </Grid>

              {/* End Location */}
              <Grid item xs={12} sm={6}>
                <Button 
                  variant="text" 
                  color="primary"
                  onClick={() => setShowEndMap(!showEndMap)}
                  sx={{ mb: showEndMap ? 2 : 0, justifyContent: 'space-between' }}
                  endIcon={showEndMap ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                >
                  {showEndMap ? 'Hide End Location Map' : 'Pick End Location on Map'}
                </Button>
              </Grid>

              {/* Start Location Map */}
              {showStartMap && (
                <Grid item xs={12} md={showEndMap ? 6 : 12}>
                  <Card sx={{ height: '400px', mb: 2 }}>
                    <MapComponent
                      onPositionChange={(lat, lng) => {
                        setValue("startLat", lat.toString());
                        setValue("startLong", lng.toString());
                      }}
                      onLocationSelect={() => {}}
                      initialLat={watch('startLat')}
                      initialLng={watch('startLong')}
                      startLocation={startLocation}
                      endLocation={endLocation}
                      showRoute={showStartMap && showEndMap}
                    />
                  </Card>
                </Grid>
              )}

              {/* End Location Map */}
              {showEndMap && (
                <Grid item xs={12} md={showStartMap ? 6 : 12}>
                  <Card sx={{ height: '400px', mb: 2 }}>
                    <MapComponent
                      onPositionChange={(lat, lng) => {
                        setValue("endLat", lat.toString());
                        setValue("endLong", lng.toString());
                      }}
                      onLocationSelect={() => {}}
                      initialLat={watch('endLat')}
                      initialLng={watch('endLong')}
                      startLocation={startLocation}
                      endLocation={endLocation}
                      showRoute={showStartMap && showEndMap}
                    />
                  </Card>
                </Grid>
              )}

              {/* Submit */}
              <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ minWidth: 150 }}
                  disabled={loading || vansLoading}
                >
                  {loading ? <CircularProgress size={22} color="inherit" /> : "Update"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Stack>
      </Card>
    </Box>
  );
}
