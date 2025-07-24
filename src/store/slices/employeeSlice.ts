import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { employeeService, Employee } from '../../services/employeeService';

export interface EmployeeState {
    employees: Employee[];
    currentEmployee: Employee | null;
    myProfile: Employee | null;
    isLoading: boolean;
    error: string | null;
    searchQuery: string;
    selectedService: string | null;
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
}

const initialState: EmployeeState = {
    employees: [],
    currentEmployee: null,
    myProfile: null,
    isLoading: false,
    error: null,
    searchQuery: '',
    selectedService: null,
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
    },
};

// Async thunks
export const fetchEmployees = createAsyncThunk(
    'employees/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await employeeService.getAll();
            if (response.success) {
                return response.data;
            } else {
                return rejectWithValue(response.message || 'Erreur lors du chargement des employés');
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchEmployeeById = createAsyncThunk(
    'employees/fetchById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await employeeService.getById(id);
            if (response.success) {
                return response.data;
            } else {
                return rejectWithValue(response.message || 'Erreur lors du chargement de l\'employé');
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchMyProfile = createAsyncThunk(
    'employees/fetchMyProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await employeeService.getMyProfile();
            if (response.success) {
                return response.data;
            } else {
                return rejectWithValue(response.message || 'Erreur lors du chargement du profil');
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateContactInfo = createAsyncThunk(
    'employees/updateContact',
    async (
        { id, contactData }: { id: string; contactData: any },
        { rejectWithValue }
    ) => {
        try {
            const response = await employeeService.updateContactInfo(id, contactData);
            if (response.success) {
                return response.data;
            } else {
                return rejectWithValue(response.message || 'Erreur lors de la mise à jour');
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Slice
const employeeSlice = createSlice({
    name: 'employees',
    initialState,
    reducers: {
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },
        setSelectedService: (state, action: PayloadAction<string | null>) => {
            state.selectedService = action.payload;
        },
        clearCurrentEmployee: (state) => {
            state.currentEmployee = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        reset: (state) => {
            return initialState;
        },
        setPagination: (state, action: PayloadAction<Partial<typeof initialState.pagination>>) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
    },
    extraReducers: (builder) => {
        // Fetch all employees
        builder
            .addCase(fetchEmployees.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchEmployees.fulfilled, (state, action) => {
                state.isLoading = false;
                state.employees = action.payload;
                state.pagination.total = action.payload.length;
            })
            .addCase(fetchEmployees.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch employee by ID
        builder
            .addCase(fetchEmployeeById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchEmployeeById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentEmployee = action.payload;
            })
            .addCase(fetchEmployeeById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch my profile
        builder
            .addCase(fetchMyProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMyProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.myProfile = action.payload;
            })
            .addCase(fetchMyProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Update contact info
        builder
            .addCase(updateContactInfo.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateContactInfo.fulfilled, (state, action) => {
                state.isLoading = false;
                state.myProfile = action.payload;
                // Mettre à jour aussi dans la liste des employés si présent
                const index = state.employees.findIndex(emp => emp.id === action.payload.id);
                if (index !== -1) {
                    state.employees[index] = action.payload;
                }
            })
            .addCase(updateContactInfo.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setSearchQuery,
    setSelectedService,
    clearCurrentEmployee,
    clearError,
    reset,
    setPagination,
} = employeeSlice.actions;

// Selectors
export const selectEmployees = (state: { employees: EmployeeState }) => state.employees.employees;
export const selectCurrentEmployee = (state: { employees: EmployeeState }) => state.employees.currentEmployee;
export const selectMyProfile = (state: { employees: EmployeeState }) => state.employees.myProfile;
export const selectEmployeesLoading = (state: { employees: EmployeeState }) => state.employees.isLoading;
export const selectEmployeesError = (state: { employees: EmployeeState }) => state.employees.error;
export const selectSearchQuery = (state: { employees: EmployeeState }) => state.employees.searchQuery;
export const selectSelectedService = (state: { employees: EmployeeState }) => state.employees.selectedService;

// Computed selectors
export const selectFilteredEmployees = (state: { employees: EmployeeState }) => {
    const { employees, searchQuery, selectedService } = state.employees;

    return employees.filter(employee => {
        // Filtre par recherche
        const matchesSearch = !searchQuery ||
            employee.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.matricule.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.poste?.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.service?.nom.toLowerCase().includes(searchQuery.toLowerCase());

        // Filtre par service
        const matchesService = !selectedService || employee.service?.id === selectedService;

        return matchesSearch && matchesService;
    });
};

export default employeeSlice.reducer;
