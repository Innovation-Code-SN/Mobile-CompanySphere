// src/navigations/AppNavigator.tsx - VERSION CORRIGÉE
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import des écrans
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import EmployeesScreen from '../screens/employees/EmployeesScreen';
import ServicesScreen from '../screens/services/ServicesScreen';
import DocumentsScreen from '../screens/documents/DocumentsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import FAQScreen from '../screens/faq/FAQScreen';

import { AuthNavigator } from './AuthNavigator';
import TeamsListScreen from '@/screens/teams/TeamsListScreen';
import { TeamDetailScreen } from '@/screens/teams/TeamDetailScreen';
import { ProfileStackNavigator } from './ProfileStackNavigator';


// Types de navigation
export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
    Dashboard: undefined;
    Employees: undefined;
    Services: undefined;
    Teams: undefined; // 🆕 Ajout du type Teams
    FAQ: undefined;
    Documents: undefined;
    Profile: undefined;
    ChangePassword: undefined;
    EmployeeDetail: { employee: any };
    ServiceDetail: { service: any };
    FolderDetail: { folder: any };
    TeamsList: undefined;
    TeamDetail: { teamId: string; teamName?: string };
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Couleurs du thème
const Theme = {
    Colors: {
        primary: '#1E88E5',
        secondary: '#FF6347',
        surface: '#FFFFFF',
        background: '#F5F5F5',
        text: '#333333',
        textMuted: '#666666',
        border: '#E0E0E0',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
    },
};

function TeamsStack() {
    return (
        <Stack.Navigator initialRouteName="TeamsList">
            <Stack.Screen name="TeamsList" component={TeamsListScreen} options={{
                headerShown: false, // Masque complètement le header
                title: 'Équipes' // Ou changez le titre si vous gardez le header
            }} />
            <Stack.Screen name="TeamDetail" component={TeamDetailScreen} />
        </Stack.Navigator>
    );
}

// Navigation par onglets
function MainTabNavigator() {
    return (
        <Tab.Navigator
            initialRouteName="Dashboard"
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: any;

                    switch (route.name) {
                        case 'Dashboard':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'Employees':
                            iconName = focused ? 'people' : 'people-outline';
                            break;
                        case 'Services':
                            iconName = focused ? 'business' : 'business-outline';
                            break;
                        case 'Teams':
                            iconName = focused ? 'people-circle' : 'people-circle-outline';
                            break;
                        case 'Documents':
                            iconName = focused ? 'document-text' : 'document-text-outline';
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
                headerShown: false,
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ title: 'Accueil' }}
            />
            <Tab.Screen
                name="Employees"
                component={EmployeesScreen}
                options={{ title: 'Employés' }}
            />
            <Tab.Screen
                name="Services"
                component={ServicesScreen}
                options={{ title: 'Services' }}
            />
            <Tab.Screen
                name="Teams"
                component={TeamsStack} // 🆕 Utilisation de TeamsStack
                options={{ title: 'Équipes', headerShown: false }}
            />
            <Tab.Screen
                name="Documents"
                component={DocumentsScreen}
                options={{ title: 'Documents' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStackNavigator}
                options={{ title: 'Profil' }}
            />

            <Tab.Screen
                name="FAQ"
                component={FAQScreen}
                options={{ title: 'FAQ' }}
            />
        </Tab.Navigator>
    );
}

// Navigation principale - NOUVELLE INTERFACE
interface AppNavigatorProps {
    isAuthenticated: boolean; // ✅ Changé de initialAuthenticated à isAuthenticated
}

export default function AppNavigator({ isAuthenticated }: AppNavigatorProps) {

    // ✅ Log pour débogage
    useEffect(() => {
        console.log('🖥️ AppNavigator rendu avec isAuthenticated:', isAuthenticated);
        console.log('🔀 Navigation vers:', isAuthenticated ? 'Main' : 'Auth');
    }, [isAuthenticated]);

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    // ✅ IMPORTANT : Réinitialiser la pile lors du changement d'état
                }}
            >
                {isAuthenticated ? (
                    // ✅ Utilisateur connecté : Afficher l'app principale
                    <Stack.Screen
                        name="Main"
                        component={MainTabNavigator}
                        options={{
                            animationTypeForReplace: 'push',
                        }}
                    />
                ) : (
                    // ✅ Utilisateur non connecté : Afficher l'écran de connexion
                    <Stack.Screen
                        name="Auth"
                        component={AuthNavigator}
                        options={{
                            animationTypeForReplace: 'pop',
                        }}
                    />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}