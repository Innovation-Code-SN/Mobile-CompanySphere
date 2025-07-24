import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { groupeService, Groupe } from '../../services/groupeService';

export interface TeamsState {
    teams: Groupe[];
    currentTeam: Groupe | null;
    isLoading: boolean;
    error: string | null;
    searchQuery: string;
    selectedFilter: 'TOUS' | 'ACTIF' | 'INACTIF' | 'SUSPENDU';
}

const initialState: TeamsState = {
    teams: [],
    currentTeam: null,
    isLoading: false,
    error: null,
    searchQuery: '',
    selectedFilter: 'TOUS',
};

// Async thunks
export const fetchTeams = createAsyncThunk(
    'teams/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await groupeService.getAll();
            if (response.success) {
                return response.data;
            } else {
                return rejectWithValue(response.message || 'Erreur lors du chargement des équipes');
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchTeamById = createAsyncThunk(
    'teams/fetchById',
    async (id: string, { rejectWithValue }) => {
        try {
            console.log('🔄 Fetching team with ID:', id);
            const response = await groupeService.getById(id);

            if (response.success) {
                console.log('✅ Team fetched successfully:', {
                    id: response.data.id,
                    nom: response.data.nom,
                    membresCount: response.data.membres?.length || 0
                });
                return response.data;
            } else {
                console.error('❌ Failed to fetch team:', response.message);
                return rejectWithValue(response.message || 'Erreur lors du chargement de l\'équipe');
            }
        } catch (error: any) {
            console.error('❌ Error fetching team:', error);
            return rejectWithValue(error.message);
        }
    }
);


export const fetchTeamsByEmployee = createAsyncThunk(
    'teams/fetchByEmployee',
    async (employeeId: string, { rejectWithValue }) => {
        try {
            const response = await groupeService.getByEmploye(employeeId);
            if (response.success) {
                return response.data;
            } else {
                return rejectWithValue(response.message || 'Erreur lors du chargement des équipes de l\'employé');
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Slice
const teamsSlice = createSlice({
    name: 'teams',
    initialState,
    reducers: {
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },
        setSelectedFilter: (state, action: PayloadAction<TeamsState['selectedFilter']>) => {
            state.selectedFilter = action.payload;
        },
        clearCurrentTeam: (state) => {
            state.currentTeam = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        reset: (state) => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        // Fetch all teams
        builder
            .addCase(fetchTeams.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTeams.fulfilled, (state, action) => {
                state.isLoading = false;
                state.teams = action.payload;
            })
            .addCase(fetchTeams.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch team by ID
        builder
            .addCase(fetchTeamById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTeamById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentTeam = action.payload;
            })
            .addCase(fetchTeamById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch teams by employee
        builder
            .addCase(fetchTeamsByEmployee.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTeamsByEmployee.fulfilled, (state, action) => {
                state.isLoading = false;
                // On peut stocker dans une propriété séparée si besoin
            })
            .addCase(fetchTeamsByEmployee.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setSearchQuery: setTeamsSearchQuery,
    setSelectedFilter: setTeamsFilter,
    clearCurrentTeam,
    clearError: clearTeamsError,
    reset: resetTeams,
} = teamsSlice.actions;

// Selectors
export const selectTeams = (state: { teams: TeamsState }) => state.teams.teams;
export const selectCurrentTeam = (state: { teams: TeamsState }) => state.teams.currentTeam;
export const selectTeamsLoading = (state: { teams: TeamsState }) => state.teams.isLoading;
export const selectTeamsError = (state: { teams: TeamsState }) => state.teams.error;
export const selectTeamsSearchQuery = (state: { teams: TeamsState }) => state.teams.searchQuery;
export const selectTeamsFilter = (state: { teams: TeamsState }) => state.teams.selectedFilter;

// Computed selectors
export const selectFilteredTeams = (state: { teams: TeamsState }) => {
    const { teams, searchQuery, selectedFilter } = state.teams;

    return teams.filter(team => {
        // Filtre par statut
        const statusMatch = selectedFilter === 'TOUS' || team.statut === selectedFilter;

        // Filtre par recherche
        const searchMatch = !searchQuery ||
            team.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            team.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            team.responsableNom?.toLowerCase().includes(searchQuery.toLowerCase());

        return statusMatch && searchMatch;
    });
};

export default teamsSlice.reducer;