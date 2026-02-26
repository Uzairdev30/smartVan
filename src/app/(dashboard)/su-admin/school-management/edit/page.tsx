"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
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
  CircularProgress,
} from "@mui/material";
import Link from "next/link";
import RouterLink from "next/link";
import { useRouter, useParams } from "next/navigation";
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
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { editSchool, getSchoolById } from "@/store/reducers/suadmin-slice";
import { uploadImage } from "@/utils/uploadImage";

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

/* ===================== PER-TAB FIELD MAP ===================== */

const fieldsByTab: Record<TabKey, (keyof FormValues)[]> = {
  profile: [
    "schoolImage",
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
      <Typography variant="subtitle2" sx={{ 
        mb: 1,
        fontWeight: 600,
        color: "#374151",
        fontSize: "0.875rem"
      }}>
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
        InputProps={{ 
          sx: { 
            borderRadius: 2,
            py: 1,
            backgroundColor: "#ffffff",
            "&:hover": {
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            },
            "&.Mui-focused": {
              boxShadow: "0 4px 12px rgba(21, 96, 189, 0.2)",
              borderColor: "#1560BD",
            }
          }
        }}
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
      <Typography variant="subtitle2" sx={{ 
        mb: 1,
        fontWeight: 600,
        color: "#374151",
        fontSize: "0.875rem"
      }}>
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
                  InputProps: { 
                    sx: { 
                      borderRadius: 2,
                      backgroundColor: "#ffffff",
                      "&:hover": {
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      },
                      "&.Mui-focused": {
                        boxShadow: "0 4px 12px rgba(21, 96, 189, 0.2)",
                        borderColor: "#1560BD",
                      }
                    }
                  },
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

/* ===================== ZOD SCHEMA (UPDATED) ===================== */

const schema = z.object({
  schoolImage: z.string().optional(),

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

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { school, loading, error } = useSelector((s: RootState) => s.suadmin);
  const schoolId = params.id as string;

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      schoolImage: "",
      adminName: "",
      schoolName: "",
      address: "",
      adminEmail: "",
      schoolEmail: "",
      contactNumber: "",
      pickupStartTime: null,
      dropoffStartTime: null,
      maxTripDuration: "",
      bufferTime: "",
      routeLatitude: 0,
      routeLongitude: 0,
      allowedVans: 1,
      allowedRoutes: 1,
      allowedStudents: 1,
      plan: "standard",
      billingCycle: "monthly",
      nextInvoice: "",
      paymentMethod: "cash",
      pickDropExceptionsActive: false,
    },
    mode: "onTouched",
  });

  const {
    handleSubmit,
    trigger,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = methods;

  // Fetch school data on mount
  useEffect(() => {
    if (schoolId) {
      dispatch(getSchoolById(schoolId));
    }
  }, [dispatch, schoolId]);

  // Populate form when school data is loaded
  useEffect(() => {
    if (school) {
      reset({
        schoolImage: school.schoolImage || "",
        adminName: school.contactPerson || school.admin?.name || "",
        schoolName: school.schoolName || school.name || "",
        address: school.address || "",
        adminEmail: school.admin?.email || "",
        schoolEmail: school.schoolEmail || "",
        contactNumber: school.contactNumber || "",
        pickupStartTime: school.startTime ? dayjs(school.startTime, "hh:mm A").toDate() : null,
        dropoffStartTime: school.endTime ? dayjs(school.endTime, "hh:mm A").toDate() : null,
        maxTripDuration: school.maxTripDuration?.toString() || "",
        bufferTime: school.bufferTime?.toString() || "",
        routeLatitude: school.lat || 0,
        routeLongitude: school.long || 0,
        allowedVans: school.allowedVans || 1,
        allowedRoutes: school.allowedRoutes || 1,
        allowedStudents: school.allowedStudents || 1,
        plan: school.currentPlan?.toLowerCase() === "premium" ? "premium" : "standard",
        billingCycle: school.billingCycle?.toLowerCase() || "monthly",
        nextInvoice: school.nextInvoice || "",
        paymentMethod: school.paymentMethod?.toLowerCase() === "bank" ? "bank" : "cash",
        pickDropExceptionsActive: school.autoRenew || false,
      });
    }
  }, [school, reset]);

  const activeTabOrder = tabsList.find((t) => t.key === activeTab)?.order ?? 0;

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
      schoolId,
      schoolInfo: {
        schoolImage: data.schoolImage,
        schoolName: data.schoolName,
        schoolEmail: data.schoolEmail,
        contactPerson: data.adminName,
        address: data.address,
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
      await dispatch(editSchool(formattedData)).unwrap();
      router.push(paths.dashboard.superadmin.school);
    } catch (err) {
      console.error("❌ Edit failed:", err);
    }
  };

  const isLastStep = activeTab === "subscription";

  if (loading && !school) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          Error loading school data: {error}
        </Typography>
      </Box>
    );
  }

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
        <Stack direction="row" justifyContent="space-between">
          <Stack>
            <Link
              color="text.primary"
              component={RouterLink}
              href={paths.dashboard.superadmin.school}
              sx={{ alignItems: "center", display: "inline-flex", gap: 1 }}
            >
              <ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />
              School Management
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

              {/* Progress Bar */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                {orderedTabs.map((tab, index) => {
                  const isActive = tab.key === activeTab;
                  const isCompleted = tab.order < activeTabOrder;
                  const isLast = index === orderedTabs.length - 1;

                  return (
                    <>
                      <Box
                        sx={{
                          flex: 1,
                          height: 4,
                          borderRadius: 2,
                          background: isActive || isCompleted
                            ? "linear-gradient(90deg, #1560BD, #0D47A1)"
                            : "#E0E0E0",
                        }}
                      />
                      {!isLast && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: isActive || isCompleted ? "#1560BD" : "#E0E0E0",
                          }}
                        />
                      )}
                    </>
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
                background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                border: "1px solid #dee2e6",
                height: "fit-content",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Stack spacing={4} alignItems="center">
                {/* Logo Display */}
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={watch("schoolImage") || school?.schoolImage || undefined}
                    sx={{
                      width: 150,
                      height: 150,
                      borderRadius: 4,
                      border: "1px solid",
                      boxShadow: "0 16px 40px rgba(0, 0, 0, 0.18)",
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
                      background: "linear-gradient(135deg, #0d47a1, #1976d2)",
                      boxShadow: "0 6px 20px rgba(25, 118, 210, 0.5)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease"
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
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              border: "1px solid rgba(255, 255, 255, 0.2)"
            }}>
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
                    px: 4, 
                    py: 1.5,
                    borderColor: "#FFA500",
                    color: "#FFA500",
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "#FF8C00",
                      color: "#FF8C00",
                      bgcolor: "rgba(255, 165, 0, 0.04)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(255, 165, 0, 0.2)",
                    },
                    transition: "all 0.3s ease"
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
                      py: 1.5,
                      background: "linear-gradient(135deg, #FFA500, #FF8C00)",
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: "none",
                      boxShadow: "0 4px 12px rgba(255, 165, 0, 0.3)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #FF8C00, #FFA500)",
                        boxShadow: "0 6px 20px rgba(255, 165, 0, 0.5)",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease"
                    }}
                  >
                    Update School
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={goNext}
                    sx={{
                      px: 4,
                      py: 1.5,
                      background: "linear-gradient(135deg, #FFA500, #FF8C00)",
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: "none",
                      boxShadow: "0 4px 12px rgba(255, 165, 0, 0.3)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #FF8C00, #FFA500)",
                        boxShadow: "0 6px 20px rgba(255, 165, 0, 0.5)",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease"
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

/* ===================== PROFILE SECTION ===================== */

function ProfileSection() {
  return (
    <Stack spacing={3}>
      <Typography variant="h6" sx={{ 
        fontWeight: 600, 
        color: "#1560BD",
        fontSize: "1.2rem",
        mb: 2,
        position: "relative",
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: -8,
          left: 0,
          width: 60,
          height: 3,
          background: "linear-gradient(90deg, #1560BD, #0D47A1)",
          borderRadius: 2,
        }
      }}>
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

/* ===================== OTHER SECTIONS ===================== */

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
    <Stack spacing={3}>
      <Typography variant="h6" sx={{ 
        fontWeight: 600, 
        color: "#1560BD",
        fontSize: "1.2rem",
        mb: 2,
        position: "relative",
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: -8,
          left: 0,
          width: 60,
          height: 3,
          background: "linear-gradient(90deg, #1560BD, #0D47A1)",
          borderRadius: 2,
        }
      }}>
        Route Rules
      </Typography>

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

      {/* Open in Google Maps link */}
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

/* ===================== OTHER SECTIONS (UNCHANGED) ===================== */

function LimitsSection() {
  return (
    <Stack spacing={3}>
      <Typography variant="h6" sx={{ 
        fontWeight: 600, 
        color: "#1560BD",
        fontSize: "1.2rem",
        mb: 2,
        position: "relative",
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: -8,
          left: 0,
          width: 60,
          height: 3,
          background: "linear-gradient(90deg, #1560BD, #0D47A1)",
          borderRadius: 2,
        }
      }}>
        Limits
      </Typography>

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
    <Stack spacing={3}>
      <Typography variant="h6" sx={{ 
        fontWeight: 600, 
        color: "#1560BD",
        fontSize: "1.2rem",
        mb: 2,
        position: "relative",
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: -8,
          left: 0,
          width: 60,
          height: 3,
          background: "linear-gradient(90deg, #1560BD, #0D47A1)",
          borderRadius: 2,
        }
      }}>
        Subscription & Billing
      </Typography>

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

/* ----------------------------------------
   OLD COMPONENTS (KEPT FOR REFERENCE)
---------------------------------------- */
function SchoolSummaryHeader() {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
        width: "100%",
        maxWidth: "100%",
        mt: 1,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ p: 2 }}
      >
        {/* logo */}
        <Avatar
          sx={{
            width: 48,
            height: 48,
            borderRadius: "6px",
            bgcolor: "#F6F7F9",
            border: "1px solid #E0E2E7",
            fontSize: 11,
            fontWeight: 500,
          }}
          src="/assets/school-placeholder.png"
        >
          BHI
        </Avatar>

        {/* info line(s) */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          flexWrap="wrap"
          useFlexGap
          sx={{
            width: "100%",
            fontSize: "13px",
            "& .label": {
              color: "text.secondary",
              fontSize: "13px",
              fontWeight: 400,
            },
            "& .value": {
              color: "text.primary",
              fontSize: "13px",
              fontWeight: 500,
            },
          }}
        >
          <Stack direction="row" spacing={1}>
            <Typography className="label" variant="body2">
              Campus Code
            </Typography>
            <Typography className="value" variant="body2">
              BHN-KHI-12
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Typography className="label" variant="body2">
              Contact
            </Typography>
            <Typography className="value" variant="body2">
              Ali Raza / +92-300-1234567
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Typography className="label" variant="body2">
              City
            </Typography>
            <Typography className="value" variant="body2">
              Karachi
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}

/* ----------------------------------------
   TAB SECTIONS (NOW PREFILLED)
---------------------------------------- */

function ProfileSectionFilled() {
  // pre-filled values
  return (
    <Stack spacing={2}>
      {/* Logo row */}
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: 1,
            bgcolor: "grey.100",
            border: "1px dashed",
            borderColor: "grey.400",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            textAlign: "center",
            overflow: "hidden",
          }}
        >
          <Avatar
            src="/assets/school-placeholder.png"
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: 1,
              fontSize: 12,
            }}
          >
            BHI
          </Avatar>
        </Box>

        <Stack spacing={0.5}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: "0.8rem" }}>
            School Logo
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
            Min 400×400px, PNG or JPG
          </Typography>
          <Button
            size="small"
            variant="outlined"
            sx={{
              borderRadius: 1,
              textTransform: "none",
              width: "fit-content",
              fontSize: "0.75rem",
              lineHeight: 1.4,
              height: 28,
              px: 1.5,
            }}
          >
            Change Logo
          </Button>
        </Stack>
      </Stack>

      {/* Fields grid with defaultValue instead of placeholder */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
          },
          columnGap: 2,
          rowGap: 2,
        }}
      >
        <LabeledField
          label="School Name *"
          defaultValue="Beaconhouse International School"
        />

        <LabeledFieldWithIcon
          label="Address *"
          defaultValue="Street 12, DHA Phase 6, Karachi"
          icon={<RoomOutlinedIcon fontSize="small" />}
        />

        <LabeledField
          label="Contact Person *"
          defaultValue="Ali Raza"
        />

        <LabeledField
          label="Contact Number *"
          defaultValue="+92-300-1234567"
        />

        <LabeledField
          label="Principal / Head"
          defaultValue="Mrs. Sana Riaz"
        />

        <LabeledField
          label="Campus Code"
          defaultValue="BHN-KHI-12"
        />
      </Box>
    </Stack>
  );
}

