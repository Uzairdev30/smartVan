// app/(dashboard)/vans/page.tsx
"use client";

import * as React from "react";
import { useEffect } from "react";
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
  FormControl,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Plus as PlusIcon } from "@phosphor-icons/react";
import { DataTable, type ColumnDef } from "@/components/core/data-table";
import { CustomersPagination } from "@/components/dashboard/customer/customers-pagination";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  getAllSchoolVans,
  bulkUpdateVanStatus,
  deleteVanById,
  removeDriverFromVan,
  resetBulkStatus,
  resetDeleteVan,
  resetRemoveDriver,
} from "@/store/reducers/van-slice";
import { VanFilter, type VanFilters } from "./driverfilter";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { Pencil as EditIcon } from "@phosphor-icons/react/dist/ssr/Pencil";
import { Trash as DeleteIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { CheckCircleIcon, MinusIcon } from "@/components/icons";
import { config } from "@/config";

export default function Page(): React.JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  useEffect(() => {
    document.title = `${config.site.name} | Van List`;
  }, []);

  const {
    vans,
    loading,
    pagination,
    bulkStatusSuccess,
    deleteVanSuccess,
    removeDriverSuccess,
  } = useSelector((state: RootState) => state.van);

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

  // vanOwn filter: "true" = Driver Van, "false" = School Vans
  const [vanOwn, setVanOwn] = React.useState<string>("true");

  // Routes modal
  const [routesModalOpen, setRoutesModalOpen] = React.useState(false);
  const [selectedRoutes, setSelectedRoutes] = React.useState<any[]>([]);

  const isVanOwn = vanOwn === "true";

  React.useEffect(() => {
    setLocalVans(vans);
  }, [vans]);

  // Client-side filtering for carNumber and driverName
  const filteredVans = React.useMemo(() => {
    let result = localVans;
    if (filters.carNumber?.trim()) {
      result = result.filter((v) =>
        v?.van?.carNumber
          ?.toLowerCase()
          .includes(filters.carNumber!.trim().toLowerCase())
      );
    }
    if (filters.driverName?.trim()) {
      result = result.filter((v) =>
        v?.driver?.fullname
          ?.toLowerCase()
          .includes(filters.driverName!.trim().toLowerCase())
      );
    }
    return result;
  }, [localVans, filters]);

  React.useEffect(() => {
    if (bulkStatusSuccess) {
      dispatch(resetBulkStatus());
      setSelectedVans([]);
      dispatch(getAllSchoolVans({ page, limit, vanOwn: isVanOwn, ...filters }));
    }
  }, [bulkStatusSuccess, dispatch, page, limit, filters, isVanOwn]);

  React.useEffect(() => {
    if (deleteVanSuccess) {
      dispatch(resetDeleteVan());
      setSelectedVans([]);
      dispatch(getAllSchoolVans({ page, limit, vanOwn: isVanOwn, ...filters }));
    }
  }, [deleteVanSuccess, dispatch, page, limit, filters, isVanOwn]);

  React.useEffect(() => {
    if (removeDriverSuccess) {
      dispatch(resetRemoveDriver());
      dispatch(getAllSchoolVans({ page, limit, vanOwn: isVanOwn, ...filters }));
    }
  }, [removeDriverSuccess, dispatch, page, limit, filters, isVanOwn]);

  React.useEffect(() => {
    dispatch(getAllSchoolVans({ page, limit, vanOwn: isVanOwn }));
  }, [dispatch, page, limit, isVanOwn]);

  const handleVanOwnChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setVanOwn(value);
    setPage(1);
    setSelectedVans([]);
    setFilters({});
  };

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
      if (window.confirm("Are you sure you want to remove the driver?")) {
        await dispatch(
          removeDriverFromVan({
            driverId: selectedRow.van.driverId,
            vanId: selectedRow?.van?._id || selectedRow?.van?.id,
          })
        ).unwrap();
      }
    } else {
      alert("No driver assigned to this van");
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedRow) {
      setVanToDelete(selectedRow);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleConfirmDelete = async () => {
    if (vanToDelete) {
      await dispatch(
        deleteVanById({
          vanId: vanToDelete?.van?._id || vanToDelete?.van?.id,
        })
      ).unwrap();
    }
    setDeleteDialogOpen(false);
    setVanToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setVanToDelete(null);
  };

  const handleStatusToggle = async (row: any) => {
    if (updatingStatus) return;
    setUpdatingStatus(row?.van?._id || row?.van?.id);
    const currentStatus = (row?.van?.status || "inActive").toLowerCase();
    const newStatus = currentStatus === "active" ? "inActive" : "active";
    setLocalVans((prev) =>
      prev.map((v) => {
        const vanId = v?.van?._id || v?.van?.id;
        if (vanId === (row?.van?._id || row?.van?.id)) {
          return { ...v, van: { ...v.van, status: newStatus } };
        }
        return v;
      })
    );
    await dispatch(
      bulkUpdateVanStatus({
        vanIds: [row?.van?._id || row?.van?.id],
        status: newStatus,
      })
    ).unwrap();
    setUpdatingStatus(null);
  };

  const handleViewRoutes = (row: any) => {
    setSelectedRoutes(row.routes || []);
    setRoutesModalOpen(true);
  };

  const baseColumns: ColumnDef<any>[] = [
    {
      name: "Van",
      width: "250px",
      formatter: (row) => {
        const vehicleType = row?.van?.vehicleType || "";
        const carNumber = row?.van?.carNumber || "";
        const initials = vehicleType
          ?.split(" ")
          ?.map((w: string) => w?.[0]?.toUpperCase())
          ?.join("");
        return (
          <Stack direction="row" spacing={1} alignItems="center">
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
    },
    {
      name: "Routes",
      width: "220px",
      formatter: (row) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            height: "100%",
            cursor: row.routes?.length ? "pointer" : "default",
          }}
        >
          {row.routes?.length ? (
            <Typography
              variant="body2"
              color="primary"
              onClick={() => handleViewRoutes(row)}
            >
              View Routes
            </Typography>
          ) : (
            <Typography color="text.secondary" variant="body2">
              No routes assigned
            </Typography>
          )}
        </Box>
      ),
    },
    {
      name: "Driver",
      width: "180px",
      formatter: (row) => (
        <Typography color="text.secondary">
          {row?.driver?.fullname || "-"}
        </Typography>
      ),
    },
  ];

  const statusColumn: ColumnDef<any> = {
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
      };
      const statusKey = (
        row?.van?.status?.trim()?.toLowerCase() || "inActive"
      ) as keyof typeof mapping;
      const { label, icon, color } = mapping[statusKey] ?? mapping.inActive;
      return (
        <Chip
          icon={icon}
          label={
            updatingStatus === (row?.van?._id || row?.van?.id)
              ? "Updating..."
              : label
          }
          size="small"
          color={color}
          variant="outlined"
          onClick={() => handleStatusToggle(row)}
          disabled={updatingStatus !== null}
          sx={{ cursor: updatingStatus ? "not-allowed" : "pointer" }}
        />
      );
    },
  };

  const actionsColumn: ColumnDef<any> = {
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
        >
          <MenuItem onClick={handleView}>
            <ListItemIcon>
              <EyeIcon size={18} />
            </ListItemIcon>
            <ListItemText primary="View" />
          </MenuItem>
          {!isVanOwn && (
            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <EditIcon size={18} />
              </ListItemIcon>
              <ListItemText primary="Edit" />
            </MenuItem>
          )}
          {!isVanOwn && (
            <MenuItem onClick={handleDelete}>
              <ListItemIcon>
                <DeleteIcon size={18} />
              </ListItemIcon>
              <ListItemText primary="Delete" />
            </MenuItem>
          )}
        </Menu>
      </Stack>
    ),
  };

  const columns: ColumnDef<any>[] = [
    ...baseColumns,
    ...(isVanOwn ? [] : [statusColumn]),
    actionsColumn,
  ];

  return (
    <Box sx={{ bgcolor: "var(--mui-palette-background-level1)", p: 3 }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: "center" }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5">Van Management</Typography>
          </Box>

          {/* vanOwn dropdown — exactly as before */}
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select
              value={vanOwn}
              onChange={handleVanOwnChange}
              displayEmpty
            >
              <MenuItem disabled value="">
                <em>Is Own</em>
              </MenuItem>
              <MenuItem value="true">Driver Van</MenuItem>
              <MenuItem value="false">School Vans</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            endIcon={<PlusIcon />}
            onClick={() => router.push("/van/create")}
          >
            Add Van
          </Button>
        </Stack>

        <Card>
          <VanFilter
            filters={filters}
            setFilters={(updater) => {
              setFilters((prev) =>
                typeof updater === "function" ? updater(prev) : updater
              );
            }}
            selected={selectedVans}
            onRefresh={() =>
              dispatch(getAllSchoolVans({ page, limit, vanOwn: isVanOwn }))
            }
            vanOwn={isVanOwn}
          />

          <Box sx={{ overflowX: "auto" }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : filteredVans?.length ? (
              <DataTable<any>
                columns={columns}
                rows={filteredVans}
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

        {/* Delete Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCancelDelete}
          maxWidth="sm"
          fullWidth
        >
          <DialogContent sx={{ pb: 2 }}>
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="body1" color="text.primary" fontSize="1.1rem">
                Are you sure you want to delete this van?
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete}>Cancel</Button>
            <Button onClick={handleConfirmDelete} variant="contained" color="error">
              Delete Van
            </Button>
          </DialogActions>
        </Dialog>

        {/* Routes Modal */}
        <Dialog
          open={routesModalOpen}
          onClose={() => setRoutesModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{
              backgroundColor: "#191970",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            Routes Details
          </DialogTitle>
          <DialogContent>
            {selectedRoutes.length === 0 ? (
              <Typography>No routes assigned</Typography>
            ) : (
              <Stack spacing={1} mt={1}>
                {selectedRoutes.map((route) => (
                  <Box
                    key={route.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      border: "1px solid #eee",
                      borderRadius: 1,
                      p: 1,
                    }}
                  >
                    <Typography variant="body2">{route.title}</Typography>
                    <Chip label={route.tripType} size="small" color="primary" />
                  </Box>
                ))}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRoutesModalOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  );
}