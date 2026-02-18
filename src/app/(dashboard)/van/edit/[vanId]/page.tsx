'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from '@mui/material/Link';
import { toast } from '@/components/core/toaster';
import {
  Avatar, Box, Button, Card, CardActions, CardContent,
  FormControl, FormHelperText, Grid, InputLabel, OutlinedInput,
  Stack, Typography, Select, MenuItem,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useDispatch, useSelector } from 'react-redux';
import { Camera as CameraIcon } from '@phosphor-icons/react/dist/ssr/Camera';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { paths } from '@/paths';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { routes } from '@/utils/data';
import { AppDispatch, RootState } from '@/store';
import { uploadImage } from '@/utils/uploadImage';
import { getVanDetailById, updateVan } from '@/store/reducers/van-slice';

/* ----------------------------- Local options ----------------------------- */
const vehicleTypes = [
  { value: 'Suzuki Bolan', label: 'Suzuki Bolan' },
  { value: 'Toyota Hiace', label: 'Toyota Hiace' },
  { value: 'Coaster', label: 'Coaster' },
];
const vehicleConditions = [
  { value: 'Good', label: 'Good' },
  { value: 'Average', label: 'Average' },
  { value: 'Poor', label: 'Poor' },
];

/* ------------------------------ Reusable UI ------------------------------ */
function ImageUpload({
  label = 'Van Photo',
  caption = 'Upload PNG or JPG (min 400×400)',
  value,
  onPick,
  size = 150,
}: {
  label?: string;
  caption?: string;
  value?: string;
  onPick: (file: File) => void;
  size?: number;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  return (
    <Stack spacing={2} alignItems="center">
      <Typography variant="subtitle2">{label}</Typography>
      
      {/* Centered Image */}
      <Box
        sx={{
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: '50%',
          p: '4px',
          display: 'inline-flex',
        }}
      >
        <Avatar
          src={value}
          sx={{ width: size, height: size, bgcolor: 'background.default', color: 'text.primary' }}
        >
          <CameraIcon width={50} height={50} />
        </Avatar>
      </Box>

      {/* Caption and Select Button */}
      <Stack spacing={1} alignItems="center" sx={{ width: '100%' }}>
        <Typography variant="caption" color="text.secondary" textAlign="center">{caption}</Typography>
        <Button 
          variant="outlined" 
          onClick={() => ref.current?.click()}
          sx={{ width: '100%' }}
        >
          Select
        </Button>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onPick(file);
          }}
        />
      </Stack>
    </Stack>
  );
}

/* ------------------------------ Validation ------------------------------ */
const schema = zod.object({
  venImage: zod.string().optional(),
  vehicleType: zod.string().min(1, 'Vehicle type is required'),
  carNumber: zod.string().min(1, 'Vehicle registration number is required'),
  condition: zod.string().min(1, 'Condition is required'),
  venCapacity: zod.coerce.number().int().min(1, 'Capacity must be at least 1'),
  deviceId: zod.string().optional(),
});

type Values = zod.infer<typeof schema>;

