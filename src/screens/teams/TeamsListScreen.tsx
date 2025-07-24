// src/screens/teams/TeamsListScreen.tsx - VERSION UNIFORME
import React, { useState, useEffect } from 'react';
import {
    View,
    FlatList,
    RefreshControl,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

// 🎨 IMPORTS DE LA CHARTE UNIFORME
import { Colors, Gradients, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { StyleUtils } from '../../constants/styleUtils';

// Services
import { groupeService, Groupe } from '../../services/groupeService';

// Composants
interface TeamCardProps {
    groupe: Groupe;
    onPress: (groupe: Groupe) => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ groupe, onPress }) => {
    const memberCount = groupe.nombreMembres || 0;
    const statusInfo = {
        color: StyleUtils.getStatusColor(groupe.statut),
        label: groupe.statut === 'ACTIF' ? 'Équipe active' : 'Équipe inactive'
    };

    return (
        <TouchableOpacity
            style={styles.teamCard}
            onPress={() => onPress(groupe)}
            activeOpacity={0.7}
        >
            {/* 🎨 BARRE DE STATUT UNIFORME */}
            <View style={[styles.statusBar, { backgroundColor: statusInfo.color }]} />

            <View style={styles.cardContent}>
                {/* 🎨 EN-TÊTE ÉQUIPE UNIFORME */}
                <View style={styles.teamHeader}>
                    <View style={styles.teamIconContainer}>
                        <LinearGradient
                            colors={groupe.couleur ? [groupe.couleur, StyleUtils.withOpacity(groupe.couleur, 0.7)] : [Colors.secondary, Colors.secondaryLight]}
                            style={styles.teamIcon}
                        >
                            <Ionicons name="people" size={24} color={Colors.surface} />
                        </LinearGradient>
                    </View>

                    <View style={styles.teamMainInfo}>
                        <Text style={styles.teamName} numberOfLines={2}>
                            {groupe.nom}
                        </Text>
                        <Text style={styles.teamStatus}>
                            {statusInfo.label}
                        </Text>
                        {groupe.description && (
                            <Text style={styles.teamDescription} numberOfLines={2}>
                                {groupe.description}
                            </Text>
                        )}
                    </View>
                </View>

                {/* 🎨 RESPONSABLE UNIFORME */}
                {(groupe.responsable || groupe.responsableNom) && (
                    <View style={styles.responsableSection}>
                        <View style={styles.responsableAvatar}>
                            <Ionicons name="person" size={16} color={Colors.secondary} />
                        </View>
                        <View style={styles.responsableInfo}>
                            <Text style={styles.responsableLabel}>Responsable:</Text>
                            <Text style={styles.responsableName}>
                                {groupe.responsable ?
                                    `${groupe.responsable.prenom} ${groupe.responsable.nom}` :
                                    groupe.responsableNom || 'Non défini'
                                }
                            </Text>
                            {groupe.responsable?.contact?.email && (
                                <Text style={styles.responsableEmail}>
                                    {groupe.responsable.contact.email}
                                </Text>
                            )}
                        </View>
                    </View>
                )}

                {/* 🎨 MÉTRIQUES ÉQUIPE UNIFORMES */}
                <View style={styles.teamMetrics}>
                    <View style={styles.metricItem}>
                        <View style={[styles.metricIcon, { backgroundColor: Colors.primarySoft }]}>
                            <Ionicons name="people-outline" size={16} color={Colors.primary} />
                        </View>
                        <Text style={styles.metricNumber}>{memberCount}</Text>
                        <Text style={styles.metricLabel}>Membre{memberCount > 1 ? 's' : ''}</Text>
                    </View>

                    <View style={styles.metricDivider} />

                    <View style={styles.metricItem}>
                        <View style={[styles.metricIcon, { backgroundColor: Colors.secondarySoft }]}>
                            <Ionicons name="calendar-outline" size={16} color={Colors.secondary} />
                        </View>
                        <Text style={styles.metricLabel}>Créée le</Text>
                        <Text style={styles.metricDate}>
                            {groupe.dateCreation ?
                                new Date(groupe.dateCreation).toLocaleDateString('fr-FR') :
                                groupe.createdAt ?
                                    new Date(groupe.createdAt).toLocaleDateString('fr-FR') :
                                    'Inconnue'
                            }
                        </Text>
                    </View>
                </View>

                {/* 🎨 ACTIONS RAPIDES UNIFORMES */}
                <View style={styles.teamActions}>
                    {/* Action Email Responsable */}
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            styles.emailButton,
                            !groupe.responsable?.contact?.email && styles.actionButtonDisabled
                        ]}
                        disabled={!groupe.responsable?.contact?.email}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="mail-outline"
                            size={16}
                            color={groupe.responsable?.contact?.email ? Colors.primary : Colors.textMuted}
                        />
                    </TouchableOpacity>

                    {/* Action Voir Détails */}
                    <TouchableOpacity
                        style={[styles.actionButton, styles.viewButton]}
                        onPress={() => onPress(groupe)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="eye-outline" size={16} color={Colors.secondary} />
                    </TouchableOpacity>

                    {/* Indicateur Membres */}
                    <View style={styles.membersIndicator}>
                        <Text style={styles.membersCount}>{memberCount}</Text>
                        <Ionicons name="people" size={14} color={Colors.textMuted} />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const FILTER_OPTIONS = [
    { value: 'TOUS', label: 'Toutes' },
    { value: 'ACTIF', label: 'Actives' },
    { value: 'INACTIF', label: 'Inactives' },
    { value: 'SUSPENDU', label: 'Suspendues' },
];

export default function TeamsListScreen({ navigation }: any) {
    const [groupes, setGroupes] = useState<Groupe[]>([]);
    const [filteredGroupes, setFilteredGroupes] = useState<Groupe[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('TOUS');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadGroupes();
    }, []);

    useEffect(() => {
        filterGroupes();
    }, [groupes, searchQuery, selectedFilter]);

    useFocusEffect(
        React.useCallback(() => {
            loadGroupes();
        }, [])
    );

    const loadGroupes = async () => {
        try {
            setError(null);
            const response = await groupeService.getAll();

            if (response.success) {
                setGroupes(response.data);
            } else {
                setError(response.message || 'Erreur lors du chargement');
            }
        } catch (error) {
            console.error('Erreur lors du chargement des équipes:', error);
            setError('Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadGroupes();
        setRefreshing(false);
    };

    const filterGroupes = () => {
        let filtered = [...groupes];

        if (selectedFilter !== 'TOUS') {
            filtered = filtered.filter(groupe => groupe.statut === selectedFilter);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(groupe =>
                groupe.nom.toLowerCase().includes(query) ||
                groupe.description?.toLowerCase().includes(query) ||
                groupe.responsableNom?.toLowerCase().includes(query)
            );
        }

        setFilteredGroupes(filtered);
    };

    const handleTeamPress = (groupe: Groupe) => {
        navigation.navigate('TeamDetail', {
            teamId: groupe.id,
            teamName: groupe.nom
        });
    };

    const renderFilterChip = (option: { value: string; label: string }) => (
        <TouchableOpacity
            key={option.value}
            style={[
                styles.filterChip,
                selectedFilter === option.value && styles.filterChipActive
            ]}
            onPress={() => setSelectedFilter(option.value)}
            activeOpacity={0.7}
        >
            <Text style={[
                styles.filterChipText,
                selectedFilter === option.value && styles.filterChipTextActive
            ]}>
                {option.label}
            </Text>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
                <Ionicons name="people-outline" size={64} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyStateText}>
                {error ? "Erreur de chargement" :
                    searchQuery ? 'Aucune équipe trouvée' :
                        'Aucune équipe disponible'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
                {error || (searchQuery ?
                    'Aucune équipe ne correspond à votre recherche' :
                    'Les équipes apparaîtront ici')}
            </Text>
            {error && (
                <TouchableOpacity style={styles.retryButton} onPress={loadGroupes}>
                    <Text style={styles.retryButtonText}>Réessayer</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Chargement des équipes...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* 🎨 EN-TÊTE AVEC GRADIENT ORANGE (selon la charte) */}
            <LinearGradient
                colors={Gradients.secondary}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Équipes</Text>

                {/* 🎨 STATS RAPIDES UNIFORMES */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{filteredGroupes.length}</Text>
                        <Text style={styles.statLabel}>Équipe{filteredGroupes.length > 1 ? 's' : ''}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>
                            {filteredGroupes.reduce((total, groupe) => total + (groupe.membres?.length || 0), 0)}
                        </Text>
                        <Text style={styles.statLabel}>Membres total</Text>
                    </View>
                </View>

                {/* 🎨 BARRE DE RECHERCHE UNIFORME */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={Colors.surface} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher une équipe..."
                        placeholderTextColor={StyleUtils.withOpacity(Colors.surface, 0.7)}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
                            <Ionicons name="close-circle" size={20} color={Colors.surface} />
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            {/* 🎨 FILTRES UNIFORMES */}
            <View style={styles.filtersContainer}>
                <View style={styles.filtersScrollView}>
                    {FILTER_OPTIONS.map(renderFilterChip)}
                </View>
            </View>

            {/* 🎨 LISTE DES ÉQUIPES UNIFORME */}
            <FlatList
                data={filteredGroupes}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <TeamCard
                        groupe={item}
                        onPress={handleTeamPress}
                    />
                )}
                contentContainerStyle={[
                    styles.listContent,
                    filteredGroupes.length === 0 && styles.listContentEmpty
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.secondary]}
                    />
                }
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

// =============================================================================
// 🎨 STYLES AVEC CHARTE GRAPHIQUE UNIFORME
// =============================================================================

const styles = StyleSheet.create({
    // Container principal
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    loadingText: {
        ...Typography.body,
        color: Colors.textMuted,
    },

    // 🎨 HEADER UNIFORME (gradient orange)
    header: {
        paddingTop: 10,
        paddingBottom: Spacing.lg,
        paddingHorizontal: Spacing.lg,
    },

    headerTitle: {
        ...Typography.h3,
        color: Colors.surface,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },

    // 🎨 STATS RAPIDES UNIFORMES
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.15),
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md,
        marginBottom: Spacing.lg,
    },

    statItem: {
        alignItems: 'center',
        flex: 1,
    },

    statNumber: {
        ...Typography.h4,
        color: Colors.surface,
        fontWeight: '700',
    },

    statLabel: {
        ...Typography.caption,
        color: StyleUtils.withOpacity(Colors.surface, 0.8),
        marginTop: 2,
    },

    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.3),
    },

    // 🎨 BARRE DE RECHERCHE UNIFORME
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.2),
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        paddingVertical: 10,
    },

    searchIcon: {
        marginRight: Spacing.md,
    },

    searchInput: {
        flex: 1,
        color: Colors.surface,
        ...Typography.body,
    },

    clearIcon: {
        padding: 4,
    },

    // 🎨 FILTRES UNIFORMES
    filtersContainer: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },

    filtersScrollView: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },

    filterChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.round,
        backgroundColor: Colors.surfaceVariant,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    filterChipActive: {
        backgroundColor: Colors.secondary,
        borderColor: Colors.secondary,
    },

    filterChipText: {
        ...Typography.caption,
        color: Colors.textPrimary,
        fontWeight: '500',
    },

    filterChipTextActive: {
        color: Colors.surface,
        fontWeight: '600',
    },

    // Liste
    listContent: {
        padding: Spacing.lg,
        gap: Spacing.md,
    },

    listContentEmpty: {
        flex: 1,
    },

    // 🎨 CARTE ÉQUIPE UNIFORME
    teamCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...StyleUtils.getUniformShadow('low'),
        borderLeftWidth: 4,
        borderLeftColor: Colors.secondary,
    },

    // 🎨 BARRE DE STATUT UNIFORME
    statusBar: {
        height: 4,
        width: '100%',
    },

    cardContent: {
        padding: Spacing.lg,
    },

    // 🎨 EN-TÊTE ÉQUIPE UNIFORME
    teamHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
    },

    teamIconContainer: {
        marginRight: Spacing.md,
    },

    teamIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },

    teamMainInfo: {
        flex: 1,
    },

    // 🎨 NOM ÉQUIPE UNIFORME
    teamName: {
        ...Typography.body,
        fontWeight: '600',
        color: Colors.secondary,
        marginBottom: 2,
    },

    teamStatus: {
        ...Typography.caption,
        color: Colors.textMuted,
        marginBottom: Spacing.xs,
    },

    teamDescription: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        lineHeight: 18,
    },

    // 🎨 RESPONSABLE UNIFORME
    responsableSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceVariant,
        borderRadius: BorderRadius.sm,
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },

    responsableAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.secondarySoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },

    responsableInfo: {
        flex: 1,
    },

    responsableLabel: {
        ...Typography.caption,
        color: Colors.textMuted,
    },

    responsableName: {
        ...Typography.bodySmall,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginTop: 2,
    },

    responsableEmail: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginTop: 2,
    },

    // 🎨 MÉTRIQUES UNIFORMES
    teamMetrics: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceVariant,
        borderRadius: BorderRadius.sm,
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },

    metricItem: {
        flex: 1,
        alignItems: 'center',
    },

    metricIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },

    metricNumber: {
        ...Typography.h6,
        color: Colors.textPrimary,
        fontWeight: '700',
    },

    metricLabel: {
        ...Typography.caption,
        color: Colors.textMuted,
        textAlign: 'center',
    },

    metricDate: {
        ...Typography.caption,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 2,
    },

    metricDivider: {
        width: 1,
        height: 40,
        backgroundColor: Colors.border,
        marginHorizontal: Spacing.md,
    },

    // 🎨 ACTIONS UNIFORMES
    teamActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.divider,
    },

    actionButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        ...StyleUtils.getUniformShadow('low'),
    },

    actionButtonDisabled: {
        opacity: 0.3,
    },

    emailButton: {
        backgroundColor: Colors.primarySoft,
    },

    viewButton: {
        backgroundColor: Colors.secondarySoft,
    },

    membersIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceVariant,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
        gap: Spacing.xs,
    },

    membersCount: {
        ...Typography.caption,
        color: Colors.textPrimary,
        fontWeight: '600',
    },

    // 🎨 EMPTY STATE UNIFORME
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
    },

    emptyStateIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.surfaceVariant,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },

    emptyStateText: {
        ...Typography.h6,
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },

    emptyStateSubtext: {
        ...Typography.body,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.lg,
    },

    retryButton: {
        backgroundColor: Colors.secondary,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
    },

    retryButtonText: {
        ...Typography.bodySmall,
        color: Colors.surface,
        fontWeight: '600',
    },
});
