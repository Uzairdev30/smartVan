// app/(dashboard)/su-admin/driver/page.tsx

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
  FormControl,
  InputLabel,
  Select,
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
import { MenuItem as SelectMenuItem } from "@mui/material";
import { DriverFilter, type DriverFilters } from "./driverfilter";

export default function Page(): React.JSX.Element {
  const router = useRouter();

  // Set document title
  useEffect(() => {
    document.title = `${config.site.name} | Driver List`;
  }, []);

  // 🔥 Menu States
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedDriver, setSelectedDriver] = React.useState<any | null>(null);

  const isMenuOpen = Boolean(menuAnchorEl);

  // State for drivers data
  const [drivers, setDrivers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [pagination, setPagination] = React.useState({ total: 0, totalPages: 1 });
  const [selectedSchool, setSelectedSchool] = React.useState<string>('all');
  const [schools, setSchools] = React.useState<any[]>([]);
  const [filters, setFilters] = React.useState<DriverFilters>({});
  const [localDrivers, setLocalDrivers] = React.useState<any[]>([]);

  // Fetch drivers data
  const fetchDrivers = React.useCallback(async () => {
    try {
      setLoading(true);
      // Using the correct endpoint directly
      const response = await axios.get('/admin/getAllDriversForSuperAdmin', {
        params: { page, limit, schoolId: selectedSchool === 'all' ? undefined : selectedSchool }
      });
      
      if (response.data?.data) {
        setDrivers(response.data.data);
        setLocalDrivers(response.data.data);
        setPagination(response.data.pagination || { total: 0, totalPages: 1 });
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, selectedSchool]);

  // Client-side filtering for driverName and status
  const filteredDrivers = React.useMemo(() => {
    let result = localDrivers;
    if (filters.driverName?.trim()) {
      result = result.filter((d) =>
        d?.fullname
          ?.toLowerCase()
          .includes(filters.driverName.toLowerCase())
      );
    }
    if (filters.status?.trim()) {
      result = result.filter((d) => {
        const status = d?.status?.toLowerCase();
        return status === filters.status.toLowerCase();
      });
    }
    return result;
  }, [localDrivers, filters]);

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

  // Fetch drivers on component mount and when page/limit changes
  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // Fetch schools on component mount
  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  // ─── Menu Handlers ───
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, driver: any) => {
    setMenuAnchorEl(e.currentTarget);
    setSelectedDriver(driver);
  };

  const handleMenuClose = () => setMenuAnchorEl(null);

  const handleView = () => {
    if (selectedDriver) {
      router.push(`/su-admin/driver/${selectedDriver._id}`);
    }
    handleMenuClose();
  };

  const columns: ColumnDef<any>[] = [
    {
      name: "S.No",
      width: "80px",
      formatter: (row, index): React.JSX.Element => (
        <Typography fontWeight={500}>
          {((page - 1) * limit) + index + 1}
        </Typography>
      ),
    },
    {
      name: "Driver",
      width: "240px",
      formatter: (row): React.JSX.Element => {
        const name = row?.fullname || "";
        const image = row?.image;

        // Inline initials generator
        const initials = name
          .split(" ")
          .map((w: string) => w[0]?.toUpperCase())
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

            <Box>
              <Typography color="text.primary" variant="body2">
                {name}
              </Typography>
              <Typography color="text.secondary" variant="caption">
                {row?.email || "No email"}
              </Typography>
            </Box>
          </Stack>
        );
      }
    },
    {
      name: "Phone",
      width: "150px",
      formatter: (row): React.JSX.Element => (
        <Typography color="text.secondary" variant="body2">
          {row.phoneNo || "N/A"}
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

        const statusKey = (row?.status?.trim()?.toLowerCase() || "inactive") as keyof typeof mapping;
        const { label, color } = mapping[statusKey] ?? mapping.inactive;

        return (
          <Chip
            label={label}
            size="small"
            color={color}
            variant="outlined"
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
          <DriverFilter
            filters={filters}
            setFilters={(updater) => {
              setFilters((prev) =>
                typeof updater === "function" ? updater(prev) : updater
              );
            }}
            onRefresh={() => fetchDrivers()}
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
                selectable={false}
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
        </Menu>
      </Stack>
    </Box>
  );
}
