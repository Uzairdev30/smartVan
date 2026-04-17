// app/(dashboard)/su-admin/student/[studentId]/page.tsx

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
import { Users as ParentIcon } from "@phosphor-icons/react/dist/ssr/Users";
import { useRouter, useParams } from "next/navigation";
import { config } from "@/config";
import axios from "@/api/axios";
import { SUADMIN } from "@/api/endpoint";

export default function StudentDetailPage(): React.JSX.Element {
  const router = useRouter();
  const params = useParams();
  const studentId = params.studentId as string;

  useEffect(() => {
    document.title = `${config.site.name} | Student Details (Super Admin)`;
  }, []);

  // State for student data
  const [student, setStudent] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  // Fetch student details
  const fetchStudentDetails = React.useCallback(async () => {
    if (!studentId) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${SUADMIN.GET_STUDENT_DETAIL_SUPERADMIN}/${studentId}`);
      
      if (response.data?.data) {
        setStudent(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
      setStudent(null);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  // Fetch student details on component mount
  useEffect(() => {
    fetchStudentDetails();
  }, [fetchStudentDetails]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "success";
      case "inactive": return "error";
      case "inActive": return "error";
      default: return "default";
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <Typography>Loading student details...</Typography>
      </Box>
    );
  }

  if (!student) {
    return (
      <Box sx={{ p: 4 }}>
        <Button startIcon={<ArrowLeftIcon />} onClick={() => router.back()}>
          Back to Students
        </Button>
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="h6" color="error">
            Student not found
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Button startIcon={<ArrowLeftIcon />} onClick={() => router.back()}>
        Back to Students
      </Button>

      <Stack spacing={3} mt={3}>
        {/* Main Student Card */}
        <Card sx={{ p: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar 
                  src={student?.image || undefined} 
                  sx={{ width: 56, height: 56, bgcolor: "primary.main" }}
                >
                  {!student?.image && student?.fullname?.split(' ').map((w) => w[0]?.toUpperCase()).join('')}
                </Avatar>
                <Box>
                  <Typography variant="h6">{student?.fullname || 'Student Name N/A'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Grade: {student?.grade || 'N/A'} | Gender: {student?.gender || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    DOB: {student?.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={student?.status?.charAt(0).toUpperCase() + student?.status?.slice(1) || 'Inactive'}
                  color={getStatusColor(student?.status) as any}
                  size="small"
                />
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Student Information Card */}
        <Card>
          <CardHeader avatar={<Avatar><UserIcon /></Avatar>} title="Student Information" />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Full Name</Typography>
                <Typography variant="body1">{student?.fullname || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Status</Typography>
                <Typography variant="body1">{student?.status || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" color="text.secondary">School</Typography>
                <Typography variant="body1">{student?.schoolName || 'N/A'}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Parent Information Card */}
        <Card>
          <CardHeader avatar={<Avatar><ParentIcon /></Avatar>} title="Parent Information" />
          <CardContent>
            {student?.parentId ? (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary">Parent Name</Typography>
                  <Typography variant="body1">{student?.parentName || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{student?.parentEmail || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{student?.parentContact || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary">Address</Typography>
                  <Typography variant="body1">{student?.parentAddress || 'N/A'}</Typography>
                </Grid>
              </Grid>
            ) : (
              <Typography color="text.secondary">No parent information available</Typography>
            )}
          </CardContent>
        </Card>

        {/* Van Information Card */}
        <Card>
          <CardHeader avatar={<Avatar><CarIcon /></Avatar>} title="Van Information" />
          <CardContent>
            {student?.VanId ? (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle1" color="text.secondary">Vehicle Type</Typography>
                  <Typography variant="body1">{student?.vehicleType || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle1" color="text.secondary">Car Number</Typography>
                  <Typography variant="body1">{student?.carNumber || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle1" color="text.secondary">Route</Typography>
                  <Typography variant="body1">{student?.route || 'N/A'}</Typography>
                </Grid>
              </Grid>
            ) : (
              <Typography color="text.secondary">No van assigned</Typography>
            )}
          </CardContent>
        </Card>

      </Stack>
    </Box>
  );
}
