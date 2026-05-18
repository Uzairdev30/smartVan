"use client";

import * as React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  TextField,
  Divider,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  InputAdornment,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm, Controller } from "react-hook-form";
import { z as zod } from "zod";
import { config } from "@/config";
import { Link as LinkIcon } from "@phosphor-icons/react/dist/ssr/Link";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { createSupportLink } from "@/store/reducers/suadmin-slice";

const LINK_TYPES = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone Call" },
  { value: "website", label: "Website" },
];

const LINK_TYPE_META: Record<
  string,
  {
    label: string;
    placeholder: string;
    helperText: string;
  }
> = {
  facebook: {
    label: "Facebook URL",
    placeholder: "https://facebook.com/yourpage",
    helperText: "Paste your Facebook page or profile URL",
  },

  instagram: {
    label: "Instagram Username or URL",
    placeholder: "@yourusername or https://instagram.com/yourusername",
    helperText: "Enter Instagram username or full profile URL",
  },

  whatsapp: {
    label: "WhatsApp Number",
    placeholder: "923001234567",
    helperText: "Enter number with country code without +",
  },

  email: {
    label: "Email Address",
    placeholder: "support@example.com",
    helperText: "Enter a valid support email address",
  },

  phone: {
    label: "Phone Number",
    placeholder: "+92 300 1234567",
    helperText: "Enter support contact number",
  },

  website: {
    label: "Website URL",
    placeholder: "https://yourwebsite.com",
    helperText: "Enter full website URL including https://",
  },
};

const schema = zod.object({
  type: zod.string().min(1, "Type is required"),
  title: zod.string().min(1, "Title is required"),
  value: zod.string().min(1, "Value is required"),
  url: zod.string().min(1, "Target is required"),
});

type Values = zod.infer<typeof schema>;

const defaultValues: Values = {
  type: "",
  title: "",
  value: "",
  url: "",
};

export default function CreateSupportLinkPage(): React.JSX.Element {
  const router = useRouter();

  useEffect(() => {
    document.title = `${config.site.name} | Create Link`;
  }, []);

  const dispatch = useDispatch<AppDispatch>();

  const { supportLinkCreateLoading, supportLinkCreateError } = useSelector(
    (state: RootState) => state.suadmin
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<Values>({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const selectedType = watch("type");

  const currentMeta = LINK_TYPE_META[selectedType] || {
    label: "Target",
    placeholder: "Enter value",
    // helperText: "Enter link, username, number or identifier",
  };

  const onSubmit = async (values: Values) => {
    try {
      await dispatch(createSupportLink(values)).unwrap();
      router.push("/su-admin/supportLink");
    } catch {
      // handled in redux state
    }
  };

  return (
    <Box
      sx={{
        maxWidth: "var(--Content-maxWidth)",
        m: "var(--Content-margin)",
        p: "var(--Content-padding)",
        width: "var(--Content-width)",
      }}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0px 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={4}>
              {/* Header */}
              <Stack spacing={0.5}>
                <Typography variant="h4" fontWeight={700}>
                  Add Support Link
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Create a support contact or social link for app users.
                </Typography>
              </Stack>

              <Divider />

              {/* Form */}
              <Stack spacing={3}>
                {/* Type */}
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.type}>
                      <InputLabel>Type</InputLabel>

                      <Select {...field} label="Type">
                        {LINK_TYPES.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>

                      {errors.type && (
                        <FormHelperText>
                          {errors.type.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />

                {/* Title */}
                <TextField
                  fullWidth
                  label="Title"
                  placeholder="Customer Support"
                  {...register("title")}
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />

                {/* Value */}
                <TextField
                  fullWidth
                  label="Display Value"
                  placeholder="24/7 Customer Care"
                  {...register("value")}
                  error={!!errors.value}
                  // helperText={
                  //   errors.value?.message ||
                  //   "Visible text shown to users"
                  // }
                />

                {/* Dynamic Target Field */}
                <TextField
                  fullWidth
                  label={currentMeta.label}
                  placeholder={currentMeta.placeholder}
                  {...register("url")}
                  error={!!errors.url}
                  helperText={
                    errors.url?.message || currentMeta.helperText
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkIcon size={18} opacity={0.5} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>

              {/* Error */}
              {supportLinkCreateError && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {supportLinkCreateError}
                </Alert>
              )}

              <Divider />

              {/* Actions */}
              <Stack
                direction="row"
                spacing={2}
                justifyContent="flex-end"
              >
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={supportLinkCreateLoading}
                  disabled={supportLinkCreateLoading}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    px: 4,
                    py: 1,
                    fontWeight: 600,
                  }}
                >
                  Add Support Link
                </LoadingButton>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}