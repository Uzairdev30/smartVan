"use client";

import * as React from "react";
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
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from '@mui/icons-material/Close';
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

type FormValues = {
  vanId: string;
  driverId?: string;
  title: string;
  startTime: string;
  tripType: "morning" | "evening";
  tripDays: Record<string, boolean>;
  startLat: string;
  startLong: string;
  endLat: string;
  endLong: string;
  routeId: string;
};

export default function UpdateRouteForm(): React.JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
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
      tripType: "morning",
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

  const [openPicker, setOpenPicker] = React.useState<null | "start" | "end">(null);

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
        startTime: routeDetails.startTime || "",
        tripType: routeDetails.tripType || "morning",
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

  const onSubmit = async (data: FormValues) => {
    const payload = {
      routeId: routeDetails?._id,
      vanId: data.vanId,
      title: data.title,
      startTime: data.startTime,
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
          {/* ✅ Back arrow with title */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton onClick={() => router.back()}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5">Update Route</Typography>
          </Stack>

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
                        {vans?.map((v) => (
                          <MenuItem key={v.van?.id} value={v.van?.id}>
                            {v.van.vehicleType} - {v.van.carNumber} (
                            {v.driver.fullname || "No driver"})
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.vanId && (
                        <FormHelperText>{errors.vanId.message}</FormHelperText>
                      )}
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
                  rules={{ required: "Trip Type is required" }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.tripType}>
                      <InputLabel id="trip-type-label">Trip Type</InputLabel>
                      <Select labelId="trip-type-label" {...field} label="Trip Type">
                        <MenuItem value="morning">Morning</MenuItem>
                        <MenuItem value="evening">Evening</MenuItem>
                      </Select>
                      {errors.tripType && (
                        <FormHelperText>{errors.tripType.message}</FormHelperText>
                      )}
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
                <Button variant="outlined" onClick={() => setOpenPicker("start")}>
                  Pick Start Location on Map
                </Button>
              </Grid>

              {/* End Location */}
              <Grid item xs={12} sm={6}>
                <Button variant="outlined" onClick={() => setOpenPicker("end")}>
                  Pick End Location on Map
                </Button>
              </Grid>

              {/* Submit */}
              <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ minWidth: 150 }}
                  disabled={loading || vansLoading}
                >
                  {loading ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    "Update"
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Stack>
      </Card>

      {/* Map Picker Dialog */}
      <Dialog 
        open={!!openPicker} 
        onClose={() => setOpenPicker(null)} 
        maxWidth={false}
        fullWidth
        PaperProps={{
          style: {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            margin: '0',
            width: '100vw',
            height: '100vh',
            maxWidth: 'none',
            maxHeight: 'none',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }
        }}
      >
        <DialogContent sx={{ 
          width: '90%', 
          height: '80%', 
          maxWidth: '1000px',
          maxHeight: '700px',
          margin: 'auto',
          backgroundColor: 'transparent',
          borderRadius: 0,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'none'
        }}>
          <MapComponent
            onPositionChange={(lat, lng) => {
              if (openPicker === "start") {
                setValue("startLat", lat.toString());
                setValue("startLong", lng.toString());
              } else {
                setValue("endLat", lat.toString());
                setValue("endLong", lng.toString());
              }
            }}
            onLocationSelect={() => setOpenPicker(null)}
            initialLat={openPicker === 'start' ? watch('startLat') : watch('endLat')}
            initialLng={openPicker === 'start' ? watch('startLong') : watch('endLong')}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
