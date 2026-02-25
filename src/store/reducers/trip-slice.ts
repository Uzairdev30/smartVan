import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/api/axios";
import { TRIP } from "@/api/endpoint";

// ─── State Interface ────────────────────────────────────────────────
interface TripState {
  trips: any[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total?: number;
  };
  statusFilter?: "start" | "ongoing" | "end" | ""; // current filter

  // 👉 NEW: kids by driver + trip
  tripKids: any[];
  tripKidsLoading: boolean;
  tripKidsError: string | null;
}

// ─── Initial State ─────────────────────────────────────────────────
const initialState: TripState = {
  trips: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
  },
  statusFilter: "",

  tripKids: [],
  tripKidsLoading: false,
  tripKidsError: null,
};

// ─── Thunks ────────────────────────────────────────────────────────

// ✅ Get All Trips
export const getAllTrips = createAsyncThunk<
  any, // response type
  { page?: number; limit?: number; status?: string; date?: string }, // args
  { rejectValue: string }
>(
  "trip/getAllTrips",
  async ({ page = 1, limit = 10, status = "", date = "" } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get(TRIP.GET_ALL_TRIP, {
        params: { page, limit, status, date }, // 🔥 include status & date param
      });
      return response.data; // expected { message, data, pagination }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch trips"
      );
    }
  }
);

// ✅ NEW: Get Kids By Driver & Trip
// GET {{baseurl}}/van/getKidsByDriver?tripId=...&driverId=...
export const getTripKidsByDriver = createAsyncThunk<
  any, // response type (e.g. { success, data: [...] })
  { tripId: string; driverId: string }, // args
  { rejectValue: string }
>("trip/getTripKidsByDriver", async ({ tripId, driverId }, { rejectWithValue }) => {
  try {
    const response = await api.get(TRIP.GET_ALL_TRIP_KIDS, {
      params: { tripId, driverId },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch kids for this trip"
    );
  }
});

// ─── Slice ─────────────────────────────────────────────────────────
const tripSlice = createSlice({
  name: "trip",
  initialState,
  reducers: {
    clearTrips: (state) => {
      state.trips = [];
      state.error = null;
      state.loading = false;
    },
    setStatusFilter: (
      state,
      action: PayloadAction<"start" | "ongoing" | "end" | "">
    ) => {
      state.statusFilter = action.payload;
    },

    // optional: agar kids clear karne hon
    clearTripKids: (state) => {
      state.tripKids = [];
      state.tripKidsError = null;
      state.tripKidsLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Fetch Trips
      .addCase(getAllTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = action.payload?.data || [];
        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(getAllTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch trips";
      })

      // ✅ Fetch Kids By Driver & Trip
      .addCase(getTripKidsByDriver.pending, (state) => {
        state.tripKidsLoading = true;
        state.tripKidsError = null;
      })
      .addCase(getTripKidsByDriver.fulfilled, (state, action) => {
  state.tripKidsLoading = false;
  state.tripKids = action.payload?.data || null; // 👈 full data object
})
      .addCase(getTripKidsByDriver.rejected, (state, action) => {
        state.tripKidsLoading = false;
        state.tripKidsError =
          action.payload || "Failed to fetch kids for this trip";
      });
  },
});

// ─── Exports ──────────────────────────────────────────────────────
export const { clearTrips, setStatusFilter, clearTripKids } = tripSlice.actions;
export default tripSlice.reducer;
