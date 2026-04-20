"use client";

import React, { useCallback, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import { FilterButton, FilterPopover, useFilterContext } from "@/components/core/filter-button";

export interface Filters {
  alertTitle?: string;
  message?: string;
  sendTo?: string;
}

interface AlertFilterProps {
  filters: Filters;
  setFilters: (updater: Filters | ((prev: Filters) => Filters)) => void;
}

export function AlertFilter({
  filters,
  setFilters,
}: AlertFilterProps): React.JSX.Element {
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
          <FilterButton
            displayValue={filters?.alertTitle || ""}
            label="Alert Title"
            onFilterApply={(value) =>
              handleFilterChange("alertTitle", value as string)
            }
            onFilterDelete={() => handleFilterChange("alertTitle", "")}
            popover={<GenericFilterPopover field="Alert Title" />}
            value={filters?.alertTitle || ""}
          />

          <FilterButton
            displayValue={filters?.message || ""}
            label="Message"
            onFilterApply={(value) =>
              handleFilterChange("message", value as string)
            }
            onFilterDelete={() => handleFilterChange("message", "")}
            popover={<GenericFilterPopover field="Message" />}
            value={filters?.message || ""}
          />

          <FilterButton
            displayValue={filters?.sendTo || ""}
            label="Receipt Type"
            onFilterApply={(value) =>
              handleFilterChange("sendTo", value as string)
            }
            onFilterDelete={() => handleFilterChange("sendTo", "")}
            popover={<GenericFilterPopover field="Receipt Type" />}
            value={filters?.sendTo || ""}
          />

          {hasFilters && (
            <Button onClick={handleClearFilters}>Clear filters</Button>
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
      <FormControl fullWidth>
        <OutlinedInput
          autoFocus
          fullWidth
          onChange={(e) => setValue(e.target.value)}
          onKeyUp={(e) => e.key === "Enter" && onApply(value)}
          value={value}
        />
      </FormControl>
      <Button onClick={() => onApply(value)} variant="contained" sx={{ mt: 2 }}>
        Apply
      </Button>
    </FilterPopover>
  );
}