function RouteRulesSectionFilled() {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: "0.8rem" }}>
        Route Rules
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
          },
          columnGap: 2,
          rowGap: 2,
        }}
      >
        <LabeledFieldWithIcon
          label="Start Time *"
          defaultValue="07:30 AM"
          icon={<AccessTimeIcon fontSize="small" />}
        />
        <LabeledFieldWithIcon
          label="End Time *"
          defaultValue="02:30 PM"
          icon={<AccessTimeIcon fontSize="small" />}
        />
        <LabeledField
          label="Max Trip Duration *"
          defaultValue="45 mins"
        />
        <LabeledField
          label="Buffer Time *"
          defaultValue="10 mins"
        />
      </Box>
    </Stack>
  );
}

function LimitsSectionFilled() {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: "0.8rem" }}>
        Limits
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
          },
          columnGap: 2,
          rowGap: 2,
        }}
      >
        <LabeledField
          label="Allowed Vans *"
          defaultValue="50"
        />
        <LabeledField
          label="Allowed Routes *"
          defaultValue="20"
        />
        <LabeledField
          label="Allowed Students *"
          defaultValue="1000"
        />
        <LabeledField
          label="Currently Active Students"
          defaultValue="742"
        />
        <LabeledField
          label="Assigned Drivers"
          defaultValue="38"
        />
      </Box>
    </Stack>
  );
}

