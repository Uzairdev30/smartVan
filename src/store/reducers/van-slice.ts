import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/api/axios";
import { VAN, STUDENT } from "@/api/endpoint";

// ─── Types ─────────────────────────────────────────────────────
export interface Van {
  _id: string;
  driverId: string;
  driverName?: string;
  driverEmail?: string;
  driverPhone?: string;
  driverCnic?: string;
  driverLicense?: string;
  schoolId: string;
  venImage?: string;
  cnic?: string;
  vehicleType: string;
  venCapacity: number;
  assignRoute: string;
  startTime?: string;
  endTime?: string;
  licenceImageFront?: string;
  licenceImageBack?: string;
  carNumber: string;
  vehicleCardImage?: string;
  status: string;
  condition?: string;
  deviceId?: string;
  createdAt: string;
  updatedAt: string;
  trips?: any[];
  [key: string]: any;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface VanState {
  vans: Van[];
  pagination: PaginationMeta;
  selectedVan?: Van | null;
  loading: boolean;
  error: string | null;
  assignLoading: boolean;
  assignSuccess: boolean;
  assignError: string | null;
  selectedVanLoading: boolean;
  selectedVanError: string | null;
  addVanLoading: boolean;
  addVanSuccess: boolean;
  addVanError: string | null;
  updateVanLoading: boolean;
  updateVanError: string | null;
  bulkStatusLoading: boolean;
  bulkStatusSuccess: boolean;
  bulkStatusError: string | null;
  deleteVanLoading: boolean;
  deleteVanSuccess: boolean;
  deleteVanError: string | null;
  removeDriverLoading: boolean;
  removeDriverSuccess: boolean;
  removeDriverError: string | null;
}

const initialState: VanState = {
  vans: [],
  pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
  selectedVan: null,
  loading: false,
  error: null,
  assignLoading: false,
  assignSuccess: false,
  assignError: null,
  selectedVanLoading: false,
  selectedVanError: null,
  addVanLoading: false,
  addVanSuccess: false,
  addVanError: null,
  updateVanLoading: false,
  updateVanError: null,
  bulkStatusLoading: false,
  bulkStatusSuccess: false,
  bulkStatusError: null,
  deleteVanLoading: false,
  deleteVanSuccess: false,
  deleteVanError: null,
  removeDriverLoading: false,
  removeDriverSuccess: false,
  removeDriverError: null,
};

// ─── Thunks ────────────────────────────────────────────────────
type GetAllSchoolVansParams = {
  page?: number;
  limit?: number;
  carNumber?: string;
  driverName?: string;
};
// Get all vans with pagination
export const getAllSchoolVans = createAsyncThunk<
  { vans: Van[]; pagination: PaginationMeta },
  GetAllSchoolVansParams | undefined,
  { rejectValue: string }
>(
  "van/getAllSchoolVans",
  async (params = {}, { rejectWithValue }) => {
    try {
      const {
        page = 1,
        limit = 10,
        ...filters // carNumber, driverName
      } = params;

      const response = await api.get(VAN.GET_ALL_VAN_OF_SCHOOL, {
        params: {
          page,
          limit,
          ...filters, // -> ?page=1&limit=10&carNumber=340&driverName=Ali
        },
      });

      const { data, pagination } = response.data as {
        data: Van[];
        pagination: PaginationMeta;
      };

      return { vans: data, pagination };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch vans"
      );
    }
  }
);
// Assign van to student
interface AssignVanPayload {
  kidIds: string[];
  vanId: string;
}
export const assignVanToStudent = createAsyncThunk<any, AssignVanPayload, { rejectValue: string }>(
  "van/assignVanToStudent",
  async (payload, { rejectWithValue }) => {
    try {
      console.log('📤 Assigning van to students:', payload);
      const response = await api.post('/kid/assignVanToStudents', payload);
      console.log('📥 Van assignment response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Van assignment error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || "Failed to assign van");
    }
  }
);

// Remove van from student
interface RemoveVanPayload {
  kidIds: string[];
}
export const removeVanFromStudent = createAsyncThunk<any, RemoveVanPayload, { rejectValue: string }>(
  "van/removeVanFromStudent",
  async (payload, { rejectWithValue }) => {
    try {
      console.log('📤 Removing van from students:', payload);
      const response = await api.post('/kid/removeVanFromKid', payload);
      console.log('📥 Van removal response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Van removal error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || "Failed to remove van");
    }
  }
);

// Get van detail by ID
export const getVanDetailById = createAsyncThunk<Van, string, { rejectValue: string }>(
  "van/getVanDetailById",
  async (vanId, { rejectWithValue }) => {
    try {
      const response = await api.get(`${VAN.GET_VAN_BY_ID}/${vanId}`);
      return response.data.data as Van;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch van detail");
    }
  }
);

// Add new van
export const addVan = createAsyncThunk<Van, Partial<Van>, { rejectValue: string }>(
  "van/addVan",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post(VAN.ADD_VAN, payload);
      return response.data.data as Van;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add van");
    }
  }
);

