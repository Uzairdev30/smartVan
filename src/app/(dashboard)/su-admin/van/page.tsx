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
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { config } from "@/config";
import { DataTable, type ColumnDef } from "@/components/core/data-table";
import { CustomersPagination } from "@/components/dashboard/customer/customers-pagination";
import { useRouter } from "next/navigation";
import { SUADMIN } from "@/api/endpoint";
import axios from "@/api/axios";
import { VanFilter, type VanFilters } from "./driverfilter";
import { FormControl, Select, MenuItem as SelectMenuItem } from "@mui/material";

export default function Page(): React.JSX.Element {
  const router = useRouter();

  useEffect(() => {
    document.title = `${config.site.name} | Van List`;
  }, []);

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedVan, setSelectedVan] = React.useState<any | null>(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [pagination, setPagination] = React.useState({ total: 0, totalPages: 1 });
  const [filters, setFilters] = React.useState<VanFilters>({});
  const [selectedSchool, setSelectedSchool] = React.useState<string>("all");
  const [schools, setSchools] = React.useState<any[]>([]);
  const [routesModalOpen, setRoutesModalOpen] = React.useState(false);
  const [selectedRoutes, setSelectedRoutes] = React.useState<any[]>([]);
  const [localVans, setLocalVans] = React.useState<any[]>([]);

  const fetchVans = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(SUADMIN.GET_ALL_VAN_FOR_SUPERADMIN, {
        params: {
          page,
          limit,
          schoolId: selectedSchool === "all" ? undefined : selectedSchool,
          ...filters,
        },
      });
      if (response.data?.data) {
        setLocalVans(response.data.data);
        setPagination(response.data.pagination || { total: 0, totalPages: 1 });
      }
    } catch (error) {
      console.error("Error fetching vans:", error);
      setLocalVans([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, selectedSchool, filters]);

  const filteredVans = React.useMemo(() => {
    let result = localVans;
    if (filters.carNumber?.trim()) {
      result = result.filter((v) =>
        v?.van?.carNumber?.toLowerCase().includes(filters.carNumber.toLowerCase())
      );
    }
    if (filters.driverName?.trim()) {
      result = result.filter((v) =>
        v?.driver?.fullname?.toLowerCase().includes(filters.driverName.toLowerCase())
      );
    }
    if (filters.status?.trim()) {
      result = result.filter((v) =>
        v?.van?.status?.toLowerCase() === filters.status.toLowerCase()
      );
    }
    return result;
  }, [localVans, filters]);

  const fetchSchools = React.useCallback(async () => {
    try {
      const response = await axios.get(SUADMIN.GET_ALL_SCHOOL);
      if (response.data?.data) setSchools(response.data.data);
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  }, []);

  useEffect(() => { fetchVans(); }, [fetchVans]);
  useEffect(() => { fetchSchools(); }, [fetchSchools]);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, van: any) => {
    setMenuAnchorEl(e.currentTarget);
    setSelectedVan(van);
  };

  const handleMenuClose = () => setMenuAnchorEl(null);

  const handleView = () => {
    if (selectedVan) {
      // ✅ API returns "id" not "_id"
      const vanId = selectedVan?.van?.id;
      if (vanId) {
        router.push(`/su-admin/van/${vanId}`);
      } else {
        console.error("Van ID not found in selected row:", selectedVan);
      }
    }
    handleMenuClose();
  };

  const handleViewRoutes = (row: any) => {
    setSelectedRoutes(row.routes || []);
    setRoutesModalOpen(true);
  };

  const columns: ColumnDef<any>[] = [
    {
      name: "S.No",
      formatter: (row, index) => (
        <Typography fontWeight={500}>{(page - 1) * limit + index + 1}</Typography>
      ),
    },
    {
      name: "Driver",
      width: "240px",
      formatter: (row): React.JSX.Element => {
        const name = row?.driver?.fullname?.trim() || "No Driver Assigned";
        const image = row?.driver?.image;
        const phone = row?.driver?.phoneNo || "N/A";
        const initials = name.split(" ").map((w: string) => w[0]?.toUpperCase()).join("");

        return (
          <Stack direction="row" spacing={1} alignItems="center">
            {image ? (
              <img
                src={image}
                alt={name}
                style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "#1976d2", color: "#fff",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", fontWeight: 600, fontSize: 14,
                }}
              >
                {initials}
              </div>
            )}
            <Box>
              <Typography color="text.primary" variant="body2">{name}</Typography>
              <Typography color="text.secondary" variant="caption">{phone}</Typography>
            </Box>
          </Stack>
        );
      },
    },
    {
      name: "Car Number",
      formatter: (row) => (
        <Typography color="text.secondary" variant="body2">
          {row?.van?.carNumber || "N/A"}
        </Typography>
      ),
    },
    {
      name: "Vehicle Type",
      formatter: (row) => (
        <Typography color="text.secondary" variant="body2">
          {row?.van?.vehicleType || "N/A"}
        </Typography>
      ),
    },
    {
      name: "Condition",
      formatter: (row) => (
        <Typography color="text.secondary" variant="body2">
          {row?.van?.condition || "N/A"}
        </Typography>
      ),
    },
    {
      name: "Routes",
      formatter: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          {row.routes?.length ? (
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: "pointer" }}
              onClick={() => handleViewRoutes(row)}
            >
              View Routes 
            </Typography>
          ) : (
            <Typography color="text.secondary" variant="body2">No routes assigned</Typography>
          )}
        </Box>
      ),
    },
    {
      name: "Status",
      formatter: (row) => {
        const isActive = row?.van?.status?.toLowerCase() === "active";
        return (
          <Chip
            label={isActive ? "Active" : "Inactive"}
            color={isActive ? "success" : "error"}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      name: "Actions",
      align: "right",
      formatter: (row) => (
        <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
          <MoreVertIcon />
        </IconButton>
      ),
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
            <Typography variant="h5">Van Management</Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={selectedSchool}
              onChange={(e) => { setSelectedSchool(e.target.value); setPage(1); }}
            >
              <SelectMenuItem value="all">All Schools</SelectMenuItem>
              {schools?.map((school: any) => (
                <SelectMenuItem key={school._id} value={school._id}>
                  {school.schoolName || school.name}
                </SelectMenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Card>
          <VanFilter
            filters={filters}
            setFilters={(updater) => {
              setFilters((prev) =>
                typeof updater === "function" ? updater(prev) : updater
              );
            }}
            onRefresh={() => fetchVans()}
          />

          <Box sx={{ overflowX: "auto" }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : filteredVans?.length ? (
              <DataTable columns={columns} rows={filteredVans} selectable={false} />
            ) : (
              <Box sx={{ p: 3 }}>
                <Typography color="text.secondary" sx={{ textAlign: "center" }} variant="body2">
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
            onPaginationChange={(_, newPage) => setPage(newPage + 1)}
            onRowsPerPageChange={(event) => {
              setLimit(parseInt(event.target.value, 10));
              setPage(1);
            }}
          />
        </Card>

        {/* Routes Modal */}
        <Dialog open={routesModalOpen} onClose={() => setRoutesModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ backgroundColor: "#191970", color: "white" }}>
            Routes Details
          </DialogTitle>
          <DialogContent>
            {selectedRoutes.length === 0 ? (
              <Typography mt={2}>No routes assigned</Typography>
            ) : (
              <Stack spacing={1} mt={2}>
                {selectedRoutes.map((route) => (
                  <Box
                    key={route.id}
                    sx={{
                      display: "flex", justifyContent: "space-between",
                      border: "1px solid #eee", borderRadius: 1, p: 1.5,
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

        {/* MENU */}
        <Menu anchorEl={menuAnchorEl} open={isMenuOpen} onClose={handleMenuClose}>
          <MenuItem onClick={handleView}>
            <ListItemIcon><EyeIcon size={18} /></ListItemIcon>
            View
          </MenuItem>
        </Menu>
      </Stack>
    </Box>
  );
}