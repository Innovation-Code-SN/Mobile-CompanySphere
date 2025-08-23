// src/navigations/types.ts - VERSION CORRIGÉE
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

// Types pour les onglets principaux du MainNavigator
export type MainTabParamList = {
    Dashboard: undefined;
    Employees: undefined;
    Services: undefined;
    Documents: undefined;
    FAQ: undefined;
    Teams: undefined;
    Meetings: undefined; 
    Profile: undefined;


};

// Types pour la navigation principale (AppNavigator)
export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
    MainTabs: undefined;
    Dashboard: undefined;
    Employees: undefined;
    Services: undefined;
    Documents: undefined;
    FAQ: undefined;
    Profile: undefined;
    ChangePassword: undefined;
    EmployeeDetail: { employee: any };
    ServiceDetail: { service: any };
    FolderDetail: { folder: any };
};

// Types pour les stacks individuels
export type DashboardStackParamList = {
    DashboardHome: undefined;
};

export type EmployeesStackParamList = {
    EmployeesHome: undefined;
};

export type ServicesStackParamList = {
    ServicesHome: undefined;
};

export type DocumentsStackParamList = {
    DocumentsHome: undefined;
};

export type FAQStackParamList = {
    FAQHome: undefined;
};


export type ProfileStackParamList = {
    ProfileHome: undefined;
    ChangePassword: undefined;
};

// 🔧 CORRECTION: Types pour le TeamsStack
export type TeamsStackParamList = {
    TeamsHome: undefined;
    TeamDetail: { teamId: string; teamName?: string };
};

// Types pour les props des écrans Teams
export type TeamsListScreenProps = {
    navigation: StackNavigationProp<TeamsStackParamList, 'TeamsHome'>;
    route: RouteProp<TeamsStackParamList, 'TeamsHome'>;
};

export type TeamDetailScreenProps = {
    navigation: StackNavigationProp<TeamsStackParamList, 'TeamDetail'>;
    route: RouteProp<TeamsStackParamList, 'TeamDetail'>;
};

export type MeetingsStackParamList = {
  MeetingsList: undefined;
  MeetingsCalendar: undefined;
};