// src/services/passwordService.ts
import { apiClient, ApiResponse } from './apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ChangePasswordResponse {
    success: boolean;
    message?: string;
    data?: {
        token?: string;
        message?: string;
    };
}

class PasswordService {
    /**
     * Change le mot de passe de l'utilisateur connecté
     */
    async changePassword(passwordData: ChangePasswordData): Promise<ChangePasswordResponse> {
        try {
            console.log('🔐 Appel API changement mot de passe...');

            // Validation côté client
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                return {
                    success: false,
                    message: 'Les mots de passe ne correspondent pas',
                };
            }

            // Validation de la complexité du mot de passe
            const validation = this.validatePassword(passwordData.newPassword);
            if (!validation.isValid) {
                return {
                    success: false,
                    message: validation.message,
                };
            }

            // Appel API
            const response = await apiClient.post('/api/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });

            console.log('✅ Changement de mot de passe réussi');

            // Si un nouveau token est fourni, le stocker
            if (response.data.token) {
                console.log('🔑 Mise à jour du token après changement');
                await AsyncStorage.setItem('auth_token', response.data.token);
            }

            return {
                success: true,
                message: response.data.message || 'Mot de passe modifié avec succès',
                data: response.data,
            };

        } catch (error: any) {
            console.error('❌ Erreur changement mot de passe:', error);

            // Gestion des erreurs spécifiques
            if (error.response?.status === 401) {
                return {
                    success: false,
                    message: 'Mot de passe actuel incorrect',
                };
            }

            if (error.response?.status === 400) {
                return {
                    success: false,
                    message: error.response.data.message || 'Le nouveau mot de passe ne respecte pas les exigences de sécurité',
                };
            }

            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors du changement de mot de passe',
            };
        }
    }

    /**
     * Valide la complexité d'un mot de passe
     */
    validatePassword(password: string): { isValid: boolean; message: string } {
        // Règles de validation
        const rules = [
            {
                test: (pwd: string) => pwd.length >= 8,
                message: 'Le mot de passe doit contenir au moins 8 caractères',
            },
            {
                test: (pwd: string) => /[a-z]/.test(pwd),
                message: 'Le mot de passe doit contenir au moins une lettre minuscule',
            },
            {
                test: (pwd: string) => /[A-Z]/.test(pwd),
                message: 'Le mot de passe doit contenir au moins une lettre majuscule',
            },
            {
                test: (pwd: string) => /[0-9]/.test(pwd),
                message: 'Le mot de passe doit contenir au moins un chiffre',
            },
            {
                test: (pwd: string) => /[@#$%^&+=!]/.test(pwd),
                message: 'Le mot de passe doit contenir au moins un caractère spécial (@#$%^&+=!)',
            },
        ];

        // Vérifier chaque règle
        for (const rule of rules) {
            if (!rule.test(password)) {
                return { isValid: false, message: rule.message };
            }
        }

        return { isValid: true, message: 'Mot de passe valide' };
    }

    /**
     * Vérifie si le mot de passe actuel est correct (utile pour la validation en temps réel)
     */
    async verifyCurrentPassword(currentPassword: string): Promise<ApiResponse<boolean>> {
        try {
            console.log('🔍 Vérification du mot de passe actuel...');

            const response = await apiClient.post('/api/auth/verify-password', {
                password: currentPassword,
            });

            return {
                success: true,
                data: response.data.valid || false,
            };

        } catch (error: any) {
            console.error('❌ Erreur vérification mot de passe:', error);

            return {
                success: false,
                data: false,
                message: 'Erreur lors de la vérification du mot de passe',
            };
        }
    }

    /**
     * Génère un mot de passe aléatoire sécurisé
     * Utile pour suggérer des mots de passe forts
     */
    generateSecurePassword(length: number = 12): string {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const special = '@#$%^&+=!';

        const allChars = lowercase + uppercase + numbers + special;

        let password = '';

        // Garantir au moins un caractère de chaque type
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += special[Math.floor(Math.random() * special.length)];

        // Compléter avec des caractères aléatoires
        for (let i = password.length; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }

        // Mélanger le mot de passe
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }

    /**
     * Calcule la force d'un mot de passe (0-100)
     */
    calculatePasswordStrength(password: string): number {
        let strength = 0;

        // Longueur
        if (password.length >= 8) strength += 20;
        if (password.length >= 12) strength += 10;
        if (password.length >= 16) strength += 10;

        // Diversité des caractères
        if (/[a-z]/.test(password)) strength += 15;
        if (/[A-Z]/.test(password)) strength += 15;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[@#$%^&+=!]/.test(password)) strength += 15;

        // Bonus pour la complexité
        const uniqueChars = new Set(password).size;
        if (uniqueChars >= password.length * 0.8) strength += 10;

        return Math.min(100, strength);
    }

    /**
     * Retourne un message descriptif sur la force du mot de passe
     */
    getPasswordStrengthLabel(strength: number): { label: string; color: string } {
        if (strength < 30) {
            return { label: 'Très faible', color: '#EF4444' }; // Colors.error
        } else if (strength < 50) {
            return { label: 'Faible', color: '#F59E0B' }; // Colors.warning
        } else if (strength < 70) {
            return { label: 'Moyen', color: '#3B82F6' }; // Colors.info
        } else if (strength < 90) {
            return { label: 'Fort', color: '#10B981' }; // Colors.success
        } else {
            return { label: 'Très fort', color: '#10B981' }; // Colors.success
        }
    }
}

// Export de l'instance
export const passwordService = new PasswordService();