// services/passwordResetService.ts
import { apiClient, ApiResponse } from './apiConfig';

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

class PasswordResetService {

    async forgotPassword(email: string): Promise<ApiResponse<string>> {
        try {
            console.log('📧 Envoi demande mot de passe oublié pour:', email);

            const response = await apiClient.post('/api/auth/forgot-password-mobile', { email });

            console.log('✅ Demande envoyée avec succès');
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Email de réinitialisation envoyé'
            };

        } catch (error: any) {
            console.error('❌ Erreur lors de l\'envoi:', error);

            if (error.response?.data) {
                return {
                    success: false,
                    data: '',
                    message: error.response.data.message || 'Erreur lors de l\'envoi de l\'email'
                };
            }

            return {
                success: false,
                data: '',
                message: 'Erreur de connexion. Vérifiez votre connexion internet.'
            };
        }
    }

    async verifyResetToken(token: string): Promise<ApiResponse<boolean>> {
        try {
            console.log('🔍 Vérification du token:', token);

            const response = await apiClient.get(`/api/auth/verify-reset-token/${token}`);

            console.log('✅ Token vérifié:', response.data.data);
            return {
                success: true,
                data: response.data.data,
                message: response.data.data ? 'Token valide' : 'Token invalide ou expiré'
            };

        } catch (error: any) {
            console.error('❌ Erreur vérification token:', error);

            return {
                success: false,
                data: false,
                message: 'Token invalide ou expiré'
            };
        }
    }

    async resetPassword(token: string, newPassword: string): Promise<ApiResponse<string>> {
        try {
            console.log('🔐 Réinitialisation du mot de passe avec token:', token);

            const response = await apiClient.post('/api/auth/reset-password', {
                token,
                newPassword
            });

            console.log('✅ Mot de passe réinitialisé avec succès');
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Mot de passe réinitialisé avec succès'
            };

        } catch (error: any) {
            console.error('❌ Erreur réinitialisation:', error);

            if (error.response?.data) {
                return {
                    success: false,
                    data: '' ,
                    message: error.response.data.message || 'Erreur lors de la réinitialisation'
                };
            }

            return {
                success: false,
                data: '',
                message: 'Erreur de connexion. Vérifiez votre connexion internet.'
            };
        }
    }

    // Utilitaire pour valider le format email
    validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Utilitaire pour valider le mot de passe selon les règles backend
    validatePassword(password: string): { isValid: boolean; message: string } {
        const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/;

        if (!password) {
            return { isValid: false, message: 'Le mot de passe est requis' };
        }

        if (password.length < 8) {
            return { isValid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
        }

        if (!/(?=.*[a-z])/.test(password)) {
            return { isValid: false, message: 'Le mot de passe doit contenir au moins une lettre minuscule' };
        }

        if (!/(?=.*[A-Z])/.test(password)) {
            return { isValid: false, message: 'Le mot de passe doit contenir au moins une lettre majuscule' };
        }

        if (!/(?=.*[0-9])/.test(password)) {
            return { isValid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
        }

        if (!/(?=.*[@#$%^&+=!])/.test(password)) {
            return { isValid: false, message: 'Le mot de passe doit contenir au moins un caractère spécial (@#$%^&+=!)' };
        }

        return { isValid: true, message: 'Mot de passe valide' };
    }
}

export const passwordResetService = new PasswordResetService();