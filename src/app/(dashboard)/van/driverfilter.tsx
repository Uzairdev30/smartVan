// app/(dashboard)/vans/driverfilter.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import {
  Menu,
  MenuItem as MenuItemComponent,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { CheckCircleIcon, MinusIcon } from "@/components/icons";
import {
  FilterButton,
  FilterPopover,
  useFilterContext,
} from "@/components/core/filter-button";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import {
  bulkUpdateVanStatus,
  deleteVans,
  removeDriverFromVan,
} from "@/store/reducers/van-slice";

export interface VanFilters {
  carNumber?: string;
  driverName?: string;
}

interface VanFilterProps {
  filters: VanFilters;
  setFilters: (updater: VanFilters | ((prev: VanFilters) => VanFilters)) => void;
  selected?: any[];
  onBulkStatusUpdate?: (vanIds: string[], status: string) => void;
  onBulkDelete?: (vanIds: string[]) => void;
  bulkStatusLoading?: boolean;
  deleteVanLoading?: boolean;
  onRefresh?: () => void;
  vanOwn?: boolean;
}

export function VanFilter({
  filters,
  setFilters,
  selected = [],
  onRefresh,
  vanOwn = false,
}: VanFilterProps): React.JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const [actionAnchor, setActionAnchor] = useState<null | HTMLElement>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const handleFilterChange = useCallback(
    (key: keyof VanFilters, value?: string) => {
      setFilters((prev: VanFilters) => {
        const next = { ...prev };
        if (!value || value.trim() === "") {
          delete next[key];
        } else {
          next[key] = value;
        }
        return next;
      });
    },
    [setFilters]
  );

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, [setFilters]);

  const hasFilters = Object.values(filters || {}).some((val) => !!val);
  const hasSelected = selected.length > 0;

  const handleBulkDelete = async () => {
    const ids = selected
      ?.map((item: any) => item?.van?._id || item?.van?.id || item?.id)
      .filter(Boolean);
    if (!ids.length) {
      alert("Please select at least one van to delete");
      return;
    }
    const confirmMessage =
      ids.length === 1
        ? "Are you sure you want to delete this van?"
        : `Are you sure you want to delete ${ids.length} vans?`;
    if (window.confirm(confirmMessage)) {
      try {
        setBulkUpdating(true);
        setActionAnchor(null);
        const vansWithDrivers = selected.filter(
          (item: any) => item?.van?.driverId
        );
        if (vansWithDrivers.length > 0) {
          await Promise.all(
            vansWithDrivers.map((van) =>
              dispatch(
                removeDriverFromVan({
                  driverId: van.van.driverId,
                  vanId: van?.van?._id || van?.van?.id || van?.id,
                })
              ).unwrap()
            )
          );
        }
        await dispatch(deleteVans({ vanIds: ids }));
        if (onRefresh) onRefresh();
      } catch (error) {
        console.error("Failed to delete vans:", error);
      } finally {
        setBulkUpdating(false);
      }
    }
  };

  const handleBulkActivate = async () => {
    const ids = selected
      ?.map((item: any) => item?.van?._id || item?.van?.id || item?.id)
      .filter(Boolean);
    if (!ids.length) return;
    try {
      setBulkUpdating(true);
      setActionAnchor(null);
      await dispatch(bulkUpdateVanStatus({ vanIds: ids, status: "active" }));
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Failed to activate vans:", error);
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkDeactivate = async () => {
    const ids = selected
      ?.map((item: any) => item?.van?._id || item?.van?.id || item?.id)
      .filter(Boolean);
    if (!ids.length) return;
    try {
      setBulkUpdating(true);
      setActionAnchor(null);
      await dispatch(bulkUpdateVanStatus({ vanIds: ids, status: "inActive" }));
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Failed to deactivate vans:", error);
    } finally {
      setBulkUpdating(false);
    }
  };

  return (
    <div>
      <Divider />
      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        sx={{ alignItems: "center", px: 3, py: 2, flexWrap: "wrap" }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: "center", flexWrap: "wrap" }}
        >
          <FilterButton
            displayValue={filters?.carNumber || ""}
            label="Car Number"
            onFilterApply={(value) =>
              handleFilterChange("carNumber", value as string)
            }
            onFilterDelete={() => handleFilterChange("carNumber", "")}
            popover={<GenericFilterPopover field="Car Number" />}
            value={filters?.carNumber || ""}
          />

          <FilterButton
            displayValue={filters?.driverName || ""}
            label="Driver Name"
            onFilterApply={(value) =>
              handleFilterChange("driverName", value as string)
            }
            onFilterDelete={() => handleFilterChange("driverName", "")}
            popover={<GenericFilterPopover field="Driver Name" />}
            value={filters?.driverName || ""}
          />

          {hasFilters && (
            <Button size="small" onClick={handleClearFilters}>
              Clear filters
            </Button>
          )}
        </Stack>

        {!vanOwn && hasSelected && (
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2">{selected.length} selected</Typography>
            <Button
              variant="contained"
              onClick={(e) => setActionAnchor(e.currentTarget)}
              disabled={bulkUpdating}
            >
              {bulkUpdating ? "Processing..." : "Action"}
            </Button>
          </Stack>
        )}

        {!vanOwn && (
          <Menu
            anchorEl={actionAnchor}
            open={Boolean(actionAnchor)}
            onClose={() => setActionAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItemComponent onClick={handleBulkActivate}>
              <ListItemIcon>
                <CheckCircleIcon color="var(--mui-palette-success-main)" />
              </ListItemIcon>
              <ListItemText>Activate</ListItemText>
            </MenuItemComponent>
            <MenuItemComponent onClick={handleBulkDeactivate}>
              <ListItemIcon>
                <MinusIcon color="var(--mui-palette-error-main)" />
              </ListItemIcon>
              <ListItemText>InActive</ListItemText>
            </MenuItemComponent>
          </Menu>
        )}
      </Stack>
    </div>
  );
}

function GenericFilterPopover({ field }: { field: string }) {
  const { anchorEl, onApply, onClose, open, value: initialValue } =
    useFilterContext();
  const [value, setValue] = useState(initialValue || "");

  useEffect(() => {
    setValue(initialValue || "");
  }, [initialValue]);

  return (
    <FilterPopover
      anchorEl={anchorEl}
      onClose={onClose}
      open={open}
      title={`Filter by ${field}`}
    >
      <FormControl>
        <OutlinedInput
          autoFocus
          onChange={(e) => setValue(e.target.value)}
          onKeyUp={(e) => e.key === "Enter" && onApply(value)}
          value={value}
        />
      </FormControl>
      <Button onClick={() => onApply(value)} variant="contained">
        Apply
      </Button>
    </FilterPopover>
  );
}