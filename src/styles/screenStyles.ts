// src/styles/screenStyles.ts
// Styles spécifiques pour chaque écran
import { StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { StyleUtils } from '../constants/styleUtils';
import { BaseComponents } from '../constants/components';

// =============================================================================
// STYLES PAR ÉCRAN
// =============================================================================

// === LOGIN SCREEN ===
export const LoginStyles = StyleSheet.create({
    container: {
        ...BaseComponents.container,
    },

    gradient: {
        flex: 1,
    },

    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.xxxl,
        paddingVertical: Spacing.massive,
    },

    header: {
        alignItems: 'center',
        marginBottom: Spacing.massive,
    },

    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.2),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.surface,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },

    subtitle: {
        fontSize: 16,
        color: StyleUtils.withOpacity(Colors.surface, 0.8),
        textAlign: 'center',
    },

    formContainer: {
        ...BaseComponents.cardElevated,
        padding: Spacing.xxxl,
        ...StyleUtils.getUniformShadow('high'),
    },

    loginButton: {
        ...BaseComponents.buttonBase,
        ...BaseComponents.buttonPrimary,
        marginBottom: Spacing.lg,
    },

    loginButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.surface,
    },

    forgotPassword: {
        alignItems: 'center',
    },

    forgotPasswordText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '500',
    },
});

// === DASHBOARD SCREEN ===
export const DashboardStyles = StyleSheet.create({
    container: {
        flex: 1,
    },

    header: {
        ...BaseComponents.headerBase,
    },

    profileButton: {
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.2),
        borderRadius: BorderRadius.xl,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: StyleUtils.withOpacity(Colors.surface, 0.2),
    },

    quickActionCard: {
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        ...StyleUtils.getUniformShadow('medium'),
        marginBottom: Spacing.md,
    },

    activitySection: {
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.95),
        marginHorizontal: Spacing.lg,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
    },
});

// === EMPLOYEE SCREEN ===
export const EmployeeStyles = StyleSheet.create({
    header: {
        ...BaseComponents.headerBase,
    },

    employeeCard: {
        ...BaseComponents.card,
        marginBottom: Spacing.md,
        overflow: 'hidden',
    },

    statusBar: {
        ...BaseComponents.statusBar,
    },

    cardContent: {
        padding: Spacing.lg,
    },

    employeeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },

    avatarSection: {
        position: 'relative',
        marginRight: Spacing.md,
    },

    employeeAvatar: {
        ...BaseComponents.avatar,
        ...BaseComponents.avatarPrimary,
    },

    statusIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.surface,
    },

    employeeName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primary,
        marginBottom: 2,
    },

    communicationActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.divider,
    },
});

// === SERVICE SCREEN ===
export const ServiceStyles = StyleSheet.create({
    header: {
        ...BaseComponents.headerBase,
    },

    serviceCard: {
        ...BaseComponents.card,
        marginBottom: Spacing.md,
        overflow: 'hidden',
    },

    serviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.secondary,
        marginBottom: Spacing.sm,
    },

    managerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },

    managerAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.secondarySoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },

    serviceActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.divider,
    },
});

// === DOCUMENT SCREEN ===
export const DocumentStyles = StyleSheet.create({
    header: {
        ...BaseComponents.headerBase,
    },

    folderCard: {
        ...BaseComponents.card,
        marginBottom: Spacing.md,
    },

    folderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },

    folderIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.primarySoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },

    folderName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 4,
    },

    visibilityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.lg,
        gap: 4,
    },
});

// === FAQ SCREEN ===
export const FAQStyles = StyleSheet.create({
    header: {
        ...BaseComponents.headerBase,
        backgroundColor: '#4A90E2', // Couleur spéciale FAQ
    },

    categoryCard: {
        marginBottom: Spacing.md,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.surface,
        ...StyleUtils.getUniformShadow('medium'),
        overflow: 'hidden',
    },

    categoryGradient: {
        padding: Spacing.lg,
    },

    categoryTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.surface,
        marginBottom: 2,
    },

    questionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
    },

    questionText: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.textPrimary,
        lineHeight: 22,
        flex: 1,
        marginRight: Spacing.md,
    },

    answerContainer: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.lg,
        backgroundColor: Colors.surfaceVariant,
    },

    answerText: {
        fontSize: 15,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
});

// === PROFILE SCREEN ===
export const ProfileStyles = StyleSheet.create({
    header: {
        ...BaseComponents.headerBase,
        paddingBottom: Spacing.xxxl,
    },

    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    avatarContainer: {
        position: 'relative',
        marginRight: Spacing.lg,
    },

    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: Colors.surface,
    },

    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.2),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: Colors.surface,
    },

    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.surface,
        marginBottom: 4,
    },

    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
        borderRadius: BorderRadius.lg,
    },

    infoCard: {
        ...BaseComponents.card,
    },

    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },

    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.surfaceVariant,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },

    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.sm,
        ...StyleUtils.getUniformShadow('low'),
    },
});

// === TEAM SCREEN ===
export const TeamStyles = StyleSheet.create({
    header: {
        ...BaseComponents.headerBase,
    },

    teamCard: {
        ...BaseComponents.card,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },

    teamDetailHeader: {
        padding: Spacing.lg,
        marginBottom: Spacing.md,
    },

    teamIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.2),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },

    teamName: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.surface,
        marginBottom: Spacing.xs,
    },

    statCard: {
        ...BaseComponents.card,
        alignItems: 'center',
        flex: 1,
    },

    memberCard: {
        ...BaseComponents.card,
        marginBottom: Spacing.sm,
    },

    memberAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.primarySoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
});