function SubscriptionBillingSectionFilled() {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: "0.8rem" }}>
        Subscription &amp; Billing
      </Typography>

      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",
          fontSize: "14px",
        }}
      >
        <RowKV label="Current Plan" value="Premium (Per Student)" />
        <RowKV label="Billing Cycle" value="Monthly" />
        <RowKV label="Next Invoice" value="01-Sep-2025" />
        <RowKV label="Payment Method" value="Bank Transfer" />
        <RowKV
          label="Account Status"
          value={
            <StatusPill
              text="In Good Standing"
              bg="rgba(76,175,80,0.08)"
              color="#2e7d32"
              borderColor="#4CAF50"
            />
          }
        />
      </Box>
    </Stack>
  );
}

/* ----------------------------------------
   SMALL BUILDING BLOCKS
---------------------------------------- */

function LabeledField({
  label,
  defaultValue,
}: {
  label: string;
  defaultValue: string;
}) {
  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{
          mb: 1,
          fontSize: "0.8rem",
          lineHeight: 1.4,
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>
      <TextField
        fullWidth
        size="small"
        defaultValue={defaultValue}
        InputProps={{
          sx: { borderRadius: 1, fontSize: "0.8rem" },
        }}
        inputProps={{
          style: { fontSize: "0.8rem" },
        }}
      />
    </Box>
  );
}

