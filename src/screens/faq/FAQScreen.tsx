// FAQScreen.tsx - VERSION UNIFORME
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    TextInput,
    Alert,
    Animated,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

// 🎨 IMPORTS DE LA CHARTE UNIFORME
import { Colors, Gradients, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { StyleUtils } from '../../constants/styleUtils';

// Services
import { faqService, FAQCategory, FAQQuestion } from '../../services/faqService';

// Types (utilisation des types du service existant)
type Category = FAQCategory;
type Question = FAQQuestion;

// Activer LayoutAnimation sur Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQScreen: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

    const navigation = useNavigation();

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        filterCategories();
    }, [categories, searchQuery]);

    const loadCategories = async () => {
        try {
            setError(null);
            const response = await faqService.getAllQuestionsWithCategories();

            if (response.success) {
                setCategories(response.data);
            } else {
                setError(response.message || 'Erreur lors du chargement des catégories');
            }
        } catch (error: any) {
            console.error('Erreur lors du chargement des catégories:', error);
            setError('Erreur de connexion. Veuillez vérifier votre connexion internet.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadCategories();
        setRefreshing(false);
    };

    const filterCategories = () => {
        if (!searchQuery.trim()) {
            setFilteredCategories(categories);
            return;
        }

        const filtered = faqService.searchInAllQuestions(categories, searchQuery);
        setFilteredCategories(filtered);
    };

    const toggleCategory = (categoryId: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const toggleQuestion = (questionId: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        const newExpanded = new Set(expandedQuestions);
        if (newExpanded.has(questionId)) {
            newExpanded.delete(questionId);
        } else {
            newExpanded.add(questionId);
        }
        setExpandedQuestions(newExpanded);

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const clearSearch = () => {
        setSearchQuery('');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const renderQuestion = ({ item: question }: { item: Question }) => {
        const isExpanded = expandedQuestions.has(question.id);

        return (
            <View style={styles.questionContainer}>
                <TouchableOpacity
                    style={styles.questionHeader}
                    onPress={() => toggleQuestion(question.id)}
                    activeOpacity={0.7}
                >
                    <View style={styles.questionTextContainer}>
                        <Text style={styles.questionText}>{question.question}</Text>
                    </View>
                    <View style={[
                        styles.questionToggle,
                        isExpanded && styles.questionToggleExpanded
                    ]}>
                        <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color={isExpanded ? Colors.surface : Colors.textSecondary}
                        />
                    </View>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.answerContainer}>
                        <Text style={styles.answerText}>{question.reponse}</Text>
                    </View>
                )}
            </View>
        );
    };

    const renderCategory = ({ item: category }: { item: Category }) => {
        const isExpanded = expandedCategories.has(category.id);
        const questionCount = category.questions?.length || 0;

        return (
            <View style={styles.categoryContainer}>
                <TouchableOpacity
                    style={styles.categoryHeader}
                    onPress={() => toggleCategory(category.id)}
                    activeOpacity={0.7}
                >
                    {/* 🎨 GRADIENT SPÉCIAL FAQ (bleu différent) */}
                    <LinearGradient
                        colors={Gradients.faq}
                        style={styles.categoryGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <View style={styles.categoryContent}>
                            {/* 🎨 ICÔNE CATÉGORIE UNIFORME */}
                            <View style={styles.categoryIcon}>
                                <Ionicons name="help-circle" size={24} color={Colors.surface} />
                            </View>

                            <View style={styles.categoryInfo}>
                                <Text style={styles.categoryTitle}>{category.nom}</Text>
                                <Text style={styles.categorySubtitle}>
                                    {questionCount} question{questionCount !== 1 ? 's' : ''}
                                </Text>
                            </View>

                            {/* 🎨 TOGGLE UNIFORME */}
                            <View style={[
                                styles.categoryToggle,
                                isExpanded && styles.categoryToggleExpanded
                            ]}>
                                <Ionicons
                                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color={Colors.surface}
                                />
                            </View>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {isExpanded && category.questions && category.questions.length > 0 && (
                    <View style={styles.questionsContainer}>
                        <FlatList
                            data={category.questions}
                            renderItem={renderQuestion}
                            keyExtractor={(question) => question.id.toString()}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                )}

                {isExpanded && (!category.questions || category.questions.length === 0) && (
                    <View style={styles.emptyQuestionsContainer}>
                        <Ionicons name="help-circle-outline" size={32} color={Colors.textMuted} />
                        <Text style={styles.emptyText}>Aucune question disponible</Text>
                    </View>
                )}
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyStateIcon}>
                <Ionicons name="help-circle-outline" size={64} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>
                {searchQuery ? 'Aucun résultat trouvé' : 'Aucune FAQ disponible'}
            </Text>
            <Text style={styles.emptySubtitle}>
                {searchQuery
                    ? 'Essayez avec d\'autres mots-clés'
                    : 'Les questions fréquentes apparaîtront ici'
                }
            </Text>
            {searchQuery && (
                <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
                    <Text style={styles.clearButtonText}>Effacer la recherche</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.titleContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.surface} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>FAQ</Text>
                <View style={styles.placeholder} />
            </View>
        </View>
    );

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                {renderHeader()}
                <View style={styles.errorContainer}>
                    <View style={styles.errorIcon}>
                        <Ionicons name="alert-circle" size={64} color={Colors.error} />
                    </View>
                    <Text style={styles.errorTitle}>Erreur de chargement</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadCategories}>
                        <Text style={styles.retryButtonText}>Réessayer</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* 🎨 EN-TÊTE AVEC GRADIENT FAQ SPÉCIAL */}
            <LinearGradient
                colors={Gradients.faq}
                style={styles.headerGradient}
            >
                {renderHeader()}

                {/* 🎨 BARRE DE RECHERCHE UNIFORME */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBox}>
                        <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Rechercher dans la FAQ..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor={Colors.textMuted}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={clearSearch} style={styles.clearIcon}>
                                <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* 🎨 STATS FAQ UNIFORMES */}
                <View style={styles.faqStats}>
                    <View style={styles.faqStatItem}>
                        <Text style={styles.faqStatNumber}>{filteredCategories.length}</Text>
                        <Text style={styles.faqStatLabel}>Catégories</Text>
                    </View>
                    <View style={styles.faqStatDivider} />
                    <View style={styles.faqStatItem}>
                        <Text style={styles.faqStatNumber}>
                            {filteredCategories.reduce((total, cat) => total + (cat.questions?.length || 0), 0)}
                        </Text>
                        <Text style={styles.faqStatLabel}>Questions</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* 🎨 LISTE DES CATÉGORIES UNIFORME */}
            <FlatList
                style={styles.content}
                data={filteredCategories}
                renderItem={renderCategory}
                keyExtractor={(category) => category.id.toString()}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#4A90E2']}
                        tintColor="#4A90E2"
                    />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={filteredCategories.length === 0 ? styles.emptyContentContainer : styles.contentContainer}
                ListEmptyComponent={!isLoading ? renderEmptyState : null}
            />
        </SafeAreaView>
    );
};

