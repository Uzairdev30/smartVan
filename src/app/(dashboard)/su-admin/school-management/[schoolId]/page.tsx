"use client";

import React from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  Divider,
  Button,
  Chip,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  ArrowLeft as ArrowLeftIcon,
  Building,
  Envelope,
  Phone,
  MapPin,
  Clock,
  Users,
  CreditCard,
  Edit as EditIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { getSchoolById } from "@/store/reducers/suadmin-slice";

function DetailItem({ label, value, icon }: { label: string; value: any; icon?: React.ReactNode }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {icon}
        <Typography variant="subtitle1" fontWeight={600}>
          {value || "—"}
        </Typography>
      </Box>
    </Box>
  );
}

export default function SchoolDetailsPage() {
  const params = useParams();
  const schoolId = String(params?.schoolId);
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();
  const { school, loading, error } = useSelector((s: RootState) => s.suadmin);

  React.useEffect(() => {
    if (schoolId) dispatch(getSchoolById(schoolId));
  }, [dispatch, schoolId]);

  if (loading && !school)
    return (
      <Box p={3} textAlign="center">
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box p={3}>
        <Typography color="error">{String(error)}</Typography>
      </Box>
    );

  if (!school) return <Typography>Loading...</Typography>;

  const initials = school?.schoolName
    ?.split(" ")
    .map((x) => x[0]?.toUpperCase())
    .join("") || "SC";

  return (
    <Box sx={{ p: 3, bgcolor: "var(--mui-palette-background-level1)" }}>
      {/* HEADER */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Link
          href="/su-admin/school-management"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            color: "text.primary",
          }}
        >
          <ArrowLeftIcon size={20} />
          <Typography variant="subtitle2" color="text.primary">
            Back to Schools
          </Typography>
        </Link>

        <Button
          variant="contained"
          startIcon={<EditIcon size={18} />}
          onClick={() => router.push(`/su-admin/school-management/edit/${schoolId}`)}
          sx={{
            background: "#FFA500",
            "&:hover": {
              background: "#FF8C00",
            }
          }}
        >
          Edit School
        </Button>
      </Stack>

      {/* MAIN CARD */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)" }}>
        <CardContent sx={{ p: 4 }}>
          {/* SCHOOL HEADER */}
          <Box sx={{ mb: 4 }}>
            <Stack direction="row" alignItems="center" spacing={3}>
              <Avatar
                src={school.schoolImage || undefined}
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                  border: "2px solid #E0E2E7",
                  bgcolor: "#F6F7F9",
                  fontSize: 28,
                  fontWeight: "bold",
                  color: "#616161",
                }}
              >
                {!school.schoolImage ? (
                  <Building size={32} color="#616161" />
                ) : null}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
                  {school.schoolName}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Chip
                    label={school.status?.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: school.status === "active" ? "#E8F5E8" : "#FEE2E2",
                      color: school.status === "active" ? "#2E7D32" : "#D32F2F",
                      fontWeight: 600,
                      fontSize: "12px",
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    ID: {school._id}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={4}>
            {/* SCHOOL INFORMATION */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 3, color: "#1560BD", fontWeight: 600 }}>
                School Information
              </Typography>
              
              <DetailItem 
                label="School Name" 
                value={school.schoolName} 
                icon={<Building size={18} color="#616161" />}
              />
              <DetailItem 
                label="School Email" 
                value={school.schoolEmail} 
                icon={<Envelope size={18} color="#616161" />}
              />
              <DetailItem 
                label="Contact Number" 
                value={school.contactNumber} 
                icon={<Phone size={18} color="#616161" />}
              />
              <DetailItem 
                label="Address" 
                value={school.address} 
                icon={<MapPin size={18} color="#616161" />}
              />
            </Grid>

            {/* ADMIN INFORMATION */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 3, color: "#1560BD", fontWeight: 600 }}>
                Admin Information
              </Typography>
              
              <DetailItem 
                label="Admin Name" 
                value={school.admin?.name} 
                icon={<Users size={18} color="#616161" />}
              />
              <DetailItem 
                label="Admin Email" 
                value={school.admin?.email} 
                icon={<Envelope size={18} color="#616161" />}
              />
            </Grid>

            {/* ROUTE & TIMING INFORMATION */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 3, color: "#1560BD", fontWeight: 600 }}>
                Route & Timing
              </Typography>
              
              <DetailItem 
                label="Start Time" 
                value={school.startTime} 
                icon={<Clock size={18} color="#616161" />}
              />
              <DetailItem 
                label="End Time" 
                value={school.endTime} 
                icon={<Clock size={18} color="#616161" />}
              />
              <DetailItem 
                label="Max Trip Duration" 
                value={school.maxTripDuration + " mins"} 
                icon={<Clock size={18} color="#616161" />}
              />
              <DetailItem 
                label="Buffer Time" 
                value={school.bufferTime + " mins"} 
                icon={<Clock size={18} color="#616161" />}
              />
            </Grid>

            {/* LIMITS */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 3, color: "#1560BD", fontWeight: 600 }}>
                Limits
              </Typography>
              
              <DetailItem 
                label="Allowed Vans" 
                value={school.allowedVans} 
                icon={<Users size={18} color="#616161" />}
              />
              <DetailItem 
                label="Allowed Routes" 
                value={school.allowedRoutes} 
                icon={<MapPin size={18} color="#616161" />}
              />
              <DetailItem 
                label="Allowed Students" 
                value={school.allowedStudents} 
                icon={<Users size={18} color="#616161" />}
              />
            </Grid>

            {/* BILLING & PLAN */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 3, color: "#1560BD", fontWeight: 600 }}>
                Plan & Billing
              </Typography>
              
              <DetailItem 
                label="Current Plan" 
                value={school.currentPlan} 
                icon={<CreditCard size={18} color="#616161" />}
              />
              <DetailItem 
                label="Billing Cycle" 
                value={school.billingCycle} 
                icon={<Clock size={18} color="#616161" />}
              />
              <DetailItem 
                label="Payment Method" 
                value={school.paymentMethod} 
                icon={<CreditCard size={18} color="#616161" />}
              />
              <DetailItem 
                label="Auto Renew" 
                value={school.autoRenew ? "Enabled" : "Disabled"} 
                icon={<CreditCard size={18} color="#616161" />}
              />
            </Grid>

            {/* LOCATION */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 3, color: "#1560BD", fontWeight: 600 }}>
                Location
              </Typography>
              
              <DetailItem 
                label="Latitude" 
                value={school.lat} 
                icon={<MapPin size={18} color="#616161" />}
              />
              <DetailItem 
                label="Longitude" 
                value={school.long} 
                icon={<MapPin size={18} color="#616161" />}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
