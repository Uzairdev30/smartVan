"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Divider,
  TextField,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Paper,
  Avatar,
  Chip,
} from "@mui/material";
import Link from "next/link";
import RouterLink from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft as ArrowLeftIcon, Building, MapPin, Clock, CreditCard, Users, Upload, CaretDown as CaretDownIcon } from "@phosphor-icons/react/dist/ssr";
import { paths } from "@/paths";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  Controller,
  FormProvider,
  useFormContext,
} from "react-hook-form";
import { TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { registerSchool } from "@/store/reducers/suadmin-slice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { uploadImage } from "@/utils/uploadImage"; 
import MapComponent from "@/components/MapSelection";
// import GoogleMapsProvider from "@/components/GoogleMapsProvider";

/* ===================== SECTIONS ===================== */

/* ===================== ZOD SCHEMA (UPDATED) ===================== */

const schema = z.object({
  schoolImage: z.string().optional(), // ⬅️ ADDED

  // Profile
  adminName: z.string().min(1, "Admin name is required"),
  schoolName: z.string().min(1, "School name is required"),
  address: z.string().min(1, "Address is required"),
  adminEmail: z.string().email("Invalid admin email"),
  schoolEmail: z.string().email("Invalid school email"),
  contactNumber: z.string().min(6, "Contact number is required"),

  // Route Rules
  pickupStartTime: z.date().optional().nullable(),
  dropoffStartTime: z.date().optional().nullable(),
  maxTripDuration: z.string().min(1, "Required"),
  bufferTime: z.string().min(1, "Required"),
  routeLatitude: z
    .coerce.number({ invalid_type_error: "Latitude must be a number" })
    .min(-90, "Min -90")
    .max(90, "Max 90")
    .optional(),   // ✅ add this
  routeLongitude: z
    .coerce.number({ invalid_type_error: "Longitude must be a number" })
    .min(-180, "Min -180")
    .max(180, "Max 180")
    .optional(),   // ✅ add this

  // Limits
  allowedVans: z.coerce.number().min(1, "Min 1"),
  allowedRoutes: z.coerce.number().min(1, "Min 1"),
  allowedStudents: z.coerce.number().min(1, "Min 1"),

  // Subscription & Billing
  plan: z.enum(["premium", "standard"]),
  billingCycle: z.enum(["weekly", "monthly", "quarterly"]),
  nextInvoice: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), {
      message: "Use YYYY-MM-DD",
    }),
  paymentMethod: z.enum(["cash", "bank"]),
  pickDropExceptionsActive: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;


/* ===================== RHF HELPERS ===================== */

function RHFTextField({
  name,
  label,
  placeholder,
  type = "text",
  select = false,
  children,
}: {
  name: keyof FormValues;
  label: string;
  placeholder?: string;
  type?: React.InputHTMLAttributes<unknown>["type"];
  select?: boolean;
  children?: React.ReactNode;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormValues>();
  const err = (errors as any)[name]?.message as string | undefined;

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <TextField
        fullWidth
        size="small"
        placeholder={placeholder}
        type={type}
        select={select}
        error={!!err}
        helperText={err}
        InputProps={{ sx: { borderRadius: 1, py: 1 } }}
        inputProps={
          type === "number"
            ? { inputMode: "decimal", step: "any" }
            : undefined
        }
        {...register(name)}
      >
        {children}
      </TextField>
    </Box>
  );
}

function RHFTimePicker({
  name,
  label,
}: {
  name: keyof FormValues;
  label: string;
}) {
  const {
    control,
    formState: { errors },
  } = useFormContext<FormValues>();
  const err = (errors as any)[name]?.message as string | undefined;

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              value={field.value ? dayjs(field.value as Date) : null}
              onChange={(v) => field.onChange(v ? v.toDate() : null)}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  error: !!err,
                  helperText: err,
                  InputProps: { sx: { borderRadius: 1 } },
                },
              }}
            />
          </LocalizationProvider>
        )}
      />
    </Box>
  );
}

function RHFSwitch({
  name,
  label,
}: {
  name: keyof FormValues;
  label: string;
}) {
  const { control } = useFormContext<FormValues>();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={
            <Switch
              checked={!!field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          }
          label={label}
        />
      )}
    />
  );
}

/* ===================== PAGE ===================== */

