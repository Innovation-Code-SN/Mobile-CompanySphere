// src/constants/styleUtils.ts
// Fonctions utilitaires pour la charte graphique
import { Colors, Gradients } from './theme';

// =============================================================================
// FONCTIONS UTILITAIRES
// =============================================================================

export const StyleUtils = {
    // Ajouter de l'opacité à une couleur
    withOpacity: (color: string, opacity: number): string => {
        const opacityHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
        return `${color}${opacityHex}`;
    },

    // Obtenir la couleur de statut
    getStatusColor: (status: string | boolean): string => {
        if (typeof status === 'boolean') {
            return status ? Colors.success : Colors.textMuted;
        }

        switch (status?.toUpperCase()) {
            case 'ACTIF':
            case 'ACTIVE':
                return Colors.success;
            case 'INACTIF':
            case 'INACTIVE':
                return Colors.textMuted;
            case 'SUSPENDU':
                return Colors.warning;
            case 'EN_CONGE':
                return Colors.info;
            default:
                return Colors.textMuted;
        }
    },

    // Obtenir la couleur selon le type de fichier
    getFileTypeColor: (contentType: string): string => {
        if (contentType.includes('pdf')) return Colors.error;
        if (contentType.includes('image')) return Colors.success;
        if (contentType.includes('video')) return '#9C27B0';
        if (contentType.includes('word')) return Colors.primary;
        if (contentType.includes('excel')) return Colors.success;
        return Colors.textMuted;
    },

    // Obtenir le gradient selon l'écran
    getScreenGradient: (screen: 'dashboard' | 'employee' | 'service' | 'document' | 'profile' | 'team' | 'faq'): readonly [string, string] => {
        switch (screen) {
            case 'service':
            case 'team':
                return Gradients.secondary;
            case 'faq':
                return Gradients.faq;
            case 'dashboard':
            case 'employee':
            case 'document':
            case 'profile':
            default:
                return Gradients.primary;
        }
    },

    // Ombres uniformes
    getUniformShadow: (elevation: 'low' | 'medium' | 'high' = 'low') => {
        switch (elevation) {
            case 'medium':
                return {
                    elevation: 4,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                };
            case 'high':
                return {
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                };
            case 'low':
            default:
                return {
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.22,
                    shadowRadius: 2.22,
                };
        }
    },
};