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
    document.title = `${config.site.name} | Driver List (Super Admin)`;
  }, []);

  // 🔥 Menu States
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedDriver, setSelectedDriver] = React.useState<any | null>(null);

  const isMenuOpen = Boolean(menuAnchorEl);

  // Mock data for drivers
  const [drivers, setDrivers] = React.useState<any[]>([
    {
      id: "1",
      name: "Muhammad Ahmed",
      phone: "0300-1234567",
      cnic: "42101-1234567-1",
      licenseNumber: "DL-123456",
      status: "active",
      image: "/assets/avatar.png",
      assignedVan: "Van #1",
      school: "ABC School",
    },
    {
      id: "2",
      name: "Ali Khan",
      phone: "0311-9876543",
      cnic: "42201-7654321-9",
      licenseNumber: "DL-654321",
      status: "inactive",
      image: null,
      assignedVan: "Not Assigned",
      school: "XYZ School",
    },
    {
      id: "3",
      name: "Hassan Raza",
      phone: "0322-5555555",
      cnic: "42301-5555555-5",
      licenseNumber: "DL-555555",
      status: "active",
      image: "/assets/avatar-2.png",
      assignedVan: "Van #3",
      school: "PQR School",
    },
  ]);

  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [pagination, setPagination] = React.useState({ total: drivers.length });
  const [selectedDrivers, setSelectedDrivers] = React.useState<any[]>([]);

  // ─── Menu Handlers ───
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, driver: any) => {
    setMenuAnchorEl(e.currentTarget);
    setSelectedDriver(driver);
  };

  const handleMenuClose = () => setMenuAnchorEl(null);

  const handleView = () => {
    if (selectedDriver) {
      router.push(`/su-admin/driver/${selectedDriver.id}`);
    }
    handleMenuClose();
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

            <Typography color="text.primary" variant="body2">
              {name}
            </Typography>
          </Stack>
        );
      }
    },
    {
      name: "Phone",
      width: "150px",
      formatter: (row): React.JSX.Element => (
        <Typography color="text.secondary" variant="body2">
          {row.phone}
        </Typography>
      ),
    },
    {
      name: "CNIC",
      width: "180px",
      formatter: (row): React.JSX.Element => (
        <Typography color="text.secondary" variant="body2">
          {row.cnic}
        </Typography>
      ),
    },
    {
      name: "License Number",
      width: "150px",
      formatter: (row): React.JSX.Element => (
        <Typography color="text.secondary" variant="body2">
          {row.licenseNumber}
        </Typography>
      ),
    },
    {
      name: "Assigned Van",
      width: "150px",
      formatter: (row): React.JSX.Element => (
        <Typography color="text.secondary" variant="body2">
          {row.assignedVan || "N/A"}
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
            <Typography variant="h5">Driver Management (Super Admin)</Typography>
          </Box>
        </Stack>

        <Card>
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
