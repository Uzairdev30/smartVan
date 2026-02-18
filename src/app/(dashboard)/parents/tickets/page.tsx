'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { useRouter } from 'next/navigation';
import { paths } from '@/paths';
import { dayjs } from '@/lib/dayjs';
import { CustomersPagination } from '@/components/dashboard/customer/customers-pagination';
import { DataTable } from '@/components/core/data-table';
import type { ColumnDef } from '@/components/core/data-table';
import { getAllComplaints } from '@/store/reducers/complaint-management';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';

export default function Page(): React.JSX.Element {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { complaints, loading } = useSelector((state: RootState) => state.complaint);

  // Fetch complaints on component mount
  React.useEffect(() => {
    dispatch(getAllComplaints({ page: 1, limit: 10 }));
  }, [dispatch]);

  // Transform API data to table format
  const data = complaints.map((complaint) => ({
    id: complaint._id,
    parentName: 'Parent Name', // API might not have this field
    studentName: 'Student Name', // API might not have this field
    subject: complaint.issueType || 'No Subject',
    date: complaint.createdAt || new Date().toISOString(),
    status: complaint.status === 'closed' ? 'Resolved' :
            complaint.status === 'acknowledge' ? 'In Progress' :
            complaint.status === 'pending' ? 'New' :
            complaint.status,
  }));

  const columns = [
    {
      name: 'Parent Name',
      width: '180px',
      formatter: (row): React.JSX.Element => (
        <Typography variant="body2">{row.parentName}</Typography>
      ),
    },
    {
      name: 'Student Name',
      width: '180px',
      formatter: (row): React.JSX.Element => (
        <Typography variant="body2">{row.studentName || 'Not Linked'}</Typography>
      ),
    },
    {
      name: 'Subject',
      width: '250px',
      formatter: (row): React.JSX.Element => (
        <Typography variant="body2">{row.subject}</Typography>
      ),
    },
    {
      name: 'Date',
      width: '150px',
      formatter: (row): React.JSX.Element => (
        <Typography variant="body2">{dayjs(row.date).format('DD MMM YYYY')}</Typography>
      ),
    },
    {
      name: 'Status',
      width: '120px',
      formatter: (row): React.JSX.Element => (
        <Chip
          label={row.status}
          size="small"
          color={
            row.status === 'Resolved'
              ? 'success'
              : row.status === 'In Progress'
              ? 'warning'
              : 'default'
          }
        />
      ),
    },
    {
      name: 'Actions',
      width: '100px',
      align: 'right',
      formatter: (row): React.JSX.Element => (
        <IconButton onClick={() => router.push(`/parents/tickets/${row.id}`)} size="small">
          <EyeIcon />
        </IconButton>
      ),
    },
  ] satisfies ColumnDef<any>[];

  return (
    <Box sx={{ bgcolor: 'var(--mui-palette-background-level1)', p: 3 }}>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
          <Box sx={{ flex: '1 1 auto' }}>
            <Typography variant="h5">Parent Support Tickets</Typography>
          </Box>
          <Box>
            <Button variant="contained" color="primary" endIcon={<PlusIcon />}>
              Raise New Ticket
            </Button>
          </Box>
        </Stack>

        <Card>
          <Box sx={{ overflowX: 'auto' }}>
            {data.length ? (
              <DataTable<any> columns={columns} rows={data} />
            ) : (
              <Box sx={{ p: 3 }}>
                <Typography color="text.secondary" sx={{ textAlign: 'center' }} variant="body2">
                  No tickets found
                </Typography>
              </Box>
            )}
          </Box>
          <Divider />
          <CustomersPagination
            count={data.length}
            page={0}
            rowsPerPage={10}
            onPaginationChange={() => {}}
            onRowsPerPageChange={() => {}}
          />
        </Card>
      </Stack>
    </Box>
  );
}
