"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
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
  CircularProgress,
  Grid,
  Paper,
  Avatar,
  Chip,
} from "@mui/material";
import RouterLink from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft as ArrowLeftIcon, Building, MapPin, Clock, Users, CreditCard, Upload, CaretDown as CaretDownIcon } from "@phosphor-icons/react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { paths } from "@/paths";
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
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { getSchoolById, editSchool } from "@/store/reducers/suadmin-slice";
import MapComponent from "@/components/MapSelection";
import { uploadImage } from "@/utils/uploadImage";

const schema = z.object({
  schoolImage: z.string().optional(),

  // Profile
  adminInfo: z.object({
    name: z.string().min(1, "Admin name is required"),
    email: z.string().email("Invalid admin email"),
  }),
  schoolName: z.string().min(1, "School name is required"),
  schoolEmail: z.string().email("Invalid school email"),
  address: z.string().min(1, "Address is required"),
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
    .optional(),
  routeLongitude: z
    .coerce.number({ invalid_type_error: "Longitude must be a number" })
    .min(-180, "Min -180")
    .max(180, "Max 180")
    .optional(),

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
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), { message: "Use YYYY-MM-DD" }),
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
  disabled,
}: {
  name: keyof FormValues;
  label: string;
  placeholder?: string;
  type?: React.InputHTMLAttributes<unknown>["type"];
  select?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
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
        inputProps={type === "number" ? { inputMode: "decimal", step: "any" } : undefined}
        disabled={disabled}
        {...register(name)}
      >
        {children}
      </TextField>
    </Box>
  );
}

function RHFNestedTextField({
  name,
  label,
  placeholder,
  type = "text",
  select = false,
  children,
  disabled,
}: {
  name: string;
  label: string;
  placeholder?: string;
  type?: React.InputHTMLAttributes<unknown>["type"];
  select?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormValues>();
  
  // Handle nested errors
  const errorPath = name.split('.');
  let err: string | undefined;
  let currentErrors: any = errors;
  
  for (const part of errorPath) {
    if (currentErrors && currentErrors[part]) {
      currentErrors = currentErrors[part];
    } else {
      currentErrors = undefined;
      break;
    }
  }
  
  if (currentErrors && typeof currentErrors === 'object' && 'message' in currentErrors) {
    err = currentErrors.message as string;
  }

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
        inputProps={type === "number" ? { inputMode: "decimal", step: "any" } : undefined}
        disabled={disabled}
        {...register(name as any)}
      >
        {children}
      </TextField>
    </Box>
  );
}

function RHFTimePicker({
  name,
  label,
  disabled,
}: {
  name: keyof FormValues;
  label: string;
  disabled?: boolean;
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
              disabled={disabled}
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

function RHFSelectField({
  name,
  label,
  children,
  disabled,
}: {
  name: keyof FormValues;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
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
          <TextField
            fullWidth
            size="small"
            select
            error={!!err}
            helperText={err}
            InputProps={{ sx: { borderRadius: 1, py: 1 } }}
            disabled={disabled}
            {...field}
          >
            {children}
          </TextField>
        )}
      />
    </Box>
  );
}

function RHFSwitch({
  name,
  label,
  disabled,
}: {
  name: keyof FormValues;
  label: string;
  disabled?: boolean;
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
              disabled={disabled}
            />
          }
          label={label}
        />
      )}
    />
  );
}

/* ===================== PAGE (DETAIL + EDIT) ===================== */

