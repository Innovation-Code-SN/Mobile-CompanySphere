// DocumentsScreen.tsx - VERSION UNIFORME
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    Alert,
    Share,
    Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// 🎨 IMPORTS DE LA CHARTE UNIFORME
import { Colors, Gradients, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { StyleUtils } from '../../constants/styleUtils';

// Services
import { documentService, Folder, Document } from '../../services/documentService';
import FolderDetailScreen from './FolderDetailScreen';

// 🔧 Extension de l'interface Folder pour les propriétés manquantes
interface ExtendedFolder extends Folder {
    description?: string;
    updatedAt?: string;
}

interface FolderCardProps {
    folder: ExtendedFolder;
    onPress: (folder: ExtendedFolder) => void;
}

const FolderCard: React.FC<FolderCardProps> = ({ folder, onPress }) => {
    const getVisibilityInfo = () => {
        switch (folder.visibilite) {
            case 'PUBLIC':
                return {
                    icon: 'globe-outline',
                    color: Colors.success,
                    label: 'Public'
                };
            case 'SERVICES_SPECIFIQUES':
                return {
                    icon: 'people-outline',
                    color: Colors.primary,
                    label: 'Services spécifiques'
                };
            case 'MANAGERS_SERVICES':
                return {
                    icon: 'shield-outline',
                    color: Colors.warning,
                    label: 'Managers seulement'
                };
            default:
                return {
                    icon: 'globe-outline',
                    color: Colors.success,
                    label: 'Public'
                };
        }
    };

    const visibilityInfo = getVisibilityInfo();
    const documentCount = folder.documents?.length || 0;
    const subFolderCount = folder.sousDossiers?.length || 0;

    return (
        <TouchableOpacity
            style={styles.folderCard}
            onPress={() => onPress(folder)}
            activeOpacity={0.7}
        >
            {/* 🎨 EN-TÊTE DOSSIER UNIFORME */}
            <View style={styles.folderHeader}>
                <View style={styles.folderIconContainer}>
                    <Ionicons name="folder" size={32} color={Colors.primary} />
                </View>
                <View style={styles.folderInfo}>
                    <Text style={styles.folderName} numberOfLines={2}>
                        {folder.nom}
                    </Text>
                    <View style={styles.folderStats}>
                        <View style={styles.statItem}>
                            <Ionicons name="document-outline" size={14} color={Colors.textMuted} />
                            <Text style={styles.folderStatsText}>
                                {documentCount} doc{documentCount > 1 ? 's' : ''}
                            </Text>
                        </View>
                        {subFolderCount > 0 && (
                            <View style={styles.statItem}>
                                <Ionicons name="folder-outline" size={14} color={Colors.textMuted} />
                                <Text style={styles.folderStatsText}>
                                    {subFolderCount} dossier{subFolderCount > 1 ? 's' : ''}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* 🎨 INDICATEUR DE VISIBILITÉ UNIFORME */}
            <View style={styles.visibilityContainer}>
                <View style={[
                    styles.visibilityBadge,
                    { backgroundColor: StyleUtils.withOpacity(visibilityInfo.color, 0.15) }
                ]}>
                    <Ionicons name={visibilityInfo.icon as any} size={14} color={visibilityInfo.color} />
                    <Text style={[styles.visibilityText, { color: visibilityInfo.color }]}>
                        {visibilityInfo.label}
                    </Text>
                </View>
            </View>

            {/* 🎨 ACTIONS RAPIDES */}
            <View style={styles.folderActions}>
                <TouchableOpacity style={styles.quickActionButton}>
                    <Ionicons name="eye-outline" size={16} color={Colors.primary} />
                    <Text style={styles.quickActionText}>Ouvrir</Text>
                </TouchableOpacity>

                <View style={styles.folderMetrics}>
                    <Text style={styles.metricsText}>
                        Dernière modification: {folder.updatedAt ?
                            new Date(folder.updatedAt).toLocaleDateString('fr-FR') :
                            folder.createdAt ?
                                new Date(folder.createdAt).toLocaleDateString('fr-FR') :
                                'Inconnue'
                        }
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const DocumentsScreen: React.FC = () => {
    const [folders, setFolders] = useState<ExtendedFolder[]>([]);
    const [filteredFolders, setFilteredFolders] = useState<ExtendedFolder[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<ExtendedFolder | null>(null);
    const [showFolderDetail, setShowFolderDetail] = useState(false);

    const loadFolders = async () => {
        try {
            const response = await documentService.getAllFolders();
            if (response.success) {
                // Filtrer pour ne montrer que les dossiers racine (sans parent)
                const rootFolders = response.data.filter(folder => !folder.parent) as ExtendedFolder[];
                setFolders(rootFolders);
                setFilteredFolders(rootFolders);
            } else {
                Alert.alert('Erreur', response.message || 'Impossible de charger les dossiers');
            }
        } catch (error: any) {
            Alert.alert('Erreur', error.message || 'Erreur lors du chargement des dossiers');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const filterFolders = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredFolders(folders);
        } else {
            const filtered = folders.filter(folder =>
                folder.nom.toLowerCase().includes(query.toLowerCase()) ||
                folder.description?.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredFolders(filtered);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadFolders();
    };

    const handleFolderPress = (folder: ExtendedFolder) => {
        setSelectedFolder(folder);
        setShowFolderDetail(true);
    };

    useFocusEffect(
        React.useCallback(() => {
            loadFolders();
        }, [])
    );

    return (
        <View style={styles.container}>
            {/* 🎨 EN-TÊTE AVEC GRADIENT BLEU (selon la charte) */}
            <LinearGradient
                colors={Gradients.primary}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Documents</Text>

                {/* 🎨 BARRE DE RECHERCHE UNIFORME */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={Colors.surface} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher un dossier..."
                        placeholderTextColor={StyleUtils.withOpacity(Colors.surface, 0.7)}
                        value={searchQuery}
                        onChangeText={filterFolders}
                    />
                </View>

                {/* 🎨 STATS RAPIDES */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Ionicons name="folder" size={20} color={Colors.surface} />
                        <Text style={styles.statNumber}>{filteredFolders.length}</Text>
                        <Text style={styles.statLabel}>Dossiers</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="document" size={20} color={Colors.surface} />
                        <Text style={styles.statNumber}>
                            {filteredFolders.reduce((total, folder) => total + (folder.documents?.length || 0), 0)}
                        </Text>
                        <Text style={styles.statLabel}>Documents</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* 🎨 LISTE DES DOSSIERS UNIFORME */}
            <ScrollView
                style={styles.foldersList}
                contentContainerStyle={styles.foldersContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {filteredFolders.map((folder) => (
                    <FolderCard
                        key={folder.id}
                        folder={folder}
                        onPress={handleFolderPress}
                    />
                ))}

                {filteredFolders.length === 0 && !isLoading && (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyStateIcon}>
                            <Ionicons name="folder-outline" size={64} color={Colors.textMuted} />
                        </View>
                        <Text style={styles.emptyStateText}>
                            {searchQuery ? 'Aucun dossier trouvé' : 'Aucun dossier disponible'}
                        </Text>
                        <Text style={styles.emptyStateSubtext}>
                            {searchQuery ? 'Essayez avec d\'autres mots-clés' : 'Les dossiers apparaîtront ici'}
                        </Text>
                        {searchQuery && (
                            <TouchableOpacity
                                style={styles.clearSearchButton}
                                onPress={() => filterFolders('')}
                            >
                                <Text style={styles.clearSearchText}>Effacer la recherche</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Modal de détails du dossier */}
            <FolderDetailScreen
                visible={showFolderDetail}
                folder={selectedFolder}
                onClose={() => {
                    setShowFolderDetail(false);
                    setSelectedFolder(null);
                }}
                onRefresh={loadFolders}
            />
        </View>
    );
};

// =============================================================================
// 🎨 STYLES AVEC CHARTE GRAPHIQUE UNIFORME
// =============================================================================

const styles = StyleSheet.create({
    // Container principal
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    // 🎨 HEADER UNIFORME (gradient bleu)
    header: {
        paddingTop: 50,
        paddingBottom: Spacing.lg,
        paddingHorizontal: Spacing.lg,
    },

    headerTitle: {
        ...Typography.h3,
        color: Colors.surface,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },

    // 🎨 BARRE DE RECHERCHE UNIFORME
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.2),
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        paddingVertical: 10,
        marginBottom: Spacing.lg,
    },

    searchIcon: {
        marginRight: Spacing.md,
    },

    searchInput: {
        flex: 1,
        color: Colors.surface,
        ...Typography.body,
    },

    // 🎨 STATS RAPIDES UNIFORMES
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: Spacing.md,
    },

    statCard: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.15),
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.sm,
    },

    statNumber: {
        ...Typography.h4,
        color: Colors.surface,
        fontWeight: '700',
        marginTop: Spacing.xs,
    },

    statLabel: {
        ...Typography.caption,
        color: StyleUtils.withOpacity(Colors.surface, 0.8),
        marginTop: 2,
    },

    // Liste des dossiers
    foldersList: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    foldersContent: {
        padding: Spacing.lg,
        gap: Spacing.md,
    },

    // 🎨 CARTE DOSSIER UNIFORME
    folderCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        ...StyleUtils.getUniformShadow('low'),
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },

    // 🎨 EN-TÊTE DOSSIER UNIFORME
    folderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },

    folderIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.primarySoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },

    folderInfo: {
        flex: 1,
    },

    // 🎨 NOM DOSSIER UNIFORME
    folderName: {
        ...Typography.body,
        fontWeight: '600',
        color: Colors.primary,
        marginBottom: Spacing.xs,
    },

    // 🎨 STATS DOSSIER UNIFORMES
    folderStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },

    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },

    folderStatsText: {
        ...Typography.caption,
        color: Colors.textMuted,
    },

    // 🎨 INDICATEUR DE VISIBILITÉ UNIFORME
    visibilityContainer: {
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
    },

    visibilityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.lg,
        gap: Spacing.xs,
    },

    visibilityText: {
        ...Typography.caption,
        fontWeight: '600',
    },

    // 🎨 ACTIONS DOSSIER UNIFORMES
    folderActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.divider,
    },

    quickActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primarySoft,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        gap: Spacing.xs,
    },

    quickActionText: {
        ...Typography.caption,
        color: Colors.primary,
        fontWeight: '600',
    },

    folderMetrics: {
        flex: 1,
        alignItems: 'flex-end',
    },

    metricsText: {
        ...Typography.caption,
        color: Colors.textMuted,
        fontStyle: 'italic',
    },

    // 🎨 EMPTY STATE UNIFORME
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
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
        ...Typography.body,
        color: Colors.textMuted,
        marginBottom: Spacing.sm,
        textAlign: 'center',
        fontWeight: '600',
    },

    emptyStateSubtext: {
        ...Typography.bodySmall,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: Spacing.lg,
    },

    clearSearchButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
    },

    clearSearchText: {
        ...Typography.bodySmall,
        color: Colors.surface,
        fontWeight: '600',
    },
});

export default DocumentsScreen;

