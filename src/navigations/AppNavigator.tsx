// src/navigations/AppNavigator.tsx - VERSION CORRIGÉE SANS ERREURS TYPESCRIPT
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

// 🆕 AJOUTER LES IMPORTS MEETINGS
import MeetingsScreen from '../screens/meetings/MeetingsScreen';
import CalendarScreen from '@/screens/meetings/MeetingCalendarScreen';

// 🔧 CORRECTION DES TYPES
// Types pour les onglets principaux
export type MainTabParamList = {
    Dashboard: undefined;
    Employees: undefined;
    Services: undefined;
    Teams: undefined;
    Meetings: undefined; // 🆕 Ajouter Meetings
    Documents: undefined;
    FAQ: undefined;
    Profile: undefined;
};

// Types pour les stacks individuels
export type MeetingsStackParamList = {
    MeetingsList: undefined;
    MeetingsCalendar: undefined; // 🔧 Nom correct
};

// Types pour la navigation principale
export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
    Dashboard: undefined;
    Employees: undefined;
    Services: undefined;
    Teams: undefined;
    Meetings: undefined;
    FAQ: undefined;
    Documents: undefined;
    Profile: undefined;
    ChangePassword: undefined;
    EmployeeDetail: { employee: any };
    ServiceDetail: { service: any };
    FolderDetail: { folder: any };
    TeamsList: undefined;
    TeamDetail: { teamId: string; teamName?: string };
    // 🔧 Ajouter les routes du MeetingsStack
    MeetingsList: undefined;
    MeetingsCalendar: undefined;
};

// 🔧 CRÉER LES NAVIGATEURS AVEC LES BONS TYPES
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const MeetingsStackNavigator = createStackNavigator<MeetingsStackParamList>();

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
                headerShown: false,
                title: 'Équipes'
            }} />
            <Stack.Screen name="TeamDetail" component={TeamDetailScreen} />
        </Stack.Navigator>
    );
}

// 🔧 MEETINGS STACK AVEC LES BONS TYPES
function MeetingsStack() {
    console.log('🔧 MeetingsStack créé dans AppNavigator');
    return (
        <MeetingsStackNavigator.Navigator screenOptions={{ headerShown: false }}>
            <MeetingsStackNavigator.Screen 
                name="MeetingsList" 
                component={MeetingsScreen}
            />
            <MeetingsStackNavigator.Screen 
                name="MeetingsCalendar" 
                component={CalendarScreen}
            />
        </MeetingsStackNavigator.Navigator>
    );
}

// Navigation par onglets
function MainTabNavigator() {
    console.log('🔧 MainTabNavigator rendu dans AppNavigator');
    
    return (
        <Tab.Navigator
            initialRouteName="Dashboard"
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    console.log('🔍 Configuration icône pour:', route.name);

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
                        case 'Meetings':
                            console.log('✅ Icône Meetings configurée');
                            iconName = focused ? 'calendar' : 'calendar-outline';
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
                            console.log('⚠️ Route non reconnue:', route.name);
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
                component={TeamsStack}
                options={{ title: 'Équipes' }}
            />
            {/* 🔧 ONGLET MEETINGS SANS tabBarOnPress QUI CAUSE L'ERREUR */}
            <Tab.Screen
                name="Meetings"
                component={MeetingsStack}
                options={{ title: 'Réunions' }}
            />
            <Tab.Screen
                name="Documents"
                component={DocumentsScreen}
                options={{ title: 'Documents' }}
            />
            <Tab.Screen
                name="FAQ"
                component={FAQScreen}
                options={{ title: 'FAQ' }}
            />
            {/* <Tab.Screen
                name="Profile"
                component={ProfileStackNavigator}
                options={{ title: 'Profil' }}
            /> */}
        </Tab.Navigator>
    );
}

// Navigation principale
interface AppNavigatorProps {
    isAuthenticated: boolean;
}

export default function AppNavigator({ isAuthenticated }: AppNavigatorProps) {
    useEffect(() => {
        console.log('🖥️ AppNavigator rendu avec isAuthenticated:', isAuthenticated);
        console.log('🔀 Navigation vers:', isAuthenticated ? 'Main (avec Meetings)' : 'Auth');
    }, [isAuthenticated]);

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
            >
                {isAuthenticated ? (
                    <Stack.Screen
                        name="Main"
                        component={MainTabNavigator}
                        options={{
                            animationTypeForReplace: 'push',
                        }}
                    />
                ) : (
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
