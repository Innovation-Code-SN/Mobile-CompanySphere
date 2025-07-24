// ServicesScreen.tsx - VERSION AVEC ORGANIGRAMME
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
    Linking,
    ActionSheetIOS,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// 🎨 IMPORTS DE LA CHARTE UNIFORME
import { Colors, Gradients, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { StyleUtils } from '../../constants/styleUtils';

// Services
import { serviceService, Service } from '../../services/serviceService';
import ServiceDetailScreen from './ServiceDetailScreen';

// 🆕 Import du composant organigramme
import { OrgChartComponent, OrgChartNode } from '../../components/orgchart/OrgChartComponent';

interface ServiceCardProps {
    service: any;
    onViewDetails: (service: any) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onViewDetails }) => {
    const handleManagerEmail = async () => {
        if (!service.manager?.contact?.email) {
            Alert.alert('Information', 'Aucun email disponible pour le manager');
            return;
        }

        const url = `mailto:${service.manager.contact.email}`;

        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application mail');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Erreur lors de l\'ouverture de l\'email');
        }
    };

    const handleManagerPhone = () => {
        const manager = service.manager;
        if (!manager?.contact?.telephoneMobile && !manager?.contact?.telephoneInterne) {
            Alert.alert('Information', 'Aucun numéro disponible pour le manager');
            return;
        }

        const phoneOptions = [];

        if (manager.contact?.telephoneMobile) {
            phoneOptions.push({
                title: `Personnel: ${manager.contact.telephoneMobile}`,
                number: manager.contact.telephoneMobile
            });
        }

        if (manager.contact?.telephoneInterne) {
            phoneOptions.push({
                title: `Professionnel: ${manager.contact.telephoneInterne}`,
                number: manager.contact.telephoneInterne
            });
        }

        if (phoneOptions.length === 1) {
            makePhoneCall(phoneOptions[0].number);
        } else {
            showPhoneSelectionDialog(phoneOptions);
        }
    };

    const makePhoneCall = async (phoneNumber: string) => {
        const url = `tel:${phoneNumber}`;

        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Erreur', 'Impossible de passer l\'appel');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Erreur lors de l\'appel');
        }
    };

    const showPhoneSelectionDialog = (phoneOptions: any[]) => {
        if (Platform.OS === 'ios') {
            const options = phoneOptions.map(option => option.title);
            options.push('Annuler');

            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options,
                    cancelButtonIndex: options.length - 1,
                    title: 'Choisir le numéro à appeler'
                },
                (buttonIndex) => {
                    if (buttonIndex < phoneOptions.length) {
                        makePhoneCall(phoneOptions[buttonIndex].number);
                    }
                }
            );
        } else {
            const buttons: any[] = phoneOptions.map(option => ({
                text: option.title,
                onPress: () => makePhoneCall(option.number)
            }));

            buttons.push({
                text: 'Annuler',
                style: 'cancel'
            });

            Alert.alert(
                'Choisir le numéro',
                'Quel numéro voulez-vous appeler ?',
                buttons
            );
        }
    };

    return (
        <TouchableOpacity style={styles.serviceCard} activeOpacity={0.7}>
            {/* 🎨 BARRE DE STATUT UNIFORME */}
            <View style={[
                styles.statusBar,
                { backgroundColor: StyleUtils.getStatusColor(service.status) }
            ]} />

            <View style={styles.cardContent}>
                {/* 🎨 EN-TÊTE SERVICE UNIFORME */}
                <View style={styles.serviceHeader}>
                    <View style={styles.serviceIconContainer}>
                        <Ionicons name="business" size={24} color={Colors.secondary} />
                    </View>
                    <View style={styles.serviceMainInfo}>
                        <Text style={styles.serviceName}>{service.nom}</Text>
                        <Text style={styles.serviceStatus}>
                            {service.status === 'ACTIVE' ? 'Service actif' : 'Service inactif'}
                        </Text>
                    </View>
                </View>

                {/* 🎨 SECTION MANAGER UNIFORME */}
                {service.manager && (
                    <View style={styles.managerSection}>
                        <View style={styles.managerAvatar}>
                            <Ionicons name="person" size={16} color={Colors.secondary} />
                        </View>
                        <View style={styles.managerInfo}>
                            <Text style={styles.managerName}>
                                Manager: {service.manager.prenom} {service.manager.nom}
                            </Text>
                            {service.manager.contact?.email && (
                                <Text style={styles.managerEmail}>
                                    {service.manager.contact.email}
                                </Text>
                            )}
                        </View>
                    </View>
                )}

                {/* Description du service */}
                {service.description && (
                    <Text style={styles.serviceDescription} numberOfLines={2}>
                        {service.description}
                    </Text>
                )}

                {/* 🎨 ACTIONS DE COMMUNICATION UNIFORMES */}
                <View style={styles.serviceActions}>
                    {/* Email du manager */}
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            styles.emailButton,
                            !service.manager?.contact?.email && styles.actionButtonDisabled
                        ]}
                        onPress={handleManagerEmail}
                        disabled={!service.manager?.contact?.email}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="mail-outline"
                            size={18}
                            color={service.manager?.contact?.email ? Colors.primary : Colors.textMuted}
                        />
                    </TouchableOpacity>

                    {/* Téléphone du manager */}
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            styles.phoneButton,
                            !service.manager?.contact?.telephoneMobile && !service.manager?.contact?.telephoneInterne && styles.actionButtonDisabled
                        ]}
                        onPress={handleManagerPhone}
                        disabled={!service.manager?.contact?.telephoneMobile && !service.manager?.contact?.telephoneInterne}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="call-outline"
                            size={18}
                            color={service.manager?.contact?.telephoneMobile || service.manager?.contact?.telephoneInterne ? Colors.success : Colors.textMuted}
                        />
                    </TouchableOpacity>

                    {/* Voir détails du service */}
                    <TouchableOpacity
                        style={[styles.actionButton, styles.viewDetailsButton]}
                        onPress={() => onViewDetails(service)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="eye-outline" size={18} color={Colors.secondary} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const ServicesScreen: React.FC = () => {
    const [services, setServices] = useState<any[]>([]);
    const [filteredServices, setFilteredServices] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [showServiceDetailModal, setShowServiceDetailModal] = useState(false);

    // 🆕 États pour l'organigramme
    const [viewMode, setViewMode] = useState<'list' | 'orgchart'>('list');
    const [orgChartData, setOrgChartData] = useState<OrgChartNode | null>(null);
    const [isLoadingOrgChart, setIsLoadingOrgChart] = useState(false);

    const loadServices = async () => {
        try {
            const response = await serviceService.getAll();
            if (response.success) {
                setServices(response.data);
                setFilteredServices(response.data);
            } else {
                Alert.alert('Erreur', response.message || 'Impossible de charger les services');
            }
        } catch (error: any) {
            Alert.alert('Erreur', error.message || 'Impossible de charger les services');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    // 🆕 Fonction pour transformer les données en format organigramme
    const transformToOrgChart = (servicesData: Service[]): OrgChartNode | null => {
        // Trouver le service racine (sans parent)
        const rootService = servicesData.find(service => !service.serviceParent);

        if (!rootService) return null;

        // Fonction récursive pour construire l'arbre
        const buildNode = (service: Service): OrgChartNode => {
            const children = servicesData.filter(s =>
                s.serviceParent && s.serviceParent.id === service.id
            );

            return {
                id: service.id,
                name: service.nom,
                nom: service.nom,
                description: service.description,
                status: service.status,
                head: service.manager ?
                    `${service.manager.prenom} ${service.manager.nom}` :
                    'Non assigné',
                children: children.map(child => buildNode(child))
            };
        };

        return buildNode(rootService);
    };

    // 🆕 Fonction pour charger et transformer l'organigramme
    const loadOrgChart = async () => {
        try {
            setIsLoadingOrgChart(true);

            // Utiliser les services déjà chargés
            if (services.length > 0) {
                const orgData = transformToOrgChart(services);
                if (orgData) {
                    setOrgChartData(orgData);
                } else {
                    Alert.alert('Information', 'Aucune structure hiérarchique trouvée');
                }
            } else {
                // Si les services ne sont pas encore chargés
                const response = await serviceService.getAll();
                if (response.success) {
                    const orgData = transformToOrgChart(response.data);
                    if (orgData) {
                        setOrgChartData(orgData);
                        setServices(response.data);
                        setFilteredServices(response.data);
                    }
                }
            }
        } catch (error: any) {
            console.error('Erreur chargement organigramme:', error);
            Alert.alert('Erreur', 'Impossible de charger l\'organigramme');
        } finally {
            setIsLoadingOrgChart(false);
        }
    };

    const filterServices = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredServices(services);
        } else {
            const filtered = services.filter(service =>
                service.nom.toLowerCase().includes(query.toLowerCase()) ||
                service.description?.toLowerCase().includes(query.toLowerCase()) ||
                `${service.manager?.prenom} ${service.manager?.nom}`.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredServices(filtered);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        if (viewMode === 'list') {
            loadServices();
        } else {
            loadServices().then(() => {
                loadOrgChart();
            });
        }
    };

    const handleViewDetails = (service: any) => {
        setSelectedService(service);
        setShowServiceDetailModal(true);
    };

    // 🆕 Gestion du changement de vue
    const handleViewModeChange = (mode: 'list' | 'orgchart') => {
        setViewMode(mode);
        if (mode === 'orgchart' && !orgChartData) {
            loadOrgChart();
        }
    };

    // 🆕 Gestion du clic sur un nœud de l'organigramme
    const handleOrgChartNodePress = (node: OrgChartNode) => {
        // Trouver le service correspondant dans la liste
        const service = services.find(s => s.id === node.id);
        if (service) {
            handleViewDetails(service);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadServices();
        }, [])
    );

    return (
        <View style={styles.container}>
            {/* 🎨 EN-TÊTE AVEC GRADIENT ORANGE (selon la charte) */}
            <LinearGradient
                colors={Gradients.secondary}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Services</Text>

                {/* 🆕 Sélecteur de vue */}
                <View style={styles.viewModeSelector}>
                    <TouchableOpacity
                        style={[
                            styles.viewModeButton,
                            viewMode === 'list' && styles.viewModeButtonActive
                        ]}
                        onPress={() => handleViewModeChange('list')}
                    >
                        <Ionicons
                            name="list"
                            size={20}
                            color={viewMode === 'list' ? Colors.secondary : Colors.surface}
                        />
                        <Text style={[
                            styles.viewModeText,
                            viewMode === 'list' && styles.viewModeTextActive
                        ]}>
                            Liste
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.viewModeButton,
                            viewMode === 'orgchart' && styles.viewModeButtonActive
                        ]}
                        onPress={() => handleViewModeChange('orgchart')}
                    >
                        <Ionicons
                            name="git-network"
                            size={20}
                            color={viewMode === 'orgchart' ? Colors.secondary : Colors.surface}
                        />
                        <Text style={[
                            styles.viewModeText,
                            viewMode === 'orgchart' && styles.viewModeTextActive
                        ]}>
                            Organigramme
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* 🎨 BARRE DE RECHERCHE UNIFORME (visible uniquement en mode liste) */}
                {viewMode === 'list' && (
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color={Colors.surface} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Rechercher un service..."
                            placeholderTextColor={StyleUtils.withOpacity(Colors.surface, 0.7)}
                            value={searchQuery}
                            onChangeText={filterServices}
                        />
                    </View>
                )}
            </LinearGradient>

            {/* 🆕 Contenu selon le mode de vue */}
            {viewMode === 'list' ? (
                // Mode liste classique
                <ScrollView
                    style={styles.servicesList}
                    contentContainerStyle={styles.servicesContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    {filteredServices.map((service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            onViewDetails={handleViewDetails}
                        />
                    ))}

                    {filteredServices.length === 0 && !isLoading && (
                        <View style={styles.emptyState}>
                            <Ionicons name="business-outline" size={64} color={Colors.textMuted} />
                            <Text style={styles.emptyStateText}>
                                {searchQuery ? 'Aucun service trouvé' : 'Aucun service disponible'}
                            </Text>
                            <Text style={styles.emptyStateSubtext}>
                                {searchQuery ? 'Essayez avec d\'autres mots-clés' : 'Les services apparaîtront ici'}
                            </Text>
                        </View>
                    )}
                </ScrollView>
            ) : (
                // Mode organigramme
                <View style={styles.orgChartContainer}>
                    {isLoadingOrgChart ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Chargement de l'organigramme...</Text>
                        </View>
                    ) : orgChartData ? (
                        <OrgChartComponent
                            data={orgChartData}
                            type="service"
                            onNodePress={handleOrgChartNodePress}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="git-network-outline" size={64} color={Colors.textMuted} />
                            <Text style={styles.emptyStateText}>
                                Aucun organigramme disponible
                            </Text>
                            <TouchableOpacity
                                style={styles.retryButton}
                                onPress={loadOrgChart}
                            >
                                <Text style={styles.retryButtonText}>Réessayer</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            {/* Modal de détails de service */}
            <ServiceDetailScreen
                visible={showServiceDetailModal}
                service={selectedService}
                onClose={() => {
                    setShowServiceDetailModal(false);
                    setSelectedService(null);
                }}
                onRefresh={loadServices}
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

    // 🎨 HEADER UNIFORME (gradient orange)
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

    // 🆕 Sélecteur de mode de vue
    viewModeSelector: {
        flexDirection: 'row',
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.2),
        borderRadius: BorderRadius.lg,
        padding: 4,
        marginBottom: Spacing.lg,
    },

    viewModeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
    },

    viewModeButtonActive: {
        backgroundColor: Colors.surface,
    },

    viewModeText: {
        ...Typography.bodySmall,
        color: Colors.surface,
        fontWeight: '600',
    },

    viewModeTextActive: {
        color: Colors.secondary,
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

    // Liste des services
    servicesList: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    servicesContent: {
        padding: Spacing.lg,
        gap: Spacing.md,
    },

    // 🎨 CARTE SERVICE UNIFORME
    serviceCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...StyleUtils.getUniformShadow('low'),
    },

    // 🎨 BARRE DE STATUT UNIFORME
    statusBar: {
        height: 4,
        width: '100%',
    },

    cardContent: {
        padding: Spacing.lg,
    },

    // 🎨 EN-TÊTE SERVICE UNIFORME
    serviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },

    serviceIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.secondarySoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },

    serviceMainInfo: {
        flex: 1,
    },

    // 🎨 NOM SERVICE UNIFORME
    serviceName: {
        ...Typography.body,
        fontWeight: '600',
        color: Colors.secondary,
        marginBottom: 2,
    },

    serviceStatus: {
        ...Typography.caption,
        color: Colors.textMuted,
    },

    // 🎨 SECTION MANAGER UNIFORME
    managerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        backgroundColor: Colors.surfaceVariant,
        borderRadius: BorderRadius.sm,
    },

    managerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.secondarySoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },

    managerInfo: {
        flex: 1,
    },

    managerName: {
        ...Typography.bodySmall,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 2,
    },

    managerEmail: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },

    // Description du service
    serviceDescription: {
        ...Typography.bodySmall,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
        lineHeight: 20,
    },

    // 🎨 ACTIONS DE COMMUNICATION UNIFORMES
    serviceActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.divider,
    },

    // 🎨 BOUTONS D'ACTION UNIFORMES
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        ...StyleUtils.getUniformShadow('low'),
    },

    actionButtonDisabled: {
        opacity: 0.3,
    },

    // 🎨 BOUTONS SPÉCIALISÉS UNIFORMES
    emailButton: {
        backgroundColor: Colors.primarySoft,
    },

    phoneButton: {
        backgroundColor: '#E8F5E8', // Vert clair pour téléphone
    },

    viewDetailsButton: {
        backgroundColor: Colors.secondarySoft,
    },

    // 🎨 EMPTY STATE UNIFORME
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },

    emptyStateText: {
        ...Typography.body,
        color: Colors.textMuted,
        marginTop: Spacing.lg,
        textAlign: 'center',
        fontWeight: '600',
    },

    emptyStateSubtext: {
        ...Typography.bodySmall,
        color: Colors.textMuted,
        marginTop: 4,
        textAlign: 'center',
    },

    // 🆕 Styles pour l'organigramme
    orgChartContainer: {
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

    retryButton: {
        marginTop: Spacing.lg,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.secondary,
        borderRadius: BorderRadius.lg,
    },

    retryButtonText: {
        ...Typography.body,
        color: Colors.surface,
        fontWeight: '600',
    },
});

export default ServicesScreen;