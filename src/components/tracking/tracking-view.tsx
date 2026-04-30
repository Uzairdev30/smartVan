'use client';

import * as React from 'react';
import {
  Box,
  Stack,
  Typography,
  Avatar,
  Divider,
  Chip,
  AvatarGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  Button,
  Tooltip,
  Card,
  CardContent,
  Grid,
  IconButton,
  TextField
} from '@mui/material';

import { Phone as PhoneIcon, Search as SearchIcon } from '@mui/icons-material';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';

import { Map } from './map';
import { Sidebar } from './Sidebar';
import { useDispatch, useSelector } from '@/store';
import { getTripKidsByDriver } from '@/store/reducers/trip-slice';
import { useAuthContext } from '@/contexts/AuthContext';

export function TrackingView({ vehicles, status, onStatusChange, selectedDate, onDateChange, selectedSchool, onSchoolChange, schools, loading, onClearFilters }: any) {
  const dispatch = useDispatch();
  const { user, userProfile } = useSelector((state: any) => state.auth);

  const [kidsModalOpen, setKidsModalOpen] = React.useState(false);
  const [selectedLocations, setSelectedLocations] = React.useState([])
  const { tripKids, tripKidsLoading } = useSelector((state) => state.trip);
  const kidsArray = tripKids?.kids ?? [];

  const [openSidebar, setOpenSidebar] = React.useState(false);

  // Check if user is super admin - check both user and userProfile
  const currentUser = user || userProfile;
  const isSuperAdmin = currentUser?.role === 'superadmin' || currentUser?.userType === 'superadmin';
  const isSchoolAdmin = currentUser?.role === 'admin' || currentUser?.userType === 'admin';

  // Debug logging
  console.log("Auth Debug:", {
    user,
    userProfile,
    currentUser,
    isSuperAdmin,
    isSchoolAdmin,
    userRole: currentUser?.role,
    userType: currentUser?.userType,
    currentUserString: JSON.stringify(currentUser, null, 2)
  });

  console.log("Schools Debug:", {
    schools,
    schoolsLength: schools?.length,
    selectedSchool
  });
  console.log("selectedSchool:", selectedSchool);
  const [currentVehicleId, setCurrentVehicleId] = React.useState<string | undefined>(
    vehicles[0] ? String(vehicles[0].id) : undefined
  );
  console.log("vehicles", vehicles)
  // ⭐ Always auto-select first vehicle when list updates
  React.useEffect(() => {
    if (vehicles.length === 0) {
      setCurrentVehicleId(undefined);
      return;
    }

    const exists = vehicles.some((v: any) => String(v.id) === currentVehicleId);
    if (!exists) {
      setCurrentVehicleId(String(vehicles[0].id));
    }
  }, [vehicles]);

  const currentVehicle =
    vehicles.length === 0
      ? null
      : vehicles.find((v: any) => String(v.id) === currentVehicleId) ||
      vehicles[0];
  const hasTrips = vehicles?.length > 0 && !!currentVehicle;
  const pickedCount =
    currentVehicle?.kids?.filter((k: any) => k.picked)?.length || 0;

  const notPickedCount =
    (currentVehicle?.kids?.length || 0) - pickedCount;
  // Debug logging for currentVehicle
  console.log("Current Vehicle Debug:", {
    currentVehicle,
    currentVehicleId,
    vehiclesLength: vehicles.length,
    vehicles: vehicles.map(v => ({
      id: v.id,
      name: v.name,
      tripStart: v.tripStart,
      status: v.status
    }))
  });

  const rawStatus =
    currentVehicle?.status ?? currentVehicle?.tripStatus ?? 'unknown';

  const statusLabelMap: any = {
    start: 'Trip Started',
    ongoing: 'On Way to School',
    end: 'Trip Completed',
    unknown: 'Unknown'
  };

  const statusColorMap: any = {
    start: '#2D9CDB',
    ongoing: '#34C759',
    end: '#9B9B9B',
    unknown: '#9B9B9B'
  };

  const statusLabel = statusLabelMap[rawStatus];
  const statusColor = statusColorMap[rawStatus];

  const progressRatio =
    rawStatus === 'start' ? 0.25 : rawStatus === 'ongoing' ? 0.6 : rawStatus === 'end' ? 1 : 0;

  const routePoints = [
    { id: 1, type: 'start', distance: 0 },
    { id: 2, type: 'route', distance: 10 },
    { id: 3, type: 'route', distance: 15 },
    { id: 4, type: 'route', distance: 40 },
    { id: 5, type: 'van', distance: 50 },
    { id: 6, type: 'route', distance: 70 },
    { id: 7, type: 'route', distance: 90 },
    { id: 8, type: 'end', distance: 100 },
  ];

  const totalDistance = 100;
  const completedWidth = `${progressRatio * 100}%`;
  const remainingWidth = `${(1 - progressRatio) * 100}%`;
  const vanLeftPercent = progressRatio * 100;

  const handleGetTripKids = () => {
    if (!currentVehicle) return;

    setKidsModalOpen(true);

    dispatch(
      getTripKidsByDriver({
        tripId: String(currentVehicle.id),
        driverId: currentVehicle.driverId,
      })
    );
  };
  console.log("selec", selectedLocations)
  return (
    <>
      <Box sx={{ display: 'flex', height: '100%' }}>

        {/* SIDEBAR ALWAYS VISIBLE */}
        <Sidebar
          currentVehicleId={currentVehicleId}
          onClose={() => setOpenSidebar(false)}
          onVehicleDeselect={() => setCurrentVehicleId(undefined)}
          onVehicleSelect={(id) => setCurrentVehicleId(id)}
          open={openSidebar}
          vehicles={vehicles}
          setSelectedLocations={setSelectedLocations}
          isSuperAdmin={isSuperAdmin}
          selectedSchool={selectedSchool}
        />

        <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* =================== DRIVER CARD =================== */}
          <Box
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack spacing={0.5}>
                <Typography variant="h6">Driver Details</Typography>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SearchIcon />}
                  onClick={() => setOpenSidebar(!openSidebar)}
                  sx={{
                    mt: 1,
                    backgroundColor: 'primary',
                    // color: '#fff',
                    display: {
                      xs: 'flex',
                      sm: 'flex',
                      md: 'none', // 👈 hide on >= 900px
                    },
                    '&:hover': {
                      backgroundColor: 'primary',
                    },
                  }}
                >
                  By Driver Name
                </Button>
              </Stack>

              {/* DATE PICKER AND FILTER */}
              <Stack direction="row" spacing={1} alignItems="center">
                {/* Show school filter ONLY for super admin */}
                {isSuperAdmin && (
                  <Select
                    value={selectedSchool}
                    onChange={(e) => onSchoolChange(e.target.value)}
                    size="small"
                    sx={{ minWidth: 200, background: 'white', borderRadius: 1 }}
                    displayEmpty
                  >
                    <MenuItem value="">Select Schools</MenuItem>
                    {schools?.map((school: any) => (
                      <MenuItem key={school._id} value={school._id}>
                        {school.schoolName || school.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}

                {/* Show date and trips filters for school admin OR for super admin after school selection */}
                {(isSchoolAdmin || (isSuperAdmin && selectedSchool)) && (
                  <>
                    <TextField
                      type="date"
                      size="small"
                      value={selectedDate}
                      onChange={(e) => onDateChange(e.target.value)}
                      sx={{
                        background: 'white',
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                        }
                      }}
                    />
                    <Select
                      value={status}
                      onChange={(e) => onStatusChange(e.target.value)}
                      size="small"
                      sx={{ minWidth: 150, background: 'white', borderRadius: 1 }}
                    >
                      <MenuItem value="">All Trips</MenuItem>
                      <MenuItem value="start">Started</MenuItem>
                      <MenuItem value="ongoing">Ongoing</MenuItem>
                      <MenuItem value="end">Completed</MenuItem>
                    </Select>

                    {/* Clear button for super admin */}
                    {isSuperAdmin && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={onClearFilters}
                        sx={{ borderRadius: 1 }}
                      >
                        Clear
                      </Button>
                    )}
                  </>
                )}
              </Stack>
            </Stack>

            {/* No Vehicle or School Selection State */}
            {(!currentVehicle || (isSuperAdmin && (!selectedSchool || selectedSchool === ''))) && (
              <Typography sx={{ opacity: 0.6 }}>
                {isSuperAdmin && (!selectedSchool || selectedSchool === '') ? 'Please Select School First' : 'No trips found'}
              </Typography>
            )}

            {/* When vehicle exists and school is selected */}
            {currentVehicle && !(isSuperAdmin && (!selectedSchool || selectedSchool === '')) && (
              <>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={currentVehicle.avatar} sx={{ width: 56, height: 56 }} />
                    <Box>
                      <Typography fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                        {currentVehicle.driverName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {currentVehicle.carName} ({currentVehicle.plate})
                      </Typography>
                    </Box>
                  </Stack>

                  <Chip
                    label={statusLabel}
                    size="small"
                    sx={{
                      backgroundColor: '#F6F7F9',
                      color: statusColor,
                      fontWeight: 'bold',
                      fontSize: 12,
                    }}
                  />
                </Stack>

                <Divider />

                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.3,
                      px: 1.5,
                      py: 1,
                      backgroundColor: '#FFFFFF',
                      flex: 1
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#6B7280',
                        fontWeight: 600,
                        letterSpacing: 0.3,
                        textTransform: 'uppercase',
                      }}
                    >
                      School Name
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: '#191970',
                      }}
                    >
                      {currentVehicle.schoolName || 'N/A'}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                      px: 1.5,
                      py: 1,
                      backgroundColor: '#FFFFFF',
                      flex: 1
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#6B7280',
                        fontWeight: 600,
                        letterSpacing: 0.3,
                        textTransform: 'uppercase',
                      }}
                    >
                      Trip Started
                    </Typography>

                    <Chip
                      label={
                        currentVehicle.tripStart?.startTime
                          ? new Date(currentVehicle.tripStart.startTime).toLocaleString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                          : 'N/A'
                      }
                      sx={{
                        width: 'fit-content',
                        fontWeight: 600,
                        backgroundColor: '#E6F7EC',
                        color: '#1FA959',
                        borderRadius: '8px',
                        px: 1,
                        height: 24,
                        fontSize: 11,
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                      px: 1.5,
                      py: 1,
                      backgroundColor: '#FFFFFF',
                      flex: 1
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#6B7280',
                        fontWeight: 600,
                        letterSpacing: 0.3,
                        textTransform: 'uppercase',
                      }}
                    >
                      Trip Ended
                    </Typography>

                    <Chip
                      label={
                        currentVehicle.tripEnd?.endTime
                          ? new Date(currentVehicle.tripEnd.endTime).toLocaleString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                          : 'N/A'
                      }
                      sx={{
                        width: 'fit-content',
                        fontWeight: 600,
                        backgroundColor: '#FDECEC',
                        color: '#D32F2F',
                        borderRadius: '8px',
                        px: 1,
                        height: 24,
                        fontSize: 11,
                      }}
                    />
                  </Box>


                </Stack>
              </>
            )}
          </Box>

          {/* =================== ROUTE DETAILS =================== */}
          {currentVehicle && !(isSuperAdmin && (!selectedSchool || selectedSchool === '')) && (
            <Box
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                backgroundColor: '#FFFFFF',
                p: 2,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Trip Details
              </Typography>

              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.3,
                    px: 1.5,
                    py: 1,
                    backgroundColor: '#FFFFFF',
                    flex: 1
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#6B7280',
                      fontWeight: 600,
                      letterSpacing: 0.3,
                      textTransform: 'uppercase',
                    }}
                  >
                    Route Name
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: '#191970' }}
                  >
                    {currentVehicle?.routeTitle || 'No Route Assigned'}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.3,
                    px: 1.5,
                    py: 1,
                    backgroundColor: '#FFFFFF',
                    flex: 1
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#6B7280',
                      fontWeight: 600,
                      letterSpacing: 0.3,
                      textTransform: 'uppercase',
                    }}
                  >
                    Route Trip Type
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      width: 'fit-content',
                      px: 1,
                      py: 0.2,
                      borderRadius: '6px',
                      display: 'inline-block',
                      backgroundColor:
                        currentVehicle?.routeTripType === 'pick'
                          ? '#E6F7EC'
                          : currentVehicle?.routeTripType === 'drop'
                            ? '#E3F2FD'
                            : '#F3F4F6',
                      color:
                        currentVehicle?.routeTripType === 'pick'
                          ? '#1FA959'
                          : currentVehicle?.routeTripType === 'drop'
                            ? '#1976D2'
                            : '#666',
                    }}
                  >
                    {currentVehicle?.routeTripType === 'pick'
                      ? 'Pick'
                      : currentVehicle?.routeTripType === 'drop'
                        ? 'Drop'
                        : 'No Trip'}
                  </Typography>
                </Box>

                <Stack direction="row" justifyContent="space-between">
                  <Button
                    size="small"
                    onClick={handleGetTripKids}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      flexDirection: "column",
                      gap: 0.8,
                      px: 1.5,
                      py: 1,
                      textTransform: "none",
                      backgroundColor: "#FFFFFF",
                      flex: 1,
                      borderRadius: 2,
                      "&:hover": {
                        backgroundColor: "rgba(25, 118, 210, 0.04)",
                      },
                    }}
                  >

                    {/* Title */}
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#6B7280',
                        fontWeight: 600,
                        letterSpacing: 0.3,
                        textTransform: 'uppercase',
                      }}
                    >
                      Students to be Picked
                    </Typography>

                    {/* BADGES ROW */}
                    <Stack direction="row" spacing={1} flexWrap="wrap">

                      <Chip
                        label={`Total: ${tripKids?.totalKids || 0}`}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: 11,
                          backgroundColor: "#E3F2FD",
                          color: "#1976D2",
                          fontWeight: 600,
                        }}
                      />

                      <Chip
                        label={`Picked: ${tripKids?.pickedCount || 0}`}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: 11,
                          backgroundColor: "#E6F7EC",
                          color: "#1FA959",
                          fontWeight: 600,
                        }}
                      />

                      <Chip
                        label={`Not Picked: ${(tripKids?.totalKids || 0) - (tripKids?.pickedCount || 0)}`}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: 11,
                          backgroundColor: "#FDECEC",
                          color: "#D32F2F",
                          fontWeight: 600,
                        }}
                      />

                    </Stack>

                  </Button>
                </Stack>
              </Stack>
            </Box>
          )}

          {/* MAP - SHOW ONLY WHEN VEHICLE EXISTS AND SCHOOL SELECTED */}
          {currentVehicle && !(isSuperAdmin && (!selectedSchool || selectedSchool === '')) && (
            <Box sx={{ flex: 1, borderRadius: 2, overflow: 'hidden', minHeight: '500px' }}>
              <Map
                status={status}
                currentVehicle={currentVehicle}
                currentVehicleId={currentVehicleId}
                vehicles={vehicles}
                onVehicleSelect={(id) => setCurrentVehicleId(id)}
                selectedLocations={selectedLocations}
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* STUDENTS MODAL */}
      <Dialog
        open={kidsModalOpen}
        onClose={() => setKidsModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >

        {/* ================= HEADER ================= */}
        <DialogTitle
          sx={{
            backgroundColor: '#191970',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon />
            Students to be Picked ({tripKids?.totalKids || 0})
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" sx={{ color: '#34C759', fontWeight: 600 }}>
              Picked: {tripKids?.pickedCount || 0}
            </Typography>

            <Typography variant="body2" sx={{ color: '#D32F2F', fontWeight: 600 }}>
              Not Picked: {(tripKids?.totalKids || 0) - (tripKids?.pickedCount || 0)}
            </Typography>
          </Stack>
        </DialogTitle>

        {/* ================= CONTENT ================= */}
        <DialogContent 
          sx={{ 
            p: 2, 
            backgroundColor: '#ffffff',
            overflowY: 'auto',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE and Edge
            '&::-webkit-scrollbar': {
              display: 'none', // Chrome, Safari, Opera
            },
            '&': {
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE and Edge
            }
          }}
        >

          {tripKidsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography>Loading students...</Typography>
            </Box>
          ) : kidsArray.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography color="text.secondary">No students found.</Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>

              {kidsArray.map((kid: any, index: number) => (
                <ListItem
                  key={kid._id}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom:
                      index < kidsArray.length - 1 ? '1px solid #e0e0e0' : 'none',
                    '&:hover': { backgroundColor: '#f8f9fa' }
                  }}
                >

                  <Grid container alignItems="center">

                    {/* ================= S.NO ================= */}
                    <Grid item xs={1}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: '#191970' }}
                      >
                        {index + 1}
                      </Typography>
                    </Grid>

                    {/* ================= KID INFO ================= */}
                    <Grid item xs={7}>
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">

                        <Avatar src={kid.image} sx={{ bgcolor: '#1FA959' }}>
                          {!kid.image && kid.name?.charAt(0)?.toUpperCase()}
                        </Avatar>

                        <Box>
                          <Typography fontWeight="bold" color="#191970">
                            {kid.name}
                          </Typography>

                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            <strong>Address:</strong> {kid.parent?.address || 'N/A'}
                          </Typography>

                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            <strong>Phone:</strong> {kid.parent?.phone || 'N/A'}
                          </Typography>
                        </Box>

                      </Stack>
                    </Grid>

                    {/* ================= STATUS (RIGHT CORNER FIX) ================= */}
                    <Grid
                      item
                      xs={4}
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end'
                      }}
                    >
                      <Chip
                        label={kid.picked ? 'Picked' : 'Not Picked'}
                        size="small"
                        sx={{
                          backgroundColor: kid.picked ? '#E6F7EC' : '#FDECEC',
                          color: kid.picked ? '#1FA959' : '#D32F2F',
                          fontWeight: 600,
                        }}
                      />
                    </Grid>

                  </Grid>

                </ListItem>
              ))}

            </List>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
