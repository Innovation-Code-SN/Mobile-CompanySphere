// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../services/authService';

// Types
export interface User {
    id: string;
    username: string;
    displayName: string;
    email: string;
    roles: string[];
    permissions: string[];
    employeId?: string;
    passwordChangeRequired?: boolean;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    permissions: string[];
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    permissions: [],
};

// Async thunks avec débogage amélioré
export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { username: string; password: string }, { rejectWithValue }) => {
        console.log('🔄 === THUNK AUTH/LOGIN - DÉBUT ===');
        console.log('👤 Credentials username:', credentials.username);
        console.log('🔒 Password provided:', !!credentials.password);

        try {
            console.log('📤 Appel authService.login()...');

            const response = await authService.login(credentials);

            console.log('📥 Réponse authService:', response);
            console.log('✅ Success:', response.success);

            if (response.success && response.data) {
                console.log('💾 Stockage des données dans AsyncStorage...');

                // Stocker le token localement
                if (response.data.token) {
                    await AsyncStorage.setItem('token', response.data.token);
                    console.log('✅ Token stocké');
                } else {
                    console.warn('⚠️ Aucun token dans la réponse');
                }

                // Stocker l'utilisateur
                if (response.data.user) {
                    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
                    console.log('✅ User stocké');
                } else {
                    console.warn('⚠️ Aucun user dans la réponse');
                }

                console.log('📦 Données retournées par le thunk:', response.data);
                return response.data;

            } else {
                console.error('❌ Réponse d\'échec du service');
                console.error('📝 Message:', response.message);

                const errorMessage = response.message || 'Erreur de connexion inconnue';
                console.error('🚫 Rejet avec message:', errorMessage);

                return rejectWithValue(errorMessage);
            }
        } catch (error: any) {
            console.error('💥 === ERREUR DANS LE THUNK LOGIN ===');
            console.error('🔍 Error type:', typeof error);
            console.error('🔍 Error name:', error?.name);
            console.error('🔍 Error message:', error?.message);
            console.error('🔍 Error stack:', error?.stack);
            console.error('🔍 Full error object:', error);

            let errorMessage = 'Erreur de connexion';

            if (error?.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            console.error('🚫 Rejet final avec message:', errorMessage);
            return rejectWithValue(errorMessage);
        } finally {
            console.log('🏁 === THUNK AUTH/LOGIN - FIN ===');
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { dispatch }) => {
        console.log('🚪 === LOGOUT COMPLET - DÉBUT ===');

        try {
            console.log('🗑️ Suppression de TOUTES les données...');

            // Nettoyer TOUTES les clés utilisées dans l'app
            await Promise.all([
                // Clés authSlice
                AsyncStorage.removeItem('token'),
                AsyncStorage.removeItem('user'),
                // Clés apiConfig  
                AsyncStorage.removeItem('auth_token'),
                AsyncStorage.removeItem('user_data'),
                // Clé profile
                AsyncStorage.removeItem('employee_profile'),
            ]);

            console.log('✅ Stockage local complètement nettoyé');

            // Réinitialiser les autres slices
            dispatch({ type: 'employees/reset' });
            dispatch({ type: 'services/reset' });
            dispatch({ type: 'documents/reset' });

            console.log('✅ Logout terminé');
            return true;

        } catch (error) {
            console.error('❌ Erreur lors de la déconnexion:', error);
            // Retourner true pour forcer la déconnexion même en cas d'erreur
            return true;
        } finally {
            console.log('🏁 === LOGOUT COMPLET - FIN ===');
        }
    }
);


export const loadStoredAuth = createAsyncThunk(
    'auth/loadStored',
    async (_, { rejectWithValue }) => {
        console.log('📂 === LOAD STORED AUTH - DÉBUT ===');

        try {
            console.log('🔍 Recherche des données stockées...');

            const token = await AsyncStorage.getItem('token');
            const userStr = await AsyncStorage.getItem('user');

            console.log('🔑 Token trouvé:', !!token);
            console.log('👤 User trouvé:', !!userStr);

            if (token && userStr) {
                const user = JSON.parse(userStr);
                console.log('📋 User parsé:', user);

                console.log('🔐 Vérification de la validité du token...');

                // Vérifier la validité du token
                const isValid = await authService.verifyToken(token);
                console.log('✅ Token valide:', isValid);

                if (isValid) {
                    console.log('✅ Session restaurée avec succès');
                    return { token, user };
                } else {
                    console.warn('⚠️ Token invalide, nettoyage du storage');
                    // Token invalide, nettoyer le storage
                    await AsyncStorage.removeItem('token');
                    await AsyncStorage.removeItem('user');
                    return rejectWithValue('Token invalide');
                }
            }

            console.log('ℹ️ Aucune session trouvée');
            return rejectWithValue('Aucune session trouvée');

        } catch (error: any) {
            console.error('❌ Erreur lors du chargement de la session:', error);
            return rejectWithValue(error.message);
        } finally {
            console.log('🏁 === LOAD STORED AUTH - FIN ===');
        }
    }
);

export const changePassword = createAsyncThunk(
    'auth/changePassword',
    async (
        passwordData: {
            currentPassword: string;
            newPassword: string;
            confirmPassword: string;
        },
        { rejectWithValue }
    ) => {
        console.log('🔄 === CHANGE PASSWORD - DÉBUT ===');

        try {
            console.log('📤 Appel du service de changement de mot de passe...');

            const response = await authService.changePassword(passwordData);

            console.log('📥 Réponse changement mot de passe:', response);

            if (response.success) {
                console.log('✅ Mot de passe changé avec succès');

                // Mettre à jour le token si fourni
                if (response.data.token) {
                    console.log('🔑 Mise à jour du token...');
                    await AsyncStorage.setItem('token', response.data.token);
                }

                return response.data;
            } else {
                console.error('❌ Échec du changement de mot de passe');
                return rejectWithValue(response.message || 'Erreur lors du changement de mot de passe');
            }
        } catch (error: any) {
            console.error('💥 Erreur changement mot de passe:', error);
            return rejectWithValue(error.message);
        } finally {
            console.log('🏁 === CHANGE PASSWORD - FIN ===');
        }
    }
);

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            console.log('🧹 Nettoyage de l\'erreur auth');
            state.error = null;
        },
        updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
            console.log('👤 Mise à jour du profil utilisateur:', action.payload);
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
        setPermissions: (state, action: PayloadAction<string[]>) => {
            console.log('🔐 Mise à jour des permissions:', action.payload);
            state.permissions = action.payload;
            if (state.user) {
                state.user.permissions = action.payload;
            }
        },
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(login.pending, (state) => {
                console.log('⏳ Login pending - chargement en cours');
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                console.log('✅ Login fulfilled - succès');
                console.log('📦 Action payload:', action.payload);

                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.permissions = action.payload.permissions || action.payload.user?.permissions || [];
                state.error = null;

                console.log('📊 Nouvel état auth:', {
                    isAuthenticated: state.isAuthenticated,
                    userId: state.user?.id,
                    username: state.user?.username,
                    permissionsCount: state.permissions.length
                });
            })
            .addCase(login.rejected, (state, action) => {
                console.error('❌ Login rejected - échec');
                console.error('📝 Error payload:', action.payload);
                console.error('🔍 Action meta:', action.meta);
                console.error('🔍 Action error:', action.error);

                state.isLoading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.permissions = [];

                console.log('📊 État auth après échec:', {
                    isAuthenticated: state.isAuthenticated,
                    error: state.error
                });
            });

        // Load stored auth
        builder
            .addCase(loadStoredAuth.pending, (state) => {
                console.log('⏳ LoadStoredAuth pending');
                state.isLoading = true;
            })
            .addCase(loadStoredAuth.fulfilled, (state, action) => {
                console.log('✅ LoadStoredAuth fulfilled');
                console.log('📦 Restored data:', action.payload);

                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.permissions = action.payload.user.permissions || [];

                console.log('📊 Session restaurée pour:', state.user?.username);
            })
            .addCase(loadStoredAuth.rejected, (state, action) => {
                console.log('ℹ️ LoadStoredAuth rejected (normal si pas de session)');
                console.log('📝 Raison:', action.payload);

                state.isLoading = false;
                state.isAuthenticated = false;
            });

        // Logout
        builder
            .addCase(logout.fulfilled, (state) => {
                console.log('✅ Logout fulfilled - utilisateur déconnecté');

                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.permissions = [];
                state.error = null;

                console.log('📊 État après logout:', {
                    isAuthenticated: state.isAuthenticated
                });
            });

        // Change password
        builder
            .addCase(changePassword.pending, (state) => {
                console.log('⏳ ChangePassword pending');
                state.isLoading = true;
                state.error = null;
            })
            .addCase(changePassword.fulfilled, (state, action) => {
                console.log('✅ ChangePassword fulfilled');

                state.isLoading = false;
                if (state.user) {
                    state.user.passwordChangeRequired = false;
                }
                if (action.payload.token) {
                    state.token = action.payload.token;
                }
            })
            .addCase(changePassword.rejected, (state, action) => {
                console.error('❌ ChangePassword rejected');
                console.error('📝 Error:', action.payload);

                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, updateUserProfile, setPermissions } = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => {
    // Ajouter un log pour débugger les sélecteurs
    console.log('🔍 selectAuth appelé, état actuel:', {
        isAuthenticated: state.auth.isAuthenticated,
        isLoading: state.auth.isLoading,
        error: state.auth.error,
        user: state.auth.user?.username
    });
    return state.auth;
};

export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectPermissions = (state: { auth: AuthState }) => state.auth.permissions;

// Helper functions pour les permissions
export const hasPermission = (permissions: string[], requiredPermission: string): boolean => {
    const result = permissions.includes(requiredPermission);
    console.log(`🔐 Vérification permission "${requiredPermission}":`, result);
    return result;
};

export const hasAnyPermission = (permissions: string[], requiredPermissions: string[]): boolean => {
    const result = requiredPermissions.some(permission => permissions.includes(permission));
    console.log(`🔐 Vérification permissions ANY ${requiredPermissions}:`, result);
    return result;
};

export const hasAllPermissions = (permissions: string[], requiredPermissions: string[]): boolean => {
    const result = requiredPermissions.every(permission => permissions.includes(permission));
    console.log(`🔐 Vérification permissions ALL ${requiredPermissions}:`, result);
    return result;
};

export default authSlice.reducer;