export default function SchoolDetailEditPage() {
  const router = useRouter();
  const params = useParams();
  // supports /[id] or /[schoolId]
  const schoolId = String((params as any)?.id ?? (params as any)?.schoolId ?? "");
  const dispatch = useDispatch<AppDispatch>();
  const { school, loading } = useSelector((s: RootState) => s.suadmin);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(true);

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {},
    mode: "onTouched",
  });

  const { handleSubmit, reset, watch, setValue } = methods;

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

  // fetch details once
  useEffect(() => {
    if (schoolId) dispatch(getSchoolById(schoolId));
  }, [dispatch, schoolId]);

  // when details arrive, prefill form from FLAT shape
  useEffect(() => {
    const s: any = (school as any)?.data ?? school;
    if (!s) return;

    const toDateOrNull = (t?: string) => {
      if (!t) return null;
      const parsed = dayjs(t, ["hh:mm A", "h:mm A"]);
      return parsed.isValid() ? parsed.toDate() : null;
    };

    const plan: "premium" | "standard" =
      String(s.currentPlan || "").toLowerCase() === "premium" ? "premium" : "standard";

    const billingCycle: "weekly" | "monthly" | "quarterly" = (
      String(s.billingCycle || "monthly").toLowerCase()
    ) as any;

    // Map DB payment methods to our two options
    // e.g. "Bank Transfer" or "Cash" -> "bank" or "cash"
    const paymentMethod: "cash" | "bank" = (() => {
      const pm = String(s.paymentMethod || "").toLowerCase();
      if (pm.includes("cash")) return "cash";
      if (pm.includes("bank")) return "bank";
      return "bank"; // default fallback
    })();

    reset({
      // Profile
      schoolImage: s.schoolImage ?? "",
      adminInfo: {
        name: s.admin?.name ?? "",
        email: s.admin?.email ?? "",
      },
      schoolName: s.schoolName ?? "",
      schoolEmail: s.schoolEmail ?? "",
      address: s.address ?? "",
      contactNumber: s.contactNumber ?? "",

      // Route rules
      pickupStartTime: toDateOrNull(s.startTime),
      dropoffStartTime: toDateOrNull(s.endTime),
      maxTripDuration: s.maxTripDuration != null ? String(s.maxTripDuration) : "",
      bufferTime: s.bufferTime != null ? String(s.bufferTime) : "",
      routeLatitude: s.lat ?? ("" as any),
      routeLongitude: s.long ?? ("" as any),

      // Limits
      allowedVans: s.allowedVans ?? ("" as any),
      allowedRoutes: s.allowedRoutes ?? ("" as any),
      allowedStudents: s.allowedStudents ?? ("" as any),

      // Subscription & Billing
      plan,
      billingCycle,
      nextInvoice: s.nextInvoice ? dayjs(s.nextInvoice).format("YYYY-MM-DD") : "",
      paymentMethod,
      pickDropExceptionsActive: !!s.autoRenew,
    });

    // Form is already in edit mode
  }, [school, reset]);

  
  const onSubmit = async (data: FormValues) => {
    if (!schoolId) return;
    const payload = {
      schoolId,
      adminInfo: {
        name: data.adminInfo.name,
        email: data.adminInfo.email,
      },
      schoolInfo: {
        schoolImage: data.schoolImage,
        contactPerson: data.adminInfo.name,
        startTime: data.pickupStartTime ? dayjs(data.pickupStartTime).format("hh:mm A") : "",
        endTime: data.dropoffStartTime ? dayjs(data.dropoffStartTime).format("hh:mm A") : "",
        maxTripDuration: Number(data.maxTripDuration),
        bufferTime: Number(data.bufferTime),
        currentPlan: data.plan === "premium" ? "Premium" : "Standard",
        billingCycle:
          data.billingCycle.charAt(0).toUpperCase() + data.billingCycle.slice(1),
        paymentMethod: data.paymentMethod === "bank" ? "Bank Transfer" : "Cash",
        nextInvoice: data.nextInvoice || undefined,
        allowedVans: Number(data.allowedVans),
        allowedStudents: Number(data.allowedStudents),
        allowedRoutes: Number(data.allowedRoutes),
        autoRenew: !!data.pickDropExceptionsActive,
        lat: Number(data.routeLatitude),
        long: Number(data.routeLongitude),
        contactNumber: data.contactNumber,
      },
    };

    try {
      await dispatch(editSchool(payload)).unwrap();
      router.push(paths.dashboard.superadmin.school);
    } catch (err) {
      console.error("Edit failed:", err);
    }
  };

  const isLastStep = false;

  return (
    <FormProvider {...methods}>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: 3 }}>

        {/* MAIN CONTENT AREA */}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* LOGO CARD - COL-4 */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #dee2e6",
                height: "fit-content"
              }}
            >
              <Stack spacing={4} alignItems="center">
                {/* Logo Display - Clickable */}
                <Box 
                  sx={{ position: 'relative', cursor: isEditing ? 'pointer' : 'default' }}
                  onClick={isEditing ? handleSelectImage : undefined}
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
                      "&:hover": isEditing ? {
                        borderColor: "#0d47a1",
                        transform: "scale(1.02)",
                        boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
                      } : {},
                      opacity: isEditing ? 1 : 0.8,
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
                  disabled={!isEditing}
                />
              </Stack>
            </Paper>
          </Grid>

          {/* FORM CARD - COL-8 */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                  <Stack spacing={4}>
                    <ProfileSection disabled={!isEditing} />
                    <Divider />
                    <RouteRulesSection disabled={!isEditing} />
                    <Divider />
                    <LimitsSection disabled={!isEditing} />
                    <Divider />
                    <SubscriptionBillingSection disabled={!isEditing} />
                  </Stack>

                  <button type="submit" style={{ display: "none" }} />
                </Box>
              </CardContent>

              <Divider />

              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ p: 3 }}
              >
                {/* <Button
                  variant="outlined"
                  size="small"
                  onClick={() => router.push(paths.dashboard.superadmin.school)}
                  sx={{ textTransform: "none" }}
                >
                  Back to list
                </Button> */}

                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    textTransform: "none",
                    bgcolor: "#FFB800",
                    color: "white",
                    fontWeight: 500,
                    "&:hover": { bgcolor: "#e5a700" },
                  }}
                  onClick={handleSubmit(onSubmit)}
                  disabled={loading}
                >
                  Update Changes
                </Button>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </FormProvider>
  );
}