function LabeledFieldWithIcon({
  label,
  defaultValue,
  icon,
}: {
  label: string;
  defaultValue: string;
  icon?: React.ReactNode;
}) {
  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{
          mb: 1,
          fontSize: "0.8rem",
          lineHeight: 1.4,
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>

      <Box sx={{ position: "relative" }}>
        <TextField
          fullWidth
          size="small"
          defaultValue={defaultValue}
          InputProps={{
            sx: {
              borderRadius: 1,
              fontSize: "0.8rem",
              pr: icon ? 4 : undefined,
            },
          }}
          inputProps={{
            style: { fontSize: "0.8rem" },
          }}
        />
        {icon && (
          <IconButton
            size="small"
            sx={{
              position: "absolute",
              right: 4,
              top: "50%",
              transform: "translateY(-50%)",
              color: "text.secondary",
            }}
          >
            {icon}
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

// reused from your code
function RowKV({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        p: 2,
        "&:last-of-type": {
          borderBottom: "none",
        },
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", sm: "220px" },
          flexShrink: 0,
          color: "text.secondary",
          fontSize: "13px",
          fontWeight: 500,
          mb: { xs: 1, sm: 0 },
        }}
      >
        {label}
      </Box>

      <Box
        sx={{
          flex: 1,
          fontSize: "13px",
          fontWeight: 500,
          color: "text.primary",
        }}
      >
        {value}
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
        display: "inline-flex",
        alignItems: "center",
        fontSize: "12px",
        lineHeight: 1.4,
        borderRadius: "4px",
        border: `1px solid ${borderColor}`,
        bgcolor: bg,
        color,
        fontWeight: 500,
        px: 1,
        py: "2px",
      }}
    >
      {text}
    </Box>
  );
}

/* ----------------------------------------
   FOOTERS (EDIT MODE)
---------------------------------------- */

function FooterEditDefault() {
  return (
    <Stack
      direction="row"
      justifyContent="flex-end"
      spacing={1}
      sx={{ p: 2 }}
    >
      <Button
        variant="text"
        size="small"
        sx={{
          color: "text.secondary",
          textTransform: "none",
        }}
      >
        Cancel
      </Button>

      <Button
        variant="contained"
        size="small"
        sx={{
          textTransform: "none",
          bgcolor: "#FFB800",
          color: "#000",
          fontWeight: 500,
          "&:hover": {
            bgcolor: "#e5a700",
          },
        }}
      >
        Save Changes
      </Button>
    </Stack>
  );
}

function FooterSubscriptionEdit() {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent={{ xs: "flex-start", sm: "flex-end" }}
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={1.5}
      sx={{ p: 2 }}
    >
      <Button
        variant="text"
        size="small"
        sx={{
          color: "text.secondary",
          textTransform: "none",
        }}
      >
        View Invoices
      </Button>

      <Button
        variant="contained"
        size="small"
        sx={{
          textTransform: "none",
          bgcolor: "#1560BD",
          color: "#fff",
          fontWeight: 500,
          "&:hover": {
            bgcolor: "#0f4a94",
          },
        }}
      >
        Change Plan
      </Button>

      <Button
        variant="contained"
        size="small"
        sx={{
          textTransform: "none",
          bgcolor: "#FFB800",
          color: "#000",
          fontWeight: 500,
          "&:hover": {
            bgcolor: "#e5a700",
          },
        }}
      >
        Save Changes
      </Button>
    </Stack>
  );
}
