// EmployeesScreen.tsx - VERSION AVEC PHOTOS
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
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// 🎨 IMPORTS DE LA CHARTE UNIFORME
import { Colors, Gradients, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { StyleUtils } from '../../constants/styleUtils';

// Services
import { employeeService, Employee } from '../../services/employeeService';
import { apiClient } from '../../services/apiConfig';
import EmployeeDetailScreen from './EmployeeDetailScreen';

// 🆕 Import du composant organigramme
import { OrgChartComponent, OrgChartNode } from '../../components/orgchart/OrgChartComponent';

// Types
interface EmployeeHierarchique {
    id: string;
    matricule: string;
    nom: string;
    prenom: string;
    service: string;
    photo?: string;
    function: string;
    statut: string;
    managerId?: string;
    children?: EmployeeHierarchique[];
}

interface EmployeeCardProps {
    employee: Employee;
    onViewDetails: (employee: Employee) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onViewDetails }) => {
    const [imageError, setImageError] = useState(false);

    const handleEmailPress = async () => {
        if (!employee.contact?.email) {
            Alert.alert('Information', 'Aucun email disponible pour cet employé');
            return;
        }

        const url = `mailto:${employee.contact.email}`;

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

    const handlePhonePress = () => {
        const phoneOptions = [];

        if (employee.contact?.telephoneMobile) {
            phoneOptions.push({
                title: `Personnel: ${employee.contact.telephoneMobile}`,
                number: employee.contact.telephoneMobile,
                type: 'Personnel'
            });
        }

        if (employee.contact?.telephoneInterne) {
            phoneOptions.push({
                title: `Professionnel: ${employee.contact.telephoneInterne}`,
                number: employee.contact.telephoneInterne,
                type: 'Professionnel'
            });
        }

        if (phoneOptions.length === 0) {
            Alert.alert('Information', 'Aucun numéro de téléphone disponible');
            return;
        }

        if (phoneOptions.length === 1) {
            makePhoneCall(phoneOptions[0].number);
        } else {
            showPhoneSelectionDialog(phoneOptions);
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

    // 📸 Fonction pour obtenir l'URL de la photo
    const getPhotoUrl = () => {
        return employeeService.getEmployeePhotoUrl(employee.photo);
    };

    // 👤 Fonction pour obtenir les initiales
    const getInitials = () => {
        const firstName = employee.prenom || '';
        const lastName = employee.nom || '';
        return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
    };

    return (
        <TouchableOpacity style={styles.employeeCard} activeOpacity={0.7}>
            {/* 🎨 BARRE DE STATUT UNIFORME */}
            <View style={[
                styles.statusBar,
                { backgroundColor: StyleUtils.getStatusColor(employee.statut) }
            ]} />

            <View style={styles.cardContent}>
                {/* 🎨 EN-TÊTE AVEC AVATAR UNIFORME ET PHOTO */}
                <View style={styles.employeeHeader}>
                    <View style={styles.avatarSection}>
                        <View style={styles.employeeAvatar}>
                            {employee.photo && !imageError && getPhotoUrl() ? (
                                <Image
                                    source={{ uri: getPhotoUrl()! }}
                                    style={styles.employeePhoto}
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <LinearGradient
                                        colors={[Colors.secondary, Colors.secondaryLight]}
                                        style={styles.avatarGradient}
                                    >
                                        <Text style={styles.avatarInitials}>{getInitials()}</Text>
                                    </LinearGradient>
                                </View>
                            )}
                        </View>
                        <View style={[
                            styles.statusIndicator,
                            { backgroundColor: StyleUtils.getStatusColor(employee.statut) }
                        ]}>
                            <Ionicons name="checkmark" size={12} color={Colors.surface} />
                        </View>
                    </View>

                    <View style={styles.employeeInfo}>
                        <Text style={styles.employeeName}>
                            {employee.prenom} {employee.nom}
                        </Text>
                        <Text style={styles.employeeMatricule}>
                            {employee.matricule}
                        </Text>
                        <Text style={styles.employeeService} numberOfLines={1}>
                            {employee.service?.nom || 'Non assigné'}
                        </Text>
                        <Text style={styles.employeePoste} numberOfLines={1}>
                            {employee.poste?.nom || 'Non assigné'}
                        </Text>
                    </View>
                </View>

                {/* 🎨 ACTIONS DE COMMUNICATION UNIFORMES */}
                <View style={styles.communicationActions}>
                    {/* Bouton Email */}
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            styles.emailButton,
                            !employee.contact?.email && styles.actionButtonDisabled
                        ]}
                        onPress={handleEmailPress}
                        disabled={!employee.contact?.email}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="mail-outline"
                            size={20}
                            color={employee.contact?.email ? Colors.primary : Colors.textMuted}
                        />
                    </TouchableOpacity>

                    {/* Bouton Téléphone */}
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            styles.phoneButton,
                            !employee.contact?.telephoneMobile && !employee.contact?.telephoneInterne && styles.actionButtonDisabled
                        ]}
                        onPress={handlePhonePress}
                        disabled={!employee.contact?.telephoneMobile && !employee.contact?.telephoneInterne}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="call-outline"
                            size={20}
                            color={employee.contact?.telephoneMobile || employee.contact?.telephoneInterne ? Colors.success : Colors.textMuted}
                        />
                    </TouchableOpacity>

                    {/* Bouton Voir détails */}
                    <TouchableOpacity
                        style={[styles.actionButton, styles.viewDetailsButton]}
                        onPress={() => onViewDetails(employee)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="eye-outline" size={20} color={Colors.secondary} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const EmployeesScreen: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // 🆕 États pour l'organigramme
    const [viewMode, setViewMode] = useState<'list' | 'orgchart'>('list');
    const [orgChartData, setOrgChartData] = useState<EmployeeHierarchique | null>(null);
    const [isLoadingOrgChart, setIsLoadingOrgChart] = useState(false);

    const loadEmployees = async () => {
        try {
            const response = await employeeService.getAll();
            if (response.success) {
                setEmployees(response.data);
                setFilteredEmployees(response.data);
            }
        } catch (error: any) {
            Alert.alert('Erreur', error.message || 'Impossible de charger les employés');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    // 🆕 Fonction pour charger l'organigramme
    const loadOrgChart = async () => {
        try {
            setIsLoadingOrgChart(true);
            const response = await apiClient.get('/api/admin/employes/organigramme');

            if (response.data.success && response.data.data) {
                console.log('Organigramme chargé avec succès:', response.data.data);
                setOrgChartData(response.data.data);
            } else {
                Alert.alert('Erreur', 'Impossible de charger l\'organigramme');
            }
        } catch (error: any) {
            console.error('Erreur chargement organigramme:', error);
            Alert.alert('Erreur', 'Impossible de charger l\'organigramme');
        } finally {
            setIsLoadingOrgChart(false);
        }
    };

    const filterEmployees = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredEmployees(employees);
        } else {
            const filtered = employees.filter(employee =>
                `${employee.prenom} ${employee.nom}`.toLowerCase().includes(query.toLowerCase()) ||
                employee.matricule.toLowerCase().includes(query.toLowerCase()) ||
                employee.service?.nom.toLowerCase().includes(query.toLowerCase()) ||
                employee.poste?.nom.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredEmployees(filtered);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        if (viewMode === 'list') {
            loadEmployees();
        } else {
            Promise.all([loadEmployees(), loadOrgChart()]).then(() => {
                setRefreshing(false);
            });
        }
    };

    const handleViewDetails = (employee: Employee) => {
        setSelectedEmployee(employee);
        setShowDetailModal(true);
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
        // Trouver l'employé correspondant dans la liste
        const employee = employees.find(emp => emp.id === node.id);
        if (employee) {
            handleViewDetails(employee);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadEmployees();
        }, [])
    );

    return (
        <View style={styles.container}>
            {/* 🎨 EN-TÊTE AVEC GRADIENT BLEU (selon la charte) */}
            <LinearGradient
                colors={Gradients.primary}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Employés</Text>

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
                            color={viewMode === 'list' ? Colors.primary : Colors.surface}
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
                            color={viewMode === 'orgchart' ? Colors.primary : Colors.surface}
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
                            placeholder="Rechercher un employé..."
                            placeholderTextColor={StyleUtils.withOpacity(Colors.surface, 0.7)}
                            value={searchQuery}
                            onChangeText={filterEmployees}
                        />
                    </View>
                )}
            </LinearGradient>

            {/* 🆕 Contenu selon le mode de vue */}
            {viewMode === 'list' ? (
                // Mode liste classique
                <ScrollView
                    style={styles.employeesList}
                    contentContainerStyle={styles.employeesContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    {filteredEmployees.map((employee) => (
                        <EmployeeCard
                            key={employee.id}
                            employee={employee}
                            onViewDetails={handleViewDetails}
                        />
                    ))}

                    {filteredEmployees.length === 0 && !isLoading && (
                        <View style={styles.emptyState}>
                            <Ionicons name="people-outline" size={64} color={Colors.textMuted} />
                            <Text style={styles.emptyStateText}>
                                {searchQuery ? 'Aucun employé trouvé' : 'Aucun employé disponible'}
                            </Text>
                            <Text style={styles.emptyStateSubtext}>
                                {searchQuery ? 'Essayez avec d\'autres mots-clés' : 'Les employés apparaîtront ici'}
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
                            type="employee"
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

            {/* Modal de détails riche */}
            <EmployeeDetailScreen
                visible={showDetailModal}
                employee={selectedEmployee}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedEmployee(null);
                }}
                onRefresh={loadEmployees}
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

    // 🎨 HEADER UNIFORME
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
        color: Colors.primary,
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

    // Liste des employés
    employeesList: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    employeesContent: {
        padding: Spacing.lg,
        gap: Spacing.md,
    },

    // 🎨 CARTE EMPLOYÉ UNIFORME
    employeeCard: {
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

    // 🎨 EN-TÊTE EMPLOYÉ UNIFORME
    employeeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },

    avatarSection: {
        position: 'relative',
        marginRight: Spacing.md,
    },

    // 🎨 AVATAR UNIFORME AVEC PHOTO
    employeeAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        overflow: 'hidden',
        backgroundColor: Colors.primarySoft,
        justifyContent: 'center',
        alignItems: 'center',
    },

    employeePhoto: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
    },

    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
        overflow: 'hidden',
    },

    avatarGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    avatarInitials: {
        ...Typography.bodySmall,
        color: Colors.surface,
        fontWeight: '700',
    },

    // 🎨 INDICATEUR DE STATUT UNIFORME
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

    employeeInfo: {
        flex: 1,
    },

    // 🎨 NOM EMPLOYÉ UNIFORME
    employeeName: {
        ...Typography.body,
        fontWeight: '600',
        color: Colors.primary,
        marginBottom: 2,
    },

    employeeMatricule: {
        ...Typography.caption,
        color: Colors.textMuted,
        marginBottom: 4,
    },

    employeeService: {
        ...Typography.bodySmall,
        color: Colors.textPrimary,
        marginBottom: 2,
    },

    employeePoste: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },

    // 🎨 ACTIONS DE COMMUNICATION UNIFORMES
    communicationActions: {
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
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.lg,
    },

    retryButtonText: {
        ...Typography.body,
        color: Colors.surface,
        fontWeight: '600',
    },
});

export default EmployeesScreen;