/* ===================== TAB SECTIONS ===================== */

function ProfileSection({ disabled }: { disabled?: boolean }) {
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
        <RHFNestedTextField name="adminInfo.name" label="Admin Name" placeholder="Enter admin name" disabled={disabled} />
        <RHFNestedTextField name="adminInfo.email" label="Admin Email" placeholder="Enter admin email" disabled={disabled} />
        <RHFTextField name="schoolName" label="School Name" placeholder="Enter school name" disabled={disabled} />
        <RHFTextField name="schoolEmail" label="School Email" placeholder="Enter school email" disabled={disabled} />
        <RHFTextField name="address" label="Address" placeholder="Enter address" disabled={disabled} />
        <RHFTextField name="contactNumber" label="Contact Number" placeholder="+92-300-0000000" disabled={disabled} />
      </Box>
    </Stack>
  );
}

function RouteRulesSection({ disabled }: { disabled?: boolean }) {
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
        <RHFTimePicker name="pickupStartTime" label="Pickup Start Time" disabled={disabled} />
        <RHFTimePicker name="dropoffStartTime" label="Dropoff Start Time" disabled={disabled} />

        <RHFTextField name="maxTripDuration" label="Max Trip Duration" placeholder="e.g., 60" type="number" disabled={disabled} />

        <RHFTextField name="bufferTime" label="Buffer Time" placeholder="e.g., 15" type="number" disabled={disabled} />
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

function LimitsSection({ disabled }: { disabled?: boolean }) {
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
        <RHFTextField name="allowedVans" label="Allowed Vans" type="number" placeholder="10" disabled={disabled} />
        <RHFTextField name="allowedRoutes" label="Allowed Routes" type="number" placeholder="25" disabled={disabled} />
        <RHFTextField name="allowedStudents" label="Allowed Students" type="number" placeholder="500" disabled={disabled} />
      </Box>
    </Stack>
  );
}

function SubscriptionBillingSection({ disabled }: { disabled?: boolean }) {
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
        <RHFSelectField name="plan" label="Current Plan" disabled={disabled}>
          <MenuItem value="premium">Premium</MenuItem>
          <MenuItem value="standard">Standard</MenuItem>
        </RHFSelectField>

        <RHFSelectField name="billingCycle" label="Billing Cycle" disabled={disabled}>
          <MenuItem value="weekly">Weekly</MenuItem>
          <MenuItem value="monthly">Monthly</MenuItem>
          <MenuItem value="quarterly">Quarterly</MenuItem>
        </RHFSelectField>

        <RHFTextField name="nextInvoice" type="date" label="Next Invoice" disabled={disabled} />

        <RHFSelectField name="paymentMethod" label="Payment Method" disabled={disabled}>
          <MenuItem value="cash">Cash</MenuItem>
          <MenuItem value="bank">Bank</MenuItem>
        </RHFSelectField>

        <Box sx={{ gridColumn: "1 / -1" }}>
          <RHFSwitch name="pickDropExceptionsActive" label="Auto Renew" disabled={disabled} />
        </Box>
      </Box>
    </Stack>
  );
}

/* ===================== (Optional) Demo Table kept for parity ===================== */

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
    <TableRow sx={{ "& td": { verticalAlign: "top", fontSize: "13px" } }}>
      <TableCell sx={{ fontWeight: 500, whiteSpace: "nowrap" }}>{name}</TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>{role}</TableCell>
      <TableCell sx={{ minWidth: 180 }}>{desc}</TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>{users}</TableCell>
      <TableCell align="right" sx={{ width: 40 }}>
        <IconButton size="small">
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
