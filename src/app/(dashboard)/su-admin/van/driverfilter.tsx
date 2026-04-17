// app/(dashboard)/su-admin/van/driverfilter.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import {
  FilterButton,
  FilterPopover,
  useFilterContext,
} from "@/components/core/filter-button";
import axios from "@/api/axios";
import { SUADMIN } from "@/api/endpoint";

export interface VanFilters {
  carNumber?: string;
  driverName?: string;
  status?: string;
}

interface VanFilterProps {
  filters: VanFilters;
  setFilters: (updater: VanFilters | ((prev: VanFilters) => VanFilters)) => void;
  selected?: any[];
  onRefresh?: () => void;
}

export function VanFilter({
  filters,
  setFilters,
  selected = [],
  onRefresh,
}: VanFilterProps): React.JSX.Element {

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
            displayValue={filters?.status || ""}
            label="Status"
            onFilterApply={(value) =>
              handleFilterChange("status", value as string)
            }
            onFilterDelete={() => handleFilterChange("status", "")}
            popover={<GenericFilterPopover field="Status" />}
            value={filters?.status || ""}
          />

          {hasFilters && (
            <Button size="small" onClick={handleClearFilters}>
              Clear filters
            </Button>
          )}
        </Stack>
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


