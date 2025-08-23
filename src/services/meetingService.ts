// meetingService.js - Version complète avec réponse aux invitations

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Meeting } from '../types/meetings';
import { apiClient, ApiResponse } from "./apiConfig";

export const meetingService = {
    // Obtenir mes réunions
    getMyMeetings: async (): Promise<{ success: boolean; data: Meeting[] }> => {
        try {
            console.log('🔄 Appel API: /api/reunions/mes-reunions');

            const response = await apiClient.get('/api/reunions/mes-reunions');
            console.log('📥 Réponse complète:', response);
            console.log('📊 Status:', response.status);
            console.log('💾 Data:', response.data);

            const backendResponse = response.data;

            if (backendResponse && backendResponse.success) {
                console.log('✅ Succès - Données brutes:', backendResponse.data);
                
                return {
                    success: true,
                    data: backendResponse.data || []
                };
            } else {
                console.warn('⚠️ Réponse sans succès:', backendResponse);
                return {
                    success: false,
                    data: []
                };
            }
        } catch (error: unknown) {
            console.error('❌ Erreur lors de la récupération des réunions:', error);

            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as any;
                console.error('📊 Status de l\'erreur:', axiosError.response?.status);
                console.error('💬 Message d\'erreur:', axiosError.response?.data);

                if (axiosError.response?.status === 400) {
                    console.error('❌ Erreur 400 - Requête invalide ou utilisateur non authentifié');
                } else if (axiosError.response?.status === 401) {
                    console.error('❌ Erreur 401 - Non autorisé');
                } else if (axiosError.response?.status === 403) {
                    console.error('❌ Erreur 403 - Accès interdit');
                }
            }

            return {
                success: false,
                data: []
            };
        }
    },

    // 🔧 MÉTHODE COMPLÈTE pour répondre à une invitation
    respondToInvitation: async (
        meetingId: string | number,
        employeeId: string | number,
        status: string,
        comment?: string
    ) => {
        try {
            console.log('🔄 Réponse à l\'invitation:', { 
                meetingId, 
                employeeId, 
                status, 
                comment: comment ? 'Oui' : 'Non' 
            });

            // Vérifier qu'on a bien un employeeId
            let finalEmployeeId = employeeId;
            if (!finalEmployeeId) {
                const userData = await AsyncStorage.getItem('user_data');
                if (userData) {
                    const user = JSON.parse(userData);
                    finalEmployeeId = user.employeId || user.id;
                }

                if (!finalEmployeeId) {
                    throw new Error('ID employé non trouvé');
                }
            }

            // Préparer le payload
            const payload = {
                statut: status,
                commentaire: comment || null
            };

            console.log('📤 Payload envoyé:', payload);

            // Appeler l'endpoint avec commentaire (nouvelle API)
            const response = await apiClient.put(
                `/api/reunions/${meetingId}/participants/employe/${finalEmployeeId}/reponse`,
                payload
            );

            console.log('✅ Réponse invitation réussie:', response.data);

            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Réponse enregistrée avec succès'
            };
        } catch (error: unknown) {
            console.error('❌ Erreur lors de la réponse:', error);
            
            let errorMessage = 'Erreur lors de l\'enregistrement de la réponse';
            
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as any;
                console.error('📊 Status de l\'erreur:', axiosError.response?.status);
                console.error('💬 Détail de l\'erreur:', axiosError.response?.data);
                
                if (axiosError.response?.data?.message) {
                    errorMessage = axiosError.response.data.message;
                } else if (axiosError.response?.status === 404) {
                    errorMessage = 'Réunion ou participant non trouvé';
                } else if (axiosError.response?.status === 400) {
                    errorMessage = 'Données invalides';
                } else if (axiosError.response?.status === 403) {
                    errorMessage = 'Vous n\'êtes pas autorisé à répondre à cette invitation';
                }
            }

            return {
                success: false,
                error: errorMessage
            };
        }
    },

    // Méthode alternative pour les réponses rapides (sans commentaire)
    quickResponse: async (
        meetingId: string | number,
        employeeId: string | number,
        status: string
    ) => {
        return await meetingService.respondToInvitation(meetingId, employeeId, status);
    },

    // Méthode de test pour vérifier la connexion
    testConnection: async () => {
        try {
            console.log('🧪 Test de connexion API...');

            const token = await AsyncStorage.getItem('auth_token');
            const userData = await AsyncStorage.getItem('user_data');

            console.log('🔑 Token présent:', !!token);
            console.log('👤 User data présent:', !!userData);

            if (userData) {
                const user = JSON.parse(userData);
                console.log('👤 User:', user.username || user.displayName);
                console.log('🆔 Employee ID:', user.employeId);
            }

            const response = await apiClient.get('/api/reunions');
            console.log('✅ Test connexion réussi:', response.status);

            return { success: true, message: 'Connexion OK' };
        } catch (error: any) {
            console.error('❌ Test connexion échoué:', error.response?.status, error.response?.data);
            return {
                success: false,
                message: `Erreur ${error.response?.status}: ${error.response?.data?.message || 'Connexion échouée'}`
            };
        }
    },

    // Obtenir les détails d'une réunion spécifique
    getMeetingDetails: async (meetingId: string | number) => {
        try {
            console.log('🔄 Récupération des détails de la réunion:', meetingId);

            const response = await apiClient.get(`/api/reunions/${meetingId}`);
            console.log('✅ Détails réunion récupérés:', response.data);

            if (response.data && response.data.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    error: response.data?.message || 'Erreur lors de la récupération des détails'
                };
            }
        } catch (error: any) {
            console.error('❌ Erreur lors de la récupération des détails:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la récupération des détails'
            };
        }
    },

    // Obtenir les participants d'une réunion
    getMeetingParticipants: async (meetingId: string | number) => {
        try {
            console.log('🔄 Récupération des participants de la réunion:', meetingId);

            const response = await apiClient.get(`/api/reunions/${meetingId}/participants`);
            console.log('✅ Participants récupérés:', response.data);

            if (response.data && response.data.success) {
                return {
                    success: true,
                    data: response.data.data || response.data.participants
                };
            } else {
                return {
                    success: false,
                    error: response.data?.message || 'Erreur lors de la récupération des participants'
                };
            }
        } catch (error: any) {
            console.error('❌ Erreur lors de la récupération des participants:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la récupération des participants'
            };
        }
    }
};