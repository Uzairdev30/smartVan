"use client";

import React, { useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  Divider,
  Chip,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import RouteIcon from '@mui/icons-material/Route';
import PeopleIcon from '@mui/icons-material/People';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import api from "@/api/axios";
import { toast } from "@/components/core/toaster";
import { AUTH } from "@/api/endpoint";

// 🔹 Modern Detail Item Component
function DetailItem({ label, value, icon }: { label: string; value: any; icon?: React.ReactNode }) {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      p: 2,
      borderRadius: 2,
      bgcolor: 'grey.50',
      border: '1px solid',
      borderColor: 'divider',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        bgcolor: 'primary.50',
        transform: 'translateY(-2px)',
        boxShadow: 2
      }
    }}>
      {icon && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'primary.main',
          minWidth: 40
        }}>
          {icon}
        </Box>
      )}
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="body1" fontWeight="600" color="text.primary">
          {value || "—"}
        </Typography>
      </Box>
    </Box>
  );
}

// 🔹 Change Password Modal Component
function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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
        oldPassword: oldPassword,
        newPassword: newPassword
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
            position: 'absolute',
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
                )
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
                )
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
                )
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

// 🔹 MAIN COMPONENT
export default function SchoolDetails() {
  const school = useSelector((state: RootState) => state.auth.userProfile);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  if (!school) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Typography variant="h6" color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Profile Header */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
        }}
      >
        <Stack direction="row" spacing={3} alignItems="center">
          <Avatar
            src={school?.schoolImage}
            sx={{
              width: 80,
              height: 80,
              border: '3px solid white',
              boxShadow: 2
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
              sx={{
                fontWeight: 'bold',
                px: 2,
                py: 1
              }}
            />
            <Button
              variant="outlined"
              onClick={() => setChangePasswordOpen(true)}
              sx={{
                fontWeight: 'bold',
                px: 2,
                py: 1
              }}
            >
              Change Password
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* School Information */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 'bold' }}>
              {/* <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> */}
              School Information
            </Typography>
            <Stack spacing={2}>
              <DetailItem
                label="School Name"
                value={school.schoolName}
                icon={<BusinessIcon />}
              />
              <DetailItem
                label="Email"
                value={school.schoolEmail}
                icon={<EmailIcon />}
              />
              <DetailItem
                label="Branch"
                value={school.branchName}
                icon={<LocationOnIcon />}
              />
              <DetailItem
                label="Contact Number"
                value={school.contactNumber}
                icon={<PhoneIcon />}
              />
              <DetailItem
                label="Address"
                value={school.address}
                icon={<LocationOnIcon />}
              />
            </Stack>
          </Paper>
        </Grid>

        {/* Subscription Details */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 'bold' }}>
              {/* <CreditCardIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> */}
              Subscription Details
            </Typography>
            <Stack spacing={2}>
              <DetailItem
                label="Current Plan"
                value={school.currentPlan}
                icon={<CreditCardIcon />}
              />
              <DetailItem
                label="Billing Cycle"
                value={school.billingCycle}
                icon={<CreditCardIcon />}
              />
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
              <DetailItem
                label="Payment Method"
                value={school.paymentMethod}
                icon={<CreditCardIcon />}
              />
            </Stack>
          </Paper>
        </Grid>

        {/* Usage Limits */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 'bold' }}>
              {/* <RouteIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> */}
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

        {/* Location */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 'bold' }}>
              {/* <LocationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> */}
              Location
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <DetailItem
                  label="Latitude"
                  value={school.lat}
                  icon={<LocationOnIcon />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DetailItem
                  label="Longitude"
                  value={school.long}
                  icon={<LocationOnIcon />}
                />
              </Grid>
            </Grid>
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
