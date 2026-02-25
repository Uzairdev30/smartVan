'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { BagSimple as BagSimpleIcon } from '@phosphor-icons/react/dist/ssr/BagSimple';
import { Car as CarIcon } from '@phosphor-icons/react/dist/ssr/Car';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { MapPin as MapPinIcon } from '@phosphor-icons/react/dist/ssr/MapPin';
import { paths } from '@/paths';

export interface Kid {
  kidId: string;
  time: string;
  lat: number;
  long: number;
  status: string;
}

export interface TripAPI {
  _id: string;
  driverName: string;
  carNumber: string;
  status: 'start' | 'ongoing' | 'end';
  kids: Kid[];
  tripStart: { startTime: string };
  createdAt: string;
  updatedAt: string;
}

export interface TripCardProps {
  trips: TripAPI[];
  loading?: boolean;
  trackingPath?: string;
  status: '' | 'start' | 'ongoing' | 'end';              // 🔹 parent se aa raha
  onStatusChange: (status: '' | 'start' | 'ongoing' | 'end') => void; // 🔹 parent handler
  selectedTrip?: TripAPI | null;
  onSelectTrip?: (trip: TripAPI) => void;
}

export function TripCard({
  trips = [],
  loading = false,
  trackingPath = '/tracking',
  status,
  onStatusChange,
  selectedTrip,
  onSelectTrip,
}: TripCardProps): React.JSX.Element {
  const router = useRouter();
  const displayedTrips = trips.slice(0, 4);
  const selectedId = selectedTrip?._id;

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: '#2D9CDB' }}>
            <BagSimpleIcon fontSize="var(--Icon-fontSize)" />
          </Avatar>
        }
        title={<Typography variant="h6" sx={{ fontWeight: 600 }}>Trips</Typography>}
        action={
          <Button
            color="secondary"
            size="small"
            onClick={() => router.push(trackingPath)}
          >
            View All
          </Button>
        }
      />
      <Divider />

      {/* 🔹 optional: status filter buttons */}
      <Box sx={{ px: 2, pt: 1, pb: 1 }}>
        <Stack direction="row" spacing={1}>
          {[
            { label: 'All', value: '' as const },
            { label: 'Start', value: 'start' as const },
            { label: 'Ongoing', value: 'ongoing' as const },
            { label: 'End', value: 'end' as const },
          ].map((item) => (
            <Button
              key={item.value || 'all'}
              size="small"
              variant={status === item.value ? 'contained' : 'outlined'}
              onClick={() => onStatusChange(item.value)}
              sx={{ textTransform: 'none' }}
            >
              {item.label}
            </Button>
          ))}
        </Stack>
      </Box>

      <Divider />

      <Box sx={{ height: 380, overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: 0 } }}>
        {loading ? (
          <Typography sx={{ p: 2 }}>Loading...</Typography>
        ) : displayedTrips.length === 0 ? (
          <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>No trips available</Typography>
        ) : (
          displayedTrips.map((trip) => {
            const isSelected = trip._id === selectedId;
            
            // Status color mapping
            const getStatusColor = (status: string) => {
              switch(status) {
                case 'start': return '#2D9CDB';
                case 'ongoing': return '#34C759';
                case 'end': return '#9B9B9B';
                default: return '#9B9B9B';
              }
            };

            const getStatusLabel = (status: string) => {
              switch(status) {
                case 'start': return 'Started';
                case 'ongoing': return 'Ongoing';
                case 'end': return 'Completed';
                default: return 'Unknown';
              }
            };

            return (
              <Box
                key={trip._id}
                sx={{
                  p: 2,
                  cursor: onSelectTrip ? 'pointer' : 'default',
                  bgcolor: isSelected ? '#F1F7FF' : 'transparent',
                  borderRadius: 2,
                  mb: 1,
                  border: isSelected ? '2px solid #2D9CDB' : '1px solid #E5E7EB',
                  '&:hover': {
                    bgcolor: '#F8FAFC',
                    borderColor: '#D1D5DB',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
                onClick={() => onSelectTrip && onSelectTrip(trip)}
              >
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar 
                    sx={{ 
                      width: 56, 
                      height: 56, 
                      bgcolor: getStatusColor(trip.status),
                      fontSize: '1.2rem',
                      fontWeight: 600
                    }}
                  >
                    {trip.driverName ? trip.driverName[0]?.toUpperCase() : 'D'}
                  </Avatar>

                  <Box flex={1}>
                    {/* Driver Name and Status */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="subtitle1" fontWeight={600} color="#1F2937">
                        {trip.driverName || 'Unknown Driver'}
                      </Typography>
                      <Chip
                        label={getStatusLabel(trip.status)}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(trip.status),
                          color: 'white',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                        }}
                      />
                    </Stack>

                    {/* Trip Details */}
                    <Stack spacing={1.5}>
                      {/* Car Info */}
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CarIcon size={16} color="#6B7280" />
                        <Typography variant="body2" color="#6B7280" fontWeight={500}>
                          Vehicle:
                        </Typography>
                        <Typography variant="body2" color="#1F2937" fontWeight={400}>
                          {trip.carNumber || 'N/A'}
                        </Typography>
                      </Stack>

                      {/* Kids Count */}
                      <Stack direction="row" spacing={1} alignItems="center">
                        <UsersIcon size={16} color="#6B7280" />
                        <Typography variant="body2" color="#6B7280" fontWeight={500}>
                          Students:
                        </Typography>
                        <Typography variant="body2" color="#1F2937" fontWeight={400}>
                          {trip.kids ? trip.kids.length : 0}
                        </Typography>
                      </Stack>

                      {/* Date/Time */}
                      <Stack direction="row" spacing={1} alignItems="center">
                        <MapPinIcon size={16} color="#6B7280" />
                        <Typography variant="body2" color="#6B7280" fontWeight={500}>
                          Started:
                        </Typography>
                        <Typography variant="body2" color="#1F2937" fontWeight={400}>
                          {trip.tripStart?.startTime 
                            ? new Date(trip.tripStart.startTime).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Not started'
                          }
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            );
          })
        )}
      </Box>
    </Card>
  );
}
