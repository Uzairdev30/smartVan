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
import { DataTable, type ColumnDef } from "@/components/core/data-table";
import { CustomersPagination } from "@/components/dashboard/customer/customers-pagination";
import { Eye as EyeIcon, Edit as EditIcon, Building, Users, Power } from "@phosphor-icons/react";
import { MoreVertical as MoreVertIcon } from "@phosphor-icons/react";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { getAllSchools, getSchoolById, changeSchoolStatus } from "@/store/reducers/suadmin-slice";
import { PlusIcon } from "@/components/icons";

type UiSchoolRow = {
  _id: string;            // backend id (for routes)
  name: string;           // schoolName
  contact: string;        // contactPerson or admin.name
  vansLimit: number;      // allowedVans
  routesLimit: number;    // allowedRoutes
  students: number;       // allowedStudents
  status: "active" | "inActive";
  schoolLogo?: any
};

export default function Page(): React.JSX.Element {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // from suadmin slice (as designed earlier)
  const { schools, total, page, limit, listLoading, listError } = useSelector(
    (s: RootState) => s.suadmin
  );

  const [selectedRows, setSelectedRows] = React.useState<UiSchoolRow[]>([]);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = React.useState<UiSchoolRow | null>(null);

  React.useEffect(() => {
    dispatch(getAllSchools({ page: 1, limit: 10 }));
  }, [dispatch]);

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
  const rows: UiSchoolRow[] = React.useMemo(() => {
    return (schools ?? []).map((s: any) => ({
      _id: s?._id,
      name: s?.schoolName ?? s?.name ?? "—",
      schoolLogo: s?.schoolImage,
      contact: s?.contactPerson ?? s?.admin?.name ?? "—",
      vansLimit: Number(s?.allowedVans ?? 0),
      routesLimit: Number(s?.allowedRoutes ?? 0),
      students: Number(s?.allowedStudents ?? 0),
      status:
        String(s?.status ?? "active").toLowerCase() === "active"
          ? "active"
          : "inActive",
    }));
  }, [schools]);

  const columns: ColumnDef<UiSchoolRow>[] = [
    {
      name: "#",
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
            {row.schoolLogo ? (
              <img
                src={row.schoolLogo}
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
            dispatch(getAllSchools({ page: page ?? 1, limit: limit ?? 10 }));
          } catch (error) {
            console.error("Failed to change school status:", error);
          }
        };

        return (
          <Box
            onClick={handleStatusToggle}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              "&:hover": {
                opacity: 0.8,
              }
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: row.status === "active" ? "#4CAF50" : "#F44336",
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: row.status === "active" ? "#4CAF50" : "#F44336",
                fontWeight: 500,
              }}
            >
              {row.status === "active" ? "Active" : "Inactive"}
            </Typography>
          </Box>
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

        {/* STATISTICS CARDS */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)"
            }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {(schools || [])?.length || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Schools
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "50%",
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Building size={32} color="white" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
              color: "white",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(76, 175, 80, 0.3)"
            }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {(schools || [])?.filter(s => s.status === "active").length || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Active Schools
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "50%",
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Users size={32} color="white" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
              color: "white",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(255, 107, 107, 0.3)"
            }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {(schools || [])?.filter(s => s.status !== "active").length || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Inactive Schools
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "50%",
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Power size={32} color="white" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card>
          {/* TABLE */}
          <Box sx={{ overflowX: "auto" }}>
            {listLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
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
          </Box>

          <Divider />

          {/* PAGINATION */}
          <CustomersPagination
            count={total ?? 0}
            page={Math.max(0, (page ?? 1) - 1)}     // component expects 0-based
            rowsPerPage={limit ?? 10}
            onPaginationChange={(_, newPage0) => {
              const next = newPage0 + 1;
              dispatch(getAllSchools({ page: next, limit: limit ?? 10 }));
              setSelectedRows([]);
            }}
            onRowsPerPageChange={(e) => {
              const newLimit = parseInt(e.target.value, 10);
              dispatch(getAllSchools({ page: 1, limit: newLimit }));
              setSelectedRows([]);
            }}
          />
        </Card>
      </Stack>
    </Box>
  );
}
