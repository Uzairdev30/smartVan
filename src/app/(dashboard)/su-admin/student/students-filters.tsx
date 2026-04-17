"use client";

import React, { useState, useCallback } from "react";
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

export interface StudentFilters {
  studentName?: string;
  age?: string;
  status?: string;
  parentName?: string;
}

interface StudentFilterProps {
  filters: StudentFilters;
  setFilters: (updater: StudentFilters | ((prev: StudentFilters) => StudentFilters)) => void;
  onRefresh?: () => void;
}

export function StudentFilter({
  filters,
  setFilters,
  onRefresh,
}: StudentFilterProps): React.JSX.Element {

  const handleFilterChange = useCallback(
    (key: keyof StudentFilters, value?: string) => {
      setFilters((prev: StudentFilters) => {
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
            displayValue={filters?.studentName || ""}
            label="Student Name"
            onFilterApply={(value) =>
              handleFilterChange("studentName", value as string)
            }
            onFilterDelete={() => handleFilterChange("studentName", "")}
            popover={<GenericFilterPopover field="Student Name" />}
            value={filters?.studentName || ""}
          />
          
          <FilterButton
            displayValue={filters?.age || ""}
            label="Age"
            onFilterApply={(value) =>
              handleFilterChange("age", value as string)
            }
            onFilterDelete={() => handleFilterChange("age", "")}
            popover={<GenericFilterPopover field="Age" />}
            value={filters?.age || ""}
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

  React.useEffect(() => {
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

