import { apiClient, ApiResponse } from "./apiConfig";

export interface Service {
    id: string;
    nom: string;
    description?: string;
    status: 'ACTIVE' | 'INACTIVE';
    manager?: {
        id: string;
        nom: string;
        prenom: string;
        contact?: {
            email?: string;
            telephoneMobile?: string;
            telephoneInterne?: string;
        };
    };
    serviceParent?: {
        id: string;
        nom: string;
    };
    servicesEnfants?: Service[];
}

class ServiceService {
    async getAll(): Promise<ApiResponse<Service[]>> {
        try {
            const response = await apiClient.get('/api/admin/services');
            return {
                success: true,
                data: response.data.data,
            };
        } catch (error: any) {
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Erreur lors de la récupération des services',
            };
        }
    }

    async getById(id: string): Promise<ApiResponse<Service>> {
        try {
            const response = await apiClient.get(`/api/admin/services/${id}`);
            return {
                success: true,
                data: response.data.data,
            };
        } catch (error: any) {
            return {
                success: false,
                data: {} as Service,
                message: error.response?.data?.message || 'Erreur lors de la récupération du service',
            };
        }
    }
}

export const serviceService = new ServiceService();