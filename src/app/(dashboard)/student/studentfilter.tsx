// app/(dashboard)/student/studentfilter.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import { Trash, Van as VanIcon } from "@phosphor-icons/react";
import { Menu, MenuItem, ListItemIcon, ListItemText, Modal, Select, InputLabel, Alert, List, ListItem, Box } from "@mui/material";
import { CheckCircleIcon, MinusIcon } from "@/components/icons";
import Grid from "@mui/material/Grid";
import {
  FilterButton,
  FilterPopover,
  useFilterContext,
} from "@/components/core/filter-button";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { deleteStudentsAndRefetch, bulkUpdateStudentStatus } from "@/store/reducers/student-slice";
import { assignVanToStudent, getAllSchoolVans, removeVanFromStudent } from "@/store/reducers/van-slice";
import { CheckCircle as CheckIcon, Warning as WarningIcon, XCircle as XIcon } from "@phosphor-icons/react/dist/ssr";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";

export interface Filters {
  carNumber?: string;
  driverName?: string;
  kidsName?: string;
  parentName?: string;
  grade?: string;
}

interface StudentFilterProps {
  filters: Filters;
  setFilters: (updater: Filters | ((prev: Filters) => Filters)) => void;
  selected: any[];
  onRefresh?: () => void;
}

export function StudentFilter({
  filters,
  setFilters,
  selected,
  onRefresh,
}: StudentFilterProps): React.JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const vans = useSelector((state: RootState) => state.van.vans);
  const [actionAnchor, setActionAnchor] = useState<null | HTMLElement>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Van assignment states
  const [vanModalOpen, setVanModalOpen] = useState(false);
  const [selectedVan, setSelectedVan] = useState("");
  const [assignmentResult, setAssignmentResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [bulkResultModalOpen, setBulkResultModalOpen] = useState(false);

  // Van removal states
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removalResult, setRemovalResult] = useState<any>(null);
  const [showRemovalResult, setShowRemovalResult] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  // ✅ ADD THIS HERE
