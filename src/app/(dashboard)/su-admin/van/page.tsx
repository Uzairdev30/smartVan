// app/(dashboard)/su-admin/van/page.tsx

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
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { config } from "@/config";
import { DataTable, type ColumnDef } from "@/components/core/data-table";
import { CustomersPagination } from "@/components/dashboard/customer/customers-pagination";
import { useRouter } from "next/navigation";

export default function Page(): React.JSX.Element {
  const router = useRouter();

  // Set document title
  useEffect(() => {
    document.title = `${config.site.name} | Van List (Super Admin)`;
  }, []);

  // 🔥 Menu States
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedVan, setSelectedVan] = React.useState<any | null>(null);

  const isMenuOpen = Boolean(menuAnchorEl);

  // Mock data for vans
  const [vans, setVans] = React.useState<any[]>([
    {
      id: "1",
      carNumber: "ABC-123",
      model: "Suzuki Bolan",
      year: "2022",
      color: "White",
      capacity: 30,
      driverName: "Muhammad Ahmed",
      school: "ABC School",
      status: "active",
    },
    {
      id: "2",
      carNumber: "DEF-456",
      model: "Dyson Master",
      year: "2021",
      color: "Silver",
      capacity: 25,
      driverName: "Ali Khan",
      school: "XYZ School",
      status: "inactive",
    },
    {
      id: "3",
      carNumber: "GHI-789",
      model: "Suzuki Bolan",
      year: "2023",
      color: "White",
      capacity: 30,
      driverName: "Hassan Raza",
      school: "PQR School",
      status: "active",
    },
  ]);

  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [pagination, setPagination] = React.useState({ total: vans.length });
  const [selectedVans, setSelectedVans] = React.useState<any[]>([]);

  // ─── Menu Handlers ───
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, van: any) => {
    setMenuAnchorEl(e.currentTarget);
    setSelectedVan(van);
  };

  const handleMenuClose = () => setMenuAnchorEl(null);

  const handleView = () => {
    if (selectedVan) {
      router.push(`/su-admin/van/${selectedVan.id}`);
    }
    handleMenuClose();
  };

  const columns: ColumnDef<any>[] = [
    {
      name: "Car Number",
      width: "150px",
      formatter: (row): React.JSX.Element => (
        <Typography color="text.primary" variant="body2" fontWeight={600}>
          {row.carNumber}
        </Typography>
      ),
    },
    {
      name: "Model",
      width: "180px",
      formatter: (row): React.JSX.Element => (
        <Typography color="text.secondary" variant="body2">
          {row.model}
        </Typography>
      ),
    },
    {
      name: "Year",
      width: "100px",
      formatter: (row): React.JSX.Element => (
        <Typography color="text.secondary" variant="body2">
          {row.year}
        </Typography>
      ),
    },
    {
      name: "Color",
      width: "120px",
      formatter: (row): React.JSX.Element => (
        <Typography color="text.secondary" variant="body2">
          {row.color}
        </Typography>
      ),
    },
    {
      name: "Capacity",
      width: "120px",
      formatter: (row): React.JSX.Element => (
        <Typography color="text.secondary" variant="body2">
          {row.capacity} seats
        </Typography>
      ),
    },
    {
      name: "Driver",
      width: "180px",
      formatter: (row): React.JSX.Element => (
        <Typography color="text.secondary" variant="body2">
          {row.driverName || "N/A"}
        </Typography>
      ),
    },
    {
      name: "School",
      width: "180px",
      formatter: (row): React.JSX.Element => (
        <Typography color="text.secondary" variant="body2">
          {row.school || "N/A"}
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
            <Typography variant="h5">Van Management (Super Admin)</Typography>
          </Box>
        </Stack>

        <Card>
          <Box sx={{ overflowX: "auto" }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : vans?.length ? (
              <DataTable<any>
                columns={columns}
                rows={vans}
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
