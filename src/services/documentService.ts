import { apiClient, ApiResponse } from "./apiConfig";

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
    visibilite: 'PUBLIC' | 'SERVICES_SPECIFIQUES' | 'MANAGERS_SERVICES';
    serviceIds?: string[];
    createdAt: string;
    lastUpdatedAt: string;
}

class DocumentService {
    async getAllFolders(): Promise<ApiResponse<Folder[]>> {
        try {
            const response = await apiClient.get('/api/dossiers');
            return {
                success: true,
                data: response.data.data,
            };
        } catch (error: any) {
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Erreur lors de la récupération des dossiers',
            };
        }
    }

    async getAllDocuments(): Promise<ApiResponse<Document[]>> {
        try {
            const response = await apiClient.get('/api/documents');
            return {
                success: true,
                data: response.data.data,
            };
        } catch (error: any) {
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Erreur lors de la récupération des documents',
            };
        }
    }


    async downloadDocument(documentId: string): Promise<Blob> {
        try {
            console.log('⬇️ Téléchargement document ID:', documentId);
            const response = await apiClient.get(`/api/documents/${documentId}/download`, {
                responseType: 'blob',
            });
            return response.data;
        } catch (error: any) {
            console.log('❌ Erreur téléchargement document:', error);
            throw new Error(error.response?.data?.message || 'Erreur lors du téléchargement du document');
        }
    }

    // Optionnel: Méthode pour obtenir les documents d'un dossier spécifique
    async getDocumentsByFolder(folderId: string): Promise<ApiResponse<Document[]>> {
        try {
            console.log('📄 Récupération documents du dossier:', folderId);
            const response = await apiClient.get(`/api/dossiers/${folderId}/documents`);

            return {
                success: true,
                data: response.data.data || [],
            };
        } catch (error: any) {
            console.log('❌ Erreur récupération documents dossier:', error.response?.data?.message);
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Erreur lors de la récupération des documents du dossier',
            };
        }
    }

    // Méthode pour obtenir les détails d'un dossier avec ses sous-dossiers et documents
    async getFolderDetails(folderId: string): Promise<ApiResponse<Folder>> {
        try {
            console.log('📁 Récupération détails dossier:', folderId);
            const response = await apiClient.get(`/api/dossiers/${folderId}`);

            return {
                success: true,
                data: response.data.data,
            };
        } catch (error: any) {
            console.log('❌ Erreur récupération détails dossier:', error.response?.data?.message);
            return {
                success: false,
                data: {} as Folder,
                message: error.response?.data?.message || 'Erreur lors de la récupération des détails du dossier',
            };
        }
    }
}

export const documentService = new DocumentService();