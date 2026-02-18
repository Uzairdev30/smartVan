// app/(dashboard)/student/page.tsx

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  Divider,
  Stack,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { DataTable, type ColumnDef } from "@/components/core/data-table";
import { CustomersPagination } from "@/components/dashboard/customer/customers-pagination";
import {
  CheckCircleIcon,
  MinusIcon,
} from "@/components/icons";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { Trash as TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  getAllStudents,
  getStudentDetail,
  verifyStudentByAdmin,
  deleteStudentsAndRefetch,
  bulkUpdateStudentStatus,
} from "@/store/reducers/student-slice";
import type { StudentRecord } from "@/types/student";
import { StudentFilter, type Filters } from "./studentfilter";

export default function Page(): React.JSX.Element {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { loading, students, pagination } = useSelector(
    (state: RootState) => state.student
  );

  const [selectedStudents, setSelectedStudents] = React.useState<StudentRecord[]>([]);
  const [filters, setFilters] = React.useState<Filters>({});
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [updatingStatus, setUpdatingStatus] = React.useState<string | null>(null);
  const [bulkUpdating, setBulkUpdating] = React.useState(false);
  const [headerActionAnchor, setHeaderActionAnchor] = React.useState<null | HTMLElement>(null);

  // 🔁 Fetch on mount + whenever pagination/filters change
  React.useEffect(() => {
    dispatch(
      getAllStudents({
        page,
        limit,
        ...filters, // carNumber, driverName if present
      })
    );
  }, [dispatch, page, limit, filters]);

  // Refresh function to reload student data
  const handleRefresh = React.useCallback(() => {
    dispatch(
      getAllStudents({
        page,
        limit,
        ...filters,
      })
    );
  }, [dispatch, page, limit, filters]);

  // Bulk status update handlers
  const handleBulkActivate = async () => {
    if (selectedStudents.length === 0) return;
    
    try {
      setBulkUpdating(true);
      setHeaderActionAnchor(null); // Close menu
      const studentIds = selectedStudents.map(s => s.student.id);
      
      console.log('Bulk activating students:', { studentIds, status: 'active' });
      
      await dispatch(
        bulkUpdateStudentStatus({
          studentIds,
          status: 'active',
        })
      ).unwrap();

      // Refresh data and clear selection
      dispatch(getAllStudents({ page, limit, ...filters }));
      setSelectedStudents([]);
      
    } catch (error) {
      console.error("Failed to bulk activate students:", error);
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedStudents.length === 0) return;
    
    try {
      setBulkUpdating(true);
      setHeaderActionAnchor(null); // Close menu
      const studentIds = selectedStudents.map(s => s.student.id);
      
      console.log('Bulk deactivating students:', { studentIds, status: 'inActive' });
      
      await dispatch(
        bulkUpdateStudentStatus({
          studentIds,
          status: 'inActive',
        })
      ).unwrap();

      // Refresh data and clear selection
      dispatch(getAllStudents({ page, limit, ...filters }));
      setSelectedStudents([]);
      
    } catch (error) {
      console.error("Failed to bulk deactivate students:", error);
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedStudents.length} student(s)?`)) {
      try {
        setBulkUpdating(true);
        setHeaderActionAnchor(null); // Close menu
        const studentIds = selectedStudents.map(s => s.student.id);
        
        console.log('Bulk deleting students:', { studentIds });
        
        await dispatch(deleteStudentsAndRefetch(studentIds)).unwrap();
        
      } catch (error) {
        console.error("Failed to bulk delete students:", error);
      } finally {
        setBulkUpdating(false);
      }
    }
  };

  const columns: ColumnDef<StudentRecord>[] = [
    {
      name: "Student",
      width: "240px",
      formatter: (row): React.JSX.Element => {
        const name = row?.student?.fullname || "";
        const image = row?.student?.image;

        // Inline initials generator
        const initials = name
          .split(" ")
          .map((w) => w[0]?.toUpperCase())
          .join("");

        return (
          <Stack direction="row" spacing={1} alignItems="center">

            {image ? (
              <img
                src={image}
                alt={name}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#1976d2",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {initials}
              </div>
            )}

            <Typography color="text.primary" variant="body2">
              {name}
            </Typography>
          </Stack>
        );
      }
    }
    ,
    {
      name: "Parent/Guardian",
      width: "200px",
      formatter: (row): React.JSX.Element => (
        <Typography color="text.primary" variant="body2">
          {row.parent?.fullname}
        </Typography>
      ),
    },
    {
      name: "Class/Grade",
      width: "150px",
      formatter: (row): React.JSX.Element => (
        <Typography color="text.secondary" variant="body2">
          {row.student?.grade}
        </Typography>
      ),
    },
    {
      name: "Van Assigned",
      width: "150px",
      formatter: (row): React.JSX.Element => (
        <Typography color="text.secondary" variant="body2">
          {row.van?.carNumber || "N/A"}
        </Typography>
      ),
    },
    {
      name: "Driver",
      width: "180px",
      formatter: (row): React.JSX.Element => (
        <Typography color="text.secondary" variant="body2">
          {row.driver?.fullname || "N/A"}
        </Typography>
      ),
    },
    {
      name: "Status",
      width: "120px",
      formatter: (row): React.JSX.Element => {
        const mapping = {
          inActive: {
            label: "Inactive",
            icon: <MinusIcon color="var(--mui-palette-error-main)" />,
            color: "error" as const,
          },
          active: {
            label: "Active",
            icon: (
              <CheckCircleIcon
                color="var(--mui-palette-success-main)"
                weight="fill"
              />
            ),
            color: "success" as const,
          },
        } as const;

        const statusKey = (row.student?.status?.trim()?.toLowerCase() ||
          "inactive") as keyof typeof mapping;

        // Convert "inactive" to "inActive" for mapping
        const mappingKey = statusKey === "inactive" ? "inActive" : statusKey;

        // Debug: Log the actual status value from backend
        console.log('Student status debug:', {
          studentId: row.student.id,
          originalStatus: row.student?.status,
          normalizedStatus: statusKey,
          mappingKey: mappingKey
        });

        const { label, icon, color } = mapping[mappingKey] ?? mapping.inActive;

        const handleStatusClick = async () => {
          if (updatingStatus) return; // Prevent multiple clicks
          
          try {
            setUpdatingStatus(row.student.id);
            
            // Toggle status - ensure case-insensitive comparison
            const currentStatus = row.student.status?.trim()?.toLowerCase() || "inactive";
            const newStatus = currentStatus === "active" ? "inActive" : "active";

            console.log("Updating status:", { id: row.student.id, currentStatus, newStatus });

            await dispatch(
              verifyStudentByAdmin({
                id: row.student.id,
                status: newStatus,
              })
            ).unwrap();

            // Refresh the data to ensure UI is updated
            dispatch(getAllStudents({ page, limit, ...filters }));

          } catch (error) {
            console.error("Failed to toggle student status:", error);
          } finally {
            setUpdatingStatus(null);
          }
        };


        return (
          <Chip
            icon={icon}
            label={updatingStatus === row.student.id ? "Updating..." : label}
            size="small"
            color={color}
            variant="outlined"
            onClick={handleStatusClick}
            disabled={updatingStatus !== null}
            sx={{
              cursor: updatingStatus ? 'not-allowed' : 'pointer',
              '&:hover': {
                backgroundColor: updatingStatus ? 'transparent' : 'action.hover',
              }
            }}
          />
        );
      },
    },
    {
      name: "Actions",
      width: "100px",
      align: "right",
      formatter: (row) => {
        const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
        const open = Boolean(anchorEl);

        const handleView = async () => {
          setAnchorEl(null);
          await dispatch(getStudentDetail(row.student.id)).unwrap();
          router.push(`/student/${row.student.id}`);
        };

        const handleActivate = async () => {
          setAnchorEl(null);
          try {
            const studentIds = [row.student.id];
            console.log('Activating student:', { studentIds, status: 'active' });
            
            await dispatch(
              bulkUpdateStudentStatus({
                studentIds,
                status: 'active',
              })
            ).unwrap();

            dispatch(getAllStudents({ page, limit, ...filters }));
          } catch (error) {
            console.error("Failed to activate student:", error);
          }
        };

        const handleDeactivate = async () => {
          setAnchorEl(null);
          try {
            const studentIds = [row.student.id];
            console.log('Deactivating student:', { studentIds, status: 'inActive' });
            
            await dispatch(
              bulkUpdateStudentStatus({
                studentIds,
                status: 'inActive',
              })
            ).unwrap();

            dispatch(getAllStudents({ page, limit, ...filters }));
          } catch (error) {
            console.error("Failed to deactivate student:", error);
          }
        };

        const handleDelete = async () => {
          setAnchorEl(null);
          if (window.confirm('Are you sure you want to delete this student?')) {
            try {
              await dispatch(deleteStudentsAndRefetch([row.student.id])).unwrap();
            } catch (error) {
              console.error("Failed to delete student:", error);
            }
          }
        };

        return (
          <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
            <IconButton size="small" onClick={handleView}>
              <EyeIcon />
            </IconButton>
          </Stack>
        );
      },
    },
  ];

  return (
    <Box sx={{ bgcolor: "var(--mui-palette-background-level1)", p: 3 }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          sx={{ alignItems: "flex-start" }}
        >
          <Box sx={{ flex: "1 1 auto" }}>
            <Typography variant="h5">Student Management</Typography>
          </Box>
        </Stack>

        <Card>
          <StudentFilter
            filters={filters}
            setFilters={(updater) => {
              setPage(1); // reset page on filter change
              setFilters((prev) =>
                typeof updater === "function" ? updater(prev) : updater
              );
            }}
            selected={selectedStudents}
            onRefresh={handleRefresh}
          />

          <Box sx={{ overflowX: "auto" }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : students?.length ? (
              <DataTable<any>
                columns={columns}
                rows={students}
                selectable
                onSelectionChange={(_, rows) =>
                  setSelectedStudents(rows as StudentRecord[])
                }
              />
            ) : (
              <Box sx={{ p: 3 }}>
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center" }}
                  variant="body2"
                >
                  No Data found
                </Typography>
              </Box>
            )}
          </Box>

          <Divider />

          <CustomersPagination
            count={pagination?.total || 0}
            page={(page || 1) - 1}
            rowsPerPage={limit}
            onPaginationChange={(_, newPage) => {
              setPage(newPage + 1);
              setSelectedStudents([]);
            }}
            onRowsPerPageChange={(event) => {
              const newLimit = parseInt(event.target.value, 10);
              setLimit(newLimit);
              setPage(1);
              setSelectedStudents([]);
            }}
          />
        </Card>
      </Stack>
    </Box>
  );
}
