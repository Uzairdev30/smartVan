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

import { Phone as PhoneIcon } from '@mui/icons-material';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';

import { Map } from './map';
import { Sidebar } from './Sidebar';
import { useDispatch, useSelector } from '@/store';
import { getTripKidsByDriver } from '@/store/reducers/trip-slice';

export function TrackingView({ vehicles, status, onStatusChange, loading }: any) {
  const dispatch = useDispatch();

  const [kidsModalOpen, setKidsModalOpen] = React.useState(false);
  const [selectedLocations,setSelectedLocations]=React.useState([])
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);
  const { tripKids, tripKidsLoading } = useSelector((state) => state.trip);
  const kidsArray = tripKids?.kids ?? [];

  const [openSidebar, setOpenSidebar] = React.useState(false);

  const [currentVehicleId, setCurrentVehicleId] = React.useState<string | undefined>(
    vehicles[0] ? String(vehicles[0].id) : undefined
  );
console.log("vehicles",vehicles)
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
console.log("selec",selectedLocations)
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
              <Typography variant="h6">Driver Details</Typography>

              {/* DATE PICKER AND FILTER */}
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  type="date"
                  size="small"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
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
              </Stack>
            </Stack>

            {/* No Vehicle State */}
            {!currentVehicle && (
              <Typography sx={{ opacity: 0.6 }}>No trips found</Typography>
            )}

            {/* When vehicle exists */}
            {currentVehicle && (
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

                <Stack direction="row" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" fontWeight="bold" color="#191970">
                      Trip started on:
                    </Typography>
                    <Typography variant="body2">
                      {currentVehicle.tripStart
                        ? new Date(currentVehicle.tripStart).toLocaleString()
                        : 'N/A'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" fontWeight="bold" color="#191970">
                      School Route:
                      </Typography>
                    <Typography variant="body2">{currentVehicle.routeTitle || 'N/A'}</Typography>
                  </Box>

                  <Tooltip title={` ${currentVehicle.driver?.phoneNo || currentVehicle.phoneNo || 'N/A'}`} arrow placement="top">
                    <Button
                      variant="contained"
                      startIcon={<PhoneIcon sx={{ color: 'white' }} />}
                      sx={{
                        backgroundColor: '#1FA959',
                        color: 'white',
                        '&:hover': { backgroundColor: '#178a48' },
                      }}
                      onClick={() => {
                        const phoneNo = currentVehicle.driver?.phoneNo || currentVehicle.phoneNo;
                        if (phoneNo) {
                          window.open(`tel:${phoneNo}`);
                        }
                      }}
                    >
                      Call Driver
                    </Button>
                  </Tooltip>
                </Stack>
              </>
            )}
          </Box>

          {/* =================== TRIP DETAILS =================== */}
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
            <Typography variant="h6">Trip Details</Typography>
              
            {!currentVehicle && (
              <Typography sx={{ opacity: 0.6 }}>No trip data available</Typography>
            )}

            {currentVehicle && (
              <>
                <Box sx={{display:'flex',gap:20}}>
                     <Typography variant="body2" color="text.secondary">
                 <span style={{fontWeight:'bold'}}> Route Name: </span> {currentVehicle?.routeTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                   <span style={{fontWeight:'bold'}}> Route Trip Type: </span> 
                    {currentVehicle?.routeTripType}
                </Typography> 
                  
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {statusLabel}
                </Typography>

                {/* Student Details */}
                <Typography variant="h6">Student Details</Typography>

                <Stack direction="row" justifyContent="space-between">
                  {/* <Stack direction="row" alignItems="center" gap={1}>
                    <Typography variant="body2" color="#008000">Students Picked</Typography>
                    <AvatarGroup max={3}>
                      {[1, 2].map((i) => (
                        <Avatar key={i} src={`/assets/avatar-${i}.png`} />
                      ))}
                    </AvatarGroup>
                  </Stack> */}

                  <Stack
                    direction="row"
                    alignItems="center"
                    gap={1}
                    sx={{ cursor: 'pointer' }}
                    onClick={handleGetTripKids}
                  >
                    <Typography variant="body2" color="#008000">Students to be Picked</Typography>
                    {/* <AvatarGroup max={3}>
                      {[3, 4, 5].map((i) => (
                        <Avatar key={i} src={`/assets/avatar-${i}.png`} />
                      ))}
                    </AvatarGroup> */}
                  </Stack>
                </Stack>
              </>
            )}
          </Box>

          {/* MAP ALWAYS SHOW */}
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
        </Box>
      </Box>

      {/* STUDENTS MODAL */}
      <Dialog 
        open={kidsModalOpen} 
        onClose={() => setKidsModalOpen(false)} 
        fullWidth 
        maxWidth="sm"
      >
        <DialogTitle sx={{ 
          backgroundColor: '#191970', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <SchoolIcon />
          Students to be Picked ({kidsArray.length})
        </DialogTitle>
        <DialogContent sx={{ p: 2, backgroundColor: '#ffffff' }}>
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
                <React.Fragment key={kid._id}>
                  <ListItem 
                    sx={{ 
                      px: 2,
                      py: 1.5,
                      borderBottom: index < kidsArray.length - 1 ? '1px solid #e0e0e0' : 'none',
                      '&:hover': { backgroundColor: '#f8f9fa' }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#1FA959' }}>
                        {kid.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="bold" color="#191970">
                          {kid.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            📍 {kid.parent?.address || 'Address not available'}
                          </Typography>
                          {kid.parent?.name && (
                            <Typography variant="body2" color="text.secondary">
                              👤 Parent: {kid.parent.name}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    {kid.parent?.phone && (
                      <Tooltip title={`Call parent: ${kid.parent.phone}`}>
                        <IconButton 
                          sx={{ 
                            bgcolor: '#1FA959',
                            color: 'white',
                            '&:hover': { bgcolor: '#178a48' }
                          }}
                          onClick={() => window.open(`tel:${kid.parent.phone}`)}
                        >
                          <PhoneIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
