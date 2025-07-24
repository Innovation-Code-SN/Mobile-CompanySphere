import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { serviceService, Service } from '../../services/serviceService';

export interface ServiceState {
    services: Service[];
    currentService: Service | null;
    isLoading: boolean;
    error: string | null;
    searchQuery: string;
}

const initialState: ServiceState = {
    services: [],
    currentService: null,
    isLoading: false,
    error: null,
    searchQuery: '',
};

// Async thunks
export const fetchServices = createAsyncThunk(
    'services/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await serviceService.getAll();
            if (response.success) {
                return response.data;
            } else {
                return rejectWithValue(response.message || 'Erreur lors du chargement des services');
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchServiceById = createAsyncThunk(
    'services/fetchById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await serviceService.getById(id);
            if (response.success) {
                return response.data;
            } else {
                return rejectWithValue(response.message || 'Erreur lors du chargement du service');
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Slice
const serviceSlice = createSlice({
    name: 'services',
    initialState,
    reducers: {
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },
        clearCurrentService: (state) => {
            state.currentService = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        reset: (state) => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        // Fetch all services
        builder
            .addCase(fetchServices.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchServices.fulfilled, (state, action) => {
                state.isLoading = false;
                state.services = action.payload;
            })
            .addCase(fetchServices.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch service by ID
        builder
            .addCase(fetchServiceById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchServiceById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentService = action.payload;
            })
            .addCase(fetchServiceById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setSearchQuery: setServiceSearchQuery,
    clearCurrentService,
    clearError: clearServiceError,
    reset: resetServices,
} = serviceSlice.actions;

// Selectors
export const selectServices = (state: { services: ServiceState }) => state.services.services;
export const selectCurrentService = (state: { services: ServiceState }) => state.services.currentService;
export const selectServicesLoading = (state: { services: ServiceState }) => state.services.isLoading;
export const selectServicesError = (state: { services: ServiceState }) => state.services.error;
export const selectServiceSearchQuery = (state: { services: ServiceState }) => state.services.searchQuery;

// Computed selectors
export const selectFilteredServices = (state: { services: ServiceState }) => {
    const { services, searchQuery } = state.services;

    return services.filter(service => {
        return !searchQuery ||
            service.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.manager?.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.manager?.prenom.toLowerCase().includes(searchQuery.toLowerCase());
    });
};

export default serviceSlice.reducer;