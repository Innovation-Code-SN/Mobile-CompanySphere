// faqService.ts - Service pour gérer les APIs FAQ
import { apiClient, ApiResponse } from "./apiConfig";

export interface FAQQuestion {
    id: string;
    question: string;
    reponse: string;
    createdAt: string;
    lastUpdatedAt: string;
    categorieQuestion?: {
        id: string;
        nom: string;
    };
}

export interface FAQCategory {
    id: string;
    nom: string;
    description?: string;
    createdAt: string;
    lastUpdatedAt: string;
    questions?: FAQQuestion[];
}

class FAQService {
    // ===== CATÉGORIES =====

    async getAllCategories(): Promise<ApiResponse<FAQCategory[]>> {
        try {
            console.log('📚 Récupération de toutes les catégories FAQ...');
            const response = await apiClient.get('/api/categorie-questions');

            return {
                success: true,
                data: response.data.data || [],
            };
        } catch (error: any) {
            console.log('❌ Erreur récupération catégories FAQ:', error.response?.data?.message);
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Erreur lors de la récupération des catégories FAQ',
            };
        }
    }

    async getCategoryById(categoryId: string): Promise<ApiResponse<FAQCategory>> {
        try {
            console.log('📚 Récupération catégorie FAQ ID:', categoryId);
            const response = await apiClient.get(`/api/categorie-questions/${categoryId}`);

            return {
                success: true,
                data: response.data.data,
            };
        } catch (error: any) {
            console.log('❌ Erreur récupération catégorie FAQ:', error.response?.data?.message);
            return {
                success: false,
                data: {} as FAQCategory,
                message: error.response?.data?.message || 'Erreur lors de la récupération de la catégorie FAQ',
            };
        }
    }

    // ===== QUESTIONS =====

    async getQuestionsByCategory(categoryId: string): Promise<ApiResponse<FAQQuestion[]>> {
        try {
            console.log('❓ Récupération questions de la catégorie:', categoryId);
            const response = await apiClient.get(`/api/questions/categorie/${categoryId}`);

            return {
                success: true,
                data: response.data.data || [],
            };
        } catch (error: any) {
            console.log('❌ Erreur récupération questions:', error.response?.data?.message);
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Erreur lors de la récupération des questions',
            };
        }
    }

    async getQuestionById(questionId: string): Promise<ApiResponse<FAQQuestion>> {
        try {
            console.log('❓ Récupération question ID:', questionId);
            const response = await apiClient.get(`/api/questions/${questionId}`);

            return {
                success: true,
                data: response.data.data,
            };
        } catch (error: any) {
            console.log('❌ Erreur récupération question:', error.response?.data?.message);
            return {
                success: false,
                data: {} as FAQQuestion,
                message: error.response?.data?.message || 'Erreur lors de la récupération de la question',
            };
        }
    }

    // ===== RECHERCHE =====

    async searchQuestions(query: string): Promise<ApiResponse<FAQQuestion[]>> {
        try {
            console.log('🔍 Recherche dans les questions FAQ:', query);
            // Si votre API a un endpoint de recherche, utilisez-le
            // Sinon, cette méthode peut être implémentée côté client après avoir récupéré toutes les données
            const response = await apiClient.get(`/api/questions/search?q=${encodeURIComponent(query)}`);

            return {
                success: true,
                data: response.data.data || [],
            };
        } catch (error: any) {
            console.log('❌ Erreur recherche questions:', error.response?.data?.message);
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Erreur lors de la recherche',
            };
        }
    }

    // ===== MÉTHODES UTILITAIRES =====

    async getAllQuestionsWithCategories(): Promise<ApiResponse<FAQCategory[]>> {
        try {
            console.log('📚❓ Récupération complète FAQ (catégories + questions)...');

            // Récupérer toutes les catégories
            const categoriesResponse = await this.getAllCategories();
            if (!categoriesResponse.success) {
                return categoriesResponse;
            }

            // Pour chaque catégorie, récupérer ses questions
            const categoriesWithQuestions = await Promise.all(
                categoriesResponse.data.map(async (category) => {
                    const questionsResponse = await this.getQuestionsByCategory(category.id);
                    return {
                        ...category,
                        questions: questionsResponse.success ? questionsResponse.data : []
                    };
                })
            );

            return {
                success: true,
                data: categoriesWithQuestions,
            };
        } catch (error: any) {
            console.log('❌ Erreur récupération FAQ complète:', error);
            return {
                success: false,
                data: [],
                message: 'Erreur lors de la récupération de la FAQ complète',
            };
        }
    }

    // Méthode pour rechercher dans toutes les questions (côté client)
    searchInAllQuestions(categories: FAQCategory[], query: string): FAQCategory[] {
        if (!query.trim()) return categories;

        const searchTerm = query.toLowerCase();

        return categories.map(category => {
            // Filtrer les questions qui correspondent à la recherche
            const matchingQuestions = category.questions?.filter(question =>
                question.question.toLowerCase().includes(searchTerm) ||
                question.reponse.toLowerCase().includes(searchTerm)
            ) || [];

            // Garder la catégorie si son nom correspond ou si elle contient des questions correspondantes
            const categoryMatches = category.nom.toLowerCase().includes(searchTerm);

            if (categoryMatches || matchingQuestions.length > 0) {
                return {
                    ...category,
                    questions: categoryMatches ? category.questions : matchingQuestions
                };
            }
            return null;
        }).filter(Boolean) as FAQCategory[];
    }
}

export const faqService = new FAQService();