const getReasonMessage = (reason: string) => {
  switch (reason) {
    case "ALREADY_ASSIGNED_TO_THIS_VAN":
      return "Already assigned to this van";

    case "ASSIGNED_TO_OTHER_VAN":
      return "Already Assigned to another van";

    default:
      return reason;
  }
};

  const handleFilterChange = useCallback(
    (key: keyof Filters, value?: string) => {
      setFilters((prev: Filters) => {
        const next = { ...prev };
        if (!value) {
          delete next[key];
        } else {
          next[key] = value;
        }
        return next;
      });
    },
    [setFilters]
  );

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, [setFilters]);

  const hasFilters = Object.values(filters || {}).some((val) => !!val);

  // Fetch vans on mount
  useEffect(() => {
    dispatch(getAllSchoolVans({ page: 1, limit: 1000 }));
  }, [dispatch]);

  // Bulk van assignment handlers
  const handleBulkVanAssign = async () => {
    if (selected.length === 0 || !selectedVan) return;

    try {
      setIsAssigning(true);
      const studentIds = selected.map(s => s.student.id);

      console.log('Bulk assigning van to students:', { studentIds, vanId: selectedVan });

      const result = await dispatch(assignVanToStudent({
        kidIds: studentIds,
        vanId: selectedVan
      })).unwrap();

      // Set result and show modal
      setAssignmentResult(result);
      setBulkResultModalOpen(true);

      // Close assignment modal and refresh
      setVanModalOpen(false);
      setSelectedVan("");
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      console.error('Bulk assignment error:', err);
      setAssignmentResult({
        message: err.message || 'Failed to assign van',
        error: true
      });
      setBulkResultModalOpen(true);
    } finally {
      setIsAssigning(false);
    }
  };


  const handleVanModalOpen = (action: 'assign' | 'remove') => {
    if (action === 'assign') {
      setSelectedVan("");
      setVanModalOpen(true);
    } else if (action === 'remove') {
      setRemoveModalOpen(true);
    }
    setActionAnchor(null);
  };

  const handleBulkVanRemove = async () => {
    if (selected.length === 0) return;

    if (window.confirm(`Are you sure you want to remove van from ${selected.length} student(s)?`)) {
      try {
        setIsRemoving(true);
        const studentIds = selected.map(s => s.student.id);

        console.log('Bulk removing van from students:', { studentIds });

        const result = await dispatch(removeVanFromStudent({
          kidIds: studentIds
        })).unwrap();


        // Close modal immediately and refresh
        setRemoveModalOpen(false);
        if (onRefresh) {
          onRefresh();
        }

      } catch (err: any) {
        console.error('Bulk removal error:', err);
        setRemovalResult({
          message: err.message || 'Failed to remove van',
          error: true
        });
        setShowRemovalResult(true);
      } finally {
        setIsRemoving(false);
      }
    }
  };

  const handleBulkDelete = () => {
    console.log('Selected data structure for delete:', selected);
    const ids = selected
      ?.map((item: any) => item?.student?.id || item?.id)
      .filter(Boolean);

    console.log('Extracted IDs for delete:', ids);

    if (!ids.length) {
      alert('Please select at least one student to delete');
      return;
    }

    // Open confirmation dialog instead of window.confirm
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    const ids = selected
      ?.map((item: any) => item?.student?.id || item?.id)
      .filter(Boolean);

    try {
      setBulkUpdating(true);
      setActionAnchor(null);
      setDeleteDialogOpen(false);
      await dispatch(deleteStudentsAndRefetch(ids));
    } catch (error) {
      console.error("Failed to delete students:", error);
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  const handleBulkActivate = async () => {
    console.log('🔍 Selected data structure:', selected);
    const ids = selected
      ?.map((item: any) => item?.student?.id || item?.id)
      .filter(Boolean);

    console.log('Extracted IDs:', ids);

    if (!ids.length) return;

    try {
      setBulkUpdating(true);
      setActionAnchor(null);
      await dispatch(
        bulkUpdateStudentStatus({
          studentIds: ids,
          status: 'active',
        })
      );
      // Refresh data to show updated status
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to activate students:", error);
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkDeactivate = async () => {
    const ids = selected
      ?.map((item: any) => item?.student?.id || item?.id)
      .filter(Boolean);

    if (!ids.length) return;

    try {
      setBulkUpdating(true);
      setActionAnchor(null);
      await dispatch(
        bulkUpdateStudentStatus({
          studentIds: ids,
          status: 'inActive',
        })
      );
      // Refresh data to show updated status
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to deactivate students:", error);
    } finally {
      setBulkUpdating(false);
    }
  };

  return (
    <div>
      <Divider />

      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: "center", flexWrap: "wrap", px: 3, py: 2 }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: "center", flex: "1 1 auto", flexWrap: "wrap" }}
        >
          {/* 🔍 Car Number */}
          <FilterButton
            displayValue={filters?.carNumber || ""}
            label="Car Number"
            onFilterApply={(value) =>
              handleFilterChange("carNumber", value as string)
            }
            onFilterDelete={() => handleFilterChange("carNumber", "")}
            popover={<GenericFilterPopover field="Car Number" />}
            value={filters?.carNumber || ""}
          />

          {/*  Driver Name */}
          <FilterButton
            displayValue={filters?.driverName || ""}
            label="Driver Name"
            onFilterApply={(value) =>
              handleFilterChange("driverName", value as string)
            }
            onFilterDelete={() => handleFilterChange("driverName", "")}
            popover={<GenericFilterPopover field="Driver Name" />}
            value={filters?.driverName || ""}
          />
          <FilterButton
            displayValue={filters?.kidsName || ""}
            label="Student Name"
            onFilterApply={(value) =>
              handleFilterChange("kidsName", value as string)
            }
            onFilterDelete={() => handleFilterChange("kidsName", "")}
            popover={<GenericFilterPopover field="Student Name" />}
            value={filters?.kidsName || ""}
          />
          <FilterButton
            displayValue={filters?.parentName || ""}
            label="Parent Name"
            onFilterApply={(value) =>
              handleFilterChange("parentName", value as string)
            }
            onFilterDelete={() => handleFilterChange("parentName", "")}
            popover={<GenericFilterPopover field="Parent Name" />}
            value={filters?.parentName || ""}
          />
          {/* 🔍 Grade */}
          <FilterButton
            displayValue={filters?.grade || ""}
            label="Class/Grade"
            onFilterApply={(value) =>
              handleFilterChange("grade", value as string)
            }
            onFilterDelete={() => handleFilterChange("grade", "")}
            popover={<GenericFilterPopover field="Grade" />}
            value={filters?.grade || ""}
          />
          {hasFilters ? (
            <Button onClick={handleClearFilters}>Clear filters</Button>
          ) : null}
        </Stack>

        {selected.length > 0 && (
          <>
            <Typography variant="body2" sx={{ alignSelf: "center" }}>
              {selected.length} selected
            </Typography>
            <Button
              variant="contained"
              onClick={(e) => setActionAnchor(e.currentTarget)}
              disabled={bulkUpdating}
            >
              Action
            </Button>
          </>
        )}

        <Menu
          anchorEl={actionAnchor}
          open={Boolean(actionAnchor)}
          onClose={() => setActionAnchor(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleBulkActivate}>
            <ListItemIcon>
              <CheckCircleIcon color="var(--mui-palette-success-main)" />
            </ListItemIcon>
            <ListItemText>Activate All</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleBulkDeactivate}>
            <ListItemIcon>
              <MinusIcon color="var(--mui-palette-error-main)" />
            </ListItemIcon>
            <ListItemText>Inactive All</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleBulkDelete}>
            <ListItemIcon sx={{ color: "error.main" }}>
              <Trash weight="fill" />
            </ListItemIcon>
            <ListItemText>Delete All</ListItemText>
          </MenuItem>

          <MenuItem onClick={() => handleVanModalOpen('assign')}>
            <ListItemIcon>
              <VanIcon size={18} />
            </ListItemIcon>
            <ListItemText>Assign Van</ListItemText>
          </MenuItem>

          <MenuItem onClick={() => handleVanModalOpen('remove')}>
            <ListItemIcon sx={{ color: "error.main" }}>
              <VanIcon size={18} />
            </ListItemIcon>
            <ListItemText>Remove Van</ListItemText>
          </MenuItem>
        </Menu>

        {/* ─── BULK VAN ASSIGNMENT MODAL ─── */}
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
              width: 500,
              maxHeight: "80vh",
              overflowY: "auto",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" mb={2}>
              Bulk Van Assignment
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={2}>
              Assign van to {selected.length} selected student{selected.length > 1 ? 's' : ''}
            </Typography>

            {/* Selected Students Summary */}
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Students:
              </Typography>
              <Box sx={{ maxHeight: 150, overflowY: 'auto', border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}>
                {selected.map((student, index) => (
                  <Typography key={student.student.id} variant="body2" sx={{ py: 0.5 }}>
                    {index + 1}. {student.student.fullname}
                  </Typography>
                ))}
              </Box>
            </Box>

            {/* Van Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Van</InputLabel>
              <Select
                value={selectedVan}
                label="Select Van"
                onChange={(e) => setSelectedVan(e.target.value)}
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
                onClick={handleBulkVanAssign}
              >
                {isAssigning ? 'Assigning...' : 'Assign Van'}
              </Button>
            </Stack>

          </Box>
        </Modal>

        {/* ─── BULK VAN REMOVAL MODAL ─── */}
        <Modal open={removeModalOpen} onClose={() => {
          setRemoveModalOpen(false);
          setShowRemovalResult(false);
          setRemovalResult(null);
        }}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              p: 4,
              width: 500,
              maxHeight: "80vh",
              overflowY: "auto",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" mb={2}>
              Bulk Van Removal
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={2}>
              Remove van from {selected.length} selected student{selected.length > 1 ? 's' : ''}
            </Typography>

            {/* Selected Students Summary */}
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Students:
              </Typography>
              <Box sx={{ maxHeight: 150, overflowY: 'auto', border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}>
                {selected.map((student, index) => (
                  <Typography key={student.student.id} variant="body2" sx={{ py: 0.5 }}>
                    {index + 1}. {student.student.fullname} - {student.van?.carNumber || 'No van assigned'}
                  </Typography>
                ))}
              </Box>
            </Box>

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => {
                setRemoveModalOpen(false);
              }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                disabled={isRemoving}
                onClick={handleBulkVanRemove}
              >
                {isRemoving ? 'Removing...' : 'Remove Van'}
              </Button>
            </Stack>

          </Box>
        </Modal>

        {/* ─── BULK ASSIGNMENT RESULT MODAL ─── */}
        <Modal open={bulkResultModalOpen} onClose={() => {
          setBulkResultModalOpen(false);
          setAssignmentResult(null);
        }}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              p: 4,
              width: 600,
              maxHeight: "80vh",
              overflowY: "auto",
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {assignmentResult?.error ? 'Assignment Failed' : 'Bulk Assign'}
              </Typography>
              
              {/* Summary Counts in Top Right */}
              {assignmentResult?.summary && (
                <Box sx={{ textAlign: 'right' }}>
                  {assignmentResult.summary?.alreadySameVan > 0 && (
                    <Typography variant="body2" color="info.main" sx={{ mb: 1 }}>
                      Already in this Van: {assignmentResult.summary.alreadySameVan}
                    </Typography>
                  )}
                  {assignmentResult.summary?.differentVan > 0 && (
                    <Typography variant="body2" color="warning.main">
                      Different Van: {assignmentResult.summary.differentVan}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            {assignmentResult?.error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {assignmentResult.message}
              </Alert>
            ) : (
              <>
                {/* Summary */}
                {/* <Alert severity="success" sx={{ mb: 2 }}>
                  {assignmentResult?.message || 'Van assignment processed successfully'}
                </Alert> */}

                {assignmentResult && (
                  <Box>
                    <Grid container spacing={2}>

                      {/* Student Details */}
                      <Grid item xs={12}>
                        {assignmentResult?.details && (
                          <Box>
                            {/* <Typography variant="subtitle2" gutterBottom>
                              Student Details:
                            </Typography> */}

                            {/* Assigned */}
                            {assignmentResult.details.assignedKids?.length > 0 && (
                              <Box mb={2}>
                                <Typography variant="body2" color="success.main">
                                  Successfully Assigned:
                                </Typography>
                                <List dense>
                                  {assignmentResult.details.assignedKids.map((kid: any) => (
                                    <ListItem key={kid.id}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <Typography variant="body2">{kid.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">{getReasonMessage(kid.reason)}</Typography>
                                      </Box>
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            )}

                            {/* Already Same Van */}
                            {assignmentResult.details.alreadySameVanKids?.length > 0 && (
                              <Box mb={2}>
                                <Typography variant="body2" color="info.main">
                                  {assignmentResult.details.alreadySameVanKids[0]?.reason === 'ALREADY_ASSIGNED_TO_THIS_VAN' ? 'Already Assign Van :' : 'Already in this Van:'}
                                </Typography>
                                <List dense>
                                  {assignmentResult.details.alreadySameVanKids.map((kid: any, index: number) => (
                                    <ListItem key={kid.id}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <Typography variant="body2">{kid.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">{getReasonMessage(kid.reason)}</Typography>
                                      </Box>
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            )}
                          </Box>
                        )}
                      </Grid>

                      
                      {/* Different Van Details */}
                      <Grid item xs={12}>
                        {assignmentResult?.details?.differentVanKids?.length > 0 && (
                          <Box mb={2}>
                            <Typography variant="body2" color="warning.main">
                              {assignmentResult.details.differentVanKids[0]?.reason === 'ASSIGNED_TO_OTHER_VAN' ? 'Assign Other Van :' : 'Different Van:'}
                            </Typography>
                            <List dense>
                              {assignmentResult.details.differentVanKids.map((kid: any) => (
                                <ListItem key={kid.id}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <Typography variant="body2">{kid.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">{getReasonMessage(kid.reason)}</Typography>
                                  </Box>
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                      </Grid>

                    </Grid>
                  </Box>
                )}

                
              </>
            )}

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="contained"
                onClick={() => {
                  setBulkResultModalOpen(false);
                  setAssignmentResult(null);
                }}
              >
                Close
              </Button>
            </Stack>
          </Box>
        </Modal>

        {/* ─── DELETE CONFIRMATION DIALOG ─── */}
        <ConfirmationDialog
          open={deleteDialogOpen}
          title={selected.length === 1 ? 'Delete Student' : 'Delete Students'}
          message={
            selected.length === 1
              ? 'Are you sure you want to delete this student?'
              : `Are you sure you want to delete ${selected.length} students?`
          }
          confirmText={selected.length === 1 ? 'Delete' : `Delete ${selected.length}`}
          confirmColor="error"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          loading={bulkUpdating}
        />
      </Stack>
    </div>
  );
}

function GenericFilterPopover({ field }: { field: string }) {
  const { anchorEl, onApply, onClose, open, value: initialValue } =
    useFilterContext();
  const [value, setValue] = useState(initialValue || "");

  useEffect(() => {
    setValue(initialValue || "");
  }, [initialValue]);

  return (
    <FilterPopover
      anchorEl={anchorEl}
      onClose={onClose}
      open={open}
      title={`Filter by ${field}`}
    >
      <FormControl>
        <OutlinedInput
          onChange={(e) => setValue(e.target.value)}
          onKeyUp={(e) => e.key === "Enter" && onApply(value)}
          value={value}
        />
      </FormControl>
      <Button onClick={() => onApply(value)} variant="contained">
        Apply
      </Button>
    </FilterPopover>
  );
}