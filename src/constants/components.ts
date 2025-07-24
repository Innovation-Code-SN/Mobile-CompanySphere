// src/constants/components.ts
// Styles de composants réutilisables
import { StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from './theme';
import { StyleUtils } from './styleUtils';

// =============================================================================
// COMPOSANTS DE BASE
// =============================================================================

export const BaseComponents = StyleSheet.create({
  // === CARTES ===
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...StyleUtils.getUniformShadow('low'),
  },
  
  cardElevated: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...StyleUtils.getUniformShadow('medium'),
  },

  // === CONTENEURS ===
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  screenPadding: {
    paddingHorizontal: Spacing.lg,
  },

  // === HEADERS ===
  headerBase: {
    paddingTop: 50,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.surface,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },

  // === BOUTONS ===
  buttonBase: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...StyleUtils.getUniformShadow('medium'),
  },
  
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  
  buttonSecondary: {
    backgroundColor: Colors.secondary,
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },

  // === INPUTS ===
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surfaceVariant,
    marginBottom: Spacing.lg,
  },
  
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.textPrimary,
  },

  // === ACTIONS ===
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...StyleUtils.getUniformShadow('low'),
  },
  
  actionEmail: {
    backgroundColor: Colors.primarySoft,
  },
  
  actionPhone: {
    backgroundColor: '#E8F5E8',
  },
  
  actionView: {
    backgroundColor: Colors.secondarySoft,
  },

  // === AVATARS ===
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  avatarPrimary: {
    backgroundColor: Colors.primarySoft,
  },
  
  avatarSecondary: {
    backgroundColor: Colors.secondarySoft,
  },

  // === BADGES ===
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.round,
    alignSelf: 'flex-start',
  },
  
  badgeSuccess: {
    backgroundColor: Colors.success,
  },
  
  badgeWarning: {
    backgroundColor: Colors.warning,
  },
  
  badgeError: {
    backgroundColor: Colors.error,
  },

  // === SÉPARATEURS ===
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.md,
  },
  
  statusBar: {
    height: 4,
    width: '100%',
  },

  // === RECHERCHE ===
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.2),
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  
  searchInput: {
    flex: 1,
    color: Colors.surface,
    fontSize: 16,
  },

  // === EMPTY STATES ===
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  
  emptyStateText: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
});