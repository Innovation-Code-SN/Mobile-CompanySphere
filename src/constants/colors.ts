export const Colors = {
    primary: '#067BC2',      // Bleu principal du logo
    secondary: '#FF6B35',    // Orange du logo
    accent: '#F15A29',       // Orange plus vif

    // Variations du bleu
    primaryLight: '#4A9FDB',
    primaryDark: '#034F7A',

    // Variations de l'orange
    secondaryLight: '#FF8A5B',
    secondaryDark: '#E55A2B',

    // Neutres modernes
    background: '#FAFBFC',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F7FA',

    // Texte
    textPrimary: '#1A1D29',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',

    // États
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Bordures et séparateurs
    border: '#E5E7EB',
    divider: '#F3F4F6',

    // Overlay et modal
    overlay: 'rgba(0, 0, 0, 0.5)',
    backdrop: 'rgba(6, 123, 194, 0.05)',
};

export const Gradients = {
    primary: ['#067BC2', '#4A9FDB'] as const,
    secondary: ['#FF6B35', '#F15A29'] as const,
    surface: ['#FAFBFC', '#F5F7FA'] as const,
    header: ['#067BC2', '#034F7A'] as const,
};