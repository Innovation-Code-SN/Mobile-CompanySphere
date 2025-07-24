// src/services/groupeService.ts - SERVICE COMPLET CORRIGÉ
import { apiClient, ApiResponse } from "./apiConfig";

// Interface Contact (Value Object)
export interface Contact {
    email?: string;
    telephoneMobile?: string;
    telephoneInterne?: string;
    adresseEnEntreprise?: string;
}

// Interface PosteResponseDto
export interface PosteResponseDto {
    id: number;
    nom: string;
    description?: string;
}

// Interface ServiceResponseSimpleDto
export interface ServiceResponseSimpleDto {
    id: number;
    nom: string;
}

export interface Membre {
    id: number;
    matricule: string;
    nom: string;
    prenom: string;
    photo?: string;
    dateEntree?: string;
    poste?: string; // Simplifié pour MemberCard
    contact?: Contact;
    email?: string; // Propriété directe pour faciliter l'usage
    statut: string;
    role?: 'CHEF' | 'MEMBRE'; // Propriété spécifique aux équipes
    dateAjout?: string; // Date d'ajout à l'équipe
}


// Interface EmployeResponseDto (membre de l'équipe)
export interface EmployeResponseDto {
    id: number;
    matricule: string;
    nom: string;
    prenom: string;
    photo?: string;
    dateEntree: string; // LocalDate converti en string
    poste?: PosteResponseDto;
    contact?: Contact;
    statut: 'ACTIF' | 'INACTIF' | 'SUSPENDU' | 'PLUS_EN_POSTE' | 'EN_CONGE';
    service?: ServiceResponseSimpleDto;
    createdAt: string; // LocalDateTime converti en string
    lastUpdatedAt: string;
}

// ✅ Interface pour la liste simple (GET /api/groupes)
export interface GroupeSimpleResponseDto {
    id: number;
    nom: string;
    description?: string;
    statut: 'ACTIF' | 'INACTIF' | 'SUSPENDU';
    responsableNom?: string; // ✅ String direct du backend
    nombreMembres: number;   // ✅ Calculé côté backend
}

// ✅ Interface pour les détails complets (GET /api/groupes/{id})
export interface GroupeDetailResponseDto {
    id: number;
    nom: string;
    description?: string;
    statut: 'ACTIF' | 'INACTIF' | 'SUSPENDU';
    responsable?: EmployeResponseDto; // ✅ Objet employé complet
    membres: EmployeResponseDto[];    // ✅ Array d'employés complets
    createdAt: string;
    lastUpdatedAt: string;
}

// ✅ Interface unifiée pour l'usage dans l'app (combine les deux)
export interface Groupe {
    id: number;
    nom: string;
    description?: string;
    statut: 'ACTIF' | 'INACTIF' | 'SUSPENDU';

    // Pour la liste simple
    responsableNom?: string;
    nombreMembres: number;

    // Pour les détails complets (optionnels)
    responsable?: EmployeResponseDto;
    membres?: EmployeResponseDto[];
    createdAt?: string;
    lastUpdatedAt?: string;

    // Propriétés calculées côté frontend
    responsableEmail?: string;
    couleur?: string;
    dateCreation?: string; // Alias pour createdAt
}

