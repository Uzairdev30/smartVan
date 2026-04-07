// app/(dashboard)/driver/page.tsx

"use client";

import * as React from "react";
import { useEffect } from "react";
import {
  Box,
  Card,
  Divider,
  Stack,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { Trash } from "@phosphor-icons/react/dist/ssr";
import { config } from "@/config";
import { DataTable, type ColumnDef } from "@/components/core/data-table";
import { CustomersPagination } from "@/components/dashboard/customer/customers-pagination";
import { DriverFilter, type Filters } from "./driverfilter";
import { useRouter } from "next/navigation";
import { paths } from "@/paths";
import { getAllDrivers, changeDriverStatus, removeDriverFromSchool } from "@/services/driver.api";

export default function Page(): React.JSX.Element {
  const router = useRouter();

  // Set document title
  useEffect(() => {
    document.title = `${config.site.name} | Driver List`;
  }, []);

  // 🔥 Menu States
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedDriver, setSelectedDriver] = React.useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const isMenuOpen = Boolean(menuAnchorEl);

  // API State
  const [drivers, setDrivers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [pagination, setPagination] = React.useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [selectedDrivers, setSelectedDrivers] = React.useState<any[]>([]);
  const [filters, setFilters] = React.useState<Filters>({});

  // Fetch drivers from API
  const fetchDrivers = async () => {
    setLoading(true);
    try {
      // Build API params with filters
      const apiParams: any = { page, limit };
      
      if (filters?.driverName) {
        apiParams.driverName = filters.driverName;
      }
      
      if (filters?.status) {
        apiParams.status = filters.status;
      }

      console.log('📡 API Params:', apiParams);
      
      const response = await getAllDrivers(apiParams);
      console.log('📦 Drivers API Response:', response);
      console.log('📦 Drivers API Response data:', response?.data);
      
      // Check if response has nested data structure
      let driversData = [];
      let paginationData = { total: 0, page: 1, limit: 10, totalPages: 1 };
      
      if (response?.data) {
        // If response has message and data fields (like your example)
        if (response.data.data && Array.isArray(response.data.data)) {
          driversData = response.data.data;
          paginationData = response.data.pagination || paginationData;
        }
        // If response is directly an array
        else if (Array.isArray(response.data)) {
          driversData = response.data;
        }
        // If response has data property with array
        else if (response.data.data) {
          driversData = response.data.data;
        }
      }
      
      console.log('✅ Parsed Drivers Data:', driversData);
      setDrivers(driversData);
      setPagination(paginationData);
    } catch (error) {
      console.error('❌ Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [page, limit, filters]);

  // Refresh function to reload driver data
  const handleRefresh = React.useCallback(() => {
    console.log('🔄 Refreshing drivers with filters:', filters);
    setPage(1); // Reset to first page
    fetchDrivers();
  }, [filters, page, limit]);

  // ─── Menu Handlers ───
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, driver: any) => {
    setMenuAnchorEl(e.currentTarget);
    setSelectedDriver(driver);
  };

  const handleMenuClose = () => setMenuAnchorEl(null);

  const handleView = () => {
    if (selectedDriver) {
      console.log('👉 Navigating to driver:', selectedDriver._id || selectedDriver.id);
      router.push(`/driver/${selectedDriver._id || selectedDriver.id}`);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedDriver) {
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleConfirmDelete = async () => {
    if (!selectedDriver) return;

    const driverId = selectedDriver._id || selectedDriver.id;
    const driverName = selectedDriver.fullname || 'this driver';

    try {
      console.log('🗑️ Deleting driver:', driverId);
      
      await removeDriverFromSchool({ driverIds: [driverId] });
      
      console.log('✅ Driver deleted successfully:', driverName);
      
      // Refresh the list
      fetchDrivers();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('❌ Error deleting driver:', error);
      alert('Failed to delete driver. Please try again.');
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedDriver(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      default:
        return "default";
    }
  };

  // Toggle driver status
  const [updatingStatus, setUpdatingStatus] = React.useState<string | null>(null);

  const handleStatusToggle = async (driverId: string, currentStatus: string) => {
    if (updatingStatus) return; // Prevent multiple clicks

    const newStatus = currentStatus.toLowerCase() === 'active' ? 'inActive' : 'Active';

    try {
      setUpdatingStatus(driverId);

      // Update UI immediately
      setDrivers(prev => prev.map(d => {
        if (d._id === driverId) {
          return { ...d, status: newStatus };
        }
        return d;
      }));

      // Call API
      await changeDriverStatus({
        id: driverId,
        status: newStatus,
      });

      // Refresh the data
      fetchDrivers();
    } catch (error) {
      console.error("Failed to toggle driver status:", error);
      fetchDrivers(); // Revert on error
    } finally {
      setUpdatingStatus(null);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      name: "Driver",
      width: "240px",
      formatter: (row): React.JSX.Element => {
        const name = row?.fullname || "";
        const image = row?.image;

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
    },
    {
      name: "Email",
      width: "200px",
      formatter: (row): React.JSX.Element => (
        <Typography color="text.secondary" variant="body2">
          {row?.email || "N/A"}
        </Typography>
      ),
    },
    {
      name: "Phone",
      width: "150px",
      formatter: (row): React.JSX.Element => (
        <Typography color="text.secondary" variant="body2">
          {row?.phoneNo || "N/A"}
        </Typography>
      ),
    },
    {
      name: "Status",
      width: "120px",
      formatter: (row): React.JSX.Element => {
        const mapping = {
          active: {
            label: "Active",
            color: "success" as const,
          },
          inactive: {
            label: "Inactive",
            color: "error" as const,
          },
          inActive: {
            label: "Inactive",
            color: "error" as const,
          },
        } as const;

        const statusKey = (row?.status?.trim() || "inactive") as keyof typeof mapping;
        const { label, color } = mapping[statusKey] ?? mapping.inactive;
        const isUpdating = updatingStatus === row._id;

        return (
          <Chip
            label={isUpdating ? "Updating..." : label}
            size="small"
            color={color}
            variant="outlined"
            onClick={() => handleStatusToggle(row._id, row.status)}
            sx={{ cursor: 'pointer' }}
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
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
        >
          <Box sx={{ flex: "1 1 auto" }}>
            <Typography variant="h5">Driver Management</Typography>
          </Box>
        </Stack>

        <Card>
          {/* Filters can be added here */}
          <DriverFilter
            filters={filters}
            setFilters={(updater) => {
              setPage(1); // reset page on filter change
              setFilters((prev) =>
                typeof updater === "function" ? updater(prev) : updater
              );
            }}
            selected={selectedDrivers}
            onRefresh={handleRefresh}
          />

          <Box sx={{ overflowX: "auto" }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : drivers?.length ? (
              <DataTable<any>
                columns={columns}
                rows={drivers}
                selectable
                onSelectionChange={(_, rows) =>
                  setSelectedDrivers(rows as any[])
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
            }}
            onRowsPerPageChange={(event) => {
              const newLimit = parseInt(event.target.value, 10);
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </Card>

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
              <Trash size={18} />
            </ListItemIcon>
            Delete
          </MenuItem>
        </Menu>

        {/* ─── DELETE CONFIRMATION DIALOG ─── */}
        <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
          <DialogTitle>Delete Driver</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this driver?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} color="primary">
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  );
}
