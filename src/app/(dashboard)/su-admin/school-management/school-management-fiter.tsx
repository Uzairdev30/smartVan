'use client';
import React, { useState, useEffect, useCallback } from "react";
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import { FilterButton, FilterPopover, useFilterContext } from '@/components/core/filter-button';

export interface Filters {
  schoolName?: string;
  status?: string;
}

export function SchoolManagementFilter({ filters, setFilters }: any): React.JSX.Element {

  const handleFilterChange = useCallback((key: keyof Filters, value?: string) => {
    setFilters((prev: Filters) => {
      const newFilters = { ...prev };
      if (!value || value.trim() === '') {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      return newFilters;
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasFilters = Object.values(filters || {}).some((val) => !!val);
  return (
    <div>

      <Divider />

      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap', px: 3, py: 2 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flex: '1 1 auto', flexWrap: 'wrap' }}>
          <FilterButton
            displayValue={filters?.schoolName || ""}
            label="School Name"
            onFilterApply={(value) => handleFilterChange('schoolName', value as string)}
            onFilterDelete={() => handleFilterChange('schoolName')}
            popover={<GenericFilterPopover field="School Name" />}
            value={filters?.schoolName || ""}
          />

          <FilterButton
            displayValue={filters?.status || ""}
            label="Status"
            onFilterApply={(value) => handleFilterChange('status', value as string)}
            onFilterDelete={() => handleFilterChange('status')}
            popover={<GenericFilterPopover field="Status" />}
            value={filters?.status || ""}
          />

          {hasFilters ? <Button onClick={() => setFilters({})}>Clear filters</Button> : null}
        </Stack>
      </Stack>
    </div>
  );
}

// 🔤 Generic Text Input Popover
function GenericFilterPopover({ field }: { field: string }) {
  const { anchorEl, onApply, onClose, open, value: initialValue } = useFilterContext();
  const [value, setValue] = useState(initialValue || '');

  useEffect(() => {
    setValue(initialValue || '');
  }, [initialValue]);

  const handleApply = () => {
    onApply(value);
  };

  return (
    <FilterPopover anchorEl={anchorEl} onClose={onClose} open={open} title={`Filter by ${field}`}>
      <FormControl>
        <OutlinedInput
          onChange={(e) => setValue(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && handleApply()}
          value={value}
        />
      </FormControl>
      <Button onClick={handleApply} variant="contained">Apply</Button>
    </FilterPopover>
  );
}

