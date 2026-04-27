// app/(dashboard)/student/page.tsx

"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  Divider,
  Stack,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Modal,
  FormControl,
  InputLabel,
  Select,
  Alert,
  List,
  ListItem,
} from "@mui/material";
import { config } from "@/config";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { DataTable, type ColumnDef } from "@/components/core/data-table";
import { CustomersPagination } from "@/components/dashboard/customer/customers-pagination";
import {
  CheckCircleIcon,
  MinusIcon,
} from "@/components/icons";
import Grid from "@mui/material/Grid";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { Van as VanIcon } from "@phosphor-icons/react/dist/ssr/Van";
import { CheckCircle as CheckIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { Warning as WarningIcon } from "@phosphor-icons/react/dist/ssr/Warning";
import { XCircle as XIcon } from "@phosphor-icons/react/dist/ssr/XCircle";
import { Pencil as EditIcon } from "@phosphor-icons/react/dist/ssr/Pencil";
import { Trash as DeleteIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  getAllStudents,
  getStudentDetail,
  verifyStudentByAdmin,
  deleteStudentsAndRefetch,
  bulkUpdateStudentStatus,
  deleteStudents,
} from "@/store/reducers/student-slice";
import { assignVanToStudent, getAllSchoolVans, removeVanFromStudent } from "@/store/reducers/van-slice";
import type { StudentRecord } from "@/types/student";
import { StudentFilter, type Filters } from "./studentfilter";

export default function Page(): React.JSX.Element {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Set document title
    useEffect(() => {
      document.title = `${config.site.name} | Student List`;
    }, []);

  const { loading, students, pagination } = useSelector(
    (state: RootState) => state.student
  );

  const { vans } = useSelector((state: RootState) => state.van);

  const [localStudents, setLocalStudents] = React.useState<StudentRecord[]>([]);
  const [selectedStudents, setSelectedStudents] = React.useState<StudentRecord[]>([]);
  const [filters, setFilters] = React.useState<Filters>({});
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [updatingStatus, setUpdatingStatus] = React.useState<string | null>(null);
  const [bulkUpdating, setBulkUpdating] = React.useState(false);

  // 🔥 Menu States
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [headerActionAnchor, setHeaderActionAnchor] = React.useState<null | HTMLElement>(null);
  const [selectedStudent, setSelectedStudent] = React.useState<StudentRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  
  const isMenuOpen = Boolean(menuAnchorEl);

  // Sync localStudents with students from Redux
  React.useEffect(() => {
    setLocalStudents(students);
  }, [students]);

  // 🔁 Fetch on mount + whenever pagination/filters change
  React.useEffect(() => {
    dispatch(
      getAllStudents({
        page,
        limit,
        ...filters, // carNumber, driverName if present
      })
    );
  }, [dispatch, page, limit, filters]);

  // Fetch vans for assignment modal
  React.useEffect(() => {
    dispatch(getAllSchoolVans({ page: 1, limit: 1000 }));
  }, [dispatch]);

  // ─── Menu Handlers ───
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, student: StudentRecord) => {
    setMenuAnchorEl(e.currentTarget);
    setSelectedStudent(student);
  };

  const handleMenuClose = () => setMenuAnchorEl(null);

  const handleView = async () => {
    if (selectedStudent) {
      await dispatch(getStudentDetail(selectedStudent.student.id)).unwrap();
      router.push(`/student/${selectedStudent.student.id}`);
    }
    handleMenuClose();
  };

  
  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmDelete = async () => {
    if (!selectedStudent) return;
    
    try {
      setDeleteLoading(true);
      await dispatch(deleteStudents([selectedStudent.student.id])).unwrap();
      setDeleteDialogOpen(false);
      
      // Refresh the student list
      dispatch(getAllStudents({ page, limit, ...filters }));
    } catch (error) {
      console.error("Failed to delete student:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  // Refresh function to reload student data
  const handleRefresh = React.useCallback(() => {
    dispatch(
      getAllStudents({
        page,
        limit,
        ...filters,
      })
    );
  }, [dispatch, page, limit, filters]);

  // Bulk status update handlers
  const handleBulkActivate = async () => {
    if (selectedStudents.length === 0) return;
    
    try {
      setBulkUpdating(true);
      setHeaderActionAnchor(null); // Close menu
      const studentIds = selectedStudents.map(s => s.student.id);
      
      console.log('Bulk activating students:', { studentIds, status: 'active' });
      
      await dispatch(
        bulkUpdateStudentStatus({
          studentIds,
          status: 'active',
        })
      ).unwrap();

      // Refresh data and clear selection
      dispatch(getAllStudents({ page, limit, ...filters }));
      setSelectedStudents([]);
      
    } catch (error) {
      console.error("Failed to bulk activate students:", error);
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedStudents.length === 0) return;
    
    try {
      setBulkUpdating(true);
      setHeaderActionAnchor(null); // Close menu
      const studentIds = selectedStudents.map(s => s.student.id);
      
      console.log('Bulk deactivating students:', { studentIds, status: 'inActive' });
      
      await dispatch(
        bulkUpdateStudentStatus({
          studentIds,
          status: 'inActive',
        })
      ).unwrap();

      // Refresh data and clear selection
      dispatch(getAllStudents({ page, limit, ...filters }));
      setSelectedStudents([]);
      
    } catch (error) {
      console.error("Failed to bulk deactivate students:", error);
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedStudents.length} student(s)?`)) {
      try {
        setBulkUpdating(true);
        setHeaderActionAnchor(null); // Close menu
        const studentIds = selectedStudents.map(s => s.student.id);
        
        console.log('Bulk deleting students:', { studentIds });
        
        await dispatch(deleteStudentsAndRefetch(studentIds)).unwrap();
        
      } catch (error) {
        console.error("Failed to bulk delete students:", error);
      } finally {
        setBulkUpdating(false);
      }
    }
  };

  // Individual van assignment states
  const [vanModalOpen, setVanModalOpen] = React.useState(false);
  const [selectedVan, setSelectedVan] = React.useState("");
  const [assignmentResult, setAssignmentResult] = React.useState<any>(null);
  const [showResult, setShowResult] = React.useState(false);
  const [isAssigning, setIsAssigning] = React.useState(false);

  // Individual van assignment handlers
  const handleAssignVan = async () => {
    if (!selectedStudent || !selectedVan) return;

    try {
      setIsAssigning(true);
      
      console.log('Assigning van to student:', { studentId: selectedStudent.student.id, vanId: selectedVan });
      
      const result = await dispatch(assignVanToStudent({ 
        kidIds: [selectedStudent.student.id], 
        vanId: selectedVan 
      })).unwrap();
      
      setAssignmentResult(result);
      setShowResult(true);
      
      // Only close modal and refresh if assignment was successful
      if (result.summary?.assigned > 0) {
        setTimeout(() => {
          setVanModalOpen(false);
          setSelectedVan("");
          setShowResult(false);
          dispatch(getAllStudents({ page, limit, ...filters }));
        }, 3000);
      }
    } catch (err: any) {
      console.error('Assignment error:', err);
      setAssignmentResult({
        message: err.message || 'Failed to assign van',
        error: true
      });
      setShowResult(true);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveVan = async () => {
    if (!selectedStudent) return;

    if (window.confirm(`Are you sure you want to remove van from ${selectedStudent.student.fullname}?`)) {
      try {
        setIsAssigning(true);
        
        console.log('Removing van from student:', { studentId: selectedStudent.student.id });
        
        await dispatch(removeVanFromStudent({ 
          kidIds: [selectedStudent.student.id] 
        })).unwrap();
        
        // Refresh data
        dispatch(getAllStudents({ page, limit, ...filters }));
        setVanModalOpen(false);
        
      } catch (error) {
        console.error("Failed to remove van:", error);
      } finally {
        setIsAssigning(false);
      }
    }
  };

  const handleVanModalOpen = (action: 'assign' | 'remove') => {
    if (action === 'assign') {
      setSelectedVan(selectedStudent?.van?.id || "");
    }
    setVanModalOpen(true);
    handleMenuClose();
  };

  
  const columns: ColumnDef<StudentRecord>[] = [
    {
      name: "Student",
      width: "240px",
      formatter: (row): React.JSX.Element => {
        const name = row?.student?.fullname || "";
        const image = row?.student?.image;

        // Inline initials generator
        const initials = name
          .split(" ")
          .map((w) => w[0]?.toUpperCase())
          .join("");

        return (
          <Stack direction="row" spacing={1} alignItems="center">

            {image ? (
              <img
                src={image}
                alt={name}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#1976d2",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {initials}
              </div>
            )}

            <Typography color="text.primary" variant="body2">
              {name}
            </Typography>
          </Stack>
        );
      }
    }
    ,
    {
      name: "Parent/Guardian",
      width: "200px",
      formatter: (row): React.JSX.Element => (
        <Typography color="text.primary" variant="body2">
          {row.parent?.fullname}
        </Typography>
      ),
    },
    {
      name: "Class/Grade",
      width: "150px",
      formatter: (row): React.JSX.Element => (
        <Typography color="text.secondary" variant="body2">
          {row.student?.grade}
        </Typography>
      ),
    },
    {
      name: "Van Assigned",
      width: "150px",
      formatter: (row): React.JSX.Element => (
        <Typography color="text.secondary" variant="body2">
          {row.van?.carNumber || "N/A"}
        </Typography>
      ),
    },
    {
      name: "Driver",
      width: "180px",
      formatter: (row): React.JSX.Element => (
        <Typography color="text.secondary" variant="body2">
          {row.driver?.fullname || "N/A"}
        </Typography>
      ),
    },
    {
      name: "Status",
      width: "120px",
      formatter: (row): React.JSX.Element => {
        const mapping = {
          inActive: {
            label: "Inactive",
            icon: <MinusIcon color="var(--mui-palette-error-main)" />,
            color: "error" as const,
          },
          active: {
            label: "Active",
            icon: (
              <CheckCircleIcon
                color="var(--mui-palette-success-main)"
                weight="fill"
              />
            ),
            color: "success" as const,
          },
        } as const;

        const statusKey = (row.student?.status?.trim()?.toLowerCase() ||
          "inactive") as keyof typeof mapping;

        // Convert "inactive" to "inActive" for mapping
        const mappingKey = statusKey === "inactive" ? "inActive" : statusKey;

        // Debug: Log the actual status value from backend
        console.log('Student status debug:', {
          studentId: row.student.id,
          originalStatus: row.student?.status,
          normalizedStatus: statusKey,
          mappingKey: mappingKey
        });

        const { label, icon, color } = mapping[mappingKey] ?? mapping.inActive;

        const handleStatusClick = async () => {
          if (updatingStatus) return; // Prevent multiple clicks
          
          try {
            setUpdatingStatus(row.student.id);
            
            // Toggle status - ensure case-insensitive comparison
            const currentStatus = row.student.status?.trim()?.toLowerCase() || "inactive";
            const newStatus = currentStatus === "active" ? "inActive" : "active";

            console.log("Updating status:", { id: row.student.id, currentStatus, newStatus });

            // Optimistic update
            setLocalStudents(prev => prev.map(s => {
              if (s.student.id === row.student.id) {
                return { ...s, student: { ...s.student, status: newStatus } };
              }
              return s;
            }));

            await dispatch(
              verifyStudentByAdmin({
                id: row.student.id,
                status: newStatus,
              })
            ).unwrap();

            // Refresh the data to ensure UI is updated
            dispatch(getAllStudents({ page, limit, ...filters }));

          } catch (error) {
            console.error("Failed to toggle student status:", error);
            // Revert on error
            setLocalStudents(students);
          } finally {
            setUpdatingStatus(null);
          }
        };


        return (
          <Chip
            icon={icon}
            label={updatingStatus === row.student.id ? "Updating..." : label}
            size="small"
            color={color}
            variant="outlined"
            onClick={handleStatusClick}
            disabled={updatingStatus !== null}
            sx={{
              cursor: updatingStatus ? 'not-allowed' : 'pointer',
              '&:hover': {
                backgroundColor: updatingStatus ? 'transparent' : 'action.hover',
              }
            }}
          />
        );
      },
    },
    {
      name: "Actions",
      width: "100px",
      align: "right",
      formatter: (row) => {
        return (
          <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
            <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
              <MoreVertIcon />
            </IconButton>
          </Stack>
        );
      },
    },
  ];

  return (
    <Box sx={{ bgcolor: "var(--mui-palette-background-level1)", p: 3 }}>
      <Stack spacing={3}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5">Student List</Typography>
        </Box>

        <Card>
        <StudentFilter
          filters={filters}
          setFilters={(updater) => {
            setPage(1); // reset page on filter change
            setFilters((prev) =>
              typeof updater === "function" ? updater(prev) : updater
            );
          }}
          selected={selectedStudents}
          onRefresh={handleRefresh}
        />
        <Box sx={{ overflowX: "auto" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : students?.length ? (
            <DataTable<any>
              columns={columns}
              rows={localStudents}
              selectable
              onSelectionChange={(_, rows) =>
                setSelectedStudents(rows as StudentRecord[])
              }
            />
          ) : (
            <Box sx={{ p: 3 }}>
              <Typography
                color="text.secondary"
                sx={{ textAlign: "center" }}
                variant="body2"
              >
                No Data found
              </Typography>
            </Box>
          )}
        </Box>
        <Divider />
        <CustomersPagination
          count={pagination?.total || 0}
          page={(page || 1) - 1}
          rowsPerPage={limit}
          onPaginationChange={(_, newPage) => {
            setPage(newPage + 1);
            setSelectedStudents([]);
          }}
          onRowsPerPageChange={(event) => {
            const newLimit = parseInt(event.target.value, 10);
            setLimit(newLimit);
            setPage(1);
            setSelectedStudents([]);
          }}
        />
        </Card>
      </Stack>

      {/* ─── MENU ─── */}
      <Menu anchorEl={menuAnchorEl} open={isMenuOpen} onClose={handleMenuClose}>
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <EyeIcon size={18} />
          </ListItemIcon>
          View
        </MenuItem>

        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon size={18} />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* ─── DELETE CONFIRMATION DIALOG ─── */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Student"
        message={`Are you sure you want to delete this student "${selectedStudent?.student?.fullname}"?`}
        confirmText="Delete Student"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={deleteLoading}
      />

      {/* ─── VAN ASSIGNMENT MODAL ─── */}
      <Modal open={vanModalOpen} onClose={() => {
        setVanModalOpen(false);
        setShowResult(false);
        setAssignmentResult(null);
        setSelectedVan("");
      }}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            p: 4,
            width: showResult ? 600 : 500,
            maxHeight: "80vh",
            overflowY: "auto",
            borderRadius: 2,
          }}
        >
          {!showResult ? (
            <>
              <Typography variant="h6" mb={2}>
                Van Management
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={2}>
                Student: {selectedStudent?.student?.fullname}
              </Typography>

              {/* Current Van Status */}
              <Box mb={3}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Current Van: {selectedStudent?.van?.carNumber || 'No van assigned'}
                </Typography>
                {selectedStudent?.student?.vanId && (
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={handleRemoveVan}
                    disabled={isAssigning}
                    sx={{ mb: 2 }}
                  >
                    Remove Current Van
                  </Button>
                )}
              </Box>

              {/* Assign New Van */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" mb={2}>
                Assign New Van
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Select Van</InputLabel>
                <Select
                  value={selectedVan}
                  label="Select Van"
                  onChange={(e) => setSelectedVan(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 250,
                        overflowY: "auto",
                      },
                    },
                  }}
                >
                  {vans
                    .filter((item) => item.van.status?.toLowerCase() === 'active')
                    .map((item) => (
                      <MenuItem key={item.van.id} value={item.van.id}>
                        {item.van.vehicleType} — {item.van.carNumber}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => {
                  setVanModalOpen(false);
                  setSelectedVan("");
                }}>
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  disabled={!selectedVan || isAssigning}
                  onClick={handleAssignVan}
                >
                  {isAssigning ? 'Assigning...' : 'Assign Van'}
                </Button>
              </Stack>
            </>
          ) : (
            <>
              {/* Assignment Results */}
              <Typography variant="h6" mb={2}>
                Van Assignment Result
              </Typography>

              {assignmentResult?.error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {assignmentResult.message}
                </Alert>
              ) : (
                <>
                  {/* Summary */}
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {assignmentResult?.message || 'Van assignment processed successfully'}
                  </Alert>

                  {assignmentResult?.summary && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Summary:
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          • Total Requested: {assignmentResult.summary.totalRequested}
                        </Typography>
                        <Typography variant="body2" color="success.main">
                          • Successfully Assigned: {assignmentResult.summary.assigned}
                        </Typography>
                        <Typography variant="body2" color="info.main">
                          • Already in this Van: {assignmentResult.summary.alreadySameVan}
                        </Typography>
                        <Typography variant="body2" color="warning.main">
                          • Assigned to Other Van: {assignmentResult.summary.differentVan}
                        </Typography>
                      </Stack>
                    </Box>
                  )}

                  {/* Details */}
                  {assignmentResult?.details && (
                    <>
                      <Typography variant="subtitle2" gutterBottom>
                        Details:
                      </Typography>
                      
                      {/* Successfully Assigned */}
                      {assignmentResult.details.assignedKids?.length > 0 && (
                        <Box mb={2}>
                          <Typography variant="body2" color="success.main" gutterBottom>
                             Successfully Assigned:
                          </Typography>
                          <List dense>
                            {assignmentResult.details.assignedKids.map((kid: any) => (
                              <ListItem key={kid.id} sx={{ py: 0 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <CheckIcon color="green" size={16} />
                                </ListItemIcon>
                                <ListItemText primary={kid.name} />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}

                      {/* Already Same Van */}
                      {assignmentResult.details.alreadySameVanKids?.length > 0 && (
                        <Box mb={2}>
                          <Typography variant="body2" color="info.main" gutterBottom>
                            ℹ️ Already in this Van:
                          </Typography>
                          <List dense>
                            {assignmentResult.details.alreadySameVanKids.map((kid: any) => (
                              <ListItem key={kid.id} sx={{ py: 0 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <WarningIcon color="blue" size={16} />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={kid.name}
                                  secondary={kid.reason}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}

                      {/* Different Van */}
                      {assignmentResult.details.differentVanKids?.length > 0 && (
                        <Box mb={2}>
                          <Typography variant="body2" color="warning.main" gutterBottom>
                            ⚠️ Remove from current van then assign this van:
                          </Typography>
                          <List dense>
                            {assignmentResult.details.differentVanKids.map((kid: any) => (
                              <ListItem key={kid.id} sx={{ py: 0 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <XIcon color="orange" size={16} />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={kid.name}
                                  secondary={kid.reason}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </>
                  )}

                  {/* Driver Notification */}
                  {assignmentResult?.driverNotification?.sent && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      📱 Driver notification sent ({assignmentResult.driverNotification.assignedCount} students)
                    </Alert>
                  )}
                  
                  {/* Close Button */}
                  <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
                    <Button 
                      variant="contained" 
                      onClick={() => {
                        setVanModalOpen(false);
                        setShowResult(false);
                        setAssignmentResult(null);
                        setSelectedVan("");
                      }}
                    >
                      Close
                    </Button>
                  </Stack>
                </>
              )}
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
