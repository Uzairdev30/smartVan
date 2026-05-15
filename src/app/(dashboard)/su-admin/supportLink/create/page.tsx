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
  { value: "twitter", label: "Twitter" },
  { value: "youtube", label: "YouTube" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "website", label: "Website" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "other", label: "Other" },
];

const schema = zod.object({
  type: zod.string().min(1, "Type is required"),
  title: zod.string().min(1, "Title is required"),
  value: zod.string().min(1, "Value is required"),
  url: zod.string().url("Enter a valid URL").min(1, "URL is required"),
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

  // Set document title
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
    formState: { errors },
  } = useForm<Values>({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: Values) => {
    try {
      await dispatch(createSupportLink(values)).unwrap();
      router.push("/su-admin/supportLink");
    } catch {
      // error shown via Redux state
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
        <Card sx={{ borderRadius: 2, boxShadow: "0px 1px 3px rgba(0,0,0,0.06)" }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={4}>
              {/* Header */}
              <Stack spacing={2}>
                {/* <Link
                  color="text.primary"
                  component={RouterLink}
                  href="/su-admin/school-management"
                  sx={{
                    alignItems: "center",
                    display: "inline-flex",
                    gap: 1,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                  variant="subtitle2"
                >
                  <ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />
                  Back
                </Link> */}

                <Stack spacing={0.5}>
                  <Typography variant="h4" fontWeight={700}>
                    Add Support Link
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add a new support link that will be visible to app users.
                  </Typography>
                </Stack>
              </Stack>

              <Divider />

              {/* Form Fields */}
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
                        <FormHelperText>{errors.type.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />

                {/* Title */}
                <TextField
                  fullWidth
                  label="Title"
                  placeholder="Enter Your Title"
                  {...register("title")}
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />

                {/* Value */}
                <TextField
                  fullWidth
                  label="Value"
                  placeholder="Enter Your Value"
                  {...register("value")}
                  error={!!errors.value}
                  // helperText={errors.value?.message ?? "Display name or handle for this link"}
                />

                {/* URL */}
                <TextField
                  fullWidth
                  label="URL"
                  placeholder="Enter Your URL"
                  {...register("url")}
                  error={!!errors.url}
                  // helperText={errors.url?.message ?? "Full URL including https://"}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <LinkIcon style={{ marginRight: 8, opacity: 0.5 }} />
                      ),
                    },
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
              <Stack direction="row" spacing={2} justifyContent="flex-end">
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
