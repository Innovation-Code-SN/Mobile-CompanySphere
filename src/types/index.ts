export interface User {
    id: string;
    username: string;
    displayName: string;
    email: string;
    roles: string[];
    permissions: string[];
    employeId?: string;
    passwordChangeRequired?: boolean;
}

export interface Employee {
    id: string;
    matricule: string;
    nom: string;
    prenom: string;
    photo?: string;
    dateEntree: string;
    statut: EmployeeStatus;
    poste?: Position;
    service?: Service;
    contact: Contact;
    historiquePostes?: JobHistory[];
    linkResponseDtos?: EmployeeLink[];
}

export interface Contact {
    email?: string;
    telephoneMobile?: string;
    telephoneInterne?: string;
    adresseEnEntreprise?: string;
}

export interface Position {
    id: string;
    nom: string;
    description?: string;
}

export interface Service {
    id: string;
    nom: string;
    description?: string;
    status: ServiceStatus;
    manager?: {
        id: string;
        nom: string;
        prenom: string;
    };
    serviceParent?: {
        id: string;
        nom: string;
    };
    servicesEnfants?: Service[];
}

export interface JobHistory {
    id: string;
    nomPoste: string;
    dateDebut: string;
    dateFin?: string;
    raison?: string;
    createdAt: string;
    lastUpdatedAt: string;
}

export interface EmployeeLink {
    id: string;
    employeeId: string;
    label: string;
    url: string;
    type: string;
}

export interface Document {
    id: string;
    nom: string;
    path: string;
    size: number;
    contentType: string;
    tags: string[];
    createdAt: string;
    lastUpdatedAt: string;
    dossierParent?: {
        id: string;
        nom: string;
    };
}

export interface Folder {
    id: string;
    nom: string;
    parent?: {
        id: string;
        nom: string;
    };
    sousDossiers: Folder[];
    documents: Document[];
    visibilite: FolderVisibility;
    serviceIds?: string[];
    createdAt: string;
    lastUpdatedAt: string;
}

export interface Groupe {
    id: string;
    nom: string;
    description?: string;
    statut: 'ACTIF' | 'INACTIF' | 'SUSPENDU';
    dateCreation: string;
    nombreMembres: number;
    responsableId?: string;
    responsableNom?: string;
    responsableEmail?: string;
    membres: Membre[];
    couleur?: string;
}

export interface Membre {
    id: string;
    employeId: string;
    nom: string;
    prenom: string;
    email: string;
    poste?: string;
    role: 'CHEF' | 'MEMBRE';
    dateAjout: string;
    statut: 'ACTIF' | 'INACTIF';
}

export interface GroupeSimpleResponseDto {
    id: string;
    nom: string;
    nombreMembres: number;
    statut: string;
}


// Enums
export enum EmployeeStatus {
    ACTIF = 'ACTIF',
    INACTIF = 'INACTIF',
    SUSPENDU = 'SUSPENDU',
    PLUS_EN_POSTE = 'PLUS_EN_POSTE',
    EN_CONGE = 'EN_CONGE',
}

export enum ServiceStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export enum FolderVisibility {
    PUBLIC = 'PUBLIC',
    SERVICES_SPECIFIQUES = 'SERVICES_SPECIFIQUES',
    MANAGERS_SERVICES = 'MANAGERS_SERVICES',
}

// Navigation types - CORRIGÉS
export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
    MainTabs: undefined; // ← AJOUTÉ
    EmployeeDetail: { employeeId: string };
    ServiceDetail: { serviceId: string };
    DocumentViewer: { documentId: string };
    Profile: undefined;
    ChangePassword: undefined;
    FAQ: undefined; // ← AJOUTÉ
    FolderDetail: { folder: any }; // ← AJOUTÉ pour cohérence
};

export type MainTabParamList = {
    Dashboard: undefined;
    Employees: undefined;
    Services: undefined;
    Documents: undefined;
    FAQ: undefined; // ← REMPLACE Profile
};

export type AuthStackParamList = {
    Login: undefined;
    ForgotPassword: undefined;
};

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

// Form types
export interface LoginFormData {
    username: string;
    password: string;
}

export interface ChangePasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ContactFormData {
    email?: string;
    telephoneMobile?: string;
    telephoneInterne?: string;
    adresseEnEntreprise?: string;
}

// Utility types
export interface LoadingState {
    isLoading: boolean;
    error: string | null;
}

export interface SearchableState {
    searchQuery: string;
}

export interface SelectableState<T> {
    selectedItems: T[];
}

// Permission constants
export const PERMISSIONS = {
    // Employee permissions
    EMPLOYEE_LIST: 'EMPLOYEE_LIST',
    EMPLOYEE_READ: 'EMPLOYEE_READ',
    EMPLOYEE_CREATE: 'EMPLOYEE_CREATE',
    EMPLOYEE_UPDATE: 'EMPLOYEE_UPDATE',
    EMPLOYEE_DELETE: 'EMPLOYEE_DELETE',
    EMPLOYEE_MY_PROFILE: 'EMPLOYEE_MY_PROFILE',
    EMPLOYEE_UPDATE_PHOTO: 'EMPLOYEE_UPDATE_PHOTO',
    EMPLOYEE_UPDATE_CONTACT: 'EMPLOYEE_UPDATE_CONTACT',

    // Service permissions
    SERVICE_LIST: 'SERVICE_LIST',
    SERVICE_READ: 'SERVICE_READ',
    SERVICE_CREATE: 'SERVICE_CREATE',
    SERVICE_UPDATE: 'SERVICE_UPDATE',
    SERVICE_DELETE: 'SERVICE_DELETE',

    // Document permissions
    DOCUMENT_LIST: 'DOCUMENT_LIST',
    DOCUMENT_PREVIEW: 'DOCUMENT_PREVIEW',
    DOCUMENT_DOWNLOAD: 'DOCUMENT_DOWNLOAD',
    DOCUMENT_UPLOAD: 'DOCUMENT_UPLOAD',
    DOCUMENT_DELETE: 'DOCUMENT_DELETE',

    // Folder permissions
    FOLDER_LIST: 'FOLDER_LIST',
    FOLDER_CREATE: 'FOLDER_CREATE',
    FOLDER_UPDATE: 'FOLDER_UPDATE',
    FOLDER_DELETE: 'FOLDER_DELETE',
    FOLDER_ADD_DOCUMENT: 'FOLDER_ADD_DOCUMENT',

    // FAQ permissions - AJOUTÉES
    FAQ_READ: 'FAQ_READ',
    FAQ_CREATE: 'FAQ_CREATE',
    FAQ_UPDATE: 'FAQ_UPDATE',
    FAQ_DELETE: 'FAQ_DELETE',
    CATEGORY_CREATE: 'CATEGORY_CREATE',
    CATEGORY_UPDATE: 'CATEGORY_UPDATE',
    CATEGORY_DELETE: 'CATEGORY_DELETE',
    QUESTION_CREATE: 'QUESTION_CREATE',
    QUESTION_UPDATE: 'QUESTION_UPDATE',
    QUESTION_DELETE: 'QUESTION_DELETE',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];