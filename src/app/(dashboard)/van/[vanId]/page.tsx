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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Modal,
  Chip,
  CircularProgress,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { useParams } from "next/navigation";

import { ArrowLeft as ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { User as UserIcon } from "@phosphor-icons/react/dist/ssr/User";
import { House as HouseIcon } from "@phosphor-icons/react/dist/ssr/House";
import { PencilSimple as EditIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple";

import { getVanDetailById, bulkUpdateVanStatus, removeDriverFromVan } from "@/store/reducers/van-slice";
import { getAllDrivers, assignDriverToVan } from "@/store/reducers/driver-slice";
import Link from "next/link";

// Reusable Detail Item
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

export default function VanDetailsPage() {
  const params = useParams<{ vanId: string }>();
  const vanId = params?.vanId;

  const dispatch = useDispatch<AppDispatch>();
  const { selectedVan, selectedVanLoading } = useSelector(
    (state: RootState) => state.van
  );
  const { drivers, loading: driversLoading } = useSelector(
    (state: RootState) => state.driver
  );

  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedDriver, setSelectedDriver] = React.useState("");

  React.useEffect(() => {
    if (vanId) dispatch(getVanDetailById(vanId));
  }, [vanId, dispatch]);

  React.useEffect(() => {
    dispatch(getAllDrivers({ page: 1, limit: 1000 }));
  }, [dispatch]);

  const handleStatusToggle = async () => {
    if (!selectedVan?.id || !selectedVan?.status) return;

    const newStatus = selectedVan.status.toLowerCase() === 'active' ? 'inActive' : 'active';

    try {
      await dispatch(
        bulkUpdateVanStatus({
          vanIds: [selectedVan.id],
          status: newStatus,
        })
      ).unwrap();

      // Refresh van detail
      dispatch(getVanDetailById(vanId));
    } catch (error: any) {
      console.error("Failed to toggle van status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || 'inactive';
    return statusLower === 'active' ? 'success' : 'error';
  };

  const getStatusLabel = (status: string) => {
    const statusLower = status?.toLowerCase() || 'inactive';
    return statusLower === 'active' ? 'Active' : 'InActive';
  };

  const handleAssignDriver = async () => {
    if (!selectedDriver || !vanId) return;

    try {
      await dispatch(assignDriverToVan({ driverId: selectedDriver, vanId })).unwrap();
      setModalOpen(false);
      dispatch(getVanDetailById(vanId)); // refresh
    } catch (error) {
      console.error("Assign Driver Error:", error);
    }
  };

  const handleRemoveDriver = async () => {
    if (!selectedVan?.driverId || !vanId) return;

    try {
      await dispatch(removeDriverFromVan({
        driverId: selectedVan.driverId,
        vanId: vanId
      })).unwrap();
      dispatch(getVanDetailById(vanId)); // refresh
    } catch (error: any) {
      console.error("Remove Driver Error:", error);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Button startIcon={<ArrowLeftIcon />} onClick={() => window.history.back()}>
        Back to Vans
      </Button>

      {selectedVanLoading || driversLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : selectedVan ? (
        <Stack spacing={3} mt={3}>
          {/* Main Van Card */}
          <Card sx={{ p: 2 }}>
            <CardContent>
              {/* Top: Avatar + Van Info + Status */}
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                {/* Left: Avatar + Info */}
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    src={selectedVan.venImage || undefined}
                    sx={{ width: 56, height: 56 }}
                  >
                    {!selectedVan.venImage && <HouseIcon />}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {selectedVan.vehicleType || 'Van Type N/A'} — {selectedVan.carNumber || selectedVan.numberPlate || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Capacity: {selectedVan.venCapacity || selectedVan.capacity || 'N/A'} | Condition: {selectedVan.condition || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Device ID: {selectedVan.deviceId || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                {/* Right: Status Display + Actions */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={getStatusLabel(selectedVan.status)}
                    color={getStatusColor(selectedVan.status)}
                    onClick={handleStatusToggle}
                    sx={{ cursor: 'pointer' }}
                  />
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<UserIcon />}
                    onClick={() => setModalOpen(true)}
                  >
                    Driver
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          {/* Van Information Card */}
          <Card>
            <CardHeader title="Van Information" />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">Van ID</Typography>
                  <Typography variant="body1">{selectedVan.id || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">Vehicle Type</Typography>
                  <Typography variant="body1">{selectedVan.vehicleType || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">Car Number</Typography>
                  <Typography variant="body1">{selectedVan.carNumber || selectedVan.numberPlate || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">Capacity</Typography>
                  <Typography variant="body1">{selectedVan.venCapacity || selectedVan.capacity || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">Condition</Typography>
                  <Typography variant="body1">{selectedVan.condition || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">Device ID</Typography>
                  <Typography variant="body1">{selectedVan.deviceId || '—'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Driver Information Card */}
          <Card>
            <CardHeader title="Driver Information" />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary">Driver Name</Typography>
                  <Typography variant="body1">{selectedVan.driverName || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary">Driver Phone</Typography>
                  <Typography variant="body1">{selectedVan.driverPhone || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary">Driver Email</Typography>
                  <Typography variant="body1">{selectedVan.driverEmail || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary">Driver CNIC</Typography>
                  <Typography variant="body1">{selectedVan.cnic || '—'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Route Information Card */}
          <Card>
            <CardHeader title="Route Information" />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary">Assigned Route</Typography>
                  <Typography variant="body1">{selectedVan.route || selectedVan.assignRoute || '—'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

        </Stack>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6">Van not found</Typography>
          <Button variant="outlined" onClick={() => window.history.back()} sx={{ mt: 2 }}>
            Back to All Vans
          </Button>
        </Box>
      )}

      {/* Driver Management Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            p: 4,
            width: 500,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" mb={2}>
            Driver Management
          </Typography>

          {/* Current Driver Status */}
          <Box mb={3}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Current Driver: {selectedVan?.driverName || 'No driver assigned'}
            </Typography>
            {selectedVan?.driverId && (
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={handleRemoveDriver}
                sx={{ mb: 2 }}
              >
                Remove Current Driver
              </Button>
            )}
          </Box>

          {/* Assign New Driver */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" mb={2}>
            Assign New Driver
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Select Driver</InputLabel>
            <Select
              value={selectedDriver}
              label="Select Driver"
              onChange={(e) => setSelectedDriver(e.target.value)}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 250,
                    overflowY: "auto",
                  },
                },
              }}
            >
              {drivers?.drivers?.filter((driver: any) => driver.status?.toLowerCase() === 'active').map((driver: any) => (
                <MenuItem key={driver.id} value={driver.id}>
                  {driver.fullname} — {driver.phoneNo || "N/A"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
            <Button variant="outlined" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" disabled={!selectedDriver} onClick={handleAssignDriver}>
              Assign Driver
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}
