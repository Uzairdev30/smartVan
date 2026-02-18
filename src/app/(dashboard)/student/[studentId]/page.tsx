"use client";

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
  CircularProgress,
  Grid,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { PencilSimple as PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { Van as VanIcon } from '@phosphor-icons/react/dist/ssr/Van';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { House as HouseIcon } from '@phosphor-icons/react/dist/ssr/House';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { getStudentDetail, verifyStudentByAdmin } from '@/store/reducers/student-slice';
import { assignVanToStudent, getAllSchoolVans, removeVanFromStudent } from '@/store/reducers/van-slice';
import { PropertyItem } from '@/components/core/property-item';
import { PropertyList } from '@/components/core/property-list';


export default function StudentDetailsPage(): React.JSX.Element {
  const router = useRouter();
  const params = useParams<{ studentId: string }>();
  const studentId = params.studentId;
  const dispatch = useDispatch<AppDispatch>();
  const { studentDetail, detailLoading } = useSelector((state: RootState) => state.student);
  const { vans } = useSelector((state: RootState) => state.van);
  const handleStatusToggle = async () => {
    if (!studentDetail?.student?.id || !studentDetail?.student?.status) return;

    const newStatus = studentDetail.student.status.toLowerCase() === 'active' ? 'inactive' : 'active';

    try {
      await dispatch(
        verifyStudentByAdmin({
          id: studentDetail.student.id,
          status: newStatus, // ← lowercase matches backend
        })
      ).unwrap();

      // Refresh student detail
      dispatch(getStudentDetail(studentId));
    } catch (error: any) {
      console.error("Failed to toggle student status:", error);
    }
  };

  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedVan, setSelectedVan] = React.useState("");

  React.useEffect(() => {
    console.log('🎯 Student ID from params:', studentId);
    if (studentId) {
      console.log('📞 Calling getStudentDetail with ID:', studentId);
      dispatch(getStudentDetail(studentId));
    } else {
      console.log('❌ No studentId found');
    }
  }, [studentId, dispatch]);

  React.useEffect(() => {
    if (studentDetail) {
      console.log('✅ Student Detail loaded:', studentDetail);
    } else if (!detailLoading && studentId) {
      console.log('⚠️ Student Detail not loaded, or is null/undefined after fetch for ID:', studentId);
    }
  }, [studentDetail, detailLoading, studentId]);

  React.useEffect(() => {
    dispatch(getAllSchoolVans({ page: 1, limit: 1000 }));
  }, [dispatch]);

  const handleAssign = async () => {
    if (!selectedVan || !studentId) return;

    try {
      await dispatch(assignVanToStudent({ 
        kidIds: [studentId], 
        vanId: selectedVan 
      })).unwrap();
      setModalOpen(false);
      setSelectedVan("");
      dispatch(getStudentDetail(studentId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveVan = async () => {
    if (!studentId) return;

    try {
      await dispatch(removeVanFromStudent({ 
        kidIds: [studentId] 
      })).unwrap();
      dispatch(getStudentDetail(studentId));
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || 'inactive';
    return statusLower === 'active' ? 'success' : 'error';
  };

  const getStatusLabel = (status: string) => {
    const statusLower = status?.toLowerCase() || 'inactive';
    return statusLower === 'active' ? 'Active' : 'Inactive';
  };

  return (
    <Box sx={{ p: 4 }}>
      <Button startIcon={<ArrowLeftIcon />} onClick={() => router.back()}>
        Back to Students
      </Button>

      {detailLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : studentDetail ? (
        <Stack spacing={3} mt={3}>
          {/* Main Student Card */}
          <Card sx={{ p: 2 }}>
            <CardContent>
              {/* Top: Avatar + Student Info + Status */}
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                {/* Left: Avatar + Info */}
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    src={studentDetail?.parent?.image || undefined}
                    sx={{ width: 56, height: 56 }}
                  >
                    {!studentDetail?.parent?.image && studentDetail?.student?.fullname?.split(' ').map((w: string) => w[0]?.toUpperCase()).join('')}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{studentDetail?.student?.fullname || 'Student Name N/A'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Grade: {studentDetail?.student?.grade || 'N/A'} | Age: {studentDetail?.student?.age || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Parent: {studentDetail?.parent?.fullname || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                {/* Right: Status Display + Actions */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={getStatusLabel(studentDetail?.student?.status)}
                    color={getStatusColor(studentDetail?.student?.status)}
                    onClick={handleStatusToggle}
                    sx={{ cursor: 'pointer' }}
                  />
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<VanIcon />}
                    onClick={() => setModalOpen(true)}
                  >
                    Van
                  </Button>
                </Stack>

              </Box>
            </CardContent>
          </Card>

          {/* Student Information Card */}
          <Card>
            <CardHeader title="Student Information" />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">Full Name</Typography>
                  <Typography variant="body1">{studentDetail?.student?.fullname || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">Age</Typography>
                  <Typography variant="body1">{studentDetail?.student?.age || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">Grade</Typography>
                  <Typography variant="body1">{studentDetail?.student?.grade || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">Gender</Typography>
                  <Typography variant="body1">{studentDetail?.student?.gender || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle1" color="text.secondary">Date of Birth</Typography>
                  <Typography variant="body1">{studentDetail?.student?.dob?.slice(0, 10) || '—'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Parent Information Card */}
          <Card>
            <CardHeader title="Parent Information" />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary">Parent Name</Typography>
                  <Typography variant="body1">{studentDetail?.parent?.fullname || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary">Parent Email</Typography>
                  <Typography variant="body1">{studentDetail?.parent?.email || '—'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* School & Route Card */}
          <Card>
            <CardHeader title="School & Route Details" />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary">School ID</Typography>
                  <Typography variant="body1">{studentDetail?.student?.schoolId || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary">Student ID</Typography>
                  <Typography variant="body1">{studentDetail?.student?.id || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary">Van Type</Typography>
                  <Typography variant="body1">{studentDetail?.van?.vehicleType || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary">Car Number</Typography>
                  <Typography variant="body1">{studentDetail?.van?.carNumber || '—'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Parent Contact Card */}
          <Card>
            <CardHeader title="Parent Contact Details" />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary">Parent Phone</Typography>
                  <Typography variant="body1">{studentDetail?.parent?.phoneNo || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary">Parent Address</Typography>
                  <Typography variant="body1">{studentDetail?.parent?.address || '—'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

        </Stack>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6">Student not found</Typography>
          <Button variant="outlined" onClick={() => router.push('/student')} sx={{ mt: 2 }}>
            Back to All Students
          </Button>
        </Box>
      )}

      {/* ============================
          VAN MANAGEMENT MODAL
      ============================ */}
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
            Van Management
          </Typography>

          {/* Current Van Status */}
          <Box mb={3}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Current Van: {studentDetail?.van?.carNumber || 'No van assigned'}
            </Typography>
            {studentDetail?.student?.vanId && (
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={handleRemoveVan}
                sx={{ mb: 2 }}
              >
                Remove Current Van
              </Button>
            )}
          </Box>

          {/* Assign New Van */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" mb={2}>
            Assign New Van
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Select Van</InputLabel>

            <Select
              value={selectedVan}
              label="Select Van"
              onChange={(e) => setSelectedVan(e.target.value)}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 250,
                    overflowY: "auto",
                  },
                },
              }}
            >
              {vans.map((item) => (
                <MenuItem key={item.van.id} value={item.van.id}>
                  {item.van.vehicleType} — {item.van.carNumber}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
            <Button variant="outlined" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>

            <Button variant="contained" disabled={!selectedVan} onClick={handleAssign}>
              Assign Van
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}
