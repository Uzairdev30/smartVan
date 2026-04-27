'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DataTable } from '@/components/core/data-table';
import type { ColumnDef } from '@/components/core/data-table';

export interface TripHistory {
  id: string;
  vehicleId: string;
  driverName: string;
  date: string;
  startLocation: string;
  endLocation: string;
  status: string;
}

const columns = [
  {
    formatter: (row: TripHistory): React.JSX.Element => (
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography color="text.secondary" variant="body2">
          {row.id}
        </Typography>
      </Stack>
    ),
    name: 'Trip ID',
    width: '100px',
  },
  {
    formatter: (row: TripHistory): React.JSX.Element => (
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography color="text.secondary" variant="body2">
          {row.vehicleId}
        </Typography>
      </Stack>
    ),
    name: 'Vehicle ID',
    width: '120px',
  },
  {
    formatter: (row: TripHistory): React.JSX.Element => (
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography variant="body2">
          {row.driverName}
        </Typography>
      </Stack>
    ),
    name: 'Driver Name',
    width: '200px',
  },
  {
    formatter: (row: TripHistory): React.JSX.Element => (
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography color="text.secondary" variant="body2">
          {row.date}
        </Typography>
      </Stack>
    ),
    name: 'Date',
    width: '120px',
  },
  {
    formatter: (row: TripHistory): React.JSX.Element => (
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography variant="body2">
          {row.startLocation}
        </Typography>
      </Stack>
    ),
    name: 'Start Location',
    width: '180px',
  },
  {
    formatter: (row: TripHistory): React.JSX.Element => (
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography variant="body2">
          {row.endLocation}
        </Typography>
      </Stack>
    ),
    name: 'End Location',
    width: '180px',
  },
  {
    formatter: (row: TripHistory): React.JSX.Element => (
      <Chip
        color={row.status === 'Present' ? 'success' : row.status === 'Absent' ? 'error' : 'default'}
        label={row.status}
        size="small"
        variant="outlined"
      />
    ),
    name: 'Status',
    width: '120px',
    align: 'center',
  },
] satisfies ColumnDef<TripHistory>[];

export interface StudentTripHistoryTableProps {
  rows: TripHistory[];
}

export default function StudentTripHistoryTable({ rows }: StudentTripHistoryTableProps): React.JSX.Element {
  return (
    <React.Fragment>
      <DataTable<TripHistory>
        columns={columns}
        rows={rows}
      />
      {!rows.length ? (
        <Box sx={{ p: 3 }}>
          <Typography color="text.secondary" sx={{ textAlign: 'center' }} variant="body2">
            No trip history found
          </Typography>
        </Box>
      ) : null}
    </React.Fragment>
  );
}
