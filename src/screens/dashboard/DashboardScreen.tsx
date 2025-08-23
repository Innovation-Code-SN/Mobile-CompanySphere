// src/screens/dashboard/DashboardScreen.tsx - VERSION UNIFORME
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Dimensions,
    Modal,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

// 🎨 IMPORTS DE LA CHARTE UNIFORME
import { Colors, Gradients, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { StyleUtils } from '../../constants/styleUtils';

// Services
import { employeeService } from '../../services/employeeService';
import { serviceService } from '../../services/serviceService';
import { documentService } from '../../services/documentService';
import { useAuth } from '@/context/AuthContext';
import { groupeService } from '@/services/groupeService';

interface DashboardStats {
    employeesCount: number;
    servicesCount: number;
    documentsCount: number;
    teamsCount: number;
    newEmployeesThisMonth: number;
    newDocumentsThisMonth: number;
}

interface QuickAction {
    id: string;
    title: string;
    icon: string;
    gradient: [string, string];
    onPress: () => void;
}

interface ActivityItem {
    id: string;
    title: string;
    count: number;
    color: string;
}

export default function DashboardScreen({ navigation }: any) {
    const [stats, setStats] = useState<DashboardStats>({
        employeesCount: 0,
        servicesCount: 0,
        documentsCount: 0,
        teamsCount: 0,
        newEmployeesThisMonth: 0,
        newDocumentsThisMonth: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [user, setUser] = useState<any>(null);

    // États pour le menu profil
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.8));

    const { logout } = useAuth();

    // Charger les données au focus de l'écran
    useFocusEffect(
        React.useCallback(() => {
            loadDashboardData();
        }, [])
    );

    const loadDashboardData = async () => {
        try {
            console.log('🔄 Chargement des données du dashboard...');
            setIsLoading(true);

            // Charger les données utilisateur
            try {
                const userProfile = await employeeService.getMyProfile();
                console.log('👤 Profil utilisateur:', userProfile.success ? 'Chargé' : 'Erreur');
                if (userProfile.success) {
                    setUser(userProfile.data);
                }
            } catch (error) {
                console.log('❌ Erreur profil utilisateur:', error);
                setUser({
                    prenom: 'Utilisateur',
                    nom: '',
                    matricule: 'USER001'
                });
            }

            // Charger toutes les données en parallèle
            const [employeesResponse, servicesResponse, documentsResponse, teamsResponse] = await Promise.all([
                employeeService.getAll().catch(err => ({ success: false, data: [] })),
                serviceService.getAll().catch(err => ({ success: false, data: [] })),
                documentService.getAllDocuments().catch(err => ({ success: false, data: [] })),
                groupeService.getAll().catch(err => ({ success: false, data: [] }))
            ]);

            // Calculer les statistiques
            const employees = employeesResponse.success ? employeesResponse.data : [];
            const services = servicesResponse.success ? servicesResponse.data : [];
            const documents = documentsResponse.success ? documentsResponse.data : [];
            const teams = teamsResponse.success ? teamsResponse.data : [];

            // Calculer les nouveaux employés ce mois
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const newEmployeesThisMonth = employees.filter(emp => {
                if (!emp.dateEntree) return false;
                const entryDate = new Date(emp.dateEntree);
                return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
            }).length;

            // Calculer les nouveaux documents ce mois
            const newDocumentsThisMonth = documents.filter(doc => {
                if (!doc.createdAt) return false;
                const createdDate = new Date(doc.createdAt);
                return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
            }).length;

            setStats({
                employeesCount: employees.length,
                servicesCount: services.length,
                documentsCount: documents.length,
                teamsCount: teams.length,
                newEmployeesThisMonth,
                newDocumentsThisMonth,
            });

        } catch (error) {
            console.error('❌ Erreur lors du chargement des données:', error);
            Alert.alert('Erreur', 'Impossible de charger les données du tableau de bord');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
    };

    const openProfileMenu = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setShowProfileMenu(true);

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const closeProfileMenu = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShowProfileMenu(false);
        });
    };

    const handleProfileAction = (action: 'profile' | 'logout') => {
        closeProfileMenu();

        setTimeout(() => {
            if (action === 'profile') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate('Profile');
            } else if (action === 'logout') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

                Alert.alert(
                    'Déconnexion',
                    'Êtes-vous sûr de vouloir vous déconnecter ?',
                    [
                        {
                            text: 'Annuler',
                            style: 'cancel',
                        },
                        {
                            text: 'Déconnecter',
                            style: 'destructive',
                            onPress: handleLogout,
                        },
                    ]
                );
            }
        }, 200);
    };

    const handleLogout = async () => {
        try {
            console.log('🚪 === DÉCONNEXION DEPUIS DASHBOARD ===');
            await logout();
            console.log('✅ Déconnexion via contexte terminée');
        } catch (error) {
            console.error('❌ Erreur déconnexion Dashboard:', error);
        }
    };

    const getUserInitials = () => {
        if (!user) return 'U';
        const firstName = user.prenom || '';
        const lastName = user.nom || '';
        return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
    };

    const getUserDisplayName = () => {
        if (!user) return 'Utilisateur';
        return `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Utilisateur';
    };

    // 🎨 QUICK ACTIONS AVEC GRADIENTS UNIFORMES
    const quickActions: QuickAction[] = [
        {
            id: 'employees',
            title: 'Employés',
            icon: 'people',
            gradient: [Colors.primaryDark, Colors.primary], // Gradient bleu
            onPress: () => navigation.navigate('Employees'),
        },
        {
            id: 'services',
            title: 'Services',
            icon: 'business',
            gradient: [Colors.secondaryDark, Colors.secondary], // Gradient orange
            onPress: () => navigation.navigate('Services'),
        },
        {
            id: 'teams',
            title: 'Équipes',
            icon: 'people-circle',
            gradient: [Colors.secondaryDark, Colors.secondary], // Gradient orange
            onPress: () => navigation.navigate('Teams'),
        },
        {
            id: 'documents',
            title: 'Documents',
            icon: 'document-text',
            gradient: [Colors.primaryDark, Colors.primary], // Gradient bleu
            onPress: () => navigation.navigate('Documents'),
        },
        {
            id: 'faq',
            title: 'FAQ',
            icon: 'help-circle',
            gradient: ['#4A90E2', '#357ABD'], // Gradient FAQ spécial
            onPress: () => navigation.navigate('FAQ'),
        },
        {
    id: 'meetings',
    title: 'Réunions',
    icon: 'calendar',
    gradient: [Colors.primaryDark, Colors.primary],
    onPress: () => {
        console.log('🎯 === BOUTON RÉUNIONS CLIQUÉ ===');
        
        // 🔍 ÉTAPE 1 : Vérifier que l'action est bien appelée
        Alert.alert('Debug', 'Bouton Réunions cliqué !');
        
        // 🔍 ÉTAPE 2 : Vérifier la navigation disponible
        console.log('🔍 Navigation state:', navigation.getState());
        console.log('🔍 Routes disponibles:', navigation.getState().routeNames);
        
        // 🔍 ÉTAPE 3 : Essayer la navigation avec gestion d'erreur
        try {
            console.log('🚀 Tentative de navigation vers Meetings...');
            navigation.navigate('Meetings');
            console.log('✅ Navigation réussie');
        } catch (error) {
            console.error('❌ Erreur navigation:', error);
            Alert.alert('Erreur Navigation', `Impossible de naviguer vers Meetings:`);
        }
    },
}

    ];

    // 🎨 ACTIVITÉS AVEC COULEURS UNIFORMES
    const activityItems: ActivityItem[] = [
        {
            id: 'new_employees',
            title: 'Nouveaux employés ce mois',
            count: stats.newEmployeesThisMonth,
            color: Colors.success,
        },
        {
            id: 'new_documents',
            title: 'Documents ajoutés ce mois',
            count: stats.newDocumentsThisMonth,
            color: Colors.primary,
        },
        {
            id: 'faq_updates',
            title: 'Mises à jour de la FAQ',
            count: 0,
            color: Colors.warning,
        },
        {
            id: 'service_updates',
            title: 'Services mis à jour',
            count: 0,
            color: Colors.secondary,
        },
    ];

    const renderQuickActionCard = (action: QuickAction) => (
        <TouchableOpacity
            key={action.id}
            style={styles.quickActionCard}
            onPress={action.onPress}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={action.gradient}
                style={styles.quickActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.quickActionHeader}>
                    <Text style={styles.quickActionTitle}>{action.title}</Text>
                </View>
                <View style={styles.quickActionIconContainer}>
                    <Ionicons
                        name={action.icon as any}
                        size={48}
                        color={Colors.surface}
                    />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    const renderActivityItem = (item: ActivityItem) => (
        <View key={item.id} style={styles.activityItem}>
            <Text style={styles.activityTitle}>{item.title}</Text>
            <View style={[styles.activityBadge, { backgroundColor: item.color }]}>
                <Text style={styles.activityCount}>{item.count}</Text>
            </View>
        </View>
    );

    if (isLoading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Chargement...</Text>
            </View>
        );
    }

    return (
        // 🎨 GRADIENT BLEU PRINCIPAL (selon la charte)
        <LinearGradient colors={Gradients.primary} style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.surface}
                        colors={[Colors.primary]}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* 🎨 HEADER UNIFORME */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.menuButton}>
                        <Ionicons name="menu" size={24} color={Colors.surface} />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Accueil</Text>

                    {/* 🎨 PROFIL MODERNE UNIFORME */}
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={openProfileMenu}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[StyleUtils.withOpacity(Colors.surface, 0.25), StyleUtils.withOpacity(Colors.surface, 0.1)]}
                            style={styles.profileGradient}
                        >
                            {/* Avatar avec initiales */}
                            <View style={styles.avatarContainer}>
                                <LinearGradient
                                    colors={[Colors.secondary, Colors.secondaryLight]}
                                    style={styles.avatar}
                                >
                                    <Text style={styles.avatarText}>{getUserInitials()}</Text>
                                </LinearGradient>

                                {/* Indicateur en ligne */}
                                <View style={styles.onlineIndicator} />
                            </View>

                            {/* Informations utilisateur */}
                            <View style={styles.userInfo}>
                                <Text style={styles.userName} numberOfLines={1}>
                                    {getUserDisplayName()}
                                </Text>
                                <Text style={styles.userStatus}>En ligne</Text>
                            </View>

                            {/* Icône flèche */}
                            <View style={styles.arrowContainer}>
                                <Ionicons
                                    name="chevron-down"
                                    size={14}
                                    color={StyleUtils.withOpacity(Colors.surface, 0.8)}
                                />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* 🎨 QUICK ACTIONS GRID UNIFORME */}
                <View style={styles.quickActionsContainer}>
                    <View style={styles.quickActionsRow}>
                        {quickActions.slice(0, 2).map(renderQuickActionCard)}
                    </View>
                    <View style={styles.quickActionsRow}>
                        {quickActions.slice(2, 4).map(renderQuickActionCard)}
                    </View>
                    <View style={styles.quickActionsRow}>
                        {quickActions.slice(4, 6).map(renderQuickActionCard)} {/* 🆕 TROISIÈME RANGÉE */}
                    </View>
                </View>

                {/* 🎨 ACTIVITY SECTION UNIFORME */}
                <View style={styles.activitySection}>
                    <View style={styles.activityHeader}>
                        <Text style={styles.activitySectionTitle}>Activité récente</Text>
                    </View>
                    <View style={styles.activityList}>
                        {activityItems.map(renderActivityItem)}
                    </View>
                </View>
            </ScrollView>

            {/* Menu profil moderne avec blur */}
            <Modal
                visible={showProfileMenu}
                transparent
                animationType="none"
                onRequestClose={closeProfileMenu}
                statusBarTranslucent
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={closeProfileMenu}
                >
                    <Animated.View
                        style={[
                            styles.modalContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ scale: scaleAnim }],
                            },
                        ]}
                    >
                        <BlurView
                            intensity={100}
                            tint="light"
                            style={styles.blurContainer}
                        >
                            <View style={styles.menuContent}>
                                {/* Header du menu */}
                                <View style={styles.menuHeader}>
                                    <View style={styles.menuAvatar}>
                                        <LinearGradient
                                            colors={[Colors.secondary, Colors.secondaryLight]}
                                            style={styles.menuAvatarGradient}
                                        >
                                            <Text style={styles.menuAvatarText}>{getUserInitials()}</Text>
                                        </LinearGradient>
                                    </View>
                                    <View style={styles.menuUserInfo}>
                                        <Text style={styles.menuUserName}>{getUserDisplayName()}</Text>
                                        <Text style={styles.menuUserRole}>Utilisateur connecté</Text>
                                    </View>
                                </View>

                                {/* Séparateur */}
                                <View style={styles.separator} />

                                {/* Actions du menu */}
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => handleProfileAction('profile')}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.menuIconContainer, { backgroundColor: Colors.primary }]}>
                                        <Ionicons name="person" size={20} color={Colors.surface} />
                                    </View>
                                    <View style={styles.menuItemContent}>
                                        <Text style={styles.menuItemTitle}>Mon Profil</Text>
                                        <Text style={styles.menuItemSubtitle}>Voir et modifier mes informations</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => handleProfileAction('logout')}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.menuIconContainer, { backgroundColor: Colors.error }]}>
                                        <Ionicons name="log-out" size={20} color={Colors.surface} />
                                    </View>
                                    <View style={styles.menuItemContent}>
                                        <Text style={[styles.menuItemTitle, { color: Colors.error }]}>Déconnexion</Text>
                                        <Text style={styles.menuItemSubtitle}>Se déconnecter de l'application</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </BlurView>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        </LinearGradient>
    );
}

// =============================================================================
// 🎨 STYLES AVEC CHARTE GRAPHIQUE UNIFORME
// =============================================================================

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 60 = padding + gap

const styles = StyleSheet.create({
    // Container principal
    container: {
        flex: 1,
    },

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: Spacing.lg,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.primary,
    },

    loadingText: {
        ...Typography.body,
        color: Colors.surface,
        fontWeight: '500',
    },

    // 🎨 HEADER UNIFORME
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingTop: 60,
        paddingBottom: Spacing.xxxl,
    },

    menuButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.2),
        justifyContent: 'center',
        alignItems: 'center',
    },

    headerTitle: {
        ...Typography.h4,
        color: Colors.surface,
        flex: 1,
        textAlign: 'center',
    },

    // 🎨 PROFIL MODERNE UNIFORME
    profileButton: {
        // Pas de largeur fixe pour s'adapter au contenu
    },

    profileGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: StyleUtils.withOpacity(Colors.surface, 0.2),
        ...StyleUtils.getUniformShadow('low'),
    },

    avatarContainer: {
        position: 'relative',
    },

    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: StyleUtils.withOpacity(Colors.surface, 0.3),
    },

    avatarText: {
        ...Typography.caption,
        fontWeight: '700',
        color: Colors.surface,
    },

    onlineIndicator: {
        position: 'absolute',
        bottom: -1,
        right: -1,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.success,
        borderWidth: 2,
        borderColor: Colors.surface,
    },

    userInfo: {
        marginLeft: Spacing.sm,
        maxWidth: 100,
    },

    userName: {
        ...Typography.caption,
        fontWeight: '600',
        color: Colors.surface,
    },

    userStatus: {
        fontSize: 11,
        color: StyleUtils.withOpacity(Colors.surface, 0.8),
        marginTop: 1,
    },

    arrowContainer: {
        marginLeft: 6,
    },

    // 🎨 QUICK ACTIONS UNIFORMES
    quickActionsContainer: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xxxl,
    },

    quickActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },

    quickActionCard: {
        width: cardWidth,
        height: 140,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        ...StyleUtils.getUniformShadow('medium'),
    },

    quickActionGradient: {
        flex: 1,
        padding: Spacing.lg,
        justifyContent: 'space-between',
    },

    quickActionHeader: {
        alignItems: 'flex-start',
    },

    quickActionTitle: {
        ...Typography.body,
        color: Colors.surface,
        fontWeight: '600',
    },

    quickActionIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },

    // 🎨 ACTIVITY SECTION UNIFORME
    activitySection: {
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.95),
        marginHorizontal: Spacing.lg,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
    },

    activityHeader: {
        marginBottom: Spacing.lg,
    },

    activitySectionTitle: {
        ...Typography.h4,
        color: Colors.primary,
    },

    activityList: {
        gap: Spacing.md,
    },

    activityItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },

    activityTitle: {
        ...Typography.bodySmall,
        color: Colors.textPrimary,
        flex: 1,
    },

    activityBadge: {
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
        borderRadius: BorderRadius.lg,
        minWidth: 24,
        alignItems: 'center',
    },

    activityCount: {
        ...Typography.bodySmall,
        color: Colors.surface,
        fontWeight: '600',
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: Colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalContainer: {
        width: width * 0.85,
        maxWidth: 320,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        ...StyleUtils.getUniformShadow('high'),
    },

    blurContainer: {
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
    },

    menuContent: {
        padding: Spacing.lg,
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.9),
    },

    menuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },

    menuAvatar: {
        marginRight: Spacing.md,
    },

    menuAvatarGradient: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },

    menuAvatarText: {
        ...Typography.h4,
        fontWeight: '700',
        color: Colors.surface,
    },

    menuUserInfo: {
        flex: 1,
    },

    menuUserName: {
        ...Typography.h4,
        color: Colors.textPrimary,
    },

    menuUserRole: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        marginTop: 2,
    },

    separator: {
        height: 1,
        backgroundColor: StyleUtils.withOpacity(Colors.textPrimary, 0.1),
        marginBottom: Spacing.lg,
    },

    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: 4,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
    },

    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },

    menuItemContent: {
        flex: 1,
    },

    menuItemTitle: {
        ...Typography.body,
        fontWeight: '600',
        color: Colors.textPrimary,
    },

    menuItemSubtitle: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginTop: 2,
    },
});