class GroupeService {
    async getAll(): Promise<ApiResponse<Groupe[]>> {
        try {
            console.log('👥 Récupération de toutes les équipes (liste simple)...');
            const response = await apiClient.get('/api/groupes');

            // ✅ TRANSFORMATION : Les données viennent déjà avec responsableNom et nombreMembres
            const groupes: Groupe[] = (response.data.data || []).map((groupe: GroupeSimpleResponseDto) => ({
                id: groupe.id,
                nom: groupe.nom,
                description: groupe.description,
                statut: groupe.statut,
                responsableNom: groupe.responsableNom, // ✅ Déjà fourni par l'API
                nombreMembres: groupe.nombreMembres,   // ✅ Déjà calculé par l'API
                // Les propriétés détaillées ne sont pas disponibles dans la liste
                membres: [], // Vide pour la liste
            }));

            console.log('✅ Groupes récupérés (liste):', groupes.length);

            return {
                success: true,
                data: groupes,
            };
        } catch (error: any) {
            console.log('❌ Erreur récupération équipes:', error.response?.data?.message);
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Erreur lors de la récupération des équipes',
            };
        }
    }

    async getById(id: string): Promise<ApiResponse<Groupe>> {
        try {
            console.log('👥 Récupération équipe détaillée ID:', id);
            const response = await apiClient.get(`/api/groupes/${id}`);

            const apiData: GroupeDetailResponseDto = response.data.data;

            // ✅ TRANSFORMATION : Convertir les détails complets vers l'interface unifiée
            const groupe: Groupe = {
                id: apiData.id,
                nom: apiData.nom,
                description: apiData.description,
                statut: apiData.statut,

                // Calculer à partir des objets complets
                responsableNom: apiData.responsable ?
                    `${apiData.responsable.prenom} ${apiData.responsable.nom}` : undefined,
                nombreMembres: apiData.membres?.length || 0,
                responsableEmail: apiData.responsable?.contact?.email,

                // Objets complets pour les détails
                responsable: apiData.responsable,
                membres: apiData.membres || [],
                createdAt: apiData.createdAt,
                lastUpdatedAt: apiData.lastUpdatedAt,
                dateCreation: apiData.createdAt, // Alias
            };

            console.log('🎯 Groupe détaillé transformé:', {
                id: groupe.id,
                nom: groupe.nom,
                nombreMembres: groupe.nombreMembres,
                responsableNom: groupe.responsableNom,
                responsableEmail: groupe.responsableEmail,
                membresCount: groupe.membres?.length,
                dateCreation: groupe.dateCreation,
                premierMembre: groupe.membres?.[0] ? {
                    nom: groupe.membres[0].nom,
                    prenom: groupe.membres[0].prenom,
                    email: groupe.membres[0].contact?.email,
                    poste: groupe.membres[0].poste?.nom,
                    matricule: groupe.membres[0].matricule
                } : null
            });

            return {
                success: true,
                data: groupe,
            };
        } catch (error: any) {
            console.log('❌ Erreur récupération équipe:', error.response?.data?.message);
            return {
                success: false,
                data: {} as Groupe,
                message: error.response?.data?.message || 'Erreur lors de la récupération de l\'équipe',
            };
        }
    }

    async getByEmploye(employeId: string): Promise<ApiResponse<GroupeSimpleResponseDto[]>> {
        try {
            console.log('👤 Récupération équipes employé ID:', employeId);
            const response = await apiClient.get(`/api/groupes/employe/${employeId}`);

            return {
                success: true,
                data: response.data.data || [],
            };
        } catch (error: any) {
            console.log('❌ Erreur récupération équipes employé:', error.response?.data?.message);
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Erreur lors de la récupération des équipes de l\'employé',
            };
        }
    }

    async getByResponsable(responsableId: string): Promise<ApiResponse<Groupe[]>> {
        try {
            console.log('👤 Récupération équipes responsable ID:', responsableId);
            const response = await apiClient.get(`/api/groupes/responsable/${responsableId}`);

            // Note: Vérifier si cet endpoint retourne des détails complets ou simples
            const groupes = (response.data.data || []).map((groupe: any) => ({
                ...groupe,
                nombreMembres: groupe.membres?.length || groupe.nombreMembres || 0,
                responsableNom: groupe.responsable ?
                    `${groupe.responsable.prenom} ${groupe.responsable.nom}` : groupe.responsableNom,
                responsableEmail: groupe.responsable?.contact?.email,
                dateCreation: groupe.createdAt,
            }));

            return {
                success: true,
                data: groupes,
            };
        } catch (error: any) {
            console.log('❌ Erreur récupération équipes responsable:', error.response?.data?.message);
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Erreur lors de la récupération des équipes du responsable',
            };
        }
    }
}

export const groupeService = new GroupeService();