/* --------------------------------- Page --------------------------------- */
export default function VanEditForm(): React.JSX.Element {
  const router = useRouter();
  const params = useParams<{ vanId: string }>();
  const vanId = params?.vanId;

  const dispatch = useDispatch<AppDispatch>();
  const { selectedVan, selectedVanLoading } = useSelector(
    (state: RootState) => state.van
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<Values>({
    resolver: zodResolver(schema),
  });

  const venImage = watch('venImage');

  /* --------------------------- Fetch existing data --------------------------- */
  React.useEffect(() => {
    if (vanId) dispatch(getVanDetailById(vanId));
  }, [dispatch, vanId]);

  React.useEffect(() => {
    if (selectedVan) {
      console.log('Selected van data:', selectedVan);
      console.log('Vehicle Type:', selectedVan.vehicleType);
      console.log('Condition:', selectedVan.condition);
      
      reset({
        venImage: selectedVan.driverPicture || selectedVan.venImage || '',
        vehicleType: selectedVan.vehicleType || selectedVan.vehicleType || '',
        carNumber: selectedVan.numberPlate || selectedVan.carNumber || '',
        condition: selectedVan.condition || selectedVan.condition || '',
        venCapacity: selectedVan.capacity || selectedVan.venCapacity || 1,
        deviceId: selectedVan.deviceId || '',
      });
    }
  }, [selectedVan, reset]);

  /* ----------------------------- Image Upload ----------------------------- */
  const handlePickPhoto = async (file: File) => {
    try {
      const imageUrl = await uploadImage(file);
      setValue('venImage', imageUrl, { shouldValidate: true });
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload image');
    }
  };

  /* ----------------------------- On Submit ----------------------------- */
const onSubmit = async (values: Values) => {
  if (!vanId) return;

  const payload = {
    vanId,      // include vanId
    ...values,  // merge all form values
  };

  console.log("Van update payload:", payload);

  // Dispatch your thunk or API call here
  try {
    const updatedVan = await dispatch(updateVan(payload)).unwrap();
    toast.success("Van updated successfully");
    router.push(paths.dashboard.van);
  } catch (error: any) {
    toast.error(error || "Failed to update van");
  }
};

  /* ------------------------------- Render ------------------------------- */
  return (
    <Box
      sx={{
        maxWidth: 'var(--Content-maxWidth)',
        m: 'var(--Content-margin)',
        p: 'var(--Content-padding)',
        width: 'var(--Content-width)',
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          
          {/* Back Link */}
          <Box sx={{ alignSelf: 'flex-start' }}>
            <Button startIcon={<ArrowLeftIcon />} onClick={() => router.back()}>
              Back
            </Button>
          </Box>

          {/* MAIN ROW */}
          <Grid container spacing={3}>
            
            {/* LEFT SIDE - IMAGE CARD (COL-4) */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <ImageUpload
                    value={venImage}
                    onPick={handlePickPhoto}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* RIGHT SIDE - VEHICLE DETAILS (COL-8) */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Stack spacing={3}>
                    <Typography variant="h6">
                      Vehicle Details
                    </Typography>

                    <Grid container spacing={3}>
                    {/* Vehicle Type */}
                    <Grid item xs={12} md={6}>
                      <Controller
                        control={control}
                        name="vehicleType"
                        render={({ field }) => (
                          <FormControl fullWidth error={!!errors.vehicleType}>
                            <InputLabel required>
                              Vehicle Type
                            </InputLabel>
                            <Select 
                              {...field} 
                              label="Vehicle Type"
                              value={field.value || ''}
                            >
                              {vehicleTypes.map((v) => (
                                <MenuItem key={v.value} value={v.value}>
                                  {v.label}
                                </MenuItem>
                              ))}
                            </Select>
                            <FormHelperText>
                              {errors.vehicleType?.message}
                            </FormHelperText>
                          </FormControl>
                        )}
                      />
                    </Grid>

                    {/* Car Number */}
                    <Grid item xs={12} md={6}>
                      <Controller
                        control={control}
                        name="carNumber"
                        render={({ field }) => (
                          <FormControl fullWidth error={!!errors.carNumber}>
                            <InputLabel required>
                              Vehicle Registration Number
                            </InputLabel>
                            <OutlinedInput
                              {...field}
                              label="Vehicle Registration Number"
                            />
                            <FormHelperText>
                              {errors.carNumber?.message}
                            </FormHelperText>
                          </FormControl>
                        )}
                      />
                    </Grid>

                    {/* Condition */}
                    <Grid item xs={12} md={6}>
                      <Controller
                        control={control}
                        name="condition"
                        render={({ field }) => (
                          <FormControl fullWidth error={!!errors.condition}>
                            <InputLabel required>
                              Condition
                            </InputLabel>
                            <Select 
                              {...field} 
                              label="Condition"
                              value={field.value || ''}
                            >
                              {vehicleConditions.map((c) => (
                                <MenuItem key={c.value} value={c.value}>
                                  {c.label}
                                </MenuItem>
                              ))}
                            </Select>
                            <FormHelperText>
                              {errors.condition?.message}
                            </FormHelperText>
                          </FormControl>
                        )}
                      />
                    </Grid>

                    {/* Capacity */}
                    <Grid item xs={12} md={6}>
                      <Controller
                        control={control}
                        name="venCapacity"
                        render={({ field }) => (
                          <FormControl fullWidth error={!!errors.venCapacity}>
                            <InputLabel required>
                              Capacity
                            </InputLabel>
                            <OutlinedInput
                              type="number"
                              {...field}
                              label="Capacity"
                            />
                            <FormHelperText>
                              {errors.venCapacity?.message}
                            </FormHelperText>
                          </FormControl>
                        )}
                      />
                    </Grid>

                    {/* Device ID */}
                    <Grid item xs={12} md={6}>
                      <Controller
                        control={control}
                        name="deviceId"
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>
                              Device ID
                            </InputLabel>
                            <OutlinedInput
                              {...field}
                              label="Device ID"
                            />
                          </FormControl>
                        )}
                      />
                    </Grid>

                  </Grid>
                </Stack>
              </CardContent>

              <CardActions
                sx={{
                  justifyContent: 'flex-end',
                  px: 3,
                  pb: 3,
                }}
              >
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={selectedVanLoading}
                >
                  Update Van
                </LoadingButton>
              </CardActions>
            </Card>
          </Grid>

        </Grid>
      </Stack>
    </form>
  </Box>
);
}
