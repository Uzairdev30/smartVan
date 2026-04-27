"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  Divider,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { DataTable, type ColumnDef } from "@/components/core/data-table";
import { CustomersPagination } from "@/components/dashboard/customer/customers-pagination";
import { Eye as EyeIcon, PencilSimple as EditIcon, Building, Users, Power } from "@phosphor-icons/react";
import { CheckCircleIcon, MinusIcon } from "@/components/icons";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { getAllSchools, getSchoolById, changeSchoolStatus } from "@/store/reducers/suadmin-slice";
import { PlusIcon } from "@/components/icons";
import { SchoolManagementFilter, type Filters } from "./school-management-fiter";

type UiSchoolRow = {
  _id: string;            // backend id (for routes)
  name: string;           // schoolName
  contact: string;        // contactPerson or admin.name
  vansLimit: number;      // allowedVans
  routesLimit: number;    // allowedRoutes
  students: number;       // allowedStudents
  status: "active" | "inActive";
  image?: any
};

export default function Page(): React.JSX.Element {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // from suadmin slice (as designed earlier)
  const { schools, total, listLoading, listError } = useSelector(
    (s: RootState) => s.suadmin
  );

  const [selectedRows, setSelectedRows] = React.useState<UiSchoolRow[]>([]);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = React.useState<UiSchoolRow | null>(null);
  const [filters, setFilters] = React.useState<Filters>({});

  React.useEffect(() => {
    dispatch(getAllSchools({ page, limit }));
  }, [dispatch, page, limit]);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [filters]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, row: UiSchoolRow) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleView = async () => {
    if (!selectedRow?._id) return;
    handleMenuClose();
    try {
      await dispatch(getSchoolById(selectedRow._id)).unwrap();
    } finally {
      router.push(`/su-admin/school-management/${selectedRow._id}`);
    }
  };

  const handleEdit = () => {
    if (!selectedRow?._id) return;
    handleMenuClose();
    router.push(`/su-admin/school-management/edit/${selectedRow._id}`);
  };
  // map API -> UI
  const allRows: UiSchoolRow[] = React.useMemo(() => {
    return (schools ?? []).map((s: any) => ({
      _id: s?.schoolId ?? s?._id,
      name: s?.schoolName ?? s?.name ?? "—",
      image: s?.schoolImage,
      contact: s?.contactPerson ?? s?.admin?.name ?? "—",
      vansLimit: Number(s?.totalVans ?? 0),
      routesLimit: Number(s?.totalRoutes ?? 0),
      students: Number(s?.totalKids ?? 0),
      status:
        String(s?.status ?? "active").toLowerCase() === "active"
          ? "active"
          : "inActive",
    }));
  }, [schools]);

  // Client-side filtering like van page
  const rows: UiSchoolRow[] = React.useMemo(() => {
    let result = allRows;
    if (filters.schoolName?.trim()) {
      result = result.filter((school) =>
        school.name
          ?.toLowerCase()
          .includes(filters.schoolName!.trim().toLowerCase())
      );
    }
    if (filters.status?.trim()) {
      result = result.filter((school) =>
        school.status
          ?.toLowerCase()
          === filters.status!.trim().toLowerCase()
      );
    }
    return result;
  }, [allRows, filters]);

  const columns: ColumnDef<UiSchoolRow>[] = [
    {
      name: "S.no",
      width: "60px",
      formatter: (row, index) => (
        <Typography color="text.primary" variant="body2" sx={{ textAlign: "center" }}>
          {index + 1}
        </Typography>
      ),
    },
    {
      name: "School",
      width: "260px",
      formatter: (row) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              overflow: "hidden",
              bgcolor: "#F6F7F9",
              border: "1px solid #E0E2E7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "text.secondary",
            }}
          >
            {row.image ? (
              <img
                src={row.image}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              row.name?.[0] ?? "?"
            )}
          </Box>

          <Typography color="text.primary" variant="body2">
            {row.name}
          </Typography>
        </Stack>
      ),
    },

    {
      name: "Contact",
      width: "180px",
      formatter: (row) => (
        <Typography color="text.primary" variant="body2">
          {row.contact}
        </Typography>
      ),
    },
    {
      name: "Vans",
      width: "90px",
      formatter: (row) => (
        <Typography color="text.secondary" variant="body2">
          {row.vansLimit}
        </Typography>
      ),
    },
    {
      name: "Routes",
      width: "100px",
      formatter: (row) => (
        <Typography color="text.secondary" variant="body2">
          {row.routesLimit}
        </Typography>
      ),
    },
    {
      name: "Students",
      width: "110px",
      formatter: (row) => (
        <Typography color="text.secondary" variant="body2">
          {row.students}
        </Typography>
      ),
    },
    {
      name: "Status",
      width: "120px",
      formatter: (row) => {
        const handleStatusToggle = async () => {
          if (!row._id) return;
          const newStatus = row.status === "active" ? "inActive" : "active";
          try {
            await dispatch(changeSchoolStatus({ schoolId: row._id, status: newStatus })).unwrap();
            // Refresh the list to show updated status
            dispatch(getAllSchools({ page, limit }));
          } catch (error) {
            console.error("Failed to change school status:", error);
          }
        };

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

        const statusKey = (row?.status?.trim()?.toLowerCase() ||
          "inActive") as keyof typeof mapping;

        const { label, icon, color } = mapping[statusKey] ?? mapping.inActive;

        return (
          <Chip
            icon={icon}
            label={label}
            size="small"
            color={color}
            variant="outlined"
            onClick={handleStatusToggle}
            sx={{ cursor: "pointer" }}
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
                mt: 1,
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
          </Menu>
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
          sx={{ alignItems: { xs: "flex-start", sm: "center" } }}
        >
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            School Management
          </Typography>

          <Button
            variant="contained"
            color="primary"
            endIcon={<PlusIcon />}
            onClick={() => router.push('/su-admin/school-management/add-school')}
          >
            Add School
          </Button>
        </Stack>

        <Card>
          <SchoolManagementFilter 
            filters={filters} 
            setFilters={setFilters} 
          />

          {listLoading ? (
            <Box sx={{ textAlign: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : listError ? (
            <Box sx={{ p: 3 }}>
              <Typography color="error" variant="body2" sx={{ textAlign: "center" }}>
                {listError}
              </Typography>
            </Box>
          ) : schools && rows.length ? (
            <DataTable<UiSchoolRow>
              columns={columns}
              rows={rows}
            />
          ) : (
            <Box sx={{ p: 3 }}>
              <Typography color="text.secondary" variant="body2" sx={{ textAlign: "center" }}>
                No Data found
              </Typography>
            </Box>
          )}

          <Divider />

          {/* PAGINATION */}
          <CustomersPagination
            count={total || 0}
            page={page - 1}
            rowsPerPage={limit}
            onPaginationChange={(_, newPage) => {
              setPage(newPage + 1);
              setSelectedRows([]);
            }}
            onRowsPerPageChange={(event) => {
              const newLimit = parseInt(event.target.value, 10);
              setLimit(newLimit);
              setPage(1);
              setSelectedRows([]);
            }}
          />
        </Card>
      </Stack>
    </Box>
  );
}
