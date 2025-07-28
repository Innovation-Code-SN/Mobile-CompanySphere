// EmployeeDetailScreen.tsx - CORRECTION DES HOOKS
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
    ActionSheetIOS,
    Platform,
    Modal,
    SafeAreaView,
    StatusBar,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { Employee, employeeService } from '../../services/employeeService';

interface EmployeeDetailScreenProps {
    visible: boolean;
    employee: Employee | null;
    onClose: () => void;
    onRefresh?: () => void;
}

const EmployeeDetailScreen: React.FC<EmployeeDetailScreenProps> = ({
    visible,
    employee,
    onClose,
    onRefresh
}) => {
    const [activeTab, setActiveTab] = useState('info');
    const [refreshing, setRefreshing] = useState(false);
    const [imageError, setImageError] = useState(false);

    // ✅ CORRECTION : Déplacer useEffect AVANT le return conditionnel
    useEffect(() => {
        if (employee?.id) {
            setImageError(false);
        }
    }, [employee?.id]);

    const statusConfig = {
        ACTIF: {
            color: '#28a745',
            icon: 'checkmark-circle',
            label: 'Actif'
        },
        INACTIF: {
            color: '#6c757d',
            icon: 'close-circle',
            label: 'Inactif'
        },
        SUSPENDU: {
            color: '#dc3545',
            icon: 'ban',
            label: 'Suspendu'
        },
        PLUS_EN_POSTE: {
            color: '#000000',
            icon: 'person-remove',
            label: 'Plus en poste'
        },
        EN_CONGE: {
            color: '#ffc107',
            icon: 'calendar',
            label: 'En congé'
        }
    };

    // ✅ APRÈS tous les Hooks, on peut faire le return conditionnel
    if (!employee) return null;

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

    const handleRefresh = async () => {
        setRefreshing(true);
        if (onRefresh) {
            await onRefresh();
        }
        setRefreshing(false);
    };

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

    const handlePhonePress = (phoneType: 'mobile' | 'interne') => {
        const number = phoneType === 'mobile'
            ? employee.contact?.telephoneMobile
            : employee.contact?.telephoneInterne;

        if (!number) return;

        Linking.openURL(`tel:${number}`);
    };

    const getStatusInfo = () => {
        // Gérer les différents types de statut (boolean, string, etc.)
        let status: string;

        if (typeof employee.statut === 'boolean') {
            status = employee.statut ? 'ACTIF' : 'INACTIF';
        } else if (typeof employee.statut === 'string') {
            status = employee.statut.toUpperCase();
        } else {
            status = 'INACTIF';
        }

        return statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIF;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Non renseigné';
        return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    };

    const formatDateRange = (startDate: string, endDate?: string) => {
        const start = format(new Date(startDate), 'dd MMM yyyy', { locale: fr });
        return endDate
            ? `${start} - ${format(new Date(endDate), 'dd MMM yyyy', { locale: fr })}`
            : `Depuis le ${start}`;
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'info':
                return renderInfoTab();
            case 'contact':
                return renderContactTab();
            case 'history':
                return renderHistoryTab();
            default:
                return renderInfoTab();
        }
    };

    const renderInfoTab = () => (
        <View style={styles.tabContent}>
            {/* Informations personnelles */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informations personnelles</Text>
                <View style={styles.infoGrid}>
                    <InfoItem
                        icon="person-outline"
                        label="Nom complet"
                        value={`${employee.prenom} ${employee.nom}`}
                    />
                    <InfoItem
                        icon="card-outline"
                        label="Matricule"
                        value={employee.matricule}
                    />
                    <InfoItem
                        icon="calendar-outline"
                        label="Date d'entrée"
                        value={formatDate(employee.dateEntree)}
                    />
                    <InfoItem
                        icon="flag-outline"
                        label="Statut"
                        value={getStatusInfo().label}
                        valueColor={getStatusInfo().color}
                    />
                </View>
            </View>

            {/* Informations professionnelles */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informations professionnelles</Text>
                <View style={styles.infoGrid}>
                    <InfoItem
                        icon="business-outline"
                        label="Service"
                        value={employee.service?.nom || 'Non assigné'}
                    />
                    <InfoItem
                        icon="briefcase-outline"
                        label="Poste"
                        value={employee.poste?.nom || 'Non assigné'}
                    />
                    <InfoItem
                        icon="location-outline"
                        label="Localisation"
                        value={employee.contact?.adresseEnEntreprise || 'Non renseigné'}
                    />
                </View>
            </View>
        </View>
    );

    const renderContactTab = () => (
        <View style={styles.tabContent}>
            {/* Contact professionnel */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact professionnel</Text>
                <View style={styles.contactList}>
                    <ContactItem
                        icon="mail-outline"
                        label="Email professionnel"
                        value={employee.contact?.email}
                        onPress={() => handleEmailPress(employee.contact?.email)}
                        actionIcon="send-outline"
                    />
                    <ContactItem
                        icon="call-outline"
                        label="Téléphone interne"
                        value={employee.contact?.telephoneInterne}
                        onPress={() => handlePhonePress('interne')}
                        actionIcon="call"
                    />
                </View>
            </View>

            {/* Contact personnel (si disponible) */}
            {employee.contact?.telephoneMobile && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact personnel</Text>
                    <View style={styles.contactList}>
                        <ContactItem
                            icon="phone-portrait-outline"
                            label="Téléphone mobile"
                            value={employee.contact.telephoneMobile}
                            onPress={() => handlePhonePress('mobile')}
                            actionIcon="call"
                        />
                    </View>
                </View>
            )}

            {/* Actions rapides */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Actions rapides</Text>
                <View style={styles.quickActions}>
                    {employee.contact?.email && (
                        <QuickActionButton
                            icon="mail"
                            label="Envoyer un email"
                            onPress={() => handleEmailPress(employee.contact?.email)}
                            color="#1E88E5"
                        />
                    )}
                    {employee.contact?.telephoneMobile && (
                        <QuickActionButton
                            icon="call"
                            label="Appeler mobile"
                            onPress={() => handlePhonePress('mobile')}
                            color="#4CAF50"
                        />
                    )}
                    {employee.contact?.telephoneInterne && (
                        <QuickActionButton
                            icon="business"
                            label="Appeler interne"
                            onPress={() => handlePhonePress('interne')}
                            color="#FF6347"
                        />
                    )}
                </View>
            </View>
        </View>
    );

    const renderHistoryTab = () => (
        <View style={styles.tabContent}>
            {/* Poste actuel */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Poste actuel</Text>
                <View style={styles.currentPosition}>
                    <View style={styles.positionCard}>
                        <View style={styles.positionHeader}>
                            <View style={[styles.positionBadge, { backgroundColor: '#4CAF50' }]}>
                                <Text style={styles.positionBadgeText}>ACTUEL</Text>
                            </View>
                            <Text style={styles.positionTitle}>{employee.poste?.nom || 'Non assigné'}</Text>
                        </View>
                        <Text style={styles.positionService}>
                            {employee.service?.nom || 'Service non assigné'}
                        </Text>
                        <Text style={styles.positionDate}>
                            Depuis le {formatDate(employee.dateEntree)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Historique des postes */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Historique des postes</Text>
                {employee.historiquePostes && employee.historiquePostes.length > 0 ? (
                    <View style={styles.historyList}>
                        {employee.historiquePostes.map((historique, index) => (
                            <View key={index} style={styles.historyItem}>
                                <View style={styles.historyDot} />
                                <View style={styles.historyContent}>
                                    <Text style={styles.historyTitle}>{historique.poste?.nom}</Text>
                                    <Text style={styles.historyService}>{historique.service?.nom}</Text>
                                    <Text style={styles.historyDate}>
                                        {formatDateRange(historique.dateDebut, historique.dateFin)}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyHistory}>
                        <Ionicons name="time-outline" size={48} color="#ccc" />
                        <Text style={styles.emptyHistoryText}>Aucun historique disponible</Text>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#1E88E5" />

                {/* En-tête */}
                <LinearGradient colors={['#1E88E5', '#1976D2']} style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={onClose} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Détails de l'employé</Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* Informations principales avec photo */}
                    <View style={styles.employeeHeader}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                {employee.photo && !imageError && getPhotoUrl() ? (
                                    <Image
                                        source={{ uri: getPhotoUrl()! }}
                                        style={styles.employeePhoto}
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <LinearGradient
                                            colors={['#FF6B6B', '#FF8E8E']}
                                            style={styles.avatarGradient}
                                        >
                                            <Text style={styles.avatarInitials}>{getInitials()}</Text>
                                        </LinearGradient>
                                    </View>
                                )}
                            </View>
                            <View style={[styles.statusDot, { backgroundColor: getStatusInfo().color }]}>
                                <Ionicons name={getStatusInfo().icon as any} size={16} color="white" />
                            </View>
                        </View>

                        <View style={styles.employeeMainInfo}>
                            <Text style={styles.employeeName}>
                                {employee.prenom} {employee.nom}
                            </Text>
                            <Text style={styles.employeeMatricule}>{employee.matricule}</Text>
                            <Text style={styles.employeePosition}>
                                {employee.poste?.nom || 'Poste non assigné'}
                            </Text>
                            <Text style={styles.employeeService}>
                                {employee.service?.nom || 'Service non assigné'}
                            </Text>
                        </View>
                    </View>

                    {/* Onglets */}
                    <View style={styles.tabsContainer}>
                        <TabButton
                            title="Informations"
                            icon="information-circle-outline"
                            active={activeTab === 'info'}
                            onPress={() => setActiveTab('info')}
                        />
                        <TabButton
                            title="Contact"
                            icon="call-outline"
                            active={activeTab === 'contact'}
                            onPress={() => setActiveTab('contact')}
                        />
                        <TabButton
                            title="Historique"
                            icon="time-outline"
                            active={activeTab === 'history'}
                            onPress={() => setActiveTab('history')}
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

// Composants auxiliaires restent inchangés...
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
            color={active ? '#1E88E5' : 'rgba(255,255,255,0.7)'}
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
            <Ionicons name={icon as any} size={20} color="#1E88E5" />
        </View>
        <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>
                {value}
            </Text>
        </View>
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
                <Ionicons name={icon as any} size={20} color={value ? "#1E88E5" : "#ccc"} />
            </View>
            <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>{label}</Text>
                <Text style={[styles.contactValue, !value && styles.contactValueDisabled]}>
                    {value || 'Non renseigné'}
                </Text>
            </View>
        </View>
        {value && actionIcon && (
            <Ionicons name={actionIcon as any} size={20} color="#1E88E5" />
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
    employeeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    employeePhoto: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
        overflow: 'hidden',
    },
    avatarGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    statusDot: {
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
    employeeMainInfo: {
        flex: 1,
    },
    employeeName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    employeeMatricule: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4,
    },
    employeePosition: {
        fontSize: 16,
        color: 'white',
        fontWeight: '600',
        marginBottom: 2,
    },
    employeeService: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
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
        color: '#1E88E5',
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
        backgroundColor: '#E3F2FD',
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
        backgroundColor: '#E3F2FD',
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
    currentPosition: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    positionCard: {
        gap: 8,
    },
    positionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    positionBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    positionBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'white',
    },
    positionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    positionService: {
        fontSize: 14,
        color: '#666',
    },
    positionDate: {
        fontSize: 12,
        color: '#999',
    },
    historyList: {
        gap: 16,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
    },
    historyDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FF6347',
        marginTop: 6,
        marginRight: 12,
    },
    historyContent: {
        flex: 1,
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    historyService: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    historyDate: {
        fontSize: 12,
        color: '#999',
    },
    emptyHistory: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        backgroundColor: 'white',
        borderRadius: 12,
    },
    emptyHistoryText: {
        fontSize: 14,
        color: '#666',
        marginTop: 12,
    },
});

export default EmployeeDetailScreen;