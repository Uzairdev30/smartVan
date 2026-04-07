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
import { CheckCircleIcon, MinusIcon } from "@/components/icons";
import {
  getAllDrivers,
  changeDriverStatus,
  removeDriverFromSchool,
} from "@/services/driver.api";

export default function Page(): React.JSX.Element {
  const router = useRouter();

  useEffect(() => {
    document.title = `${config.site.name} | Driver List`;
  }, []);

  const [menuAnchorEl, setMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [selectedDriver, setSelectedDriver] = React.useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const isMenuOpen = Boolean(menuAnchorEl);

  const [drivers, setDrivers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [pagination, setPagination] = React.useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [selectedDrivers, setSelectedDrivers] = React.useState<any[]>([]);
  const [filters, setFilters] = React.useState<Filters>({});
  const [updatingStatus, setUpdatingStatus] = React.useState<string | null>(null);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await getAllDrivers({ page, limit });
      setDrivers(res?.data?.data || []);
      setPagination(
        res?.data?.pagination || {
          total: 0,
          page,
          limit,
          totalPages: 1,
        }
      );
    } catch (err) {
      console.error("Failed to fetch drivers:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDrivers();
  }, [page, limit]);

  // Client-side filtering for driverName and status
  const filteredDrivers = React.useMemo(() => {
    let result = drivers;
    if (filters.driverName?.trim()) {
      result = result.filter((d) =>
        d?.fullname
          ?.toLowerCase()
          .includes(filters.driverName!.trim().toLowerCase())
      );
    }
    if (filters.status?.trim()) {
      result = result.filter((d) =>
        d?.status
          ?.toLowerCase()
          .includes(filters.status!.trim().toLowerCase())
      );
    }
    return result;
  }, [drivers, filters]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, driver: any) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedDriver(driver);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedDriver(null);
  };

  const handleView = () => {
    if (selectedDriver) {
      router.push(
        paths.dashboard.drivers.details(
          selectedDriver?._id || selectedDriver?.id
        )
      );
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    setMenuAnchorEl(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDriver) return;
    try {
      await removeDriverFromSchool({
        driverIds: [selectedDriver?._id || selectedDriver?.id],
      });
      setDeleteDialogOpen(false);
      setSelectedDriver(null);
      fetchDrivers();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedDriver(null);
  };

  const handleStatusToggle = async (driver: any) => {
    if (updatingStatus) return;
    const driverId = driver?._id || driver?.id;
    setUpdatingStatus(driverId);
    const currentStatus = (driver?.status || "inActive").toLowerCase();
    const newStatus = currentStatus === "active" ? "inActive" : "active";

    setDrivers((prev) =>
      prev.map((d) =>
        (d?._id || d?.id) === driverId ? { ...d, status: newStatus } : d
      )
    );

    try {
      await changeDriverStatus({ driverIds: [driverId], status: newStatus });
      fetchDrivers();
    } catch (err) {
      console.error("Status update failed:", err);
      fetchDrivers();
    } finally {
      setUpdatingStatus(null);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      name: "Driver",
      width: "250px",
      formatter: (row) => {
        const fullname = row?.fullname || "";
        const initials = fullname
          .split(" ")
          .map((w: string) => w?.[0]?.toUpperCase())
          .join("")
          .slice(0, 2);
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
                {fullname}
              </Typography>
              <Typography color="text.secondary" variant="caption">
                {row?.email || ""}
              </Typography>
            </Stack>
          </Stack>
        );
      },
    },
    {
      name: "Phone",
      width: "160px",
      formatter: (row) => (
        <Typography color="text.secondary" variant="body2">
          {row?.phoneNo || row?.phone || "—"}
        </Typography>
      ),
    },
    {
      name: "Status",
      width: "130px",
      formatter: (row) => {
        const driverId = row?._id || row?.id;
        const rawStatus = (row?.status || "inActive").toLowerCase();
        const isActive = rawStatus === "active";
        return (
          <Chip
            icon={
              isActive ? (
                <CheckCircleIcon
                  color="var(--mui-palette-success-main)"
                  weight="fill"
                />
              ) : (
                <MinusIcon color="var(--mui-palette-error-main)" />
              )
            }
            label={
              updatingStatus === driverId
                ? "Updating..."
                : isActive
                ? "Active"
                : "InActive"
            }
            size="small"
            color={isActive ? "success" : "error"}
            variant="outlined"
            onClick={() => handleStatusToggle(row)}
            disabled={updatingStatus !== null}
            sx={{ cursor: updatingStatus ? "not-allowed" : "pointer" }}
          />
        );
      },
    },
    {
      name: "Actions",
      width: "80px",
      align: "right",
      formatter: (row) => (
        <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
          <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
            <MoreVertIcon />
          </IconButton>
        </Stack>
      ),
    },
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
            <Typography variant="h5">Driver Management</Typography>
          </Box>
        </Stack>

        <Card>
          <DriverFilter
            filters={filters}
            setFilters={(updater) => {
              setFilters((prev) =>
                typeof updater === "function" ? updater(prev) : updater
              );
            }}
            selected={selectedDrivers}
            onRefresh={fetchDrivers}
          />

          <Box sx={{ overflowX: "auto" }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : filteredDrivers?.length ? (
              <DataTable<any>
                columns={columns}
                rows={filteredDrivers}
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
                  No Drivers Found
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
              setSelectedDrivers([]);
            }}
            onRowsPerPageChange={(event) => {
              const newLimit = parseInt(event.target.value, 10);
              setLimit(newLimit);
              setPage(1);
              setSelectedDrivers([]);
            }}
          />
        </Card>

        <Menu
          anchorEl={menuAnchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={handleView}>
            <ListItemIcon>
              <EyeIcon size={18} />
            </ListItemIcon>
            View
          </MenuItem>
          <MenuItem onClick={handleDeleteClick}>
            <ListItemIcon>
              <Trash size={18} />
            </ListItemIcon>
            Delete
          </MenuItem>
        </Menu>

        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogContent sx={{ pb: 2 }}>
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="body1" color="text.primary" fontSize="1.1rem">
                Are you sure you want to remove this driver?
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} variant="contained" color="error">
              Remove Driver
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  );
}