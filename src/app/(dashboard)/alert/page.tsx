"use client";

import * as React from "react";
import { useEffect } from "react";
import {
  Box,
  Card,
  Divider,
  Stack,
  Typography,
  IconButton,
  CircularProgress,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { Pencil as EditIcon } from "@phosphor-icons/react/dist/ssr/Pencil";
import { Trash as DeleteIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { Trash as TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { config } from "@/config";
import { DataTable, type ColumnDef } from "@/components/core/data-table";
import { CustomersPagination } from "@/components/dashboard/customer/customers-pagination";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  deleteAlert,
  getAlertById,
  getAllAlerts,
} from "@/store/reducers/alert-slice";
import dayjs from "dayjs";
import { formatLabel } from "@/utils/data";
import { paths } from "@/paths";
import { AlertFilter, type Filters } from "./alertfilter";

type AlertRecord = {
  _id: string;
  alertType: string;
  message: string;
  recipientType: string;
  date: string;
  status: string;
};

const AlertActions = ({ row }: { row: AlertRecord }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteAlertLoading, setDeleteAlertLoading] = React.useState(false);

  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleView = async () => {
    try {
      await dispatch(getAlertById(row._id)).unwrap();
      router.push(`${paths.dashboard.alert}/${row._id}`);
    } catch (error) {
      console.error("View failed:", error);
    } finally {
      handleMenuClose();
    }
  };

  const handleEdit = () => {
    router.push(`${paths.dashboard.alert}/edit/${row._id}`);
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    setDeleteAlertLoading(true);
    try {
      await dispatch(deleteAlert({ alertId: row._id })).unwrap();
      setDeleteDialogOpen(false);
    } catch (err: any) {
      console.error("Delete failed:", err);
    } finally {
      setDeleteAlertLoading(false);
    }
  };

  return (
    <>
      <Stack direction="row" spacing={0} sx={{ justifyContent: "flex-end" }}>
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          sx={{
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "transparent",
            },
          }}
        >
          <MoreVertIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            elevation: 0,
            sx: {
              boxShadow: "none",
              border: "1px solid #e0e0e0",
            },
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

          <MenuItem onClick={handleDelete}>
            <ListItemIcon>
              <DeleteIcon size={18} />
            </ListItemIcon>
            <ListItemText primary="Delete" />
          </MenuItem>
        </Menu>
      </Stack>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Alert</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this alert{" "}
            <strong>"{row.alertType}"</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={deleteAlertLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleteAlertLoading}
            startIcon={
              deleteAlertLoading ? (
                <CircularProgress size={16} />
              ) : (
                <TrashIcon size={18} />
              )
            }
          >
            {deleteAlertLoading ? "Deleting..." : "Delete Alert"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default function AlertPage(): React.JSX.Element {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    document.title = `${config.site.name} | Alert List`;
  }, []);

  const { loading, alerts, pagination } = useSelector(
    (state: RootState) => state.alert
  );

  const [selectedAlerts, setSelectedAlerts] = React.useState<AlertRecord[]>([]);
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);
  const [filters, setFilters] = React.useState<Filters>({});

  React.useEffect(() => {
    dispatch(getAllAlerts({ page, limit }));
  }, [dispatch, page, limit]);

  const filteredAlerts = React.useMemo(() => {
    let result = alerts || [];

    if (filters.alertTitle?.trim()) {
      result = result.filter((a) =>
        a?.alertType
          ?.toLowerCase()
          .includes(filters.alertTitle!.trim().toLowerCase())
      );
    }

    if (filters.message?.trim()) {
      result = result.filter((a) =>
        a?.message
          ?.toLowerCase()
          .includes(filters.message!.trim().toLowerCase())
      );
    }

    if (filters.sendTo?.trim()) {
      result = result.filter((a) =>
        formatLabel(a?.recipientType)
          ?.toLowerCase()
          .includes(filters.sendTo!.trim().toLowerCase())
      );
    }

    return result;
  }, [alerts, filters]);

  const columns: ColumnDef<AlertRecord>[] = [
    {
      name: "S.No",
      width: "100px",
      formatter: (row, index) => (
        <Typography variant="body2">
          {(page - 1) * limit + index + 1}
        </Typography>
      ),
    },
    {
      name: "Alert Title",
      width: "150px",
      formatter: (row) => <Typography variant="body2">{row.alertType}</Typography>,
    },
    {
      name: "Date/Time",
      width: "150px",
      formatter: (row) => (
        <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
          <Box component="span" sx={{ fontWeight: 600 }}>
            {dayjs(row.date).format("DD MMM YYYY")}
          </Box>
          <Box
            component="span"
            sx={{
              display: "inline-block",
              fontSize: "11px",
              color: "primary.main",
              backgroundColor: "action.hover",
              px: 1,
              py: 0.3,
              borderRadius: "8px",
              ml: 1,
            }}
          >
            {dayjs(row.date).format("hh:mm A")}
          </Box>
        </Typography>
      ),
    },
    {
      name: "Receipt Type",
      width: "180px",
      formatter: (row) => (
        <Typography variant="body2">{formatLabel(row.recipientType)}</Typography>
      ),
    },
    {
      name: "Message",
      width: "150px",
      formatter: (row) => <Typography variant="body2">{row.message}</Typography>,
    },
    {
      name: "Actions",
      width: "90px",
      align: "right",
      formatter: (row) => <AlertActions row={row} />,
    },
  ];

  return (
    <Box sx={{ bgcolor: "var(--mui-palette-background-level1)", p: 3 }}>
      <Stack spacing={3}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5">Alerts</Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push("/alert/create")}
          >
            Add Alert
          </Button>
        </Box>

        <Card>
          <AlertFilter
            filters={filters}
            setFilters={(updater) => {
              setFilters((prev) =>
                typeof updater === "function" ? updater(prev) : updater
              );
            }}
          />

          <Box sx={{ overflowX: "auto" }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : filteredAlerts?.length ? (
              <DataTable<AlertRecord>
                columns={columns}
                rows={filteredAlerts}
                selectable={false}
                onSelectionChange={(_, rows) => setSelectedAlerts(rows)}
              />
            ) : (
              <Box sx={{ p: 3 }}>
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center" }}
                  variant="body2"
                >
                  No Data Found
                </Typography>
              </Box>
            )}
          </Box>

          <Divider />

          <CustomersPagination
            count={pagination?.total || 0}
            page={Math.max(0, page - 1)}
            rowsPerPage={limit}
            onPaginationChange={(_, newPage) => {
              setPage(newPage + 1);
              setSelectedAlerts([]);
            }}
            onRowsPerPageChange={(event) => {
              const newLimit = parseInt(event.target.value, 10);
              setLimit(newLimit);
              setPage(1);
              setSelectedAlerts([]);
            }}
          />
        </Card>
      </Stack>
    </Box>
  );
}