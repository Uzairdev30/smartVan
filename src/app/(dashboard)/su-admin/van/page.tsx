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
import { FormControl, InputLabel, Select, MenuItem as SelectMenuItem } from "@mui/material";

export default function Page(): React.JSX.Element {
  const router = useRouter();

  useEffect(() => {
    document.title = `${config.site.name} | Van List`;
  }, []);

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedVan, setSelectedVan] = React.useState<any | null>(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  const [vans, setVans] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [pagination, setPagination] = React.useState({ total: 0, totalPages: 1 });
  const [filters, setFilters] = React.useState<VanFilters>({});
  const [selectedSchool, setSelectedSchool] = React.useState<string>('all');
  const [schools, setSchools] = React.useState<any[]>([]);
  const [routesModalOpen, setRoutesModalOpen] = React.useState(false);
  const [selectedRoutes, setSelectedRoutes] = React.useState<any[]>([]);
  const [localVans, setLocalVans] = React.useState<any[]>([]);

  // Fetch vans data
  const fetchVans = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(SUADMIN.GET_ALL_VAN_FOR_SUPERADMIN, {
        params: { page, limit, schoolId: selectedSchool === 'all' ? undefined : selectedSchool, ...filters },
      });

      if (response.data?.data) {
        setVans(response.data.data);
        setLocalVans(response.data.data);
        setPagination(response.data.pagination || { total: 0, totalPages: 1 });
      }
    } catch (error) {
      console.error("Error fetching vans:", error);
      setVans([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, selectedSchool, filters]);

  // Client-side filtering for carNumber, driverName, and status
  const filteredVans = React.useMemo(() => {
    let result = localVans;
    if (filters.carNumber?.trim()) {
      result = result.filter((v) =>
        v?.van?.carNumber
          ?.toLowerCase()
          .includes(filters.carNumber.toLowerCase())
      );
    }
    if (filters.driverName?.trim()) {
      result = result.filter((v) =>
        v?.driver?.fullname
          ?.toLowerCase()
          .includes(filters.driverName.toLowerCase())
      );
    }
    if (filters.status?.trim()) {
      result = result.filter((v) => {
        const status = v?.van?.status?.toLowerCase();
        return status === filters.status.toLowerCase();
      });
    }
    return result;
  }, [localVans, filters]);

  // Fetch schools for filter dropdown
  const fetchSchools = React.useCallback(async () => {
    try {
      const response = await axios.get(SUADMIN.GET_ALL_SCHOOL);
      if (response.data?.data) {
        setSchools(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  }, []);

  // Fetch vans on component mount and when page/limit/filters change
  useEffect(() => {
    fetchVans();
  }, [fetchVans]);

  // Fetch schools on component mount
  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  // ─── Menu Handlers ───
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, van: any) => {
    setMenuAnchorEl(e.currentTarget);
    setSelectedVan(van);
  };

  const handleMenuClose = () => setMenuAnchorEl(null);

  const handleView = () => {
    if (selectedVan) {
      router.push(`/su-admin/van/${selectedVan._id}`);
    }
    handleMenuClose();
  };

  const handleViewRoutes = (row: any) => {
    setSelectedRoutes(row.routes);
    setRoutesModalOpen(true);
  };

  // ✅ Columns (Direct Nested Access)
  const columns: ColumnDef<any>[] = [
    {
      name: "S.No",
      formatter: (row, index) => (
        <Typography fontWeight={500}>
          {((page - 1) * limit) + index + 1}
        </Typography>
      ),
    },
    {
      name: "Driver Name",
      formatter: (row) => (
        <Typography>
          {row?.driver?.fullname || "N/A"}
        </Typography>
      ),
    },

    {
      name: "Car Number",
      formatter: (row) => (
        <Typography>
          {row?.van?.carNumber || "N/A"}
        </Typography>
      ),
    },
    {
      name: "Vehicle Type",
      formatter: (row) => (
        <Typography>
          {row?.van?.vehicleType || "N/A"}
        </Typography>
      ),
    },
    
    {
      name: "Condition",
      formatter: (row) => (
        <Typography>
          {row?.van?.condition || "N/A"}
        </Typography>
      ),
    },
   
    {
      name: "Routes",
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
      name: "Phone",
      formatter: (row) => (
        <Typography>
          {row?.driver?.phoneNo || "N/A"}
        </Typography>
      ),
    },
    {
      name: "Status",
      formatter: (row) => {
        const status = row?.van?.status?.toLowerCase();

        return (
          <Chip
            label={status === "active" ? "Active" : "Inactive"}
            color={status === "active" ? "success" : "error"}
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
              label="Filter by School"
              onChange={(e) => {
                setSelectedSchool(e.target.value);
                setPage(1);
              }}
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
              <DataTable
                columns={columns}
                rows={filteredVans}
                selectable={false}
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
            }}
            onRowsPerPageChange={(event) => {
              const newLimit = parseInt(event.target.value, 10);
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </Card>

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

        {/* MENU */}
        <Menu
          anchorEl={menuAnchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleView}>
            <ListItemIcon>
              <EyeIcon size={18} />
            </ListItemIcon>
            View
          </MenuItem>
        </Menu>
      </Stack>
    </Box>
  );
}