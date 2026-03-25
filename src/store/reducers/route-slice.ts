import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/api/axios";
import { ROUTE, TRIP } from "@/api/endpoint"; // 👈 TRIP bhi import

// ─── Types ──────────────────────────────────────────────

type TripDays = {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday?: boolean;
  sunday?: boolean;
};

type Point = { lat: number; long: number };

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface RouteFilters {
  driverName?: string;
  // later: carNumber?: string; tripType?: string; etc.
}

export interface VanWithRoutes {
  routes: TripRecord[];
  van: { id: string; carNumber: string };
  driver: { id: string; fullname: string };
  createdAt: string;
}

export interface TripRecord {
  _id: string;
  vanId: string;
  title: string;
  startTime: string;
  tripType: "pick" | "drop";
  tripDays: Record<string, boolean>;
  startPoint: Point;
  endPoint: Point;
}

type GetAllRoutesParams = {
  page?: number;
  limit?: number;
} & RouteFilters;

interface RouteState {
  // 👉 live trips (tracking ke liye)
  trips: any[];

  // 👉 routes (planned trips)
  routes: TripRecord[];
  routeDetails: TripRecord | any | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  pagination: PaginationMeta;
  filters: RouteFilters;
  deleteRouteLoading: boolean;
  deleteRouteSuccess: boolean;
  deleteRouteError: string | null;
}

// ─── Initial State ──────────────────────────────────────

const initialState: RouteState = {
  trips: [],

  routes: [],
  routeDetails: null,
  loading: false,
  error: null,
  success: false,
  pagination: { total: 0, page: 1, limit: 10 },
  filters: {},
  deleteRouteLoading: false,
  deleteRouteSuccess: false,
  deleteRouteError: null,
};

// ─── Thunks ──────────────────────────────────────────────

// ✅ Get all routes → /Route/getRoutes?driverName=...&page=...&limit=...
export const getAllRoutes = createAsyncThunk<
  { routes: VanWithRoutes[]; pagination: PaginationMeta; filters: RouteFilters },
  GetAllRoutesParams | undefined,
  { rejectValue: string }
>("route/getAllRoutes", async (params = {}, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 10, driverName } = params;

    const query: Record<string, any> = { page, limit };

    if (driverName && driverName.trim()) {
      query.driverName = driverName.trim();
    }

    const response = await api.get(ROUTE.GET_ALL_ROUTE, {
      params: query,
    });

    const { data, pagination } = response.data as {
      data: Array<{
        routes: TripRecord[];
        van: { id: string; carNumber: string };
        driver: { id: string; fullname: string };
        createdAt: string;
      }>;
      pagination?: PaginationMeta;
    };

    return {
      routes: data || [],
      pagination:
        pagination || {
          page,
          limit,
          total: flattenedRoutes.length || 0,
        },
      filters: {
        driverName: driverName || "",
      },
    };
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data || "Failed to fetch routes"
    );
  }
});

// ✅ Get route by ID
export const getRouteById = createAsyncThunk<
  any,
  string,
  { rejectValue: string }
>("route/getRouteById", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`${ROUTE.GET_ROUTE_BY_ID}/${id}`);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data || "Failed to fetch route details"
    );
  }
});

// ✅ Get All Trips (live trips) → /trip/getAllTrip...
export const getAllTrips = createAsyncThunk<
  any, // response type: { message, data, pagination }
  { page?: number; limit?: number; status?: string } | undefined,
  { rejectValue: string }
>(
  "route/getAllTrips",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, status = "" } = params || {};

      const response = await api.get(TRIP.GET_ALL_TRIP, {
        params: { page, limit, status },
      });

      // backend se expected: { message, data, pagination }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch trips"
      );
    }
  }
);

// ✅ Create route
export const createRoute = createAsyncThunk<
  TripRecord,
  {
    vanId: string;
    title: string;
    startTime: string;
    tripType: "pick" | "prop";
    tripDays: TripDays;
    startPoint: Point;
    endPoint: Point;
  },
  { rejectValue: string }
>("route/createRoute", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post(ROUTE.CREATE_ROUTE, payload);
    return response.data.data as TripRecord;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data || "Failed to create route"
    );
  }
});

