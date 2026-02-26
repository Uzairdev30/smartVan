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
import { ArrowLeft as ArrowLeftIcon, Building, MapPin, Clock, CreditCard, Users } from "@phosphor-icons/react/dist/ssr";
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
import { uploadImage } from "@/utils/uploadImage"; // ⬅️ ADDED
// import MapComponent from "@/components/MapSelection";
// import GoogleMapsProvider from "@/components/GoogleMapsProvider";

/* ===================== TABS ===================== */

type TabKey =
  | "profile"
  | "route_rules"
  | "limits"
  | "subscription"
  | "admins"
  | "access"
  | "onboarding"
  | "audit"
  | "notes"
  | "branches";

const tabsList: { key: TabKey; label: string; order: number }[] = [
  { key: "profile", label: "Profile", order: 0 },
  { key: "route_rules", label: "Route Rules", order: 1 },
  { key: "limits", label: "Limits", order: 2 },
  { key: "subscription", label: "Subscription & Billing", order: 3 },
];

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
    .max(90, "Max 90"),
  routeLongitude: z
    .coerce.number({ invalid_type_error: "Longitude must be a number" })
    .min(-180, "Min -180")
    .max(180, "Max 180"),

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

/* ===================== PER-TAB FIELD MAP ===================== */

const fieldsByTab: Record<TabKey, (keyof FormValues)[]> = {
  profile: [
    "schoolImage", // ⬅️ ADDED
    "adminName",
    "schoolName",
    "address",
    "adminEmail",
    "schoolEmail",
    "contactNumber",
  ],
  route_rules: [
    "pickupStartTime",
    "dropoffStartTime",
    "maxTripDuration",
    "bufferTime",
    "routeLatitude",
    "routeLongitude",
  ],
  limits: ["allowedVans", "allowedRoutes", "allowedStudents"],
  subscription: [
    "plan",
    "billingCycle",
    "nextInvoice",
    "paymentMethod",
    "pickDropExceptionsActive",
  ],
  admins: [],
  access: [],
  onboarding: [],
  audit: [],
  notes: [],
  branches: [],
};

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
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const activeTabOrder =
    tabsList.find((t) => t.key === activeTab)?.order ?? 0;
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

  /* Tab Error Logic */
  const tabHasErrors = useMemo(() => {
    const eKeys = Object.keys(errors) as (keyof FormValues)[];
    const map: Partial<Record<TabKey, boolean>> = {};
    (Object.keys(fieldsByTab) as TabKey[]).forEach((tab) => {
      map[tab] = eKeys.some((k) => fieldsByTab[tab]?.includes(k));
    });
    return map;
  }, [errors]);

  const orderedTabs = useMemo(
    () => [...tabsList].sort((a, b) => a.order - b.order),
    []
  );

  /* Step navigation */
  const goNext = async () => {
    const current = orderedTabs.find((t) => t.key === activeTab);
    if (!current) return;

    const next = orderedTabs.find((t) => t.order === current.order + 1);

    const valid = await trigger(fieldsByTab[activeTab]);
    if (!valid) return;

    if (next) setActiveTab(next.key);
  };

  const goPrev = () => {
    const current = orderedTabs.find((t) => t.key === activeTab);
    if (!current) return;

    const prev = orderedTabs.find((t) => t.order === current.order - 1);
    if (prev) setActiveTab(prev.key);
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

  const isLastStep = activeTab === "subscription";

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
        {/* TOP AREA */}
        <Stack spacing={4}>
          <Stack spacing={2}>
            <Link
              color="text.primary"
              component={RouterLink}
              href={paths.dashboard.superadmin.school}
              sx={{ alignItems: 'center', display: 'inline-flex', gap: 1 }}
              variant="subtitle2"
            >
              <ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />
            </Link>

            {/* ENHANCED TABS */}
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {orderedTabs.map((tab, index) => {
                  const isActive = tab.key === activeTab;
                  const isCompleted = tab.order < activeTabOrder;
                  const hasError = tabHasErrors[tab.key];

                  const getTabIcon = (key: TabKey) => {
                    switch (key) {
                      case 'profile': return <Building size={16} />;
                      case 'route_rules': return <MapPin size={16} />;
                      case 'limits': return <Users size={16} />;
                      case 'subscription': return <CreditCard size={16} />;
                      default: return null;
                    }
                  };

                  return (
                    <Box
                      key={tab.key}
                      onClick={async () => {
                        const current = orderedTabs.find(
                          (t) => t.key === activeTab
                        );
                        if (
                          current &&
                          tab.order > current.order &&
                          !(await trigger(fieldsByTab[activeTab]))
                        ) {
                          return;
                        }
                        setActiveTab(tab.key);
                      }}
                      sx={{
                        position: 'relative',
                        px: 2,
                        py: 1.5,
                        borderRadius: 2,
                        cursor: "pointer",
                        background: isActive
                          ? "linear-gradient(135deg, #1560BD 0%, #0D47A1 100%)"
                          : isCompleted
                            ? "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)"
                            : "#F5F5F5",
                        color: isActive || isCompleted ? "#fff" : "#616161",
                        fontSize: "14px",
                        fontWeight: isActive ? 600 : 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        transition: "all 0.3s ease",
                        boxShadow: isActive ? "0 4px 12px rgba(21, 96, 189, 0.3)" : "none",
                        border: hasError ? "2px solid #E53935" : "none",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: isActive ? "0 6px 16px rgba(21, 96, 189, 0.4)" : "0 4px 12px rgba(0, 0, 0, 0.1)",
                        }
                      }}
                    >
                      {/* Step Number */}
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: isActive || isCompleted ? "rgba(255, 255, 255, 0.2)" : "#E0E0E0",
                          color: isActive || isCompleted ? "#fff" : "#757575",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        {index + 1}
                      </Box>

                      {/* Tab Icon */}
                      {getTabIcon(tab.key)}

                      {/* Tab Label */}
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                          {tab.label}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8, fontSize: "11px" }}>
                          {isCompleted ? "Completed" : isActive ? "In Progress" : "Pending"}
                        </Typography>
                      </Box>

                      {/* Error Indicator */}
                      {hasError && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            background: "#E53935",
                            border: "2px solid #fff",
                          }}
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Stack>
        </Stack>

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
                {/* Logo Display */}
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={watch("schoolImage") || undefined}
                    sx={{
                      width: 150,
                      height: 150,
                      borderRadius: 4,
                      border: "1px solid",
                      // boxShadow: "0 16px 40px rgba(0, 0, 0, 0.18)",
                      bgcolor: "#fafafa",
                    }}
                  >
                    <Building size={60} color="#757575" />
                  </Avatar>

                </Box>

                {/* Upload Button */}
                <Button
                  variant="contained"
                  onClick={handleSelectImage}
                  size="large"
                  sx={{
                    px: 4,
                    py: 2,
                    fontSize: "16px",
                    fontWeight: 600,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #1976d2, #0d47a1)",
                    textTransform: "none",
                    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                    "&:hover": {
                      // background: "linear-gradient(135deg, #0d47a1, #1976d2)",
                      boxShadow: "0 6px 20px rgba(25, 118, 210, 0.5)",
                      // transform: "translateY(-2px)",
                    }
                  }}
                >
                  Upload School Logo
                </Button>

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
                {activeTab === "profile" && <ProfileSection />}
                {activeTab === "route_rules" && <RouteRulesSection />}
                {activeTab === "limits" && <LimitsSection />}
                {activeTab === "subscription" && (
                  <SubscriptionBillingSection />
                )}
              </CardContent>

              <Divider />

              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ p: 3 }}
              >
                <Button
                  variant="outlined"
                  onClick={goPrev}
                  disabled={activeTab === "profile"}
                  sx={{
                    px: 3,
                    py: 1,
                    borderColor: "#FFA500",
                    color: "#FFA500",
                    "&:hover": {
                      borderColor: "#FF8C00",
                      color: "#FF8C00",
                      bgcolor: "rgba(255, 165, 0, 0.04)"
                    }
                  }}
                >
                  Previous
                </Button>

                {isLastStep ? (
                  <Button
                    variant="contained"
                    onClick={async () => {
                      if (!(await trigger(fieldsByTab[activeTab]))) return;
                      handleSubmit(onSubmit)();
                    }}
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
                ) : (
                  <Button
                    variant="contained"
                    onClick={goNext}
                    sx={{
                      px: 4,
                      py: 1,
                      background: "#FFA500",
                      "&:hover": {
                        background: "#FF8C00",
                      }
                    }}
                  >
                    Next
                  </Button>
                )}
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
      <Typography variant="h6" sx={{ fontWeight: 600, color: "#1560BD" }}>
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
          label="Admin Name *"
          placeholder="Enter admin name"
        />
        <RHFTextField
          name="schoolName"
          label="School Name *"
          placeholder="Enter school name"
        />
        <RHFTextField
          name="address"
          label="Address *"
          placeholder="Enter address"
        />
        <RHFTextField
          name="adminEmail"
          label="Admin Email *"
          placeholder="Enter admin email"
        />
        <RHFTextField
          name="schoolEmail"
          label="School Email *"
          placeholder="Enter school email"
        />
        <RHFTextField
          name="contactNumber"
          label="Contact Number *"
          placeholder="+92-300-0000000"
        />
      </Box>
    </Stack>
  );
}

