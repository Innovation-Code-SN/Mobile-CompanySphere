// src/services/apiConfig.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Configuration de l'API
const getApiUrl = () => {
    if (__DEV__) {
        // En développement, utiliser votre IP locale
        // return 'http://192.168.1.92:8080';
        return 'https://companysphere.innovationcode.pro'; 
    }
    return 'https://companysphere.innovationcode.pro'; // URL de production
};

const API_BASE_URL = getApiUrl();
console.log('🌐 API_BASE_URL:', API_BASE_URL);

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
    errors?: string[];
}

// Instance axios configurée
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token automatiquement
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log('🔑 Token ajouté à la requête');
            }
        } catch (error) {
            console.log('❌ Erreur récupération token:', error);
        }

        console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.log('❌ Erreur requête:', error);
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les réponses et erreurs
apiClient.interceptors.response.use(
    (response) => {
        console.log(`✅ Réponse ${response.status} ${response.config.url}`);
        return response;
    },
    async (error) => {
        console.log(`❌ Erreur ${error.response?.status || 'Network'} ${error.config?.url}`);

        if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('🔒 Token expiré/invalide, nettoyage complet...');

            try {
                // Nettoyer TOUTES les clés
                await Promise.all([
                    AsyncStorage.removeItem('token'),
                    AsyncStorage.removeItem('user'),
                    AsyncStorage.removeItem('auth_token'),
                    AsyncStorage.removeItem('user_data'),
                    AsyncStorage.removeItem('employee_profile'),
                ]);

                console.log('🧹 Toutes les données supprimées');

                // Déclencher la déconnexion
                const handleAuthExpired = (global as any).handleAuthExpired;
                if (handleAuthExpired) {
                    console.log('🔄 Déclenchement de la déconnexion...');
                    setTimeout(() => {
                        handleAuthExpired();
                    }, 100);
                }
            } catch (cleanupError) {
                console.log('❌ Erreur nettoyage:', cleanupError);
            }
        }

        return Promise.reject(error);
    }
);


// ===== AUTH SERVICE =====
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

class AuthService {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        try {
            console.log('🔐 Tentative de connexion:', credentials.username);

            const response = await apiClient.post('/api/auth/login', credentials);
            console.log('📥 Réponse reçue du serveur');

            if (response.data && response.data.token) {
                // Stocker le token
                await AsyncStorage.setItem('auth_token', response.data.token);

                // Construire et stocker userData
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

                await AsyncStorage.setItem('user_data', JSON.stringify(userData));
                console.log('✅ Connexion réussie');

                return {
                    success: true,
                    data: {
                        token: response.data.token,
                        user: userData,
                        permissions: response.data.permissions
                    }
                };
            }

            return {
                success: false,
                message: 'Pas de token dans la réponse',
            };

        } catch (error: any) {
            console.error('❌ Erreur login:', error.response?.data?.message);
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur de connexion',
            };
        }
    }


    async logout(): Promise<void> {
        try {
            console.log('🚪 Déconnexion...');
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('user_data');
            console.log('✅ Déconnexion réussie');
        } catch (error) {
            console.log('❌ Erreur déconnexion:', error);
        }
    }

    async isAuthenticated(): Promise<boolean> {
        try {
            const token = await AsyncStorage.getItem('auth_token');
            return !!token;
        } catch (error) {
            return false;
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
}

// ===== EMPLOYEE SERVICE =====
export interface Employee {
    id: string;
    matricule: string;
    nom: string;
    prenom: string;
    photo?: string;
    dateEntree: string;
    statut: 'ACTIF' | 'INACTIF' | 'SUSPENDU' | 'PLUS_EN_POSTE' | 'EN_CONGE';
    poste?: {
        id: string;
        nom: string;
        description?: string;
    };
    service?: {
        id: string;
        nom: string;
        description?: string;
        manager?: {
            id: string;
            nom: string;
            prenom: string;
        };
    };
    contact: {
        email?: string;
        telephoneMobile?: string;
        telephoneInterne?: string;
        adresseEnEntreprise?: string;
    };
    historiquePostes?: any[];
    linkResponseDtos?: any[];
}

class EmployeeService {
    async getAll(): Promise<ApiResponse<Employee[]>> {
        try {
            console.log('👥 Récupération de tous les employés...');
            const response = await apiClient.get('/api/admin/employes');

            return {
                success: true,
                data: response.data.data || [],
            };
        } catch (error: any) {
            console.log('❌ Erreur récupération employés:', error.response?.data?.message);
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Erreur lors de la récupération des employés',
            };
        }
    }

    async getById(id: string): Promise<ApiResponse<Employee>> {
        try {
            console.log('👤 Récupération employé ID:', id);
            const response = await apiClient.get(`/api/admin/employes/${id}`);

            return {
                success: true,
                data: response.data.data,
            };
        } catch (error: any) {
            console.log('❌ Erreur récupération employé:', error.response?.data?.message);
            return {
                success: false,
                data: {} as Employee,
                message: error.response?.data?.message || 'Erreur lors de la récupération de l\'employé',
            };
        }
    }

    async getMyProfile(): Promise<ApiResponse<Employee>> {
        try {
            console.log('👤 Récupération de mon profil...');
            const response = await apiClient.get('/api/profile/me');

            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            console.log('❌ Erreur récupération profil:', error.response?.data?.message);
            return {
                success: false,
                data: {} as Employee,
                message: error.response?.data?.message || 'Erreur lors de la récupération du profil',
            };
        }
    }

    async updateContactInfo(id: string, contactData: any): Promise<ApiResponse<Employee>> {
        try {
            console.log('📝 Mise à jour contact employé ID:', id);
            const response = await apiClient.put(`/api/profile/${id}/contact`, contactData);

            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            console.log('❌ Erreur mise à jour contact:', error.response?.data?.message);
            return {
                success: false,
                data: {} as Employee,
                message: error.response?.data?.message || 'Erreur lors de la mise à jour',
            };
        }
    }
}

