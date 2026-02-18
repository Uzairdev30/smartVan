'use client';

import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid2,
  Stack,
  Typography,
} from '@mui/material';
import { BagSimple as BagSimpleIcon } from '@phosphor-icons/react/dist/ssr/BagSimple';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from '@/store';
import { getAllComplaints, type ComplaintType } from '@/store/reducers/complaint-management';
import { store } from '@/store';
import type { RootState } from '@/store';

interface ProductsProps {
  list?: any[];
}

export function TicketsComplain({ list }: ProductsProps): React.JSX.Element {
  const router = useRouter();
  const dispatch = useDispatch();
  const { complaints, loading }: { complaints: ComplaintType[]; loading: boolean } = useSelector((state: RootState) => state.complaint);

  // Fetch complaints on component mount
  React.useEffect(() => {
    dispatch(getAllComplaints({ page: 1, limit: 5 }));
  }, [dispatch]);

  const handleViewAll = () => {
    router.push('/parents');
  };

  const handleStatCardClick = (status: string) => {
    // Navigate to filtered complaints list
    if (status === 'Total Tickets') {
      router.push('/parents');
    } else if (status === 'Open') {
      router.push('/parents?filter=open');
    } else if (status === 'Resolved') {
      router.push('/parents?filter=resolved');
    }
  };

  const handleComplaintClick = (complaint: ComplaintType) => {
    router.push(`/parents/tickets/${complaint._id}`);
  };

  return (
    <Card>
      <CardHeader
        action={
          <Button
            color="secondary"
            size="small"
            sx={{ mt: 1 }}
            onClick={handleViewAll}
            endIcon={<ArrowRightIcon />}
          >
            View all
          </Button>
        }
        avatar={
          <Avatar sx={{ cursor: 'pointer' }} onClick={handleViewAll}>
            <BagSimpleIcon fontSize="var(--Icon-fontSize)" />
          </Avatar>
        }
        title="Tickets & Complaints"
        sx={{pt:2}}
      />
      <Divider />
      <Grid2 container spacing={2} sx={{ p: 2 }}>
        {[
          { label: 'Total Tickets', value: 125, bg: '#F0F7FF' },
          { label: 'Open', value: 75, bg: '#FFF6E0' },
          { label: 'Resolved', value: 50, bg: '#E5FFE5' }
        ].map((item, idx) => (
          <Grid2
            key={idx}
            size={{
              md: 4,
              xs: 12,
            }}
          >
            <Box
              sx={{
                backgroundColor: item.bg,
                px: 2,
                py: 2,
                textAlign: 'center',
                borderRadius: '10px',
                whiteSpace: 'nowrap', // Prevent label from breaking
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 'var(--mui-shadows-4)',
                }
              }}
              onClick={() => handleStatCardClick(item.label)}
            >
              <Typography
                variant="body2"
                sx={{
                  mb: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.label}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {item.value}
              </Typography>
            </Box>
          </Grid2>
        ))}
      </Grid2>
      <Divider />
      <Box sx={{
    height: 440,
    overflowY: 'auto',
    pr: 1,
    "&::-webkit-scrollbar": {
          width: "0px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "primary.main",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "transparent",
        },
  }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography>Loading complaints...</Typography>
          </Box>
        ) : complaints && complaints.length > 0 ? (
          complaints.slice(0, 3).map((complaint, idx) => (
            <Box key={complaint._id} sx={{ p: 2, cursor: 'pointer', '&:hover': { backgroundColor: 'var(--mui-palette-action-hover)' } }} onClick={() => handleComplaintClick(complaint)}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar src="/assets/avatar-1.png" sx={{ width: 48, height: 48 }} />
                <Box flex={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontWeight={600}>Complaint #{complaint._id}</Typography>
                    <Typography variant="caption" color="black">
                      {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Stack>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Type:{' '}
                      <Typography variant="caption" fontWeight={400} color='black'>
                        {complaint.type || complaint.issueType || 'N/A'}
                      </Typography>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Subject:{' '}
                      <Typography variant="caption" fontWeight={400} color='black'>
                        {complaint.issueType || 'N/A'}
                      </Typography>
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" mt={1}>
                    {complaint.description ? complaint.description.substring(0, 100) + '...' : 'No description'}
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ mt: 1 }} />
            </Box>
          ))
        ) : (
          // Fallback static data if API fails
          [
            { _id: '1', type: 'parentReport' as any, issueType: 'Van Arrived Late', description: 'sfcscsvxb', createdAt: '2025-11-25T18:53:18' },
            { _id: '2', type: 'parentReport' as any, issueType: 'Driver Using Mobile While Driving', description: 'The driver was seen using his mobile phone while driving, which is unsafe for students.', createdAt: '2025-10-22T18:09:23' },
            { _id: '3', type: 'parentReport' as any, issueType: 'Overcrowded Van', description: 'The van was carrying more students than its capacity, which seemed unsafe', createdAt: '2025-10-22T18:06:01' }
          ].map((complaint: any, idx: number) => (
            <Box key={complaint._id} sx={{ p: 2, cursor: 'pointer', '&:hover': { backgroundColor: 'var(--mui-palette-action-hover)' } }} onClick={() => handleComplaintClick(complaint)}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar src="/assets/avatar-1.png" sx={{ width: 48, height: 48 }} />
                <Box flex={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontWeight={600}>Complaint #{complaint._id}</Typography>
                    <Typography variant="caption" color="black">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </Typography>
                  </Stack>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Type:{' '}
                      <Typography variant="caption" fontWeight={400} color='black'>
                        {complaint.type || complaint.issueType || 'N/A'}
                      </Typography>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Subject:{' '}
                      <Typography variant="caption" fontWeight={400} color='black'>
                        {complaint.issueType || 'N/A'}
                      </Typography>
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" mt={1}>
                    {complaint.description ? complaint.description.substring(0, 100) + '...' : 'No description'}
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ mt: 1 }} />
            </Box>
          ))
        )}
      </Box>
      {/* <Box sx={{ overflowX: 'auto', '--mui-palette-TableCell-border': 'transparent' }}>
        <DataTable<Product> columns={columns} hideHead rows={list} />
      </Box> */}
    </Card>
  );
}
