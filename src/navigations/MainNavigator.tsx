// src/navigations/MainNavigator.tsx - VERSION CORRIGÉE
import React from 'react';
import { Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Theme } from '../constants/theme';

// Écrans existants
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import EmployeesScreen from '../screens/employees/EmployeesScreen';
import ServicesScreen from '../screens/services/ServicesScreen';
import DocumentsScreen from '../screens/documents/DocumentsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import FAQScreen from '../screens/faq/FAQScreen';

// 🔧 CORRECTION: Import des écrans Teams
import TeamsListScreen from '../screens/teams/TeamsListScreen';
import { TeamDetailScreen } from '../screens/teams/TeamDetailScreen';

// Header
import { Header } from '../components/ui/Header';

// Types
import { MainTabParamList, ProfileStackParamList, TeamsStackParamList } from './types';
import { useAuth } from '@/context/AuthContext';
import ChangePasswordScreen from '@/screens/profile/ChangePasswordScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
// 🔧 CORRECTION: Stack typé pour Teams
const TeamsStackNavigator = createStackNavigator<TeamsStackParamList>();
const Stack = createStackNavigator();

// Stack navigators existants
const DashboardStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="DashboardHome" component={DashboardScreen} />
    </Stack.Navigator>
);

const EmployeesStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="EmployeesHome" component={EmployeesScreen} />
    </Stack.Navigator>
);

const ServicesStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ServicesHome" component={ServicesScreen} />
    </Stack.Navigator>
);

const DocumentsStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="DocumentsHome" component={DocumentsScreen} />
    </Stack.Navigator>
);

// 🔧 CORRECTION: TeamsStack avec le bon navigateur typé
const TeamsStack = () => (
    <TeamsStackNavigator.Navigator screenOptions={{ headerShown: false }}>
        {/* 🔧 Écran principal des équipes */}
        <TeamsStackNavigator.Screen
            name="TeamsHome"
            component={TeamsListScreen}
        />

        {/* 🔧 Écran de détail d'équipe avec header personnalisé */}
        <TeamsStackNavigator.Screen
            name="TeamDetail"
            component={TeamDetailScreen}
            options={({ route }) => ({
                // 🔧 Accès sécurisé aux paramètres avec le bon type
                title: route.params?.teamName || 'Détails de l\'équipe',
                headerShown: true,
                headerStyle: {
                    backgroundColor: Theme.Colors.primary
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold'
                },
            })}
        />
    </TeamsStackNavigator.Navigator>
);

const ProfileStackNavigator = createStackNavigator<ProfileStackParamList>();

// Créez le ProfileStack
const ProfileStack = () => (
    <ProfileStackNavigator.Navigator screenOptions={{ headerShown: false }}>
        <ProfileStackNavigator.Screen
            name="ProfileHome"
            component={ProfileScreen}
        />
        <ProfileStackNavigator.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
        />
    </ProfileStackNavigator.Navigator>
);

const FAQStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="FAQHome" component={FAQScreen} />
    </Stack.Navigator>
);


export const MainNavigator: React.FC = () => {
    const { logout } = useAuth();

    const handleLogout = async () => {
        try {
            console.log('🚪 === DÉCONNEXION DEPUIS MAINNAVIGATOR ===');
            await logout();
            console.log('✅ Déconnexion via contexte terminée');
        } catch (error) {
            console.error('❌ Erreur déconnexion MainNavigator:', error);
        }
    };

    return (
        <Tab.Navigator
            screenOptions={({ route, navigation }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    switch (route.name) {
                        case 'Dashboard':
                            iconName = focused ? 'grid' : 'grid-outline';
                            break;
                        case 'Employees':
                            iconName = focused ? 'people' : 'people-outline';
                            break;
                        case 'Services':
                            iconName = focused ? 'business' : 'business-outline';
                            break;
                        // 🆕 Icône pour les équipes
                        case 'Teams':
                            iconName = focused ? 'people-circle' : 'people-circle-outline';
                            break;
                        case 'Documents':
                            iconName = focused ? 'document-text' : 'document-text-outline';
                            break;
                        case 'FAQ':
                            iconName = focused ? 'help-circle' : 'help-circle-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        default:
                            iconName = 'help-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: Theme.Colors.primary,
                tabBarInactiveTintColor: Theme.Colors.textMuted,
                tabBarStyle: {
                    backgroundColor: Theme.Colors.surface,
                    borderTopColor: Theme.Colors.border,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                header: () => {
                    const titles: { [key: string]: string } = {
                        Dashboard: 'Tableau de bord',
                        Employees: 'Employés',
                        Services: 'Services',
                        Teams: 'Équipes',
                        Documents: 'Documents',
                        FAQ: 'Questions fréquentes',
                        Profile: 'Mon Profil',

                    };

                    return (
                        <Header
                            title={titles[route.name] || route.name}
                            subtitle="IC Company Sphere"
                            rightIcon="person"
                            variant="gradient"
                            onRightPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

                                Alert.alert(
                                    'Menu Profil',
                                    'Choisissez une action',
                                    [
                                        {
                                            text: 'Voir le profil',
                                            onPress: () => {
                                                console.log('Navigation vers profil');
                                            },
                                        },
                                        {
                                            text: 'Déconnexion',
                                            onPress: () => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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
                                                            onPress: () => {
                                                                handleLogout();
                                                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                                            },
                                                        },
                                                    ]
                                                );
                                            },
                                            style: 'destructive',
                                        },
                                        {
                                            text: 'Annuler',
                                            style: 'cancel',
                                        },
                                    ]
                                );
                            }}
                        />
                    );
                },
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardStack}
                options={{ title: 'Accueil' }}
            />
            <Tab.Screen
                name="Employees"
                component={EmployeesStack}
                options={{ title: 'Employés' }}
            />
            <Tab.Screen
                name="Services"
                component={ServicesStack}
                options={{ title: 'Services' }}
            />
            {/* 🆕 Nouvel onglet Teams */}
            <Tab.Screen
                name="Teams"
                component={TeamsStack}
                options={{ title: 'Équipes' }}
            />
            <Tab.Screen
                name="Documents"
                component={DocumentsStack}
                options={{ title: 'Documents' }}
            />
            <Tab.Screen
                name="FAQ"
                component={FAQStack}
                options={{ title: 'FAQ' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStack}
                options={{ title: 'Profil' }}
            />
        </Tab.Navigator>
    );
};