// ===== SERVICE SERVICE =====
export interface Service {
    id: string;
    nom: string;
    description?: string;
    status: 'ACTIVE' | 'INACTIVE';
    manager?: {
        id: string;
        nom: string;
        prenom: string;
    };
    serviceParent?: {
        id: string;
        nom: string;
    };
    servicesEnfants?: Service[];
}

class ServiceService {
    async getAll(): Promise<ApiResponse<Service[]>> {
        try {
            console.log('🏢 Récupération de tous les services...');
            const response = await apiClient.get('/api/admin/services');

            return {
                success: true,
                data: response.data.data || [],
            };
        } catch (error: any) {
            console.log('❌ Erreur récupération services:', error.response?.data?.message);
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Erreur lors de la récupération des services',
            };
        }
    }

    async getById(id: string): Promise<ApiResponse<Service>> {
        try {
            console.log('🏢 Récupération service ID:', id);
            const response = await apiClient.get(`/api/admin/services/${id}`);

            return {
                success: true,
                data: response.data.data,
            };
        } catch (error: any) {
            console.log('❌ Erreur récupération service:', error.response?.data?.message);
            return {
                success: false,
                data: {} as Service,
                message: error.response?.data?.message || 'Erreur lors de la récupération du service',
            };
        }
    }
}

// ===== DOCUMENT SERVICE =====
export interface Document {
    id: string;
    nom: string;
    path: string;
    size: number;
    contentType: string;
    tags: string[];
    createdAt: string;
    lastUpdatedAt: string;
    dossierParent?: {
        id: string;
        nom: string;
    };
}

export interface Folder {
    id: string;
    nom: string;
    parent?: {
        id: string;
        nom: string;
    };
    sousDossiers: Folder[];
    documents: Document[];
    visibilite: 'PUBLIC' | 'SERVICES_SPECIFIQUES' | 'MANAGERS_SERVICES';
    serviceIds?: string[];
    createdAt: string;
    lastUpdatedAt: string;
}

class DocumentService {
    async getAllFolders(): Promise<ApiResponse<Folder[]>> {
        try {
            console.log('📁 Récupération de tous les dossiers...');
            const response = await apiClient.get('/api/dossiers');

            return {
                success: true,
                data: response.data.data || [],
            };
        } catch (error: any) {
            console.log('❌ Erreur récupération dossiers:', error.response?.data?.message);
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Erreur lors de la récupération des dossiers',
            };
        }
    }

    async getAllDocuments(): Promise<ApiResponse<Document[]>> {
        try {
            console.log('📄 Récupération de tous les documents...');
            const response = await apiClient.get('/api/documents');

            return {
                success: true,
                data: response.data.data || [],
            };
        } catch (error: any) {
            console.log('❌ Erreur récupération documents:', error.response?.data?.message);
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Erreur lors de la récupération des documents',
            };
        }
    }

    async downloadDocument(documentId: string): Promise<Blob> {
        try {
            console.log('⬇️ Téléchargement document ID:', documentId);
            const response = await apiClient.get(`/api/documents/${documentId}/download`, {
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            console.log('❌ Erreur téléchargement document:', error);
            throw error;
        }
    }
}

// Export des instances
export const authService = new AuthService();
export const employeeService = new EmployeeService();
export const serviceService = new ServiceService();
export const documentService = new DocumentService();
