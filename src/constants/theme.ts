// src/constants/theme.ts
// Fichier principal de la charte graphique IC Company Sphere
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

// =============================================================================
// COULEURS BASÉES SUR LE LOGO IC COMPANY SPHERE
// =============================================================================

export const Colors = {
    // === COULEURS DU LOGO ===
    primary: '#067BC2',        // Bleu principal du logo
    secondary: '#FF6B35',      // Orange du logo
    accent: '#F15A29',         // Orange plus vif

    // === VARIATIONS DU BLEU ===
    primaryLight: '#4A9FDB',
    primaryDark: '#034F7A',
    primarySoft: '#E3F2FD',

    // === VARIATIONS DE L'ORANGE ===
    secondaryLight: '#FF8A5B',
    secondaryDark: '#E55A2B',
    secondarySoft: '#FFF3E0',

    // === NEUTRES MODERNES ===
    background: '#FAFBFC',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F7FA',

    // === TEXTE ===
    textPrimary: '#1A1D29',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',

    // === ÉTATS ===
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // === BORDURES ===
    border: '#E5E7EB',
    divider: '#F3F4F6',

    // === OVERLAY ===
    overlay: 'rgba(0, 0, 0, 0.5)',
    backdrop: 'rgba(6, 123, 194, 0.05)',
};

// =============================================================================
// GRADIENTS PAR ÉCRAN
// =============================================================================

export const Gradients = {
    // Dashboard, Employés, Documents, Profil
    primary: ['#067BC2', '#4A9FDB'] as const,

    // Services, Équipes
    secondary: ['#FF6B35', '#F15A29'] as const,

    // Headers spéciaux
    header: ['#067BC2', '#034F7A'] as const,

    // FAQ (couleur spéciale)
    faq: ['#4A90E2', '#357ABD'] as const,
};

// =============================================================================
// TYPOGRAPHIE
// =============================================================================

export const Typography = StyleSheet.create({
    h1: {
        fontSize: 32,
        fontWeight: '800',
        lineHeight: 40,
        color: Colors.textPrimary,
    } as TextStyle,

    h2: {
        fontSize: 28,
        fontWeight: '700',
        lineHeight: 36,
        color: Colors.textPrimary,
    } as TextStyle,

    h3: {
        fontSize: 24,
        fontWeight: '700',
        lineHeight: 32,
        color: Colors.textPrimary,
    } as TextStyle,

    h4: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
        color: Colors.textPrimary,
    } as TextStyle,

    h5: {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 24,
        color: Colors.textPrimary,
    } as TextStyle,

    h6: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
        color: Colors.textPrimary,
    } as TextStyle,

    body: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
        color: Colors.textPrimary,
    } as TextStyle,

    bodySmall: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        color: Colors.textSecondary,
    } as TextStyle,

    label: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
        color: Colors.textPrimary,
    } as TextStyle,

    button: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 20,
    } as TextStyle,

    caption: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        color: Colors.textMuted,
    } as TextStyle,
});

// =============================================================================
// ESPACEMENTS
// =============================================================================

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 40,
    massive: 48,
};

// =============================================================================
// RAYONS DE BORDURE
// =============================================================================

export const BorderRadius = {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    round: 50,
    circle: 999,
};

// =============================================================================
// EXPORT DU THÈME COMPLET
// =============================================================================

export const Theme = {
    Colors,
    Gradients,
    Typography,
    Spacing,
    BorderRadius,
};