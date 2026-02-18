import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { STUDENT } from "@/api/endpoint";
import api from "@/api/axios";
import type { StudentRecord, PaginationMeta } from "@/types/student";

type SliceState = {
  students: StudentRecord[];
  pagination: PaginationMeta;
  loading: boolean;
  error: string | null;
  studentDetail: StudentRecord | null;
  detailLoading: boolean;
};

const initialState: SliceState = {
  students: [],
  pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
  loading: false,
  error: null,
  studentDetail: null,
  detailLoading: false,
};
type GetAllStudentsParams = {
  page?: number;
  limit?: number;
  carNumber?: string;
  driverName?: string; // 👈 new
};

export const getAllStudents = createAsyncThunk(
  "student/getAllStudents",
  async (
    {
      page = 1,
      limit = 10,
      ...filters // { carNumber, driverName }
    }: GetAllStudentsParams,
    { rejectWithValue }
  ) => {
    try {
      const params = {
        page,
        limit,
        ...filters, // 👈 sends carNumber & driverName as query params
      };

      const response = await api.get(STUDENT.GET_ALL_STUDENTS, { params });

      const { data, pagination } = response.data as {
        data: StudentRecord[];
        pagination: PaginationMeta;
      };

      console.log('📋 All Students Response:', data.map(s => ({
        id: s.student.id,
        name: s.student.fullname,
        status: s.student.status
      })));

      return { students: data, pagination };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || "Failed to fetch students");
    }
  }
);
export const getStudentDetail = createAsyncThunk(
  "student/getStudentDetail",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`${STUDENT.GET_STUDENT_BY_ID}/${id}`);
      console.log(' Student Detail API Response:', res.data);
      
      const data = (res.data?.data ?? res.data) as any;
      
      // Structure the data to match component expectations
      const structuredData: StudentRecord = {
        student: {
          id: data.id,
          fullname: data.fullname,
          age: data.age,
          grade: data.grade,
          gender: data.gender,
          dob: data.dob,
          schoolId: data.schoolId,
          status: data.status,
          image: data.image,
          vanId: data.VanId
        },
        parent: {
          id: data.parentId,
          fullname: data.parentName,
          email: data.parentEmail
        },
        van: {
          id: data.VanId,
          carNumber: data.carNumber,
          vehicleType: data.vehicleType
        }
      };
      
      console.log(' Structured Student Detail:', structuredData);
      return structuredData;
    } catch (error: any) {
      console.error(' Student Detail Error:', error.response?.data);
      return rejectWithValue(error?.response?.data || "Failed to fetch student detail");
    }
  }
);

export const addStudent = createAsyncThunk(
  "student/addStudent",
  async (values: any, { rejectWithValue }) => {
    try {
      const res = await api.post(STUDENT.CREATE_STUDENT, values);
      const created = (res.data?.data ?? res.data) as StudentRecord;
      return created;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || "Failed to create student");
    }
  }
);

