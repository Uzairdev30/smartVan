import * as React from 'react';
import TablePagination from '@mui/material/TablePagination';

interface CustomersPaginationProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPaginationChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CustomersPagination({ 
  count, 
  page, 
  rowsPerPage, 
  onPaginationChange, 
  onRowsPerPageChange 
}: CustomersPaginationProps): React.JSX.Element {
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      onPageChange={onPaginationChange} 
      onRowsPerPageChange={onRowsPerPageChange} 
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={[10, 25, 50]}
    />
  );
}
