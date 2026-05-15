"use client";

import * as React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  Divider,
  Stack,
  Typography,
  Chip,
  CircularProgress,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  Tooltip,
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { DataTable, type ColumnDef } from "@/components/core/data-table";
import { Trash as TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { config } from "@/config";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { getAllSupportLinks, deleteSupportLink } from "@/store/reducers/suadmin-slice";

type SupportLinkRow = {
  _id: string;
  type: string;
  title: string;
  value: string;
  url: string | null;
  status: string;
  index: number;
};

const TYPE_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  facebook:  { bg: "#1877F215", color: "#1877F2", label: "Facebook"  },
  instagram: { bg: "#E1306C15", color: "#E1306C", label: "Instagram" },
  twitter:   { bg: "#1DA1F215", color: "#1DA1F2", label: "Twitter"   },
  youtube:   { bg: "#FF000015", color: "#FF0000", label: "YouTube"   },
  whatsapp:  { bg: "#25D36615", color: "#25D366", label: "WhatsApp"  },
  website:   { bg: "#00897B15", color: "#00897B", label: "Website"   },
  email:     { bg: "#FB8C0015", color: "#FB8C00", label: "Email"     },
  phone:     { bg: "#5C6BC015", color: "#5C6BC0", label: "Phone"     },
  other:     { bg: "#78909C15", color: "#78909C", label: "Other"     },
};

export default function SupportLinkListPage(): React.JSX.Element {
  const router = useRouter();

  useEffect(() => {
    document.title = `${config.site.name} | Support Links`;
  }, []);

  const dispatch = useDispatch<AppDispatch>();

  const { supportLinks, supportLinksLoading, supportLinksError, supportLinkDeleteLoading } =
    useSelector((s: RootState) => s.suadmin);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [linkToDelete, setLinkToDelete] = React.useState<SupportLinkRow | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedLink, setSelectedLink] = React.useState<SupportLinkRow | null>(null);

  const isMenuOpen = Boolean(menuAnchorEl);

  React.useEffect(() => {
    dispatch(getAllSupportLinks());
  }, [dispatch]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, link: SupportLinkRow) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedLink(link);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedLink(null);
  };

  const handleDeleteClick = () => {
    if (selectedLink) {
      setLinkToDelete(selectedLink);
      setDeleteDialogOpen(true);
    }
    setMenuAnchorEl(null);
  };

  const handleDeleteConfirm = async () => {
    if (!linkToDelete) return;
    try {
      await dispatch(deleteSupportLink(linkToDelete._id)).unwrap();
      setDeleteDialogOpen(false);
      setLinkToDelete(null);
      dispatch(getAllSupportLinks());
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setLinkToDelete(null);
  };

  const rows: SupportLinkRow[] = React.useMemo(() => {
    return (supportLinks ?? []).map((l: any, i: number) => ({
      _id: l?._id ?? l?.id,
      type: l?.type ?? "other",
      title: l?.title ?? "—",
      value: l?.value ?? "—",
      url: l?.url ?? null,
      status: l?.status ?? "active",
      index: i + 1,
    }));
  }, [supportLinks]);

  const columns: ColumnDef<SupportLinkRow>[] = [
    {
      name: "S.No",
      width: "70px",
      formatter: (row) => (
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {row.index}
        </Typography>
      ),
    },
    {
      name: "Platform Type",
      width: "150px",
      formatter: (row) => {
        const meta = TYPE_COLORS[row.type] ?? TYPE_COLORS.other;
        return (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              px: 1.5,
              py: 0.5,
              borderRadius: "20px",
              bgcolor: meta.bg,
              border: `1px solid ${meta.color}30`,
            }}
          >
            <Typography
              variant="caption"
              fontWeight={600}
              sx={{ color: meta.color, letterSpacing: 0.3 }}
            >
              {meta.label}
            </Typography>
          </Box>
        );
      },
    },
    {
      name: "Link Title",
      width: "200px",
      formatter: (row) => (
        <Typography variant="body2" fontWeight={600} color="text.primary">
          {row.title}
        </Typography>
      ),
    },
    {
      name: "Display Value",
      width: "200px",
      formatter: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.value}
        </Typography>
      ),
    },
    {
      name: "Destination URL",
      width: "220px",
      formatter: (row) =>
        row.url ? (
          <Tooltip title={row.url} placement="top">
            <Button
              size="small"
              variant="outlined"
              endIcon={<OpenInNewIcon sx={{ fontSize: "14px !important" }} />}
              href={row.url}
              target="_blank"
              rel="noreferrer"
              component="a"
              sx={{
                textTransform: "none",
                fontSize: "0.75rem",
                px: 1.5,
                py: 0.4,
                borderRadius: "8px",
                maxWidth: "180px",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                display: "inline-flex",
              }}
            >
              Visit Link
            </Button>
          </Tooltip>
        ) : (
          <Typography variant="body2" color="text.disabled">
            No URL
          </Typography>
        ),
    },
    {
      name: "Status",
      width: "110px",
      formatter: (row) => (
        <Chip
          size="small"
          variant="outlined"
          label={row.status === "active" ? "Active" : "Inactive"}
          color={row.status === "active" ? "success" : "default"}
        />
      ),
    },
    {
      name: "Actions",
      width: "80px",
      align: "right",
      formatter: (row) => (
        <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
          <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
            <MoreVertIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box
      sx={{
        bgcolor: "var(--mui-palette-background-level1)",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        p: 3,
      }}
    >
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={0.5}>
            <Typography variant="h5" fontWeight={700}>
              Support Links
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage social media and support contact links shown to app users.
            </Typography>
          </Stack>
          <Button
            variant="contained"
            startIcon={<PlusIcon />}
            onClick={() => router.push("/su-admin/supportLink/create")}
            sx={{ textTransform: "none", borderRadius: "8px", px: 2.5 }}
          >
            Add Support Link
          </Button>
        </Stack>

        {/* Table */}
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          {supportLinksLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
              <CircularProgress />
            </Box>
          ) : supportLinksError ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="error">{supportLinksError}</Typography>
            </Box>
          ) : rows.length === 0 ? (
            <Box sx={{ p: 6, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary" fontWeight={500}>
                No support links found
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5, mb: 2 }}>
                Add your first support link to get started.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<PlusIcon />}
                onClick={() => router.push("/su-admin/supportLink/create")}
                sx={{ textTransform: "none", borderRadius: "8px" }}
              >
                Add First Support Link
              </Button>
            </Box>
          ) : (
            <>
              <DataTable columns={columns} rows={rows} />
              <Divider />
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Showing <strong>{rows.length}</strong> support link{rows.length !== 1 ? "s" : ""}
                </Typography>
              </Box>
            </>
          )}
        </Card>
      </Stack>

      {/* 3-dot menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { minWidth: 140, borderRadius: 2 } } }}
      >
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <TrashIcon size={18} />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 360 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Support Link</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>{linkToDelete?.title}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleDeleteCancel}
            disabled={supportLinkDeleteLoading}
            sx={{ textTransform: "none", borderRadius: "8px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={supportLinkDeleteLoading}
            sx={{ textTransform: "none", borderRadius: "8px", minWidth: 90 }}
          >
            {supportLinkDeleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
