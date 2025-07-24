// src/services/authService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { apiClient } from './apiConfig';

// Configuration de l'API
const getApiUrl = () => {
    if (__DEV__) {
        const { manifest } = Constants;
        if (manifest?.debuggerHost) {
            const api = manifest.debuggerHost.split(':').shift();
            return `http://${api}:8080/api`;
        }
        return 'http://192.168.1.75:8080/api'; // Votre IP de développement
    }
    return 'https://your-production-api.com/api';
};

const API_BASE_URL = getApiUrl();

console.log('🌐 AuthService - API_BASE_URL:', API_BASE_URL);

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    message?: string;
    data?: {
        token: string;
        user: {
            id: string;
            username: string;
            displayName: string;
            email: string;
            roles: string[];
            permissions: string[];
            employeId?: string;
            passwordChangeRequired?: boolean;
        };
        permissions?: string[];
    };
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

class AuthService {

    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        try {
            console.log('🔐 Tentative de connexion:', credentials.username);

            const response = await apiClient.post('/api/auth/login', credentials);
            console.log('📥 Réponse complète:', response.data);
            console.log('📥 Type de response.data:', typeof response.data);
            console.log('📥 response.data.token existe:', !!response.data?.token);

            if (response.data && response.data.token) {
                console.log('💾 === DÉBUT STOCKAGE AVEC DÉBOGAGE INTENSIF ===');

                // 1. Stocker le token
                console.log('💾 ÉTAPE 1: Stockage du token...');
                await AsyncStorage.setItem('auth_token', response.data.token);
                console.log('✅ Token stocké avec succès');

                // 2. Construire userData avec vérifications
                console.log('💾 ÉTAPE 2: Construction userData...');
                console.log('📋 Données brutes du backend:');
                console.log('  - employeId:', response.data.employeId);
                console.log('  - roles:', response.data.roles);
                console.log('  - permissions:', response.data.permissions);
                console.log('  - passwordChangeRequired:', response.data.passwordChangeRequired);
                console.log('  - internal:', response.data.internal);

                const userData = {
                    id: response.data.employeId?.toString() || '1',
                    username: credentials.username,
                    displayName: credentials.username,
                    email: credentials.username,
                    roles: response.data.roles || ['ROLE_USER'],
                    permissions: response.data.permissions || [],
                    employeId: response.data.employeId,
                    passwordChangeRequired: response.data.passwordChangeRequired || false,
                    internal: response.data.internal || false
                };

                console.log('👤 userData construites:', userData);
                console.log('👤 Type userData:', typeof userData);
                console.log('👤 userData est un objet:', userData !== null && typeof userData === 'object');

                // 3. Sérialiser et stocker avec vérifications
                console.log('💾 ÉTAPE 3: Sérialisation...');
                const userDataString = JSON.stringify(userData);
                console.log('📝 UserData sérialisées (longueur):', userDataString.length);
                console.log('📝 UserData sérialisées (début):', userDataString.substring(0, 100) + '...');

                console.log('💾 ÉTAPE 4: Stockage userData...');
                await AsyncStorage.setItem('user_data', userDataString);
                console.log('✅ UserData stockées avec clé "user_data"');

                // 4. VÉRIFICATION IMMÉDIATE EXHAUSTIVE
                console.log('🔍 ÉTAPE 5: Vérification exhaustive...');

                // Vérifier toutes les clés présentes
                const allKeys = await AsyncStorage.getAllKeys();
                console.log('🔍 Toutes les clés AsyncStorage:', allKeys);

                // Vérifier spécifiquement nos clés
                const storedToken = await AsyncStorage.getItem('auth_token');
                const storedUserData = await AsyncStorage.getItem('user_data');

                console.log('🔍 Token récupéré:', storedToken ? `✅ (${storedToken.length} chars)` : '❌');
                console.log('🔍 UserData récupéré:', storedUserData ? `✅ (${storedUserData.length} chars)` : '❌');

                // Tenter de parser les userData récupérées
                if (storedUserData) {
                    try {
                        const parsed = JSON.parse(storedUserData);
                        console.log('🔍 UserData parsées avec succès:', parsed);
                    } catch (parseError) {
                        console.error('❌ Erreur parsing userData récupérées:', parseError);
                    }
                } else {
                    console.error('❌ CRITIQUE: userData non récupérées après stockage !');

                    // Test de diagnostic - essayer de stocker une valeur simple
                    console.log('🧪 Test diagnostic - stockage valeur simple...');
                    await AsyncStorage.setItem('test_key', 'test_value');
                    const testValue = await AsyncStorage.getItem('test_key');
                    console.log('🧪 Test simple réussi:', testValue === 'test_value');
                    await AsyncStorage.removeItem('test_key');
                }

                console.log('💾 === FIN STOCKAGE AVEC DÉBOGAGE ===');

                return {
                    success: true,
                    data: {
                        token: response.data.token,
                        user: userData,
                        permissions: response.data.permissions
                    }
                };
            }

            console.log('❌ Pas de token dans la réponse');
            return {
                success: false,
                message: 'Pas de token dans la réponse',
            };

        } catch (error: any) {
            console.error('❌ Erreur login authService:', error);
            console.error('❌ Stack trace:', error.stack);
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur de connexion',
            };
        }
    }

    async isAuthenticated(): Promise<boolean> {
        try {
            console.log('🔍 === VÉRIFICATION isAuthenticated ===');

            const token = await AsyncStorage.getItem('auth_token');
            const userData = await AsyncStorage.getItem('user_data');

            console.log('🔍 Token trouvé:', !!token);
            console.log('🔍 UserData trouvé:', !!userData);

            const result = !!(token && userData);
            console.log('🔍 Résultat isAuthenticated:', result);

            return result;
        } catch (error) {
            console.error('❌ Erreur isAuthenticated:', error);
            return false;
        }
    }


    async verifyToken(token: string): Promise<boolean> {
        try {
            console.log('🔍 Vérification du token...');

            const response = await fetch(`${API_BASE_URL}/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('📊 Token verification status:', response.status);
            return response.ok;

        } catch (error) {
            console.error('❌ Erreur lors de la vérification du token:', error);
            return false;
        }
    }

    async changePassword(passwordData: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    }): Promise<ApiResponse<any>> {
        try {
            console.log('🔄 Changement de mot de passe...');

            const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(passwordData),
            });

            const data = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    data: data,
                };
            } else {
                return {
                    success: false,
                    message: data.message || 'Erreur lors du changement de mot de passe',
                };
            }
        } catch (error: any) {
            console.error('❌ Erreur changement mot de passe:', error);
            throw new Error(error.message || 'Erreur lors du changement de mot de passe');
        }
    }

    async logout(): Promise<void> {
        try {
            console.log('🚪 Déconnexion...');
            console.log('🔍 === QUI APPELLE AUTHSERVICE.LOGOUT? ===');
            console.trace(); // ← Voir qui appelle
            console.log('🔍 === FIN TRACE ===');

            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('user_data');
            console.log('✅ Déconnexion réussie');
        } catch (error) {
            console.log('❌ Erreur déconnexion:', error);
        }
    }



    async getCurrentUser(): Promise<any> {
        try {
            const userData = await AsyncStorage.getItem('user_data');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            return null;
        }
    }

    // Test de connectivité
    async testConnection(): Promise<boolean> {
        try {
            console.log('🔗 Test de connectivité...');
            console.log('📍 URL de test:', `${API_BASE_URL}/health`);

            const response = await fetch(`${API_BASE_URL}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('📊 Test connectivité status:', response.status);
            return response.ok;

        } catch (error) {
            console.error('❌ Test de connectivité échoué:', error);
            return false;
        }
    }
}

export const authService = new AuthService();