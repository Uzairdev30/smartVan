// app/(dashboard)/student/studentfilter.tsx

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
import { deleteStudentsAndRefetch, bulkUpdateStudentStatus } from "@/store/reducers/student-slice";

export interface Filters {
  carNumber?: string;
  driverName?: string;
  kidsName?: string;
  parentName?: string;
  grade?: string;
}

interface StudentFilterProps {
  filters: Filters;
  setFilters: (updater: Filters | ((prev: Filters) => Filters)) => void;
  selected: any[];
  onRefresh?: () => void;
}

export function StudentFilter({
  filters,
  setFilters,
  selected,
  onRefresh,
}: StudentFilterProps): React.JSX.Element {
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

  const handleBulkDelete = async () => {
    console.log('Selected data structure for delete:', selected);
    const ids = selected
      ?.map((item: any) => item?.student?.id || item?.id)
      .filter(Boolean);

    console.log('Extracted IDs for delete:', ids);

    if (!ids.length) {
      alert('Please select at least one student to delete');
      return;
    }

    const confirmMessage = ids.length === 1
      ? 'Are you sure you want to delete this student?'
      : `Are you sure you want to delete ${ids.length} students?`;

    if (window.confirm(confirmMessage)) {
      try {
        setBulkUpdating(true);
        setActionAnchor(null);
        await dispatch(deleteStudentsAndRefetch(ids));
      } catch (error) {
        console.error("Failed to delete students:", error);
      } finally {
        setBulkUpdating(false);
      }
    }
  };

  const handleBulkActivate = async () => {
    console.log('🔍 Selected data structure:', selected);
    const ids = selected
      ?.map((item: any) => item?.student?.id || item?.id)
      .filter(Boolean);

    console.log('Extracted IDs:', ids);

    if (!ids.length) return;

    try {
      setBulkUpdating(true);
      setActionAnchor(null);
      await dispatch(
        bulkUpdateStudentStatus({
          studentIds: ids,
          status: 'active',
        })
      );
      // Refresh data to show updated status
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to activate students:", error);
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkDeactivate = async () => {
    const ids = selected
      ?.map((item: any) => item?.student?.id || item?.id)
      .filter(Boolean);

    if (!ids.length) return;

    try {
      setBulkUpdating(true);
      setActionAnchor(null);
      await dispatch(
        bulkUpdateStudentStatus({
          studentIds: ids,
          status: 'inActive',
        })
      );
      // Refresh data to show updated status
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to deactivate students:", error);
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
        sx={{ alignItems: "center", flexWrap: "wrap", px: 3, py: 2 }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: "center", flex: "1 1 auto", flexWrap: "wrap" }}
        >
          {/* 🔍 Car Number */}
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
          <FilterButton
            displayValue={filters?.kidsName || ""}
            label="Student Name"
            onFilterApply={(value) =>
              handleFilterChange("kidsName", value as string)
            }
            onFilterDelete={() => handleFilterChange("kidsName", "")}
            popover={<GenericFilterPopover field="Student Name" />}
            value={filters?.kidsName || ""}
          />
          <FilterButton
            displayValue={filters?.parentName || ""}
            label="Parent Name"
            onFilterApply={(value) =>
              handleFilterChange("parentName", value as string)
            }
            onFilterDelete={() => handleFilterChange("parentName", "")}
            popover={<GenericFilterPopover field="Parent Name" />}
            value={filters?.parentName || ""}
          />
          {/* 🔍 Grade */}
          <FilterButton
            displayValue={filters?.grade || ""}
            label="Class/Grade"
            onFilterApply={(value) =>
              handleFilterChange("grade", value as string)
            }
            onFilterDelete={() => handleFilterChange("grade", "")}
            popover={<GenericFilterPopover field="Grade" />}
            value={filters?.grade || ""}
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
            <ListItemIcon sx={{ color: "error.main" }}>
              <Trash weight="fill" />
            </ListItemIcon>
            <ListItemText>Delete All</ListItemText>
          </MenuItem>

          <MenuItem>
           <ListItemIcon>
              <CheckCircleIcon color="var(--mui-palette-success-main)" />
            </ListItemIcon>
            <ListItemText>Assign Van All</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleBulkDelete}>
            <ListItemIcon sx={{ color: "error.main" }}>
              <Trash weight="fill" />
            </ListItemIcon>
            <ListItemText>Remove Van All</ListItemText>
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