// =============================================================================
// 🎨 STYLES AVEC CHARTE GRAPHIQUE UNIFORME
// =============================================================================

const styles = StyleSheet.create({
    // Container principal
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    // 🎨 HEADER SPÉCIAL FAQ
    headerGradient: {
        paddingBottom: Spacing.lg,
    },

    header: {
        paddingHorizontal: Spacing.lg,
        paddingTop: 10,
    },

    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.lg,
    },

    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.2),
        justifyContent: 'center',
        alignItems: 'center',
    },

    headerTitle: {
        ...Typography.h3,
        color: Colors.surface,
    },

    placeholder: {
        width: 40,
    },

    // 🎨 BARRE DE RECHERCHE UNIFORME
    searchContainer: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },

    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        height: 48,
        ...StyleUtils.getUniformShadow('low'),
    },

    searchIcon: {
        marginRight: Spacing.sm,
    },

    searchInput: {
        flex: 1,
        ...Typography.body,
        color: Colors.textPrimary,
    },

    clearIcon: {
        padding: 4,
    },

    // 🎨 STATS FAQ UNIFORMES
    faqStats: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.15),
        marginHorizontal: Spacing.lg,
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md,
    },

    faqStatItem: {
        alignItems: 'center',
        flex: 1,
    },

    faqStatNumber: {
        ...Typography.h4,
        color: Colors.surface,
        fontWeight: '700',
    },

    faqStatLabel: {
        ...Typography.caption,
        color: StyleUtils.withOpacity(Colors.surface, 0.8),
        marginTop: 2,
    },

    faqStatDivider: {
        width: 1,
        height: 30,
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.3),
    },

    // Contenu
    content: {
        flex: 1,
    },

    contentContainer: {
        padding: Spacing.lg,
    },

    emptyContentContainer: {
        flex: 1,
        padding: Spacing.lg,
    },

    // 🎨 CARTE CATÉGORIE UNIFORME
    categoryContainer: {
        marginBottom: Spacing.md,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.surface,
        ...StyleUtils.getUniformShadow('medium'),
        overflow: 'hidden',
    },

    categoryHeader: {
        overflow: 'hidden',
        borderRadius: BorderRadius.lg,
    },

    // 🎨 GRADIENT CATÉGORIE UNIFORME
    categoryGradient: {
        padding: Spacing.lg,
    },

    categoryContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    // 🎨 ICÔNE CATÉGORIE UNIFORME
    categoryIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.2),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },

    categoryInfo: {
        flex: 1,
    },

    categoryTitle: {
        ...Typography.h6,
        color: Colors.surface,
        marginBottom: 2,
    },

    categorySubtitle: {
        ...Typography.bodySmall,
        color: StyleUtils.withOpacity(Colors.surface, 0.8),
    },

    // 🎨 TOGGLE CATÉGORIE UNIFORME
    categoryToggle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.2),
        justifyContent: 'center',
        alignItems: 'center',
    },

    categoryToggleExpanded: {
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.3),
    },

    // Container des questions
    questionsContainer: {
        backgroundColor: Colors.surface,
    },

    // 🎨 QUESTION UNIFORME
    questionContainer: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },

    questionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
    },

    questionTextContainer: {
        flex: 1,
        marginRight: Spacing.md,
    },

    questionText: {
        ...Typography.body,
        fontWeight: '500',
        color: Colors.textPrimary,
        lineHeight: 22,
    },

    // 🎨 TOGGLE QUESTION UNIFORME
    questionToggle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.surfaceVariant,
        justifyContent: 'center',
        alignItems: 'center',
    },

    questionToggleExpanded: {
        backgroundColor: '#4A90E2', // Couleur FAQ spéciale
    },

    // 🎨 RÉPONSE UNIFORME
    answerContainer: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.lg,
        backgroundColor: Colors.surfaceVariant,
    },

    answerText: {
        ...Typography.body,
        color: Colors.textSecondary,
        lineHeight: 22,
    },

    // Questions vides
    emptyQuestionsContainer: {
        padding: Spacing.xl,
        alignItems: 'center',
        backgroundColor: Colors.surfaceVariant,
    },

    emptyText: {
        ...Typography.bodySmall,
        color: Colors.textMuted,
        fontStyle: 'italic',
        marginTop: Spacing.sm,
    },

    // 🎨 EMPTY STATE UNIFORME
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: Spacing.lg,
    },

    emptyStateIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.surfaceVariant,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },

    emptyTitle: {
        ...Typography.h6,
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },

    emptySubtitle: {
        ...Typography.body,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.lg,
    },

    clearButton: {
        backgroundColor: '#4A90E2', // Couleur FAQ spéciale
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
    },

    clearButtonText: {
        ...Typography.bodySmall,
        color: Colors.surface,
        fontWeight: '600',
    },

    // 🎨 ERROR STATE UNIFORME
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },

    errorIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: StyleUtils.withOpacity(Colors.error, 0.1),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },

    errorTitle: {
        ...Typography.h6,
        color: Colors.error,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },

    errorMessage: {
        ...Typography.body,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.lg,
    },

    retryButton: {
        backgroundColor: Colors.error,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
    },

    retryButtonText: {
        ...Typography.bodySmall,
        color: Colors.surface,
        fontWeight: '600',
    },
});

export default FAQScreen;
