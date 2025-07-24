// src/services/employeeService.ts - VERSION COMPLETE
import { apiClient, ApiResponse } from "./apiConfig";

export interface Employee {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  photo?: string;
  dateEntree: string;
  statut: 'ACTIF' | 'INACTIF' | 'SUSPENDU' | 'PLUS_EN_POSTE' | 'EN_CONGE';
  poste?: {
    id: string;
    nom: string;
    description?: string;
  };
  service?: {
    id: string;
    nom: string;
    description?: string;
  };
  contact: {
    email?: string;
    telephoneMobile?: string;
    telephoneInterne?: string;
    adresseEnEntreprise?: string;
  };
  historiquePostes?: any[];
  linkResponseDtos?: any[];
}

class EmployeeService {

  // 📋 MÉTHODES EXISTANTES

  async getAll(): Promise<ApiResponse<Employee[]>> {
    try {
      const response = await apiClient.get('/api/admin/employes');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Erreur lors de la récupération des employés',
      };
    }
  }

  async getById(id: string): Promise<ApiResponse<Employee>> {
    try {
      const response = await apiClient.get(`/api/admin/employes/${id}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as Employee,
        message: error.response?.data?.message || 'Erreur lors de la récupération de l\'employé',
      };
    }
  }

  async getMyProfile(): Promise<ApiResponse<Employee>> {
    try {
      console.log('🔄 Récupération du profil utilisateur...');
      const response = await apiClient.get('/api/profile/me');

      console.log('✅ Profil récupéré:', response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('❌ Erreur récupération profil:', error);
      return {
        success: false,
        data: {} as Employee,
        message: error.response?.data?.message || 'Erreur lors de la récupération du profil',
      };
    }
  }

  async updateContactInfo(id: string, contactData: any): Promise<ApiResponse<Employee>> {
    try {
      console.log('📝 Mise à jour des contacts pour l\'employé:', id, contactData);
      const response = await apiClient.put(`/api/profile/${id}/contact`, contactData);

      console.log('✅ Contacts mis à jour:', response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('❌ Erreur mise à jour contacts:', error);
      return {
        success: false,
        data: {} as Employee,
        message: error.response?.data?.message || 'Erreur lors de la mise à jour',
      };
    }
  }

  async getByService(serviceId: string): Promise<ApiResponse<Employee[]>> {
    try {
      console.log('👥 Récupération employés du service:', serviceId);
      const response = await apiClient.get(`/api/admin/employes/service/${serviceId}`);

      return {
        success: true,
        data: response.data.data || [],
      };
    } catch (error: any) {
      console.log('❌ Erreur récupération employés service:', error.response?.data?.message);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Erreur lors de la récupération des employés du service',
      };
    }
  }

  // 📸 NOUVELLES MÉTHODES POUR LA GESTION DES PHOTOS

  /**
   * Met à jour la photo de profil d'un employé
   * @param employeeId - ID de l'employé
   * @param formData - FormData contenant la nouvelle photo
   */
  async updateProfilePhoto(employeeId: string, formData: FormData): Promise<ApiResponse<{
    photoPath: string;
    photoUrl: string | null;
    message: string;
  }>> {
    try {
      console.log(`📤 Mise à jour photo employé ID: ${employeeId}`);

      // Utiliser directement apiClient qui gère déjà les headers d'authentification
      const response = await apiClient.put(`/api/profile/${employeeId}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Photo mise à jour avec succès:', response.data);

      return {
        success: true,
        data: {
          photoPath: response.data.photoPath,
          photoUrl: this.getEmployeePhotoUrl(response.data.photoPath),
          message: response.data.message || 'Photo mise à jour avec succès'
        },
        message: 'Photo mise à jour avec succès'
      };

    } catch (error: any) {
      console.error('❌ Erreur mise à jour photo:', error);

      let errorMessage = 'Erreur lors de la mise à jour de la photo';

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        data: {
          photoPath: '',
          photoUrl: null,
          message: errorMessage
        },
        message: errorMessage
      };
    }
  }

  /**
   * Supprime la photo de profil d'un employé
   * @param employeeId - ID de l'employé
   */
  async removeProfilePhoto(employeeId: string): Promise<ApiResponse<any>> {
    try {
      console.log(`🗑️ Suppression photo employé ID: ${employeeId}`);

      const response = await apiClient.delete(`/api/profile/${employeeId}/photo`);

      console.log('✅ Photo supprimée avec succès:', response.data);

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Photo supprimée avec succès'
      };

    } catch (error: any) {
      console.error('❌ Erreur suppression photo:', error);

      let errorMessage = 'Erreur lors de la suppression de la photo';

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        data: null,
        message: errorMessage
      };
    }
  }

  /**
   * Construit l'URL complète d'une photo d'employé
   * @param photoPath - Chemin ou nom de fichier de la photo
   * @returns URL complète de la photo ou null
   */
  getEmployeePhotoUrl(photoPath: string | null | undefined): string | null {
    if (!photoPath) {
      return null;
    }

    // Si c'est déjà une URL complète, la retourner telle quelle
    if (photoPath.startsWith('http')) {
      return photoPath;
    }

    // Construire l'URL à partir du nom de fichier
    // Utiliser l'endpoint défini dans le contrôleur (/api/profile/photos/{filename})
    const baseUrl = apiClient.defaults.baseURL || process.env.EXPO_PUBLIC_API_URL || '';
    return `${baseUrl}/api/profile/photos/${photoPath}`;
  }

  /**
   * Précharge une photo d'employé (utile pour vérifier si elle existe)
   * @param photoPath - Chemin de la photo
   */
  async preloadPhoto(photoPath: string): Promise<boolean> {
    try {
      if (!photoPath) return false;

      const photoUrl = this.getEmployeePhotoUrl(photoPath);
      if (!photoUrl) return false;

      // Faire une requête HEAD pour vérifier l'existence sans télécharger
      await apiClient.head(`/api/profile/photos/${photoPath}`);
      return true;
    } catch (error) {
      console.warn('⚠️ Photo non disponible:', photoPath);
      return false;
    }
  }

  /**
   * Valide un fichier photo avant upload
   * @param file - Fichier à valider
   */
  validatePhotoFile(file: any): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: 'Aucun fichier sélectionné' };
    }

    // Vérifier le type de fichier
    if (!file.type || !file.type.startsWith('image/')) {
      return { isValid: false, error: 'Le fichier doit être une image' };
    }

    // Vérifier la taille (limite à 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size && file.size > maxSize) {
      return { isValid: false, error: 'La taille de l\'image ne doit pas dépasser 5MB' };
    }

    // Types d'images acceptés
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Format non supporté. Utilisez JPG, PNG ou WebP'
      };
    }

    return { isValid: true };
  }

  /**
   * Crée un FormData pour l'upload de photo
   * @param photoUri - URI local de la photo (React Native)
   */
  createPhotoFormData(photoUri: string): FormData {
    const formData = new FormData();

    // Extraire le nom de fichier et l'extension de l'URI
    const uriParts = photoUri.split('/');
    const fileName = uriParts[uriParts.length - 1] || 'profile_photo.jpg';

    // Déterminer le type MIME
    let mimeType = 'image/jpeg';
    if (fileName.toLowerCase().includes('.png')) {
      mimeType = 'image/png';
    } else if (fileName.toLowerCase().includes('.webp')) {
      mimeType = 'image/webp';
    }

    formData.append('photo', {
      uri: photoUri,
      type: mimeType,
      name: fileName,
    } as any);

    return formData;
  }
}

export const employeeService = new EmployeeService();