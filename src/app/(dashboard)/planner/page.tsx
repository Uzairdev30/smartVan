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
import {
  Eye as EyeIcon,
  PencilSimple as EditIcon,
  Trash as TrashIcon,
} from "@phosphor-icons/react/dist/ssr";
import { DataTable, type ColumnDef } from "@/components/core/data-table";
import { CustomersPagination } from "@/components/dashboard/customer/customers-pagination";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  getAllRoutes,
  getRouteById,
  deleteRouteByAdmin,
  type RouteFilters,
} from "@/store/reducers/route-slice";
import { RouteFilter } from "./RouteFilter";
import { paths } from "@/paths";
import { config } from "@/config";

export default function RoutePlannerPage(): React.JSX.Element {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Set document title
  useEffect(() => {
    document.title = `${config.site.name} | Route List`;
  }, []);

  const { routes, loading, pagination, deleteRouteLoading } = useSelector(
    (state: RootState) => state.route
  );

  const [filters, setFilters] = React.useState<RouteFilters>({});
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);

  const [routesModalOpen, setRoutesModalOpen] = React.useState(false);
  const [selectedVan, setSelectedVan] = React.useState<any>(null);

  // 🔥 Modal Menu States
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedRoute, setSelectedRoute] = React.useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const isMenuOpen = Boolean(menuAnchorEl);

  // ─── Fetch Data ───
  React.useEffect(() => {
    dispatch(getAllRoutes({ page, limit, ...filters }));
  }, [dispatch, page, limit, filters]);

  // ─── Menu Handlers ───
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, route: any) => {
    setMenuAnchorEl(e.currentTarget);
    setSelectedRoute(route);
  };

  const handleMenuClose = () => setMenuAnchorEl(null);

  const handleViewRoutes = (row: any) => {
    setSelectedVan(row);
    setRoutesModalOpen(true);
  };

  const handleViewRoute = async () => {
    console.log('🔵 handleViewRoute called');
    console.log('🔵 selectedRoute:', selectedRoute);
    console.log('🔵 selectedRoute._id:', selectedRoute?._id);
    console.log('🔵 selectedRoute.id:', selectedRoute?.id);
    
    const routeId = selectedRoute?._id || selectedRoute?.id;
    
    if (routeId) {
      await dispatch(getRouteById(routeId));
      router.push(`/planner/${routeId}`);
    } else {
      console.error('❌ Route ID is undefined!');
    }
    handleMenuClose();
  };

  const handleEditRoute = () => {
    const routeId = selectedRoute?._id || selectedRoute?.id;
    router.push(`${paths.dashboard.planner}/edit/${routeId}`);
    handleMenuClose();
  };

  const handleDeleteRoute = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmDelete = async () => {
    const routeId = selectedRoute?._id || selectedRoute?.id;
    await dispatch(deleteRouteByAdmin({ routeId: routeId }));
    setDeleteDialogOpen(false);
    
    // Refresh the routes list
    dispatch(getAllRoutes({ page, limit, ...filters }));
    
    // Close modal if it's open and navigate back to list
    if (routesModalOpen) {
      setRoutesModalOpen(false);
      setSelectedVan(null);
    }
  };

  // ─── Columns ───
  const columns: ColumnDef<any>[] = [
    {
      name: "S.No",
      width: "80px",
      formatter: (row, index) => (
        <Typography>{(page - 1) * limit + index + 1}</Typography>
      ),
    },
    {
      name: "Car Number",
      formatter: (row) => row.van?.carNumber || "—",
    },
    {
      name: "Driver Name",
      formatter: (row) => row.driver?.fullname || "—",
    },
    {
      name: "Time",
      width: "200px",
      formatter: (row) => {
        // Separate pick and drop times
        const pickTime = row.routes?.find((r: any) => r.tripType === "pick")?.startTime;
        const dropTime = row.routes?.find((r: any) => r.tripType === "drop")?.startTime;
        
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {pickTime ? (
              <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 600 }}>
                Pick: {pickTime}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Pick: Not Assigned
              </Typography>
            )}
            {dropTime ? (
              <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 600 }}>
                Drop: {dropTime}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Drop: Not Assigned
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      name: "Routes",
      width: "220px",
      formatter: (row) => (
        <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", height: '100%', cursor: row.routes?.length ? 'pointer' : 'default' }}>

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

    // ✅ Trip Days column (IMPORTANT)
    {
      name: "Trip Days",
      width: "220px",
      formatter: (row) => {
        const allDays =
          row.routes?.flatMap((route: any) =>
            Object.entries(route.tripDays || {})
              .filter(([key, val]) => val === true && key !== "_id")
              .map(([day]) => day)
          ) || [];

        const uniqueDays = [...new Set(allDays)];

        if (!uniqueDays.length) {
          return <Typography>—</Typography>;
        }

        return (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {uniqueDays.map((day) => (
              <Box
                key={day}
                sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  background: "#e3f2fd",
                  border: "1px solid #2196f3",
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {day.slice(0, 3)}
                </Typography>
              </Box>
            ))}
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h5">Routes</Typography>
          <Button
            variant="contained"
            onClick={() =>
              router.push(`${paths.dashboard.planner}/create`)
            }
          >
            Add Route
          </Button>
        </Stack>

        <Card>
          <RouteFilter filters={filters} setFilters={setFilters} />

          {loading ? (
            <Box sx={{ textAlign: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <DataTable columns={columns} rows={routes || []} />
          )}

          <Divider />

          <CustomersPagination
            count={pagination?.total || 0}
            page={page - 1}
            rowsPerPage={limit}
            onPaginationChange={(_, newPage) => setPage(newPage + 1)}
            onRowsPerPageChange={(e) => {
              setLimit(parseInt(e.target.value));
              setPage(1);
            }}
          />
        </Card>

        {/* ─── ROUTE DETAILS MODAL ─── */}
        <Dialog open={routesModalOpen} onClose={() => setRoutesModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ background: "#191970", color: "#fff" }}>
            Route Details
          </DialogTitle>

          <DialogContent>
            {selectedVan?.routes?.map((route: any) => (
              <Box
                key={route._id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid #eee",
                  borderRadius: 1,
                  p: 1,
                  mt: 1,
                }}
              >
                <Box>
                  <Typography>{route.title}</Typography>
                  <Chip label={route.tripType} size="small" />
                </Box>

                <IconButton onClick={(e) => handleMenuOpen(e, route)}>
                  <MoreVertIcon />
                </IconButton>
              </Box>
            ))}
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setRoutesModalOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* ─── MENU ─── */}
        <Menu anchorEl={menuAnchorEl} open={isMenuOpen} onClose={handleMenuClose}>
          <MenuItem onClick={handleViewRoute}>
            <ListItemIcon>
              <EyeIcon size={18} />
            </ListItemIcon>
            View
          </MenuItem>

          <MenuItem onClick={handleEditRoute}>
            <ListItemIcon>
              <EditIcon size={18} />
            </ListItemIcon>
            Edit
          </MenuItem>

          <MenuItem onClick={handleDeleteRoute}>
            <ListItemIcon>
              <TrashIcon size={18} />
            </ListItemIcon>
            Delete
          </MenuItem>
        </Menu>

        {/* ─── DELETE DIALOG ─── */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogContent>
            <Typography>Are you sure you want to delete this route?</Typography>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={handleConfirmDelete}
              disabled={deleteRouteLoading}
            >
              {deleteRouteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  );
}