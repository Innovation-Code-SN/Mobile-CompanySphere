// src/components/orgchart/OrgChartComponent.tsx - AVEC PHOTOS
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    TextInput,
    Modal,
    SafeAreaView,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// 🎨 IMPORTS DE LA CHARTE UNIFORME
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { StyleUtils } from '../../constants/styleUtils';
import { employeeService } from '../../services/employeeService';

// Types pour les nœuds
export interface OrgChartNode {
    id: string;
    name?: string; // Rendu optionnel pour supporter les deux types
    nom?: string; // Pour les services
    prenom?: string; // Pour les employés
    title?: string;
    status?: string;
    statut?: string; // Pour les employés
    photo?: string; // Pour les photos d'employés
    children?: OrgChartNode[];
    [key: string]: any; // Pour permettre des propriétés supplémentaires
}

interface OrgChartProps {
    data: OrgChartNode;
    type: 'employee' | 'service';
    onNodePress?: (node: OrgChartNode) => void;
    highlightedId?: string | null;
}

const { width: screenWidth } = Dimensions.get('window');
const NODE_WIDTH = 220;
const NODE_HEIGHT = 140; // Augmenté pour accommoder la photo
const HORIZONTAL_SPACING = 40;
const VERTICAL_SPACING = 60;

export const OrgChartComponent: React.FC<OrgChartProps> = ({
    data,
    type,
    onNodePress,
    highlightedId
}) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [searchHighlightId, setSearchHighlightId] = useState<string | null>(null);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

    // Fonction pour obtenir l'URL de la photo
    const getPhotoUrl = (photoPath?: string) => {
        return employeeService.getEmployeePhotoUrl(photoPath);
    };

    // Fonction pour obtenir les initiales
    const getInitials = (node: OrgChartNode) => {
        if (type === 'employee') {
            const firstName = node.prenom || '';
            const lastName = node.nom || '';
            return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
        } else {
            const serviceName = node.name || node.nom || '';
            return serviceName.charAt(0).toUpperCase() || 'S';
        }
    };

    // Gérer les erreurs d'image
    const handleImageError = (nodeId: string) => {
        setImageErrors(prev => ({ ...prev, [nodeId]: true }));
    };

    // Calculer la taille du contenu nécessaire et la position de départ
    const calculateTreeDimensions = (node: OrgChartNode, depth = 0): { width: number; height: number; leftOffset: number } => {
        if (!node.children || node.children.length === 0) {
            return { width: NODE_WIDTH, height: NODE_HEIGHT, leftOffset: 0 };
        }

        let totalWidth = 0;
        let maxChildHeight = 0;
        let maxLeftOffset = 0;

        node.children.forEach((child) => {
            const childDimensions = calculateTreeDimensions(child, depth + 1);
            totalWidth += childDimensions.width + HORIZONTAL_SPACING;
            maxChildHeight = Math.max(maxChildHeight, childDimensions.height);
            maxLeftOffset = Math.max(maxLeftOffset, childDimensions.leftOffset);
        });

        totalWidth -= HORIZONTAL_SPACING; // Retirer l'espacement du dernier enfant

        // Calculer le décalage à gauche nécessaire si les enfants sont plus larges que le parent
        const leftOffset = Math.max(0, (totalWidth - NODE_WIDTH) / 2);

        return {
            width: Math.max(NODE_WIDTH, totalWidth),
            height: NODE_HEIGHT + VERTICAL_SPACING + maxChildHeight,
            leftOffset: Math.max(leftOffset, maxLeftOffset)
        };
    };

    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const dimensions = calculateTreeDimensions(data);
        const leftPadding = dimensions.leftOffset + 200; // Ajouter une marge supplémentaire

        setContentSize({
            width: Math.max(screenWidth, dimensions.width + leftPadding * 2),
            height: dimensions.height + 200
        });

        setStartPosition({
            x: leftPadding,
            y: 50
        });

        // Centrer automatiquement le scroll au démarrage
        setTimeout(() => {
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({
                    x: leftPadding - screenWidth / 2 + NODE_WIDTH / 2,
                    y: 0,
                    animated: false
                });
            }
        }, 100);
    }, [data]);

    // Fonction de recherche
    const searchInTree = (node: OrgChartNode, term: string): OrgChartNode | null => {
        const searchLower = term.toLowerCase();

        if (type === 'employee') {
            const fullName = `${node.prenom || ''} ${node.nom || ''}`.toLowerCase();
            if (fullName.includes(searchLower) ||
                node.matricule?.toLowerCase().includes(searchLower)) {
                return node;
            }
        } else {
            // Pour les services, chercher dans name ou nom
            const serviceName = (node.name || node.nom || '').toLowerCase();
            if (serviceName.includes(searchLower)) {
                return node;
            }
        }

        if (node.children) {
            for (const child of node.children) {
                const found = searchInTree(child, term);
                if (found) return found;
            }
        }

        return null;
    };

    // Fonction pour centrer sur un nœud
    const centerOnNode = (nodeId: string) => {
        // Fonction pour trouver la position d'un nœud
        const findNodePosition = (node: OrgChartNode, x: number, y: number, targetId: string, parentPath: string = ''): { x: number; y: number } | null => {
            const nodePath = parentPath ? `${parentPath}-${node.id}` : node.id;

            if (node.id === targetId) {
                return { x, y };
            }

            if (node.children && node.children.length > 0) {
                const childY = y + NODE_HEIGHT + VERTICAL_SPACING;
                let currentX = x;

                // Calculer la largeur totale des enfants
                let totalChildrenWidth = 0;
                node.children.forEach((child, index) => {
                    const childDimensions = calculateTreeDimensions(child);
                    totalChildrenWidth += childDimensions.width;
                    if (index < node.children!.length - 1) {
                        totalChildrenWidth += HORIZONTAL_SPACING;
                    }
                });

                // Centrer les enfants sous le parent
                const startX = x + (NODE_WIDTH - totalChildrenWidth) / 2;
                currentX = startX;

                for (let i = 0; i < node.children.length; i++) {
                    const child = node.children[i];
                    const childDimensions = calculateTreeDimensions(child);
                    const childX = currentX + (childDimensions.width - NODE_WIDTH) / 2;
                    const childPath = `${nodePath}-${i}`;

                    const found = findNodePosition(child, childX, childY, targetId, childPath);
                    if (found) return found;

                    currentX += childDimensions.width + HORIZONTAL_SPACING;
                }
            }

            return null;
        };

        const position = findNodePosition(data, startPosition.x, startPosition.y, nodeId);
        if (position && scrollViewRef.current) {
            const scrollX = position.x - screenWidth / 2 + NODE_WIDTH / 2;
            const scrollY = position.y - 100;

            scrollViewRef.current.scrollTo({
                x: Math.max(0, scrollX),
                y: Math.max(0, scrollY),
                animated: true
            });
        }
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) return;

        const found = searchInTree(data, searchTerm);
        if (found) {
            setSearchHighlightId(found.id);
            setShowSearchModal(false);
            // Centrer sur le nœud trouvé
            setTimeout(() => {
                centerOnNode(found.id);
            }, 100);
        }
    };

    // Rendu d'un nœud avec photo
    const renderNode = (node: OrgChartNode, x: number, y: number, parentPath: string = '') => {
        const isHighlighted = node.id === highlightedId || node.id === searchHighlightId;
        const isRoot = node === data;
        const nodePath = parentPath ? `${parentPath}-${node.id}` : node.id;
        const hasImageError = imageErrors[node.id];

        return (
            <TouchableOpacity
                key={`node-${nodePath}`}
                style={[
                    styles.nodeContainer,
                    { position: 'absolute', left: x, top: y }
                ]}
                onPress={() => onNodePress?.(node)}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={
                        isHighlighted ? [Colors.primary, Colors.primaryDark] :
                            isRoot ? [Colors.secondary, Colors.secondaryDark] :
                                [Colors.surface, Colors.surface]
                    }
                    style={[
                        styles.node,
                        isHighlighted && styles.highlightedNode,
                        isRoot && styles.rootNode
                    ]}
                >
                    {type === 'employee' ? (
                        // Nœud employé avec photo
                        <>
                            {/* Section photo et nom */}
                            <View style={styles.nodeHeader}>
                                <View style={styles.photoContainer}>
                                    {node.photo && !hasImageError && getPhotoUrl(node.photo) ? (
                                        <Image
                                            source={{ uri: getPhotoUrl(node.photo)! }}
                                            style={styles.employeePhoto}
                                            onError={() => handleImageError(node.id)}
                                        />
                                    ) : (
                                        <View style={styles.photoPlaceholder}>
                                            <LinearGradient
                                                colors={
                                                    isHighlighted || isRoot ?
                                                        [Colors.surface, StyleUtils.withOpacity(Colors.surface, 0.8)] :
                                                        [Colors.secondary, Colors.secondaryLight]
                                                }
                                                style={styles.photoGradient}
                                            >
                                                <Text style={[
                                                    styles.photoInitials,
                                                    (isHighlighted || isRoot) && styles.photoInitialsLight
                                                ]}>
                                                    {getInitials(node)}
                                                </Text>
                                            </LinearGradient>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.nameContainer}>
                                    <Text style={[
                                        styles.nodeName,
                                        (isHighlighted || isRoot) && styles.nodeNameLight
                                    ]} numberOfLines={2}>
                                        {node.prenom} {node.nom}
                                    </Text>
                                </View>
                            </View>

                            {/* Détails de l'employé */}
                            <View style={styles.nodeDetails}>
                                <Text style={[
                                    styles.nodeInfo,
                                    (isHighlighted || isRoot) && styles.nodeInfoLight
                                ]}>
                                    <Ionicons name="card-outline" size={10} /> {node.matricule}
                                </Text>
                                <Text style={[
                                    styles.nodeInfo,
                                    (isHighlighted || isRoot) && styles.nodeInfoLight
                                ]} numberOfLines={1}>
                                    <Ionicons name="briefcase-outline" size={10} /> {node.function || 'N/A'}
                                </Text>
                                <Text style={[
                                    styles.nodeInfo,
                                    (isHighlighted || isRoot) && styles.nodeInfoLight
                                ]} numberOfLines={1}>
                                    <Ionicons name="business-outline" size={10} /> {node.service || 'N/A'}
                                </Text>
                            </View>

                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: StyleUtils.getStatusColor(node.statut || 'INACTIF') }
                            ]}>
                                <Text style={styles.statusText}>{node.statut || 'INACTIF'}</Text>
                            </View>
                        </>
                    ) : (
                        // Nœud service (inchangé)
                        <>
                            <Text style={[
                                styles.nodeName,
                                (isHighlighted || isRoot) && styles.nodeNameLight
                            ]}>
                                {node.name || node.nom}
                            </Text>
                            <View style={styles.nodeDetails}>
                                <Text style={[
                                    styles.nodeInfo,
                                    (isHighlighted || isRoot) && styles.nodeInfoLight
                                ]} numberOfLines={2}>
                                    <Ionicons name="person-outline" size={12} /> {node.head || 'Non assigné'}
                                </Text>
                            </View>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: node.status === 'ACTIVE' ? Colors.success : Colors.textMuted }
                            ]}>
                                <Text style={styles.statusText}>{node.status}</Text>
                            </View>
                        </>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    // Rendu de l'arbre avec les connexions (inchangé)
    const renderTree = (node: OrgChartNode, x: number, y: number, parentPath: string = ''): React.ReactNode[] => {
        const elements: React.ReactNode[] = [];
        const nodePath = parentPath ? `${parentPath}-${node.id}` : node.id;

        // Ajouter le nœud actuel
        elements.push(renderNode(node, x, y, parentPath));

        // Calculer et rendre les enfants
        if (node.children && node.children.length > 0) {
            const childY = y + NODE_HEIGHT + VERTICAL_SPACING;
            let currentX = x;

            // Calculer la largeur totale des enfants
            let totalChildrenWidth = 0;
            node.children.forEach((child, index) => {
                const childDimensions = calculateTreeDimensions(child);
                totalChildrenWidth += childDimensions.width;
                if (index < node.children!.length - 1) {
                    totalChildrenWidth += HORIZONTAL_SPACING;
                }
            });

            // Centrer les enfants sous le parent
            const startX = x + (NODE_WIDTH - totalChildrenWidth) / 2;
            currentX = startX;

            node.children.forEach((child, childIndex) => {
                const childDimensions = calculateTreeDimensions(child);
                const childX = currentX + (childDimensions.width - NODE_WIDTH) / 2;
                const childPath = `${nodePath}-${childIndex}`;

                // Ligne de connexion verticale du parent
                elements.push(
                    <View
                        key={`line-${nodePath}-${child.id}-${childIndex}`}
                        style={[
                            styles.connectionLine,
                            {
                                position: 'absolute',
                                left: x + NODE_WIDTH / 2,
                                top: y + NODE_HEIGHT,
                                width: 2,
                                height: VERTICAL_SPACING / 2,
                            }
                        ]}
                    />
                );

                // Ligne horizontale vers l'enfant
                const horizontalLineX = Math.min(x + NODE_WIDTH / 2, childX + NODE_WIDTH / 2);
                const horizontalLineWidth = Math.abs((childX + NODE_WIDTH / 2) - (x + NODE_WIDTH / 2));

                if (horizontalLineWidth > 0) {
                    elements.push(
                        <View
                            key={`hline-${nodePath}-${child.id}-${childIndex}`}
                            style={[
                                styles.connectionLine,
                                {
                                    position: 'absolute',
                                    left: horizontalLineX,
                                    top: y + NODE_HEIGHT + VERTICAL_SPACING / 2,
                                    width: horizontalLineWidth,
                                    height: 2,
                                }
                            ]}
                        />
                    );
                }

                // Ligne verticale vers l'enfant
                elements.push(
                    <View
                        key={`vline2-${nodePath}-${child.id}-${childIndex}`}
                        style={[
                            styles.connectionLine,
                            {
                                position: 'absolute',
                                left: childX + NODE_WIDTH / 2,
                                top: y + NODE_HEIGHT + VERTICAL_SPACING / 2,
                                width: 2,
                                height: VERTICAL_SPACING / 2,
                            }
                        ]}
                    />
                );

                // Rendu récursif des enfants
                elements.push(...renderTree(child, childX, childY, childPath));

                currentX += childDimensions.width + HORIZONTAL_SPACING;
            });
        }

        return elements;
    };

    return (
        <>
            {/* Barre de recherche flottante */}
            <TouchableOpacity
                style={styles.searchButton}
                onPress={() => setShowSearchModal(true)}
            >
                <Ionicons name="search" size={24} color={Colors.surface} />
            </TouchableOpacity>

            {/* Zone de l'organigramme */}
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={true}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={[
                    styles.scrollContent,
                    { width: contentSize.width, height: contentSize.height }
                ]}
                style={styles.scrollView}
                scrollEventThrottle={16}
                directionalLockEnabled={false}
                bounces={true}
                bouncesZoom={true}
            >
                <View style={styles.treeContainer}>
                    {renderTree(data, startPosition.x, startPosition.y)}
                </View>
            </ScrollView>

            {/* Modal de recherche */}
            <Modal
                visible={showSearchModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowSearchModal(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.searchModal}>
                        <View style={styles.searchHeader}>
                            <Text style={styles.searchTitle}>
                                Rechercher {type === 'employee' ? 'un employé' : 'un service'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowSearchModal(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color={Colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchInputContainer}>
                            <Ionicons name="search" size={20} color={Colors.textMuted} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder={type === 'employee' ? 'Nom, prénom ou matricule...' : 'Nom du service...'}
                                placeholderTextColor={Colors.textMuted}
                                value={searchTerm}
                                onChangeText={setSearchTerm}
                                onSubmitEditing={handleSearch}
                                autoFocus
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.searchSubmitButton}
                            onPress={handleSearch}
                        >
                            <Text style={styles.searchSubmitText}>Rechercher</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        minWidth: screenWidth,
    },
    treeContainer: {
        position: 'relative',
    },
    nodeContainer: {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
    },
    node: {
        flex: 1,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        ...StyleUtils.getUniformShadow('medium'),
        justifyContent: 'space-between',
    },
    highlightedNode: {
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    rootNode: {
        borderWidth: 2,
        borderColor: Colors.secondary,
    },

    // 📸 Nouveaux styles pour la photo dans l'organigramme
    nodeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    photoContainer: {
        marginRight: Spacing.sm,
    },
    employeePhoto: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    photoPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    photoGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoInitials: {
        ...Typography.caption,
        color: Colors.surface,
        fontWeight: '700',
        fontSize: 12,
    },
    photoInitialsLight: {
        color: Colors.primary,
    },
    nameContainer: {
        flex: 1,
    },

    nodeName: {
        ...Typography.bodySmall,
        fontWeight: '700',
        color: Colors.textPrimary,
        lineHeight: 16,
    },
    nodeNameLight: {
        color: Colors.surface,
    },
    nodeDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    nodeInfo: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginBottom: 1,
        fontSize: 10,
        lineHeight: 12,
    },
    nodeInfoLight: {
        color: StyleUtils.withOpacity(Colors.surface, 0.9),
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
    },
    statusText: {
        ...Typography.caption,
        color: Colors.surface,
        fontWeight: '600',
        fontSize: 9,
    },
    connectionLine: {
        backgroundColor: Colors.border,
    },
    searchButton: {
        position: 'absolute',
        top: Spacing.lg,
        right: Spacing.lg,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...StyleUtils.getUniformShadow('high'),
        zIndex: 10,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: StyleUtils.withOpacity(Colors.textPrimary, 0.5),
        justifyContent: 'flex-end',
    },
    searchModal: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: BorderRadius.xxl,
        borderTopRightRadius: BorderRadius.xxl,
        padding: Spacing.xl,
        paddingBottom: Spacing.xxxl,
    },
    searchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    searchTitle: {
        ...Typography.h5,
        color: Colors.textPrimary,
    },
    closeButton: {
        padding: Spacing.sm,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        marginBottom: Spacing.xl,
        gap: Spacing.md,
    },
    searchInput: {
        flex: 1,
        ...Typography.body,
        color: Colors.textPrimary,
    },
    searchSubmitButton: {
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        ...StyleUtils.getUniformShadow('medium'),
    },
    searchSubmitText: {
        ...Typography.body,
        color: Colors.surface,
        fontWeight: '600',
    },
});