/* ===================== OTHER SECTIONS (UNCHANGED) ===================== */

function RouteRulesSection() {
  const { setValue, trigger, watch } = useFormContext<FormValues>();

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
      <Typography variant="subtitle2">Route Rules</Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)" },
          gap: 2,
        }}
      >
        <RHFTimePicker name="pickupStartTime" label="Pickup Start Time" />
        <RHFTimePicker name="dropoffStartTime" label="Dropoff Start Time" />

        <RHFTextField name="maxTripDuration" label="Max Trip Duration" placeholder="45 mins" />
        <RHFTextField name="bufferTime" label="Buffer Time" placeholder="10 mins" />

        {/* <RHFTextField name="routeLatitude" label="Latitude" type="number" placeholder="24.8607" />
        <RHFTextField name="routeLongitude" label="Longitude" type="number" placeholder="67.0011" /> */}
      </Box>

      {/* ✅ Open in Google Maps link */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Open this location in Google Maps:
        </Typography>

        <Button
          variant="outlined"
          size="small"
          disabled={!googleMapsLink}
          onClick={() => window.open(googleMapsLink, "_blank")}
        >
          Open in Google Maps
        </Button>

        {/* optional: show link text */}
        {googleMapsLink ? (
          <Typography variant="caption" sx={{ wordBreak: "break-all" }}>
            {googleMapsLink}
          </Typography>
        ) : null}
      </Box>

      {/* ✅ MapSelection component (unchanged) */}
      <Box sx={{ mt: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Pick location on map
        </Typography>
        {/* <GoogleMapsProvider> */}
        {/* <MapComponent onPositionChange={handlePositionChange} /> */}
        {/* </GoogleMapsProvider> */}

        {/* <MapComponent onPositionChange={handlePositionChange} /> */}
      </Box>
    </Stack>
  );
}


function LimitsSection() {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2">Limits</Typography>

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
          placeholder="50"
        />
        <RHFTextField
          name="allowedRoutes"
          label="Allowed Routes"
          type="number"
          placeholder="20"
        />
        <RHFTextField
          name="allowedStudents"
          label="Allowed Students"
          type="number"
          placeholder="1000"
        />
      </Box>
    </Stack>
  );
}

function SubscriptionBillingSection() {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2">Subscription & Billing</Typography>

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