export default function Page() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const inputRef = useRef<HTMLInputElement>(null);

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      schoolImage: "", // ⬅️ ADDED
    },
    mode: "onTouched",
  });

  const {
    handleSubmit,
    trigger,
    formState: { errors },
    watch,
    setValue,
  } = methods;

  // Logo upload handlers
  const handleSelectImage = () => inputRef.current?.click();

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImage(file);
      setValue("schoolImage", url, { shouldValidate: true });
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
    }
  };


  /* Submit handler */
  const onSubmit = async (data: FormValues) => {
    const formattedData = {
      adminInfo: {
        name: data.adminName,
        email: data.adminEmail,
        role: "admin",
      },
      schoolInfo: {
        schoolImage: data.schoolImage, // ⬅️ SEND LOGO
        schoolName: data.schoolName,
        schoolEmail: data.schoolEmail,
        contactPerson: data.adminName,
        address: data.address,
        branchName: "Main Campus",

        startTime: data.pickupStartTime
          ? dayjs(data.pickupStartTime).format("hh:mm A")
          : "08:00 AM",
        endTime: data.dropoffStartTime
          ? dayjs(data.dropoffStartTime).format("hh:mm A")
          : "02:00 PM",
        maxTripDuration: Number(data.maxTripDuration),
        bufferTime: Number(data.bufferTime),

        allowedVans: Number(data.allowedVans),
        allowedStudents: Number(data.allowedStudents),
        allowedRoutes: Number(data.allowedRoutes),

        currentPlan:
          data.plan === "premium" ? "Premium" : "Standard",
        billingCycle:
          data.billingCycle.charAt(0).toUpperCase() +
          data.billingCycle.slice(1),
        paymentMethod:
          data.paymentMethod === "bank"
            ? "Bank Transfer"
            : "Cash",

        lat: data.routeLatitude,
        long: data.routeLongitude,
        autoRenew: !!data.pickDropExceptionsActive,
        contactNumber: data.contactNumber,
      },
    };

    try {
      await dispatch(registerSchool(formattedData)).unwrap();
      router.push(paths.dashboard.superadmin.school);
    } catch (err) {
      console.error("❌ Register failed:", err);
    }
  };


  return (
    <FormProvider {...methods}>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          p: 3,
        }}
      >

        {/* MAIN CONTENT AREA */}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* LOGO CARD - COL-4 */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                // background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                border: "1px solid #dee2e6",
                height: "fit-content"
              }}
            >
              <Stack spacing={4} alignItems="center">
                {/* Logo Display - Clickable */}
                <Box 
                  sx={{ position: 'relative', cursor: 'pointer' }}
                  onClick={handleSelectImage}
                >
                  <Avatar
                    src={watch("schoolImage") || undefined}
                    sx={{
                      width: 150,
                      height: 150,
                      borderRadius: 4,
                      border: "2px dashed #1976d2",
                      bgcolor: "#fafafa",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "#0d47a1",
                        transform: "scale(1.02)",
                        boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
                      }
                    }}
                  >
                    <Upload size={60} color="#1976d2" />
                  </Avatar>
                </Box>

                {/* Hidden File Input */}
                <input
                  hidden
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Stack>
            </Paper>
          </Grid>

          {/* FORM CARD - COL-8 */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={4}>
                  <ProfileSection />
                  <Divider />
                  <RouteRulesSection />
                  <Divider />
                  <LimitsSection />
                  <Divider />
                  <SubscriptionBillingSection />
                </Stack>
              </CardContent>

              <Divider />

              <Stack
                direction="row"
                justifyContent="flex-end"
                sx={{ p: 3 }}
              >
                <Button
                  variant="contained"
                  onClick={handleSubmit(onSubmit)}
                  sx={{
                    px: 4,
                    py: 1,
                    background: "#FFA500",
                    "&:hover": {
                      background: "#FF8C00",
                    }
                  }}
                >
                  Submit
                </Button>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </FormProvider>
  );
}

/* ===================== PROFILE SECTION (UPDATED WITH UPLOAD) ===================== */

function ProfileSection() {
  return (
    <Stack spacing={3}>
      <Typography variant="h6">
        School Information
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)" },
          gap: 3,
        }}
      >
        <RHFTextField
          name="adminName"
          label="Admin Name"
          placeholder="Enter admin name"
        />
        <RHFTextField
          name="schoolName"
          label="School Name"
          placeholder="Enter school name"
        />
        <RHFTextField
          name="address"
          label="Address"
          placeholder="Enter address"
        />
        <RHFTextField
          name="adminEmail"
          label="Admin Email"
          placeholder="Enter admin email"
        />
        <RHFTextField
          name="schoolEmail"
          label="School Email"
          placeholder="Enter school email"
        />
        <RHFTextField
          name="contactNumber"
          label="Contact Number"
          placeholder="+92-300-0000000"
        />
      </Box>
    </Stack>
  );
}

/* ===================== OTHER SECTIONS (UNCHANGED) ===================== */