// Bulk update van status
interface BulkStatusUpdatePayload {
  vanIds: string[];
  status: string;
}
export const bulkUpdateVanStatus = createAsyncThunk<
  { modifiedCount: number; vans: Van[] },
  BulkStatusUpdatePayload,
  { rejectValue: string }
>(
  "van/bulkUpdateStatus",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post(VAN.CHANGE_STATUS, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update van status");
    }
  }
);

// Delete van (single or bulk)
interface DeleteVanPayload {
  vanIds: string[];
}
export const deleteVans = createAsyncThunk<
  { deletedCount: number },
  DeleteVanPayload,
  { rejectValue: string }
>(
  "van/deleteVans",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post(VAN.DELETE_VAN, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete van(s)");
    }
  }
);

// Remove driver from van
interface RemoveDriverPayload {
  driverId: string;
  vanId: string;
}
export const removeDriverFromVan = createAsyncThunk<
  { modifiedCount: number; van: Van },
  RemoveDriverPayload,
  { rejectValue: string }
>(
  "van/removeDriverFromVan",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post(VAN.REMOVE_DRIVER, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to remove driver from van");
    }
  }
);

// ─── Slice ─────────────────────────────────────────────────────
const vanSlice = createSlice({
  name: "van",
  initialState,
  reducers: {
    clearVans: (state) => {
      state.vans = [];
      state.pagination = { total: 0, page: 1, limit: 10, totalPages: 0 };
      state.loading = false;
      state.error = null;
    },
    resetAssignVan: (state) => {
      state.assignLoading = false;
      state.assignSuccess = false;
      state.assignError = null;
    },
    clearSelectedVan: (state) => {
      state.selectedVan = null;
      state.selectedVanLoading = false;
      state.selectedVanError = null;
    },
    resetAddVan: (state) => {
      state.addVanLoading = false;
      state.addVanSuccess = false;
      state.addVanError = null;
    },
    resetUpdateVan: (state) => {
      state.updateVanLoading = false;
      state.updateVanError = null;
    },
    resetBulkStatus: (state) => {
      state.bulkStatusLoading = false;
      state.bulkStatusSuccess = false;
      state.bulkStatusError = null;
    },
    resetDeleteVan: (state) => {
      state.deleteVanLoading = false;
      state.deleteVanSuccess = false;
      state.deleteVanError = null;
    },
    resetRemoveDriver: (state) => {
      state.removeDriverLoading = false;
      state.removeDriverSuccess = false;
      state.removeDriverError = null;
    },
  },
  extraReducers: (builder) => {
    // ─── Get all vans ───
    builder
      .addCase(getAllSchoolVans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getAllSchoolVans.fulfilled,
        (state, action: PayloadAction<{ vans: Van[]; pagination: PaginationMeta }>) => {
          state.loading = false;
          state.vans = action.payload.vans;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(getAllSchoolVans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch vans";
      });

    // ─── Assign van ───
    builder
      .addCase(assignVanToStudent.pending, (state) => {
        state.assignLoading = true;
        state.assignSuccess = false;
        state.assignError = null;
      })
      .addCase(assignVanToStudent.fulfilled, (state) => {
        state.assignLoading = false;
        state.assignSuccess = true;
      })
      .addCase(assignVanToStudent.rejected, (state, action) => {
        state.assignLoading = false;
        state.assignSuccess = false;
        state.assignError = action.payload || "Failed to assign van";
      });

    // ─── Get van detail ───
    builder
      .addCase(getVanDetailById.pending, (state) => {
        state.selectedVanLoading = true;
        state.selectedVanError = null;
        state.selectedVan = null;
      })
      .addCase(getVanDetailById.fulfilled, (state, action: PayloadAction<Van>) => {
        state.selectedVanLoading = false;
        state.selectedVan = action.payload;
      })
      .addCase(getVanDetailById.rejected, (state, action) => {
        state.selectedVanLoading = false;
        state.selectedVanError = action.payload || "Failed to fetch van detail";
      });

    // ─── Add van ───
    builder
      .addCase(addVan.pending, (state) => {
        state.addVanLoading = true;
        state.addVanSuccess = false;
        state.addVanError = null;
      })
      .addCase(addVan.fulfilled, (state, action: PayloadAction<Van>) => {
        state.addVanLoading = false;
        state.addVanSuccess = true;
        if (state.vans.length < state.pagination.limit) {
          state.vans.unshift(action.payload);
        }
        state.pagination.total = Math.max(0, state.pagination.total + 1);
        state.pagination.totalPages = Math.ceil(state.pagination.total / state.pagination.limit);
      })
      .addCase(addVan.rejected, (state, action) => {
        state.addVanLoading = false;
        state.addVanSuccess = false;
        state.addVanError = action.payload || "Failed to add van";
      });

    // ─── Bulk status update ───
    builder
      .addCase(bulkUpdateVanStatus.pending, (state) => {
        state.bulkStatusLoading = true;
        state.bulkStatusSuccess = false;
        state.bulkStatusError = null;
      })
      .addCase(bulkUpdateVanStatus.fulfilled, (state, action) => {
        state.bulkStatusLoading = false;
        state.bulkStatusSuccess = true;
        // Update the status of vans in the local state
        const { vans: updatedVans } = action.payload;
        updatedVans.forEach((updatedVan) => {
          const index = state.vans.findIndex((van) => van._id === updatedVan._id);
          if (index !== -1) {
            state.vans[index].status = updatedVan.status;
          }
        });
      })
      .addCase(bulkUpdateVanStatus.rejected, (state, action) => {
        state.bulkStatusLoading = false;
        state.bulkStatusSuccess = false;
        state.bulkStatusError = action.payload || "Failed to update van status";
      });

    // ─── Delete vans ───
    builder
      .addCase(deleteVans.pending, (state) => {
        state.deleteVanLoading = true;
        state.deleteVanSuccess = false;
        state.deleteVanError = null;
      })
      .addCase(deleteVans.fulfilled, (state, action) => {
        state.deleteVanLoading = false;
        state.deleteVanSuccess = true;
        // Note: We'll need to handle the actual removal from the list based on the API response
        // For now, just mark as successful
      })
      .addCase(deleteVans.rejected, (state, action) => {
        state.deleteVanLoading = false;
        state.deleteVanSuccess = false;
        state.deleteVanError = action.payload || "Failed to delete van(s)";
      });

    // ─── Remove driver ───
    builder
      .addCase(removeDriverFromVan.pending, (state) => {
        state.removeDriverLoading = true;
        state.removeDriverSuccess = false;
        state.removeDriverError = null;
      })
      .addCase(removeDriverFromVan.fulfilled, (state, action) => {
        state.removeDriverLoading = false;
        state.removeDriverSuccess = true;
        // Update the van in the local state
        const { van: updatedVan } = action.payload;
        const index = state.vans.findIndex((van) => van._id === updatedVan._id);
        if (index !== -1) {
          state.vans[index] = updatedVan;
        }
      })
      .addCase(removeDriverFromVan.rejected, (state, action) => {
        state.removeDriverLoading = false;
        state.removeDriverSuccess = false;
        state.removeDriverError = action.payload || "Failed to remove driver from van";
      });
  },
});

export const { clearVans, resetAssignVan, clearSelectedVan, resetAddVan, resetUpdateVan, resetBulkStatus, resetDeleteVan, resetRemoveDriver } =
  vanSlice.actions;
export default vanSlice.reducer;
