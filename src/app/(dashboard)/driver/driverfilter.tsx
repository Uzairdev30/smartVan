// app/(dashboard)/driver/driverfilter.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import { Trash } from "@phosphor-icons/react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { CheckCircleIcon, MinusIcon } from "@/components/icons";
import {
  FilterButton,
  FilterPopover,
  useFilterContext,
} from "@/components/core/filter-button";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { changeDriverStatus, removeDriverFromSchool } from "@/services/driver.api";

export interface Filters {
  driverName?: string;
  status?: string;
}

interface DriverFilterProps {
  filters: Filters;
  setFilters: (updater: Filters | ((prev: Filters) => Filters)) => void;
  selected: any[];
  onRefresh?: () => void;
}

export function DriverFilter({
  filters,
  setFilters,
  selected,
  onRefresh,
}: DriverFilterProps): React.JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const [actionAnchor, setActionAnchor] = useState<null | HTMLElement>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const handleFilterChange = useCallback(
    (key: keyof Filters, value?: string) => {
      setFilters((prev: Filters) => {
        const next = { ...prev };
        if (!value) {
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

  const handleBulkActivate = async () => {
    console.log('🔍 Selected data structure for activate:', selected);
    const ids = selected
      ?.map((item: any) => item?._id || item?.id)
      .filter(Boolean);
    
    console.log('Extracted IDs for activate:', ids);

    if (!ids.length) return;
    
    try {
      setBulkUpdating(true);
      setActionAnchor(null);
      
      // Activate all selected drivers
      for (const driverId of ids) {
        await changeDriverStatus({ id: driverId, status: 'Active' });
      }
      
      console.log('✅ Successfully activated drivers:', ids);
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to bulk activate drivers:", error);
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkDeactivate = async () => {
    console.log('🔍 Selected data structure for deactivate:', selected);
    const ids = selected
      ?.map((item: any) => item?._id || item?.id)
      .filter(Boolean);
    
    console.log('Extracted IDs for deactivate:', ids);

    if (!ids.length) return;
    
    try {
      setBulkUpdating(true);
      setActionAnchor(null);
      
      // Deactivate all selected drivers
      for (const driverId of ids) {
        await changeDriverStatus({ id: driverId, status: 'inActive' });
      }
      
      console.log('✅ Successfully deactivated drivers:', ids);
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to bulk deactivate drivers:", error);
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    console.log('Selected data structure for delete:', selected);
    const ids = selected
      ?.map((item: any) => item?._id || item?.id)
      .filter(Boolean);
    
    console.log('Extracted IDs for delete:', ids);

    if (!ids.length) {
      alert('Please select at least one driver to delete');
      return;
    }

    const confirmMessage = ids.length === 1 
      ? 'Are you sure you want to delete this driver?' 
      : `Are you sure you want to delete ${ids.length} drivers?`;

    if (window.confirm(confirmMessage)) {
      try {
        setBulkUpdating(true);
        setActionAnchor(null);
        
        // Remove drivers from school
        await removeDriverFromSchool({ driverIds: ids });
        
        console.log('✅ Successfully deleted drivers:', ids);
        if (onRefresh) {
          onRefresh();
        }
      } catch (error) {
        console.error("Failed to bulk delete drivers:", error);
      } finally {
        setBulkUpdating(false);
      }
    }
  };

  return (
    <div>
      <Divider />

      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: "center", flexWrap: "wrap", px: 3, py: 2 }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: "center", flex: "1 1 auto", flexWrap: "wrap" }}
        >
          {/* 🔍 Driver Name */}
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

          {/* 🔍 Status */}
          <FilterButton
            displayValue={filters?.status || ""}
            label="Status"
            onFilterApply={(value) =>
              handleFilterChange("status", value as string)
            }
            onFilterDelete={() => handleFilterChange("status", "")}
            popover={<GenericFilterPopover field="Status" />}
            value={filters?.status || ""}
          />

          {hasFilters ? (
            <Button onClick={handleClearFilters}>Clear filters</Button>
          ) : null}
        </Stack>

        {selected.length > 0 && (
          <>
            <Typography variant="body2" sx={{ alignSelf: "center" }}>
              {selected.length} selected
            </Typography>
            <Button
              variant="contained"
              onClick={(e) => setActionAnchor(e.currentTarget)}
              disabled={bulkUpdating}
            >
              Action
            </Button>
          </>
        )}

        <Menu
          anchorEl={actionAnchor}
          open={Boolean(actionAnchor)}
          onClose={() => setActionAnchor(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleBulkActivate}>
            <ListItemIcon>
              <CheckCircleIcon color="var(--mui-palette-success-main)" />
            </ListItemIcon>
            <ListItemText>Activate All</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={handleBulkDeactivate}>
            <ListItemIcon>
              <MinusIcon color="var(--mui-palette-error-main)" />
            </ListItemIcon>
            <ListItemText>Inactive All</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={handleBulkDelete}>
            <ListItemIcon>
              <Trash weight="fill" />
            </ListItemIcon>
            <ListItemText>Delete All</ListItemText>
          </MenuItem>
        </Menu>
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
