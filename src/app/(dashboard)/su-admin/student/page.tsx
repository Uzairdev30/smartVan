"use client";

import * as React from "react";
import { useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { config } from "@/config";
import { DataTable, type ColumnDef } from "@/components/core/data-table";
import { CustomersPagination } from "@/components/dashboard/customer/customers-pagination";
import { useRouter } from "next/navigation";
import { SUADMIN } from "@/api/endpoint";
import axios from "@/api/axios";

export default function Page(): React.JSX.Element {
  const router = useRouter();

  useEffect(() => {
    document.title = `${config.site.name} | Student List`;
  }, []);

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedStudent, setSelectedStudent] = React.useState<any | null>(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  const [students, setStudents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [pagination, setPagination] = React.useState({ total: 0, totalPages: 1 });
  const [selectedSchool, setSelectedSchool] = React.useState<string>('all');
  const [schools, setSchools] = React.useState<any[]>([]);
  const [detailsModalOpen, setDetailsModalOpen] = React.useState(false);
  const [selectedStudentDetails, setSelectedStudentDetails] = React.useState<any>(null);
  const [localStudents, setLocalStudents] = React.useState<any[]>([]);

  // Fetch students data
  const fetchStudents = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/GetStudentsBySuperAdmin', {
        params: { page, limit, schoolId: selectedSchool === 'all' ? undefined : selectedSchool }
      });

      if (response.data?.data) {
        setStudents(response.data.data);
        setLocalStudents(response.data.data);
        setPagination(response.data.pagination || { total: 0, totalPages: 1 });
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, selectedSchool]);

  // Client-side filtering
  const filteredStudents = React.useMemo(() => {
    return localStudents;
  }, [localStudents]);

  // Fetch schools for filter dropdown
  const fetchSchools = React.useCallback(async () => {
    try {
      const response = await axios.get(SUADMIN.GET_ALL_SCHOOL);
      if (response.data?.data) {
        setSchools(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  }, []);

  // Fetch students on component mount and when page/limit changes
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Fetch schools on component mount
  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  // Menu Handlers
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, student: any) => {
    setMenuAnchorEl(e.currentTarget);
    setSelectedStudent(student);
  };

  const handleMenuClose = () => setMenuAnchorEl(null);

  const handleView = () => {
    if (selectedStudent) {
      router.push(`/su-admin/student/${selectedStudent.student.id}`);
    }
    handleMenuClose();
  };

  const handleViewDetails = (student: any) => {
    setSelectedStudentDetails(student);
    setDetailsModalOpen(true);
  };

  const columns: ColumnDef<any>[] = [
    {
      name: "S.No",
      formatter: (row, index) => (
        <Typography fontWeight={500}>
          {((page - 1) * limit) + index + 1}
        </Typography>
      ),
    },
    {
      name: "Student Name",
      width: "240px",
      formatter: (row): React.JSX.Element => {
        const name = row?.student?.fullname || "No Name";
        const image = row?.student?.image;
        const grade = row?.student?.grade || "N/A";

        const initials = name
          .split(" ")
          .map((w: string) => w[0]?.toUpperCase())
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

            <Box>
              <Typography color="text.primary" variant="body2">
                {name}
              </Typography>
              <Typography color="text.secondary" variant="caption">
                Grade: {grade}
              </Typography>
            </Box>
          </Stack>
        );
      },
    },
    {
      name: "Gender",
      formatter: (row) => (
        <Typography color="text.secondary" variant="body2">
          {row?.student?.gender || "N/A"}
        </Typography>
      ),
    },
    {
      name: "Age",
      formatter: (row) => (
        <Typography color="text.secondary" variant="body2">
          {row?.student?.age || "N/A"}
        </Typography>
      ),
    },
    {
      name: "DOB",
      formatter: (row) => (
        <Typography color="text.secondary" variant="body2">
          {row?.student?.dob ? new Date(row.student.dob).toLocaleDateString() : "N/A"}
        </Typography>
      ),
    },
    {
      name: "Details",
      formatter: (row) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            height: "100%",
            cursor: "pointer",
          }}
        >
          <Typography
            variant="body2"
            color="primary"
            onClick={() => handleViewDetails(row)}
          >
            View Details
          </Typography>
        </Box>
      ),
    },
    {
      name: "Status",
      formatter: (row) => {
        const status = row?.student?.status?.toLowerCase();

        return (
          <Chip
            label={status === "active" ? "Active" : "Inactive"}
            color={status === "active" ? "success" : "error"}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      name: "Actions",
      align: "right",
      formatter: (row) => (
        <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ bgcolor: "var(--mui-palette-background-level1)", p: 3 }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
        >
          <Box sx={{ flex: "1 1 auto" }}>
            <Typography variant="h5">Student List</Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={selectedSchool}
              label="Filter by School"
              onChange={(e) => {
                setSelectedSchool(e.target.value);
                setPage(1);
              }}
            >
              <SelectMenuItem value="all">All Schools</SelectMenuItem>
              {schools?.map((school: any) => (
                <SelectMenuItem key={school._id} value={school._id}>
                  {school.schoolName || school.name}
                </SelectMenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Card>
          <Box sx={{ overflowX: "auto" }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : filteredStudents?.length ? (
              <DataTable
                columns={columns}
                rows={filteredStudents}
                selectable={false}
              />
            ) : (
              <Box sx={{ p: 3 }}>
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center" }}
                  variant="body2"
                >
                  No Students Found
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
            }}
            onRowsPerPageChange={(event) => {
              const newLimit = parseInt(event.target.value, 10);
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </Card>

        {/* Details Modal */}
        <Dialog
          open={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            sx={{
              backgroundColor: "#191970",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            Parent / Van / Driver (Details)
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {/* 1 Row with 3 Columns */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                {/* Parent Details Column */}
                <Card sx={{ flex: 1 }}>
                  <CardHeader title="Parent Information" />
                  <CardContent>
                    {selectedStudentDetails?.parent?.id ? (
                      <Stack spacing={1}>
                        <Typography><strong>Name:</strong> {selectedStudentDetails.parent.fullname}</Typography>
                        <Typography><strong>Email:</strong> {selectedStudentDetails.parent.email}</Typography>
                        <Typography><strong>Phone:</strong> {selectedStudentDetails.parent.phoneNo}</Typography>
                        <Typography><strong>Address:</strong> {selectedStudentDetails.parent.address}</Typography>
                      </Stack>
                    ) : (
                      <Typography color="text.secondary">No parent assigned</Typography>
                    )}
                  </CardContent>
                </Card>

                {/* Van Details Column */}
                <Card sx={{ flex: 1 }}>
                  <CardHeader title="Van Information" />
                  <CardContent>
                    {selectedStudentDetails?.van?.id ? (
                      <Stack spacing={1}>
                        <Typography><strong>Vehicle Type:</strong> {selectedStudentDetails.van.vehicleType}</Typography>
                        <Typography><strong>Car Number:</strong> {selectedStudentDetails.van.carNumber}</Typography>
                      </Stack>
                    ) : (
                      <Typography color="text.secondary">No van assigned</Typography>
                    )}
                  </CardContent>
                </Card>

                {/* Driver Details Column */}
                <Card sx={{ flex: 1 }}>
                  <CardHeader title="Driver Information" />
                  <CardContent>
                    {selectedStudentDetails?.driver?.id ? (
                      <Stack spacing={1}>
                        <Typography><strong>Name:</strong> {selectedStudentDetails.driver.fullname}</Typography>
                        <Typography><strong>Phone:</strong> {selectedStudentDetails.driver.phoneNo}</Typography>
                      </Stack>
                    ) : (
                      <Typography color="text.secondary">No driver assigned</Typography>
                    )}
                  </CardContent>
                </Card>
              </Stack>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsModalOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* MENU */}
        <Menu
          anchorEl={menuAnchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleView}>
            <ListItemIcon>
              <EyeIcon size={18} />
            </ListItemIcon>
            View
          </MenuItem>
        </Menu>
      </Stack>
    </Box>
  );
}
