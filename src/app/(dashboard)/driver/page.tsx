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
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { config } from "@/config";
import { DataTable, type ColumnDef } from "@/components/core/data-table";
import { CustomersPagination } from "@/components/dashboard/customer/customers-pagination";
import { DriverFilter, type Filters } from "./driverfilter";
import { useRouter } from "next/navigation";
import { paths } from "@/paths";

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

  // Mock data for drivers (replace with API call later)
  const [drivers, setDrivers] = React.useState<any[]>([
    {
      id: "1",
      name: "Muhammad Ahmed",
      status: "active",
      image: "/assets/avatar.png",
    },
    {
      id: "2",
      name: "Ali Khan",
      status: "inactive",
      image: null,
    },
    {
      id: "3",
      name: "Hassan Raza",
      status: "active",
      image: "/assets/avatar-2.png",
    },
  ]);

  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [pagination, setPagination] = React.useState({ total: drivers.length });
  const [selectedDrivers, setSelectedDrivers] = React.useState<any[]>([]);
  const [filters, setFilters] = React.useState<Filters>({});

  // Sync drivers with filters (for future API integration)
  React.useEffect(() => {
    // Add API call here later to fetch drivers with filters
    console.log('Fetching drivers with filters:', filters);
  }, [filters]);

  // Refresh function to reload driver data
  const handleRefresh = React.useCallback(() => {
    // Add API call here later to fetch drivers with filters
    console.log('Refreshing drivers with filters:', filters);
  }, [filters]);

  // ─── Menu Handlers ───
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, driver: any) => {
    setMenuAnchorEl(e.currentTarget);
    setSelectedDriver(driver);
  };

  const handleMenuClose = () => setMenuAnchorEl(null);

  const handleView = () => {
    if (selectedDriver) {
      router.push(`/driver/${selectedDriver.id}`);
    }
    handleMenuClose();
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

  const columns: ColumnDef<any>[] = [
    {
      name: "Driver",
      width: "240px",
      formatter: (row): React.JSX.Element => {
        const name = row?.name || "";
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
        </Menu>
      </Stack>
    </Box>
  );
}