export const verifyStudentByAdmin = createAsyncThunk(
  "student/verifyStudentByAdmin",
  async ({ id, status }: { id: string; status: string }, thunkAPI) => {
    try {
      // Send as kidIds array to match backend expectations
      const payload = { kidIds: [id], status };
      console.log('📤 Sending individual status update payload:', payload);
      
      const response = await api.post(STUDENT.VERIFY_STUDENT_BY_ADMIN, payload);
      console.log('📥 Individual status update response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error("❌ Backend error:", error.response?.data);
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const bulkUpdateStudentStatus = createAsyncThunk(
  "student/bulkUpdateStudentStatus",
  async ({ studentIds, status }: { studentIds: string[]; status: string }, thunkAPI) => {
    try {
      const payload = { kidIds: studentIds, status };
      console.log('📤 Sending bulk status update payload:', payload);
      
      const response = await api.post(STUDENT.VERIFY_STUDENT_BY_ADMIN, payload);
      console.log('📥 Bulk status update response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error("❌ Bulk update error:", error.response?.data);
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);




export const deleteStudents = createAsyncThunk(
  "student/deleteStudents",
  async (kidIds: string[], { rejectWithValue }) => {
    try {
      await api.post(STUDENT.DELETE_STUDENT, { kidIds });
      return { kidIds };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || "Failed to delete students");
    }
  }
);

export const deleteStudentsAndRefetch = createAsyncThunk<
  void,
  string[],
  { state: { student: SliceState } }
>("student/deleteStudentsAndRefetch", async (kidIds, { dispatch, getState, rejectWithValue }) => {
  try {
    await dispatch(deleteStudents(kidIds)).unwrap();
    const { pagination, students } = getState().student;
    const isPageEmpty = students.length === 0 && pagination.page > 1;
    const nextPage = isPageEmpty ? pagination.page - 1 : pagination.page;
    await dispatch(getAllStudents({ page: nextPage, limit: pagination.limit })).unwrap();
  } catch (err: any) {
    throw rejectWithValue(err?.message || "Failed to delete & refresh");
  }
});

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    resetStudentDetail(state) {
      state.studentDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getAllStudents.fulfilled,
        (
          state,
          action: PayloadAction<{ students: StudentRecord[]; pagination: PaginationMeta }>
        ) => {
          state.loading = false;
          state.students = action.payload.students;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(getAllStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch students";
      })
      .addCase(getStudentDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(getStudentDetail.fulfilled, (state, action: PayloadAction<StudentRecord>) => {
        state.detailLoading = false;
        state.studentDetail = action.payload;
      })
      .addCase(getStudentDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = (action.payload as string) || "Failed to fetch student detail";
      })
      .addCase(addStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addStudent.fulfilled, (state, action: PayloadAction<StudentRecord>) => {
        state.loading = false;
        if (state.students.length < state.pagination.limit) {
          state.students.unshift(action.payload);
        }
        state.pagination.total = Math.max(0, state.pagination.total + 1);
        state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
      })
      .addCase(addStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to create student";
      })
      .addCase(deleteStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteStudents.fulfilled,
        (state, action: PayloadAction<{ kidIds: string[] }>) => {
          state.loading = false;
          state.students = state.students.filter(
            (s) => !action.payload.kidIds.includes(s.student.id)
          );
          state.pagination.total = Math.max(0, state.pagination.total - action.payload.kidIds.length);
          state.pagination.totalPages =
            Math.ceil(state.pagination.total / state.pagination.limit) || 1;
          if (state.studentDetail && action.payload.kidIds.includes(state.studentDetail.student.id)) {
            state.studentDetail = null;
          }
        }
      )
      .addCase(bulkUpdateStudentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkUpdateStudentStatus.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload;
        
        console.log('Bulk status update response:', response);
        
        // Get updated students from response or use request data
        const updatedStudentIds = response?.studentIds || response?.updatedStudents || [];
        const updatedStatus = response?.status;
        
        // Helper function to normalize status
        const normalizeStatus = (status: string): string => {
          if (!status) return "inActive";
          const normalized = status.trim().toLowerCase();
          return normalized === "active" ? "active" : "inActive";
        };
        
        // Update all selected students in list
        if (updatedStudentIds.length > 0) {
          updatedStudentIds.forEach((studentId: string) => {
            const index = state.students.findIndex(s => s.student.id === studentId);
            if (index !== -1) {
              if (updatedStatus) {
                state.students[index].student.status = normalizeStatus(updatedStatus);
              } else {
                // Toggle status locally if backend doesn't return status
                const currentStatus = normalizeStatus(state.students[index].student.status);
                state.students[index].student.status = currentStatus === "active" ? "inActive" : "active";
              }
            }
          });
        }
        
        // Update student detail if it's one of the updated students
        if (state.studentDetail && updatedStudentIds.includes(state.studentDetail.student.id)) {
          if (updatedStatus) {
            state.studentDetail.student.status = normalizeStatus(updatedStatus);
          } else {
            const currentStatus = normalizeStatus(state.studentDetail.student.status);
            state.studentDetail.student.status = currentStatus === "active" ? "inActive" : "active";
          }
        }
      })
      .addCase(bulkUpdateStudentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to update student status";
      })
      .addCase(verifyStudentByAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyStudentByAdmin.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload;
        
        console.log('Status update response:', response);
        
        // Try to get student ID from response or use the request data
        const studentId = response?.studentId || response?.id || response?._id;
        const updatedStudent = response?.data || response?.student || response;
        
        // Helper function to normalize status
        const normalizeStatus = (status: string): string => {
          if (!status) return "inActive";
          const normalized = status.trim().toLowerCase();
          return normalized === "active" ? "active" : "inActive";
        };
        
        // Update student in list if we have a valid student ID
        if (studentId) {
          const index = state.students.findIndex(s => s.student.id === studentId);
          if (index !== -1) {
            if (updatedStudent && typeof updatedStudent === 'object' && updatedStudent.status) {
              // Use backend response if it contains updated status
              state.students[index].student.status = normalizeStatus(updatedStudent.status);
            } else {
              // Toggle status locally if backend doesn't return updated data
              const currentStatus = normalizeStatus(state.students[index].student.status);
              state.students[index].student.status = currentStatus === "active" ? "inActive" : "active";
            }
            
            console.log('Updated student status in list:', {
              studentId,
              oldStatus: state.students[index].student.status,
              newStatus: state.students[index].student.status
            });
          }
        }
        
        // Update student detail if it's the same student
        if (state.studentDetail && state.studentDetail.student.id === studentId) {
          if (updatedStudent && typeof updatedStudent === 'object' && updatedStudent.status) {
            state.studentDetail.student.status = normalizeStatus(updatedStudent.status);
          } else {
            const currentStatus = normalizeStatus(state.studentDetail.student.status);
            state.studentDetail.student.status = currentStatus === "active" ? "inActive" : "active";
          }
        }
      })
      .addCase(verifyStudentByAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to verify student";
      })
      .addCase(deleteStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to delete students";
      });
  },
});

export const { resetStudentDetail } = studentSlice.actions;
export default studentSlice.reducer;
