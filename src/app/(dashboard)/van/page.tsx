// app/(dashboard)/vans/page.tsx

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  Divider,
  Stack,
  Typography,
  Chip,
  CircularProgress,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Plus as PlusIcon, DotsThreeVertical as MoreIcon } from "@phosphor-icons/react";
import { DataTable, type ColumnDef } from "@/components/core/data-table";
import { CustomersPagination } from "@/components/dashboard/customer/customers-pagination";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { getAllSchoolVans, bulkUpdateVanStatus, deleteVans, resetBulkStatus, resetDeleteVan, removeDriverFromVan, resetRemoveDriver, deleteVanById } from "@/store/reducers/van-slice";
import { VanFilter, type VanFilters } from "./driverfilter";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { Pencil as EditIcon } from "@phosphor-icons/react/dist/ssr/Pencil";
import { UserMinus as RemoveDriverIcon } from "@phosphor-icons/react/dist/ssr/UserMinus";
import { Trash as DeleteIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { CheckCircleIcon, MinusIcon } from "@/components/icons";

export default function Page(): React.JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { vans, loading, pagination, bulkStatusLoading, bulkStatusSuccess, bulkStatusError, deleteVanLoading, deleteVanSuccess, deleteVanError, removeDriverLoading, removeDriverSuccess, removeDriverError } = useSelector(
    (state: RootState) => state.van
  );

  const [localVans, setLocalVans] = React.useState<any[]>([]);
  const [selectedVans, setSelectedVans] = React.useState<any[]>([]);
  const [filters, setFilters] = React.useState<VanFilters>({});
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = React.useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [vanToDelete, setVanToDelete] = React.useState<any>(null);

  // Sync localVans with vans from Redux
  React.useEffect(() => {
    setLocalVans(vans);
  }, [vans]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, row: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleView = () => {
    if (selectedRow) {
      router.push(`/van/${selectedRow?.van?._id || selectedRow?.van?.id}`);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedRow) {
      router.push(`/van/edit/${selectedRow?.van?._id || selectedRow?.van?.id}`);
    }
    handleMenuClose();
  };

  const handleRemoveDriver = async () => {
    if (selectedRow?.van?.driverId) {
      if (window.confirm('Are you sure you want to remove the driver from this van?')) {
        try {
          await dispatch(removeDriverFromVan({
            driverId: selectedRow.van.driverId,
            vanId: selectedRow?.van?._id || selectedRow?.van?.id
          })).unwrap();

          // Refresh the list
          dispatch(
            getAllSchoolVans({
              page,
              limit,
              ...filters,
            })
          );
        } catch (error) {
          console.error("Failed to remove driver:", error);
        }
      }
    } else {
      alert('No driver assigned to this van');
    }
    handleMenuClose();
  };

  const handleBulkStatusUpdate = (vanIds: string[], status: string) => {
    dispatch(bulkUpdateVanStatus({ vanIds, status }));
  };

  const handleDelete = () => {
    if (selectedRow) {
      setVanToDelete(selectedRow);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleConfirmDelete = async () => {
    if (vanToDelete?.van?._id || vanToDelete?.van?.id) {
      try {
        const vanId = vanToDelete?.van?._id || vanToDelete?.van?.id;
        await dispatch(deleteVanById({ vanId })).unwrap();
        
        // Refresh the list
        dispatch(
          getAllSchoolVans({
            page,
            limit,
            ...filters,
          })
        );
      } catch (error) {
        console.error("Failed to delete van:", error);
      }
    }
    setDeleteDialogOpen(false);
    setVanToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setVanToDelete(null);
  };

  const handleBulkDelete = async (vanIds: string[]) => {
    if (window.confirm(`Are you sure you want to delete ${vanIds.length} van(s)?`)) {
      try {
        // First, remove drivers from vans that have drivers assigned
        const vansWithDrivers = selectedVans.filter(van => van?.van?.driverId);

        if (vansWithDrivers.length > 0) {
          console.log('Removing drivers from vans before deletion...');

          // Remove drivers from all vans that have drivers
          const removeDriverPromises = vansWithDrivers.map(van =>
            dispatch(removeDriverFromVan({
              driverId: van.van.driverId,
              vanId: van?.van?._id || van?.van?.id
            })).unwrap()
          );

          await Promise.all(removeDriverPromises);
          console.log('All drivers removed successfully');
        }

        // Now delete the vans
        await dispatch(deleteVans({ vanIds })).unwrap();

      } catch (error) {
        console.error("Failed to delete vans:", error);
      }
    }
  };

  const handleStatusToggle = async (row: any) => {
    if (updatingStatus) return; // Prevent multiple clicks

    try {
      setUpdatingStatus(row?.van?._id || row?.van?.id);

      // Toggle status - ensure case-insensitive comparison
      const currentStatus = row?.van?.status?.trim()?.toLowerCase() || "inActive";
      const newStatus = currentStatus === "active" ? "inActive" : "active";

      console.log("Updating van status:", {
        id: row?.van?._id || row?.van?.id,
        currentStatus,
        newStatus
      });

      // Optimistic update
      setLocalVans(prev => prev.map(v => {
        const vanId = v?.van?._id || v?.van?.id;
        const rowId = row?.van?._id || row?.van?.id;
        if (vanId === rowId) {
          return { ...v, van: { ...v.van, status: newStatus } };
        }
        return v;
      }));

      await dispatch(
        bulkUpdateVanStatus({
          vanIds: [row?.van?._id || row?.van?.id],
          status: newStatus,
        })
      ).unwrap();

      // The fulfilled case updates the state immediately

    } catch (error) {
      console.error("Failed to toggle van status:", error);
      // Revert on error
      setLocalVans(vans);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Reset bulk operation states when successful
  React.useEffect(() => {
    if (bulkStatusSuccess) {
      dispatch(resetBulkStatus());
      setSelectedVans([]);
      // Refresh list
      dispatch(
        getAllSchoolVans({
          page,
          limit,
          ...filters,
        })
      );
    }
  }, [bulkStatusSuccess, dispatch, page, limit, filters]);

  React.useEffect(() => {
    if (deleteVanSuccess) {
      dispatch(resetDeleteVan());
      setSelectedVans([]);
      // Refresh list
      dispatch(
        getAllSchoolVans({
          page,
          limit,
          ...filters,
        })
      );
    }
  }, [deleteVanSuccess, dispatch, page, limit, filters]);

  React.useEffect(() => {
    if (removeDriverSuccess) {
      dispatch(resetRemoveDriver());
    }
  }, [removeDriverSuccess, dispatch]);

  // 🔁 Fetch vans whenever pagination or filters change
  React.useEffect(() => {
    dispatch(
      getAllSchoolVans({
        page,
        limit,
        ...filters, // carNumber, driverName if set
      })
    );
  }, [dispatch, page, limit, filters]);

  const columns: ColumnDef<any>[] = [
    {
      name: "Van",
      width: "250px",
      formatter: (row) => {
        const vehicleType = row?.van?.vehicleType || "";
        const carNumber = row?.van?.carNumber || "";
        const capacity = row?.van?.venCapacity || "-";
        const image = row?.van?.venImage;

        // initials generator based on vehicleType (e.g. "School Van" → "SV")
        const initials = vehicleType
          ?.split(" ")
          ?.map((w: string) => w?.[0]?.toUpperCase())
          ?.join("");

        return (
          <Stack direction="row" spacing={1} alignItems="center">
            {/* IMAGE or INITIALS fallback */}
            {image ? (
              <img
                src={image}
                alt={vehicleType}
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

            <Stack>
              <Typography color="text.primary" variant="body2">
                {vehicleType}
              </Typography>

              <Typography color="text.secondary" variant="caption">
                Vehicle No: {carNumber}
              </Typography>
            </Stack>
          </Stack>
        );
      },
    }
    ,
    {
      name: "Route",
      width: "220px",
      formatter: (row) => (
        <Typography color="text.secondary">
          {row?.route?.title || "-"}
        </Typography>
      ),
    },

    {
      name: "Driver",
      width: "220px",
      formatter: (row) => (
        <Typography color="text.secondary">
          {row?.driver?.fullname || "-"}
        </Typography>
      ),
    },
    {
      name: "Status",
      width: "120px",
      formatter: (row) => {
        const mapping = {
          inActive: {
            label: "InActive",
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

        const statusKey = (row?.van?.status?.trim()?.toLowerCase() ||
          "inActive") as keyof typeof mapping;

        // Debug: Log actual status value from backend
        console.log('Van status debug:', {
          vanId: row?.van?._id,
          originalStatus: row?.van?.status,
          normalizedStatus: statusKey
        });

        const { label, icon, color } = mapping[statusKey] ?? mapping.inActive;

        return (
          <Chip
            icon={icon}
            label={updatingStatus === (row?.van?._id || row?.van?.id) ? "Updating..." : label}
            size="small"
            color={color}
            variant="outlined"
            onClick={() => handleStatusToggle(row)}
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
      width: "120px",
      align: "right",
      formatter: (row) => (
        <Stack direction="row" spacing={0} sx={{ justifyContent: "flex-end" }}>
          <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
              elevation: 0,
              sx: {
                border: '1px solid',
                borderColor: 'divider',
              }
            }}
          >
            <MenuItem onClick={handleView}>
              <ListItemIcon>
                <EyeIcon size={18} />
              </ListItemIcon>
              <ListItemText primary="View" />
            </MenuItem>
            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <EditIcon size={18} />
              </ListItemIcon>
              <ListItemText primary="Edit" />
            </MenuItem>
            <MenuItem onClick={handleDelete}>
              <ListItemIcon>
                <DeleteIcon size={18} />
              </ListItemIcon>
              <ListItemText primary="Delete" />
            </MenuItem>
          </Menu>
        </Stack>
      ),
    },
  ];

  return (
    <Box
      sx={{
        bgcolor: "var(--mui-palette-background-level1)",
        p: 3,
      }}
    >
      <Stack spacing={3}>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          sx={{ alignItems: "flex-start" }}
        >
          <Box sx={{ flex: "1 1 auto" }}>
            <Typography variant="h5">Van Management</Typography>
          </Box>
          <Box>
            <Button
              variant="contained"
              color="primary"
              endIcon={<PlusIcon />}
              onClick={() => router.push("/van/create")}
            >
              Add Van
            </Button>
          </Box>
        </Stack>

        {/* Filters */}
        <Card>
          <VanFilter
            filters={filters}
            setFilters={(updater) => {
              setPage(1); // reset page on filter change
              setFilters((prev) =>
                typeof updater === "function" ? updater(prev) : updater
              );
            }}
            selected={selectedVans}
            onRefresh={() => {
              dispatch(
                getAllSchoolVans({
                  page,
                  limit,
                  ...filters,
                })
              );
            }}
          />

          {/* Table */}
          <Box sx={{ overflowX: "auto" }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : vans?.length ? (
              <DataTable<any>
                columns={columns}
                rows={localVans}
                selectable
                onSelectionChange={(_, rows) =>
                  setSelectedVans(rows as any[])
                }
              />
            ) : (
              <Box sx={{ p: 3 }}>
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center" }}
                  variant="body2"
                >
                  No Vans Found
                </Typography>
              </Box>
            )}
          </Box>

          <Divider />

          {/* Pagination */}
          <CustomersPagination
            count={pagination?.total || 0}
            page={(page || 1) - 1}
            rowsPerPage={limit}
            onPaginationChange={(_, newPage) => {
              setPage(newPage + 1);
              setSelectedVans([]);
            }}
            onRowsPerPageChange={(event) => {
              const newLimit = parseInt(event.target.value, 10);
              setLimit(newLimit);
              setPage(1);
              setSelectedVans([]);
            }}
          />
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCancelDelete}
          maxWidth="sm"
          fullWidth
        >
          <DialogContent sx={{ pb: 2 }}>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body1" color="text.primary" fontSize="1.1rem">
                Are you sure you want to delete this van?
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} disabled={deleteVanLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelete} 
              variant="contained" 
              color="error"
              disabled={deleteVanLoading}
              startIcon={deleteVanLoading ? <CircularProgress size={16} /> : <DeleteIcon size={18} />}
            >
              {deleteVanLoading ? 'Deleting...' : 'Delete Van'}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  );
}