// ✅ Update route (API expects POST)
export const updateRoute = createAsyncThunk<
  TripRecord,
  any,
  { rejectValue: string }
>("route/updateRoute", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post(ROUTE.UPDATE_ROUTE, payload);
    return response.data.data as TripRecord;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data || "Failed to update route"
    );
  }
});

// ✅ Delete route by ID (single route only)
interface DeleteRoutePayload {
  routeId: string;
}
export const deleteRouteByAdmin = createAsyncThunk<
  { success: boolean },
  DeleteRoutePayload,
  { rejectValue: string }
>("route/deleteRouteByAdmin", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post(ROUTE.DELETE_ROUTE, { routeId: payload.routeId });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to delete route"
    );
  }
});

// ─── Slice ──────────────────────────────────────────────

const routeSlice = createSlice({
  name: "route",
  initialState,
  reducers: {
    clearRouteStatus: (state) => {
      state.success = false;
      state.error = null;
    },
    clearRouteDetails: (state) => {
      state.routeDetails = null;
    },
    resetDeleteRoute: (state) => {
      state.deleteRouteLoading = false;
      state.deleteRouteSuccess = false;
      state.deleteRouteError = null;
    },
  },
  extraReducers: (builder) => {
    // ── Get all routes ─────────────────────────────
    builder.addCase(getAllRoutes.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(
      getAllRoutes.fulfilled,
      (
        state,
        action: PayloadAction<{
          routes: TripRecord[];
          pagination: PaginationMeta;
          filters: RouteFilters;
        }>
      ) => {
        state.loading = false;
        state.routes = action.payload.routes;
        state.pagination = action.payload.pagination;
        state.filters = action.payload.filters;
      }
    );

    builder.addCase(getAllRoutes.rejected, (state, action) => {
      state.loading = false;
      state.error =
        (action.payload as string) || "Failed to fetch routes";
    });

    // ── Get route by ID ─────────────────────────────
    builder.addCase(getRouteById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(getRouteById.fulfilled, (state, action) => {
      state.loading = false;
      state.routeDetails = action.payload;
    });

    builder.addCase(getRouteById.rejected, (state, action) => {
      state.loading = false;
      state.error =
        (action.payload as string) || "Failed to fetch route details";
    });

    // ── Get all trips (live trips) ──────────────────
    builder
      .addCase(getAllTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTrips.fulfilled, (state, action) => {
        state.loading = false;
        // response.data → { message, data, pagination }
        state.trips = action.payload?.data || [];

        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(getAllTrips.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to fetch trips";
      });

    // ── Create route ────────────────────────────────
    builder.addCase(createRoute.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });

    builder.addCase(createRoute.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.routes.unshift(action.payload);
    });

    builder.addCase(createRoute.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.error =
        (action.payload as string) || "Failed to create route";
    });

    // ── Update route ────────────────────────────────
    builder.addCase(updateRoute.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });

    builder.addCase(updateRoute.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;

      const updated = action.payload;
      const index = state.routes.findIndex(
        (r) => r._id === updated._id
      );
      if (index !== -1) {
        state.routes[index] = updated;
      }

      if (state.routeDetails && state.routeDetails._id === updated._id) {
        state.routeDetails = updated;
      }
    });

    builder.addCase(updateRoute.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.error =
        (action.payload as string) || "Failed to update route";
    });

    // ── Delete route by ID ────────────────────────────────
    builder.addCase(deleteRouteByAdmin.pending, (state) => {
      state.deleteRouteLoading = true;
      state.deleteRouteSuccess = false;
      state.deleteRouteError = null;
    });

    builder.addCase(deleteRouteByAdmin.fulfilled, (state) => {
      state.deleteRouteLoading = false;
      state.deleteRouteSuccess = true;
      // Note: We'll refresh the list from the component
    });

    builder.addCase(deleteRouteByAdmin.rejected, (state, action) => {
      state.deleteRouteLoading = false;
      state.deleteRouteSuccess = false;
      state.deleteRouteError =
        (action.payload as string) || "Failed to delete route";
    });
  },
});

export const { clearRouteStatus, clearRouteDetails, resetDeleteRoute } = routeSlice.actions;
export default routeSlice.reducer;
