"use client";

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { PencilSimple as PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { paths } from '@/paths';
import { getAllComplaints, getComplaintById, changeComplaintStatus } from '@/store/reducers/complaint-management';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';

export default function TicketDetailPage(): React.JSX.Element {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.ticketId as string;
  const dispatch = useDispatch<AppDispatch>();
  const { complaints, loading } = useSelector((state: RootState) => state.complaint);

  const [ticket, setTicket] = React.useState<any>(null);
  const [status, setStatus] = React.useState('In Progress');
  const [internalNote, setInternalNote] = React.useState('');

  // Fetch specific complaint by ID
  React.useEffect(() => {
    if (ticketId) {
      dispatch(getComplaintById(ticketId));
    }
  }, [dispatch, ticketId]);

  // Find specific ticket when complaints are loaded
  React.useEffect(() => {
    if (complaints && ticketId) {
      const foundTicket = complaints.find((c: any) => c._id === ticketId);
      if (foundTicket) {
        setTicket(foundTicket);
        setStatus(foundTicket.status);
      }
    }
  }, [complaints, ticketId]);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
  };

  const handleAddNote = async () => {
    if (!internalNote.trim()) return;
    
    try {
      await dispatch(changeComplaintStatus({
        reportId: ticketId,
        status: status,
        adminRemarks: internalNote
      })).unwrap();
      
      setInternalNote('');
      dispatch(getComplaintById(ticketId));
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Button startIcon={<ArrowLeftIcon />} onClick={() => router.back()}>
        Back to Tickets
      </Button>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : ticket ? (
        <Stack spacing={3} mt={3}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              {/* Top: Avatar + Parent Info + Status */}
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                {/* Left: Avatar + Info */}
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar src="/assets/avatar-3.png" sx={{ width: 56, height: 56 }} />
                  <Box>
                    <Typography variant="h6">{ticket.parentName || 'Parent Name N/A'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Type: {ticket.type || ticket.issueType || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                {/* Right: Status Chip */}
                <Chip
                  label={status}
                  color={
                    status === 'Resolved' || status === 'closed'
                      ? 'success'
                      : status === 'Rejected'
                        ? 'error'
                        : 'warning'
                  }
                  sx={{ alignSelf: 'flex-start', fontWeight: 500 }}
                />
              </Box>

              {/* Subject & Report Message (6/6) */}
              <Box display="flex" gap={2} mt={3} flexWrap="wrap">
                <Box flex={{ xs: '100%', md: 1 }} minWidth={0}>
                  <Typography variant="subtitle1" fontWeight={500}>
                    Subject:
                  </Typography>
                  <Typography variant="body2">{ticket.issueType || 'N/A'}</Typography>
                </Box>
                <Box flex={{ xs: '100%', md: 1 }} minWidth={0}>
                  <Typography variant="subtitle1" fontWeight={500}>
                    Report Message:
                  </Typography>
                  <Typography variant="body2">{ticket.description || 'No description available'}</Typography>
                </Box>
              </Box>

              {/* Image & Audio (6/6) */}
              <Box display="flex" gap={2} mt={3} flexWrap="wrap">
                {ticket.image && (
                  <Box flex={{ xs: '100%', md: 1 }} minWidth={0}>
                    <Typography variant="caption">Complaint Image:</Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: 300, // fixed container height
                        mt: 1,
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '1px solid #ddd',
                      }}
                    >
                      <img
                        src={ticket.image}
                        alt="Complaint"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </Box>
                  </Box>
                )}
                {ticket.audio && (
                  <Box flex={{ xs: '100%', md: 1 }} minWidth={0}>
                    <Typography variant="caption">Complaint Audio:</Typography>
                    <audio controls style={{ width: '100%', marginTop: 4 }}>
                      <source src={ticket.audio} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>


          <Card>
            <CardHeader title="Manage Ticket" />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  select
                  label="Update Status"
                  SelectProps={{ native: true }}
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="acknowledge">Acknowledge</option>
                  <option value="closed">Closed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </TextField>

                <TextField
                  label="Internal Note"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  multiline
                  rows={3}
                  placeholder="e.g. Parent called again. Escalated to admin."
                />
                <Button variant="contained" onClick={handleAddNote}>
                  Add Note
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ p: 2 }}>
            <CardHeader title="Ticket History" />
            <CardContent>
              <Box display="flex" flexWrap="wrap" gap={2}>
                {ticket?.createdAt && (
                  <Box
                    flex={{ xs: '100%', md: '48%' }}
                    p={2}
                    sx={{
                      borderRadius: 1,
                      backgroundColor: '#f5f5f5',
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" color="text.secondary">
                        {new Date(ticket.createdAt).toLocaleString()}
                      </Typography>
                      <Chip
                        label="Created"
                        size="small"
                        sx={{ fontWeight: 500 }}
                        color="info"
                      />
                    </Box>
                    <Box mt={1}>
                      <Typography variant="body2" color="text.primary">
                        Ticket created by parent
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                {ticket?.status && (
                  <Box
                    flex={{ xs: '100%', md: '48%' }}
                    p={2}
                    sx={{
                      borderRadius: 1,
                      backgroundColor: '#f5f5f5',
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" color="text.secondary">
                        {new Date().toLocaleString()}
                      </Typography>
                      <Chip
                        label={ticket.status}
                        size="small"
                        sx={{ fontWeight: 500 }}
                        color={
                          ticket.status.toLowerCase() === 'resolved' || ticket.status.toLowerCase() === 'closed'
                            ? 'success'
                            : ticket.status.toLowerCase() === 'rejected'
                              ? 'error'
                              : 'warning'
                        }
                      />
                    </Box>
                    <Box mt={1}>
                      <Typography variant="body2" color="text.primary">
                        Current status: {ticket.status}
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                {ticket?.adminRemarks && (
                  <Box
                    flex={{ xs: '100%', md: '48%' }}
                    p={2}
                    sx={{
                      borderRadius: 1,
                      backgroundColor: '#e3f2fd',
                      border: '1px solid #bbdefb',
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" color="text.secondary">
                        {new Date().toLocaleString()}
                      </Typography>
                      <Chip
                        label="Note"
                        size="small"
                        sx={{ fontWeight: 500 }}
                        color="info"
                      />
                    </Box>
                    <Box mt={1}>
                      <Typography variant="body2" color="text.primary">
                        {ticket.adminRemarks}
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                {!ticket?.createdAt && (
                  <Typography variant="body2" color="text.secondary">
                    No history available
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

        </Stack>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6">Ticket not found</Typography>
          <Button variant="outlined" onClick={() => router.push('/parents')} sx={{ mt: 2 }}>
            Back to All Tickets
          </Button>
        </Box>
      )}
    </Box>
  );
}
