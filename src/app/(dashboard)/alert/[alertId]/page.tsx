"use client";

import * as React from "react";
import { useEffect } from "react";
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
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { useParams, useRouter } from "next/navigation";

import { ArrowLeft as ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { User as UserIcon } from "@phosphor-icons/react/dist/ssr/User";
import { Bell as BellIcon } from "@phosphor-icons/react/dist/ssr/Bell";
import { Calendar as CalendarIcon } from "@phosphor-icons/react/dist/ssr/Calendar";
import { GraduationCap as SchoolIcon } from "@phosphor-icons/react/dist/ssr/GraduationCap";
import { config } from "@/config";
import { PencilSimple as EditIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple";

import { paths } from "@/paths";
import { getAlertById } from "@/store/reducers/alert-slice";
import { formatLabel } from "@/utils/data";

// 🔹 Reusable Detail Item
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

export default function AlertDetailPage(): React.JSX.Element {
  const params = useParams<{ alertId: string }>();
  const alertId = params?.alertId;
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();

  // Set document title
  useEffect(() => {
    document.title = `${config.site.name} | Alert Details`;
  }, []);
  const { alertDetail, detailLoading } = useSelector((s: RootState) => s.alert);

  React.useEffect(() => {
    if (alertId) dispatch(getAlertById(alertId));
  }, [alertId, dispatch]);

  const statusLabel = (alertDetail?.status || "").trim().toLowerCase();
  const isSent = statusLabel === "sent";

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || 'pending';
    return statusLower === 'sent' ? 'success' : statusLower === 'active' ? 'warning' : 'default';
  };

  if (detailLoading && !alertDetail)
    return <LinearProgress sx={{ p: 4 }} />;

  if (!alertDetail)
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" mb={2}>
          Alert not found
        </Typography>
        <Button variant="outlined" onClick={() => router.back()}>
          Back to Alerts
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
        Back to Alerts
      </Button>

      <Stack spacing={3}>
        {/* Main Alert Card */}
        <Card sx={{ p: 2 }}>
          <CardContent>
            {/* Top: Avatar + Alert Info + Status */}
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
                  <BellIcon size={24} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {alertDetail.alertType || 'Untitled Alert'}
                  </Typography>
                </Box>
              </Box>

              {/* Right: Status + Actions */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={
                    statusLabel
                      ? statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)
                      : "Pending"
                  }
                  color={getStatusColor(alertDetail.status)}
                  size="small"
                />
                {/* <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<EditIcon />}
                  onClick={() => router.push(`${paths.dashboard.alert}/edit/${alertId}`)}
                >
                  Edit
                </Button> */}
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Alert Information Card */}
        <Card>
          <CardHeader
            title="Alert Information"
          // avatar={<BellIcon color="#1976d2" />}
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Alert Type</Typography>
                <Typography variant="body1">{alertDetail.alertType || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={4} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Recipient Type</Typography>
                <Typography variant="body1">{formatLabel(alertDetail.recipientType) || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={4} md={4}>
                <Typography variant="subtitle1" color="text.secondary">Message</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>{alertDetail.message || '—'}</Typography>
              </Grid>

            </Grid>
          </CardContent>
        </Card>

        {/* School Information Card */}
        <Card>
          <CardHeader
            title="School Information"
          // avatar={<SchoolIcon color="#1976d2" />}
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={6}>
                <Typography variant="subtitle1" color="text.secondary">School Name</Typography>
                <Typography variant="body1">{alertDetail.schoolName || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <Typography variant="subtitle1" color="text.secondary">Date/Time</Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    {alertDetail.date
                      ? dayjs(alertDetail.date).format("DD MMM YYYY")
                      : "—"}
                  </Box>

                  {alertDetail.date && (
                    <Box
                      component="span"
                      sx={{
                        display: "inline-block",
                        fontSize: "11px",
                        color: "primary.main",
                        backgroundColor: "action.hover",
                        px: 1,
                        py: 0.3,
                        borderRadius: "8px",
                        ml: 1,
                      }}
                    >
                      {dayjs(alertDetail.date).format("hh:mm A")}
                    </Box>
                  )}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* System Information Card */}
        {/* <Card>
          <CardHeader 
            title="System Information" 
            avatar={<CalendarIcon color="#1976d2" />}
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Alert ID</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{alertDetail._id || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">Created Date</Typography>
                <Typography variant="body2">
                  {alertDetail.date
                    ? new Date(alertDetail.date).toLocaleString()
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
            onClick={() => router.push(`${paths.dashboard.alert}/edit/${alertId}`)}
          >
            Edit Alert
          </Button>
        </Stack> */}
      </Stack>
    </Box>
  );
}