function RouteRulesSection() {
  const { setValue, trigger, watch } = useFormContext<FormValues>();
  const [showMap, setShowMap] = useState(false);

  const lat = watch("routeLatitude");
  const lng = watch("routeLongitude");

  const googleMapsLink =
    Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
      ? `https://www.google.com/maps?q=${Number(lat)},${Number(lng)}`
      : "";

  const handlePositionChange = async (newLat: number, newLng: number) => {
    setValue("routeLatitude", newLat as any, { shouldDirty: true, shouldValidate: true });
    setValue("routeLongitude", newLng as any, { shouldDirty: true, shouldValidate: true });
    await trigger(["routeLatitude", "routeLongitude"]);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Route Rules</Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)" },
          gap: 2,
        }}
      >
        <RHFTimePicker name="pickupStartTime" label="Pickup Start Time" />
        <RHFTimePicker name="dropoffStartTime" label="Dropoff Start Time" />

        <RHFTextField name="maxTripDuration" label="Max Trip Duration" placeholder="e.g., 60" type="number" />
        <RHFTextField name="bufferTime" label="Buffer Time" placeholder="e.g., 15" type="number" />

        {/* <RHFTextField name="routeLatitude" label="Latitude" type="number" placeholder="24.8607" />
        <RHFTextField name="routeLongitude" label="Longitude" type="number" placeholder="67.0011" /> */}
      </Box>

      {/* ✅ Add School Location Button */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setShowMap(!showMap)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textTransform: "none",
            borderColor: "#1976d2",
            color: "#1976d2",
            "&:hover": {
              borderColor: "#1565c0",
              backgroundColor: "rgba(25, 118, 210, 0.04)",
            },
          }}
        >
          <Typography variant="body2">Add School Location</Typography>
          <CaretDownIcon 
            size={16} 
            style={{ 
              transform: showMap ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease"
            }} 
          />
        </Button>
      </Box>

      {/* MapSelection component */}
      {showMap && (
        <Box sx={{ mt: 1 }}>
          <Box sx={{ height: '400px', width: '100%', borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
            <MapComponent
              onPositionChange={handlePositionChange}
              initialLat={lat}
              initialLng={lng}
            />
          </Box>
        </Box>
      )}

    </Stack>
  );
}


function LimitsSection() {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">Limits</Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)" },
          gap: 2,
        }}
      >
        <RHFTextField
          name="allowedVans"
          label="Allowed Vans"
          type="number"
        />
        <RHFTextField
          name="allowedRoutes"
          label="Allowed Routes"
          type="number"
        />
        <RHFTextField
          name="allowedStudents"
          label="Allowed Students"
          type="number"
        />
      </Box>
    </Stack>
  );
}

function SubscriptionBillingSection() {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">Subscription & Billing</Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)" },
          gap: 2,
        }}
      >
        <RHFTextField name="plan" label="Current Plan" select>
          <MenuItem value="premium">Premium</MenuItem>
          <MenuItem value="standard">Standard</MenuItem>
        </RHFTextField>

        <RHFTextField name="billingCycle" label="Billing Cycle" select>
          <MenuItem value="weekly">Weekly</MenuItem>
          <MenuItem value="monthly">Monthly</MenuItem>
          <MenuItem value="quarterly">Quarterly</MenuItem>
        </RHFTextField>

        <RHFTextField name="nextInvoice" type="date" label="Next Invoice" />

        <RHFTextField name="paymentMethod" label="Payment Method" select>
          <MenuItem value="cash">Cash</MenuItem>
          <MenuItem value="bank">Bank</MenuItem>
        </RHFTextField>

        <Box sx={{ gridColumn: "1 / -1" }}>
          <RHFSwitch
            name="pickDropExceptionsActive"
            label="Auto Renew"
          />
        </Box>
      </Box>
    </Stack>
  );
}

function StatusPill({
  text,
  bg,
  color,
  borderColor,
}: {
  text: string;
  bg: string;
  color: string;
  borderColor: string;
}) {
  return (
    <Box
      sx={{
        px: 1,
        py: "2px",
        borderRadius: "4px",
        fontSize: "12px",
        border: `1px solid ${borderColor}`,
        bgcolor: bg,
        color,
      }}
    >
      {text}
    </Box>
  );
}

function AdminsRow({
  name,
  role,
  desc,
  users,
}: {
  name: string;
  role: string;
  desc: string;
  users: string;
}) {
  return (
    <TableRow>
      <TableCell>{name}</TableCell>
      <TableCell>{role}</TableCell>
      <TableCell>{desc}</TableCell>
      <TableCell>{users}</TableCell>
      <TableCell align="right">
        <IconButton size="small">
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
