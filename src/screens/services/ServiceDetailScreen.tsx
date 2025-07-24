// ServiceDetailScreen.tsx - Écran de détails riche pour les services
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Linking,
    Modal,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { employeeService, Employee } from '../../services/employeeService';

interface ServiceDetailScreenProps {
    visible: boolean;
    service: any | null;
    onClose: () => void;
    onRefresh?: () => void;
}

const ServiceDetailScreen: React.FC<ServiceDetailScreenProps> = ({
    visible,
    service,
    onClose,
    onRefresh
}) => {
    const [activeTab, setActiveTab] = useState('info');
    const [refreshing, setRefreshing] = useState(false);

    // Charger les employés du service
    const loadServiceEmployees = async () => {
        // Fonction gardée pour compatibilité mais plus utilisée dans l'onglet Parent
        if (!service?.id) return;

        try {
            const response = await employeeService.getByService(service.id.toString());
            if (response.success) {
                // Peut être utilisé pour les statistiques dans l'onglet Info
                return response.data;
            }
        } catch (error: any) {
            console.error('Erreur chargement employés:', error.message);
        }
        return [];
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        if (onRefresh) {
            await onRefresh();
        }
        setRefreshing(false);
    };

    // Charger les employés quand on passe à l'onglet parent
    useEffect(() => {
        if (activeTab === 'parent' && visible && service?.serviceParent?.id) {
            // Logique pour charger plus d'infos sur le service parent si nécessaire
        }
    }, [activeTab, visible, service?.serviceParent?.id]);

    // Retourner null APRÈS tous les hooks
    if (!service) return null;

    // Fonctions de communication
    const handleEmailPress = async (email?: string) => {
        if (!email) {
            Alert.alert('Information', 'Aucun email disponible');
            return;
        }

        const url = `mailto:${email}`;
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

    const handlePhonePress = (phoneType: 'mobile' | 'interne', contact?: any) => {
        if (!contact) return;

        const number = phoneType === 'mobile'
            ? contact.telephoneMobile
            : contact.telephoneInterne;

        if (!number) {
            Alert.alert('Information', 'Numéro non disponible');
            return;
        }

        Linking.openURL(`tel:${number}`);
    };

    const getStatusInfo = (status: boolean) => {
        return status ? {
            color: '#4CAF50',
            icon: 'checkmark-circle',
            label: 'Actif'
        } : {
            color: '#757575',
            icon: 'close-circle',
            label: 'Inactif'
        };
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'info':
                return renderInfoTab();
            case 'manager':
                return renderManagerTab();
            case 'parent':
                return renderParentTab();
            default:
                return renderInfoTab();
        }
    };

    const renderInfoTab = () => (
        <View style={styles.tabContent}>
            {/* Informations générales */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informations générales</Text>
                <View style={styles.infoGrid}>
                    <InfoItem
                        icon="business-outline"
                        label="Nom du service"
                        value={service.nom}
                    />
                    <InfoItem
                        icon="document-text-outline"
                        label="Description"
                        value={service.description || 'Aucune description'}
                    />
                    <InfoItem
                        icon="flag-outline"
                        label="Statut"
                        value={service.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                        valueColor={service.status === 'ACTIVE' ? '#4CAF50' : '#757575'}
                    />
                </View>
            </View>

            {/* Hiérarchie */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hiérarchie</Text>
                <View style={styles.infoGrid}>
                    {service.serviceParent && (
                        <InfoItem
                            icon="arrow-up-outline"
                            label="Service parent"
                            value={service.serviceParent.nom}
                        />
                    )}
                    <InfoItem
                        icon="people-outline"
                        label="Nombre d'employés"
                        value="À charger..."
                    />
                </View>
            </View>

            {/* Statistiques */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informations hiérarchiques</Text>
                <View style={styles.statsContainer}>
                    <StatCard
                        icon="business"
                        label="Statut"
                        value={service.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                        color={service.status === 'ACTIVE' ? '#4CAF50' : '#757575'}
                    />
                    <StatCard
                        icon="git-network"
                        label="Service parent"
                        value={service.serviceParent ? 'Oui' : 'Non'}
                        color="#FF6347"
                    />
                    <StatCard
                        icon="person"
                        label="Manager assigné"
                        value={service.manager ? 'Oui' : 'Non'}
                        color="#1E88E5"
                    />
                </View>
            </View>
        </View>
    );

    const renderManagerTab = () => (
        <View style={styles.tabContent}>
            {service.manager ? (
                <>
                    {/* Informations du manager */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Manager du service</Text>
                        <View style={styles.managerCard}>
                            <View style={styles.managerHeader}>
                                <View style={styles.managerAvatar}>
                                    <Ionicons name="person" size={32} color="#666" />
                                </View>
                                <View style={styles.managerInfo}>
                                    <Text style={styles.managerName}>
                                        {service.manager.prenom} {service.manager.nom}
                                    </Text>
                                    <Text style={styles.managerTitle}>
                                        {service.manager.poste?.nom || 'Manager'}
                                    </Text>
                                    <Text style={styles.managerMatricule}>
                                        {service.manager.matricule}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Contact du manager */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact du manager</Text>
                        <View style={styles.contactList}>
                            <ContactItem
                                icon="mail-outline"
                                label="Email professionnel"
                                value={service.manager.contact?.email}
                                onPress={() => handleEmailPress(service.manager.contact?.email)}
                                actionIcon="send-outline"
                            />
                            <ContactItem
                                icon="call-outline"
                                label="Téléphone interne"
                                value={service.manager.contact?.telephoneInterne}
                                onPress={() => handlePhonePress('interne', service.manager.contact)}
                                actionIcon="call"
                            />
                            <ContactItem
                                icon="phone-portrait-outline"
                                label="Téléphone mobile"
                                value={service.manager.contact?.telephoneMobile}
                                onPress={() => handlePhonePress('mobile', service.manager.contact)}
                                actionIcon="call"
                            />
                        </View>
                    </View>

                    {/* Actions rapides avec le manager */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Actions rapides</Text>
                        <View style={styles.quickActions}>
                            {service.manager.contact?.email && (
                                <QuickActionButton
                                    icon="mail"
                                    label="Envoyer un email"
                                    onPress={() => handleEmailPress(service.manager.contact?.email)}
                                    color="#1E88E5"
                                />
                            )}
                            {service.manager.contact?.telephoneMobile && (
                                <QuickActionButton
                                    icon="call"
                                    label="Appeler mobile"
                                    onPress={() => handlePhonePress('mobile', service.manager.contact)}
                                    color="#4CAF50"
                                />
                            )}
                            {service.manager.contact?.telephoneInterne && (
                                <QuickActionButton
                                    icon="business"
                                    label="Appeler interne"
                                    onPress={() => handlePhonePress('interne', service.manager.contact)}
                                    color="#FF6347"
                                />
                            )}
                        </View>
                    </View>
                </>
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="person-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyStateText}>Aucun manager assigné</Text>
                    <Text style={styles.emptyStateSubtext}>
                        Ce service n'a pas encore de manager désigné
                    </Text>
                </View>
            )}
        </View>
    );

    const renderParentTab = () => (
        <View style={styles.tabContent}>
            {service.serviceParent ? (
                <>
                    {/* Informations du service parent */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Service parent</Text>
                        <View style={styles.parentServiceCard}>
                            <View style={styles.parentServiceHeader}>
                                <View style={styles.parentServiceIcon}>
                                    <Ionicons name="business" size={32} color="#FF6347" />
                                </View>
                                <View style={styles.parentServiceInfo}>
                                    <Text style={styles.parentServiceName}>
                                        {service.serviceParent.nom}
                                    </Text>
                                    <Text style={styles.parentServiceDescription}>
                                        {service.serviceParent.description || 'Aucune description disponible'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Manager du service parent */}
                    {service.serviceParent.manager && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Manager du service parent</Text>
                            <View style={styles.managerCard}>
                                <View style={styles.managerHeader}>
                                    <View style={styles.managerAvatar}>
                                        <Ionicons name="person" size={32} color="#666" />
                                    </View>
                                    <View style={styles.managerInfo}>
                                        <Text style={styles.managerName}>
                                            {service.serviceParent.manager.prenom} {service.serviceParent.manager.nom}
                                        </Text>
                                        <Text style={styles.managerTitle}>
                                            {service.serviceParent.manager.poste?.nom || 'Manager'}
                                        </Text>
                                        <Text style={styles.managerMatricule}>
                                            {service.serviceParent.manager.matricule}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Contact du manager du service parent */}
                    {service.serviceParent.manager?.contact && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Contact du manager parent</Text>
                            <View style={styles.contactList}>
                                <ContactItem
                                    icon="mail-outline"
                                    label="Email professionnel"
                                    value={service.serviceParent.manager.contact?.email}
                                    onPress={() => handleEmailPress(service.serviceParent.manager.contact?.email)}
                                    actionIcon="send-outline"
                                />
                                <ContactItem
                                    icon="call-outline"
                                    label="Téléphone interne"
                                    value={service.serviceParent.manager.contact?.telephoneInterne}
                                    onPress={() => handlePhonePress('interne', service.serviceParent.manager.contact)}
                                    actionIcon="call"
                                />
                                <ContactItem
                                    icon="phone-portrait-outline"
                                    label="Téléphone mobile"
                                    value={service.serviceParent.manager.contact?.telephoneMobile}
                                    onPress={() => handlePhonePress('mobile', service.serviceParent.manager.contact)}
                                    actionIcon="call"
                                />
                            </View>
                        </View>
                    )}

                    {/* Hiérarchie */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Hiérarchie</Text>
                        <View style={styles.hierarchyContainer}>
                            <View style={styles.hierarchyItem}>
                                <View style={styles.hierarchyIcon}>
                                    <Ionicons name="business" size={20} color="#FF6347" />
                                </View>
                                <View style={styles.hierarchyContent}>
                                    <Text style={styles.hierarchyLabel}>Service parent</Text>
                                    <Text style={styles.hierarchyValue}>{service.serviceParent.nom}</Text>
                                </View>
                            </View>

                            <View style={styles.hierarchyArrow}>
                                <Ionicons name="arrow-down" size={24} color="#ccc" />
                            </View>

                            <View style={styles.hierarchyItem}>
                                <View style={[styles.hierarchyIcon, { backgroundColor: '#E3F2FD' }]}>
                                    <Ionicons name="business-outline" size={20} color="#1E88E5" />
                                </View>
                                <View style={styles.hierarchyContent}>
                                    <Text style={styles.hierarchyLabel}>Service actuel</Text>
                                    <Text style={styles.hierarchyValue}>{service.nom}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </>
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="git-network-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyStateText}>Aucun service parent</Text>
                    <Text style={styles.emptyStateSubtext}>
                        Ce service est à la racine de l'organisation
                    </Text>
                </View>
            )}
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#FF6347" />

                {/* En-tête */}
                <LinearGradient colors={['#FF6347', '#FF4500']} style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={onClose} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Détails du service</Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* Informations principales du service */}
                    <View style={styles.serviceHeader}>
                        <View style={styles.serviceIconContainer}>
                            <View style={styles.serviceIcon}>
                                <Ionicons name="business" size={40} color="#FF6347" />
                            </View>
                            <View style={[styles.serviceDot, {
                                backgroundColor: service.status === 'ACTIVE' ? '#4CAF50' : '#757575'
                            }]}>
                                <Ionicons
                                    name={service.status === 'ACTIVE' ? 'checkmark' : 'close'}
                                    size={12}
                                    color="white"
                                />
                            </View>
                        </View>

                        <View style={styles.serviceMainInfo}>
                            <Text style={styles.serviceName}>{service.nom}</Text>
                            <Text style={styles.serviceDescription} numberOfLines={2}>
                                {service.description || 'Aucune description disponible'}
                            </Text>
                            {service.manager && (
                                <Text style={styles.serviceManager}>
                                    Manager: {service.manager.prenom} {service.manager.nom}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Onglets */}
                    <View style={styles.tabsContainer}>
                        <TabButton
                            title="Infos"
                            icon="information-circle-outline"
                            active={activeTab === 'info'}
                            onPress={() => setActiveTab('info')}
                        />
                        <TabButton
                            title="Manager"
                            icon="person-outline"
                            active={activeTab === 'manager'}
                            onPress={() => setActiveTab('manager')}
                        />
                        <TabButton
                            title="Parent"
                            icon="git-network-outline"
                            active={activeTab === 'parent'}
                            onPress={() => setActiveTab('parent')}
                        />
                    </View>
                </LinearGradient>

                {/* Contenu */}
                <ScrollView
                    style={styles.content}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    {renderTabContent()}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

// Composants auxiliaires
const TabButton: React.FC<{
    title: string;
    icon: string;
    active: boolean;
    onPress: () => void;
}> = ({ title, icon, active, onPress }) => (
    <TouchableOpacity
        style={[styles.tabButton, active && styles.tabButtonActive]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Ionicons
            name={icon as any}
            size={20}
            color={active ? '#FF6347' : 'rgba(255,255,255,0.7)'}
        />
        <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
            {title}
        </Text>
    </TouchableOpacity>
);

const InfoItem: React.FC<{
    icon: string;
    label: string;
    value: string;
    valueColor?: string;
}> = ({ icon, label, value, valueColor }) => (
    <View style={styles.infoItem}>
        <View style={styles.infoIcon}>
            <Ionicons name={icon as any} size={20} color="#FF6347" />
        </View>
        <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>
                {value}
            </Text>
        </View>
    </View>
);

const StatCard: React.FC<{
    icon: string;
    label: string;
    value: string;
    color: string;
}> = ({ icon, label, value, color }) => (
    <View style={[styles.statCard, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={32} color={color} />
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const ContactItem: React.FC<{
    icon: string;
    label: string;
    value?: string;
    onPress?: () => void;
    actionIcon?: string;
}> = ({ icon, label, value, onPress, actionIcon }) => (
    <TouchableOpacity
        style={[styles.contactItem, !value && styles.contactItemDisabled]}
        onPress={value ? onPress : undefined}
        disabled={!value}
        activeOpacity={0.7}
    >
        <View style={styles.contactLeft}>
            <View style={styles.contactIcon}>
                <Ionicons name={icon as any} size={20} color={value ? "#FF6347" : "#ccc"} />
            </View>
            <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>{label}</Text>
                <Text style={[styles.contactValue, !value && styles.contactValueDisabled]}>
                    {value || 'Non renseigné'}
                </Text>
            </View>
        </View>
        {value && actionIcon && (
            <Ionicons name={actionIcon as any} size={20} color="#FF6347" />
        )}
    </TouchableOpacity>
);

const QuickActionButton: React.FC<{
    icon: string;
    label: string;
    onPress: () => void;
    color: string;
}> = ({ icon, label, onPress, color }) => (
    <TouchableOpacity
        style={[styles.quickActionButton, { backgroundColor: `${color}15` }]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={[styles.quickActionLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingBottom: 0,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    placeholder: {
        width: 40,
    },
    serviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    serviceIconContainer: {
        position: 'relative',
        marginRight: 16,
    },
    serviceIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    serviceDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    serviceMainInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    serviceDescription: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4,
    },
    serviceManager: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 20,
        borderRadius: 12,
        padding: 4,
        marginBottom: 10,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    tabButtonActive: {
        backgroundColor: 'white',
    },
    tabButtonText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
    },
    tabButtonTextActive: {
        color: '#FF6347',
    },
    content: {
        flex: 1,
    },
    tabContent: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    infoGrid: {
        gap: 16,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF3E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'white',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 4,
    },
    managerCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    managerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    managerAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    managerInfo: {
        flex: 1,
    },
    managerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    managerTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    managerMatricule: {
        fontSize: 12,
        color: '#999',
    },
    contactList: {
        gap: 12,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    contactItemDisabled: {
        opacity: 0.5,
    },
    contactLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    contactIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF3E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contactContent: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    contactValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    contactValueDisabled: {
        color: '#ccc',
    },
    quickActions: {
        gap: 12,
    },
    quickActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 16,
    },
    quickActionLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    employeeCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
    },
    employeeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    employeeAvatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    employeeAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    employeeStatusDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    employeeInfo: {
        flex: 1,
    },
    employeeName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    employeeMatricule: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    employeePosition: {
        fontSize: 12,
        color: '#999',
    },
    employeeActions: {
        flexDirection: 'row',
        gap: 8,
    },
    miniActionButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f8f8f8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        backgroundColor: 'white',
        borderRadius: 12,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#666',
        marginTop: 12,
        fontWeight: '600',
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 4,
        textAlign: 'center',
    },
    parentServiceCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    parentServiceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    parentServiceIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFF3E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    parentServiceInfo: {
        flex: 1,
    },
    parentServiceName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    parentServiceDescription: {
        fontSize: 14,
        color: '#666',
    },
    hierarchyContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
    },
    hierarchyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    hierarchyIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF3E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    hierarchyContent: {
        flex: 1,
    },
    hierarchyLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    hierarchyValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    hierarchyArrow: {
        alignItems: 'center',
        paddingVertical: 8,
    },
});

export default ServiceDetailScreen;