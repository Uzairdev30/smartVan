"use client";

import React, { useState } from "react";
import {
  Avatar,
  Box,
  Grid,
  Stack,
  Typography,
  Chip,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Divider,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BusinessIcon from "@mui/icons-material/Business";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import RouteIcon from "@mui/icons-material/Route";
import PeopleIcon from "@mui/icons-material/People";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import api from "@/api/axios";
import { toast } from "@/components/core/toaster";
import { AUTH } from "@/api/endpoint";

/* =========================
   Helpers
========================= */
const normalizeText = (value?: string) =>
  value && value.trim() && value.trim() !== "-" ? value.trim() : "—";

const formatAddress = (address: string) => {
  if (!address) {
    return {
      line1: "—",
      area: "—",
      city: "—",
      country: "—",
      postalCode: "—",
    };
  }

  const parts = address
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const postalMatch = address.match(/\b\d{5,6}\b/);
  const postalCode = postalMatch ? postalMatch[0] : "—";

  let line1 = "—";
  let area = "—";
  let city = "—";
  let country = "Pakistan"; // default rakh lo

  if (parts.length === 1) {
    line1 = parts[0];
  }

  if (parts.length === 2) {
    line1 = parts[0];
    city = parts[1];
  }

  if (parts.length === 3) {
    line1 = parts[0];
    area = parts[1];
    city = parts[2];
  }

  if (parts.length >= 4) {
    line1 = parts[0];
    area = parts[1];
    city = parts[2];
    country = parts[3];
  }

  return {
    line1: normalizeText(line1),
    area: normalizeText(area),
    city: normalizeText(city),
    country: normalizeText(country),
    postalCode,
  };
};

/* =========================
   UI Components
========================= */
function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: any;
  icon?: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: "grey.50",
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          bgcolor: "primary.50",
          transform: "translateY(-2px)",
          boxShadow: 2,
        },
      }}
    >
      {icon && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "primary.main",
            minWidth: 40,
          }}
        >
          {icon}
        </Box>
      )}

      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ mb: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="body1" fontWeight={400} color="text.primary">
          {value || "—"}
        </Typography>
      </Box>
    </Box>
  );
}

const LocationCard = ({ title, address }: { title: string; address: string }) => {
  const formatted = formatAddress(address);

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: 1,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          bgcolor: "primary.50",
          transform: "translateY(-2px)",
          boxShadow: 2,
        },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "primary.50",
            color: "primary.main",
            flexShrink: 0,
          }}
        >
          <LocationOnIcon fontSize="small" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            School location
          </Typography>
        </Box>

        <Chip
          label="Location"
          size="small"
          color="primary"
          variant="outlined"
          sx={{ flexShrink: 0 }}
        />
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "grey.50",
              border: "1px solid",
              borderColor: "divider",
              height: "100%",
            }}
          >
            <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ mb: 0.5 }}>
              City
            </Typography>
            <Typography variant="body1" fontWeight={400}>
              {formatted.city}
            </Typography>

            <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ mt: 2, mb: 0.5 }}>
              Postal Code
            </Typography>
            {formatted.postalCode !== "—" ? (
              <Chip
                label={formatted.postalCode}
                size="small"
                sx={{
                  bgcolor: "primary.50",
                  color: "primary.main",
                  fontWeight: 700,
                }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                —
              </Typography>
            )}

            <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ mt: 2, mb: 0.5 }}>
              Country
            </Typography>
            <Typography variant="body2" color="text.primary">
              {formatted.country}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "grey.50",
              border: "1px solid",
              borderColor: "divider",
              height: "100%",
            }}
          >
            <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ mb: 0.5 }}>
              Address Line
            </Typography>
            <Typography variant="body1" fontWeight={400}>
              {formatted.line1}
            </Typography>

            <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ mt: 2, mb: 0.5 }}>
              Area
            </Typography>
            <Typography variant="body2" color="text.primary">
              {formatted.area}
            </Typography>
          </Box>
        </Grid>

        
      </Grid>
    </Box>
  );
};

/* =========================
   Password Modal
========================= */
function ChangePasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(AUTH.CHANGE_PASSWORD, {
        oldPassword,
        newPassword,
      });

      if (response.data.status) {
        toast.success("Password changed successfully");
        onClose();
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(response.data.message || "Failed to change password");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6">Change Password</Typography>
        </Stack>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={3}>
            <TextField
              label="Old Password"
              type={showOldPassword ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    edge="end"
                  >
                    {showOldPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />

            <TextField
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />

            <TextField
              label="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Changing..." : "Change Password"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

/* =========================
   Main Page
========================= */
export default function SchoolDetails() {
  const school = useSelector((state: RootState) => state.auth.userProfile);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  if (!school) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Stack direction="row" spacing={3} alignItems="center">
          <Avatar
            src={school?.schoolImage}
            sx={{
              width: 80,
              height: 80,
              border: "3px solid white",
              boxShadow: 2,
            }}
          />

          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
              {school.schoolName}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {school.branchName}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label="Active"
              color="success"
              variant="filled"
              sx={{ fontWeight: "bold", px: 2, py: 1 }}
            />
            <Button
              variant="outlined"
              onClick={() => setChangePasswordOpen(true)}
              sx={{ fontWeight: "bold", px: 2, py: 1 }}
            >
              Change Password
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: "100%" }}>
            <Typography variant="h6" sx={{ mb: 3, color: "primary.main", fontWeight: "bold" }}>
              School Information
            </Typography>

            <Stack spacing={2}>
              <DetailItem label="School Name" value={school.schoolName} icon={<BusinessIcon />} />
              <DetailItem label="Email" value={school.schoolEmail} icon={<EmailIcon />} />
              <DetailItem label="Branch" value={school.branchName} icon={<LocationOnIcon />} />
              <DetailItem label="Contact Number" value={school.contactNumber} icon={<PhoneIcon />} />
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: "100%" }}>
            <Typography variant="h6" sx={{ mb: 3, color: "primary.main", fontWeight: "bold" }}>
              Subscription Details
            </Typography>

            <Stack spacing={2}>
              <DetailItem label="Current Plan" value={school.currentPlan} icon={<CreditCardIcon />} />
              <DetailItem label="Billing Cycle" value={school.billingCycle} icon={<CreditCardIcon />} />
              <DetailItem
                label="Auto Renew"
                value={school.autoRenew ? "Enabled" : "Disabled"}
                icon={
                  <Chip
                    label={school.autoRenew ? "ON" : "OFF"}
                    color={school.autoRenew ? "success" : "default"}
                    size="small"
                  />
                }
              />
              <DetailItem label="Payment Method" value={school.paymentMethod} icon={<CreditCardIcon />} />
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, color: "primary.main", fontWeight: "bold" }}>
              Usage Limits
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <DetailItem
                  label="Allowed Routes"
                  value={school.allowedRoutes}
                  icon={<RouteIcon />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <DetailItem
                  label="Allowed Students"
                  value={school.allowedStudents}
                  icon={<PeopleIcon />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <DetailItem
                  label="Allowed Vans"
                  value={school.allowedVans}
                  icon={<DirectionsBusIcon />}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <LocationCard
              title={`${school.schoolName} Campus`}
              address={school.address}
            />
          </Paper>
        </Grid>
      </Grid>

      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </Box>
  );
}