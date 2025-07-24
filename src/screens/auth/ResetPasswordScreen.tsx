// screens/auth/ResetPasswordScreen.tsx - VERSION UNIFORME AVEC LOGO IMAGE ET ORANGE
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// 🎨 IMPORTS DE LA CHARTE UNIFORME
import { Colors, Gradients, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { StyleUtils } from '../../constants/styleUtils';

// Services
import { passwordResetService } from '../../services/passwordResetService';

export default function ResetPasswordScreen({ navigation, route }: any) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
    const [isPasswordReset, setIsPasswordReset] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));

    const { token } = route.params || {};

    useEffect(() => {
        // Animation d'entrée
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();

        // Vérifier la validité du token si fourni
        if (token) {
            verifyToken();
        } else {
            setIsTokenValid(false);
        }
    }, [token]);

    const verifyToken = async () => {
        try {
            const response = await passwordResetService.verifyResetToken(token);
            setIsTokenValid(response.data || false);

            if (!response.data) {
                Alert.alert(
                    'Token invalide',
                    'Ce lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.',
                    [
                        {
                            text: 'Retour à la connexion',
                            onPress: () => navigation.navigate('Login'),
                        },
                    ]
                );
            }
        } catch (error) {
            console.error('Erreur vérification token:', error);
            setIsTokenValid(false);
        }
    };

    const validatePasswords = (): { isValid: boolean; message: string } => {
        if (!newPassword.trim()) {
            return { isValid: false, message: 'Veuillez saisir un nouveau mot de passe' };
        }

        if (!confirmPassword.trim()) {
            return { isValid: false, message: 'Veuillez confirmer le mot de passe' };
        }

        if (newPassword !== confirmPassword) {
            return { isValid: false, message: 'Les mots de passe ne correspondent pas' };
        }

        const passwordValidation = passwordResetService.validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return passwordValidation;
        }

        return { isValid: true, message: 'Mots de passe valides' };
    };

    const handleResetPassword = async () => {
        const validation = validatePasswords();
        if (!validation.isValid) {
            Alert.alert('Erreur', validation.message);
            return;
        }

        setIsLoading(true);

        try {
            const response = await passwordResetService.resetPassword(token, newPassword);

            if (response.success) {
                setIsPasswordReset(true);

                setTimeout(() => {
                    Alert.alert(
                        'Succès',
                        'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.',
                        [
                            {
                                text: 'Se connecter',
                                onPress: () => navigation.navigate('Login'),
                            },
                        ]
                    );
                }, 1500);
            } else {
                Alert.alert('Erreur', response.message);
            }
        } catch (error) {
            Alert.alert('Erreur', 'Une erreur inattendue s\'est produite');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigation.navigate('Login');
    };

    // Affichage de chargement pendant la vérification du token
    if (isTokenValid === null) {
        return (
            <LinearGradient colors={Gradients.primary} style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Vérification du lien...</Text>
                </View>
            </LinearGradient>
        );
    }

    // Affichage si le token est invalide
    if (!isTokenValid) {
        return (
            <LinearGradient colors={Gradients.primary} style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="warning-outline" size={80} color={Colors.warning} />
                    <Text style={styles.errorTitle}>Lien invalide</Text>
                    <Text style={styles.errorText}>
                        Ce lien de réinitialisation est invalide ou a expiré.
                    </Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBackToLogin}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.backButtonText}>Retour à la connexion</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient
                colors={Gradients.primary}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View
                        style={[
                            styles.content,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        {/* Header avec navigation */}
                        <View style={styles.header}>
                            <TouchableOpacity
                                style={styles.headerBackButton}
                                onPress={handleBackToLogin}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="arrow-back"
                                    size={24}
                                    color={Colors.surface}
                                />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Nouveau mot de passe</Text>
                            <View style={styles.headerSpacer} />
                        </View>

                        {/* 🎨 LOGO IC COMPANY SPHERE AVEC IMAGE ET ORANGE */}
                        <View style={styles.logoContainer}>
                            <View style={styles.logoImageContainer}>
                                {/* 🖼️ IMAGE DU LOGO */}
                                <Image
                                    source={require('../../../assets/logo.jpg')} // Chemin correct depuis src/screens/auth/
                                    style={styles.logoImage}
                                    resizeMode="contain"
                                />
                                {/* 🔥 ACCENT ORANGE */}
                                <View style={styles.logoAccent}>
                                    <Ionicons name="shield-checkmark" size={16} color={Colors.surface} />
                                </View>
                            </View>

                            {/* 🔥 LIGNE DÉCORATIVE ORANGE */}
                            <View style={styles.decorativeLine}>
                                <View style={styles.orangeLine} />
                            </View>
                        </View>

                        {/* Icône principale avec accent orange */}
                        <View style={styles.iconContainer}>
                            <View style={styles.iconBackground}>
                                <Ionicons
                                    name={isPasswordReset ? "checkmark-circle" : "lock-closed-outline"}
                                    size={50}
                                    color={isPasswordReset ? Colors.success : Colors.primary}
                                />
                                {/* 🔥 PETIT ACCENT ORANGE */}
                                <View style={styles.iconAccent} />
                            </View>
                        </View>

                        {/* Titre et description */}
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>
                                {isPasswordReset ? 'Mot de passe réinitialisé' : 'Nouveau mot de passe'}
                            </Text>
                            <Text style={styles.description}>
                                {isPasswordReset
                                    ? 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.'
                                    : 'Choisissez un nouveau mot de passe sécurisé pour votre compte.'
                                }
                            </Text>
                        </View>

                        {/* Formulaire */}
                        {!isPasswordReset && (
                            <View style={styles.formContainer}>
                                <View style={styles.inputContainer}>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons
                                            name="lock-closed-outline"
                                            size={20}
                                            color={Colors.primary}
                                            style={styles.inputIcon}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Nouveau mot de passe"
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            secureTextEntry={!showPassword}
                                            editable={!isLoading}
                                            placeholderTextColor={Colors.textMuted}
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowPassword(!showPassword)}
                                            style={styles.eyeButton}
                                        >
                                            <Ionicons
                                                name={showPassword ? "eye-off-outline" : "eye-outline"}
                                                size={20}
                                                color={Colors.primary}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.inputContainer}>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons
                                            name="lock-closed-outline"
                                            size={20}
                                            color={Colors.primary}
                                            style={styles.inputIcon}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Confirmer le mot de passe"
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            secureTextEntry={!showConfirmPassword}
                                            editable={!isLoading}
                                            placeholderTextColor={Colors.textMuted}
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={styles.eyeButton}
                                        >
                                            <Ionicons
                                                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                                size={20}
                                                color={Colors.primary}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Indicateurs de sécurité avec accent orange */}
                                <View style={styles.passwordRequirements}>
                                    <View style={styles.requirementsHeader}>
                                        <Ionicons name="shield-outline" size={16} color={Colors.secondary} />
                                        <Text style={styles.requirementsTitle}>Le mot de passe doit contenir :</Text>
                                    </View>
                                    <Text style={styles.requirement}>• Au moins 8 caractères</Text>
                                    <Text style={styles.requirement}>• Une lettre minuscule et une majuscule</Text>
                                    <Text style={styles.requirement}>• Un chiffre</Text>
                                    <Text style={styles.requirement}>• Un caractère spécial (@#$%^&+=!)</Text>
                                </View>

                                {/* Bouton avec gradient */}
                                <TouchableOpacity
                                    style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
                                    onPress={handleResetPassword}
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={isLoading ? [Colors.textMuted, Colors.textMuted] : [Colors.surface, StyleUtils.withOpacity(Colors.surface, 0.9)]}
                                        style={styles.resetButtonGradient}
                                    >
                                        <Text style={styles.resetButtonText}>
                                            {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                                        </Text>
                                        {/* 🔥 ACCENT ORANGE SUR LE BOUTON */}
                                        <View style={styles.buttonAccent} />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Message de succès */}
                        {isPasswordReset && (
                            <View style={styles.successContainer}>
                                <TouchableOpacity
                                    style={styles.loginButton}
                                    onPress={handleBackToLogin}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={[Colors.surface, StyleUtils.withOpacity(Colors.surface, 0.9)]}
                                        style={styles.loginButtonGradient}
                                    >
                                        <Text style={styles.loginButtonText}>Se connecter</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Animated.View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.xl,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        ...Typography.h6,
        color: Colors.surface,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
    },
    errorTitle: {
        ...Typography.h3,
        color: Colors.surface,
        textAlign: 'center',
        marginTop: Spacing.lg,
        marginBottom: Spacing.md,
    },
    errorText: {
        ...Typography.body,
        color: Colors.surface,
        textAlign: 'center',
        opacity: 0.9,
        marginBottom: Spacing.xl,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.lg,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
    },
    headerBackButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.2),
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...Typography.h6,
        color: Colors.surface,
    },
    headerSpacer: {
        width: 44,
    },

    // 🎨 LOGO AVEC IMAGE ET ORANGE
    logoContainer: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    logoImageContainer: {
        position: 'relative',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.15),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
        ...StyleUtils.getUniformShadow('medium'),
    },
    logoImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    logoAccent: {
        position: 'absolute',
        top: -3,
        right: -3,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.secondary,
        borderWidth: 2,
        borderColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        ...StyleUtils.getUniformShadow('low'),
    },
    decorativeLine: {
        alignItems: 'center',
    },
    orangeLine: {
        width: 40,
        height: 2,
        backgroundColor: Colors.secondary,
        borderRadius: 1,
    },

    // Icône principale avec accent
    iconContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    iconBackground: {
        position: 'relative',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        ...StyleUtils.getUniformShadow('medium'),
    },
    iconAccent: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.secondary,
        borderWidth: 2,
        borderColor: Colors.surface,
    },

    textContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
        paddingHorizontal: Spacing.lg,
    },
    title: {
        ...Typography.h3,
        color: Colors.surface,
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    description: {
        ...Typography.body,
        color: Colors.surface,
        textAlign: 'center',
        opacity: 0.9,
        lineHeight: 24,
    },

    formContainer: {
        marginBottom: Spacing.xl,
    },
    inputContainer: {
        marginBottom: Spacing.md,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        height: 50,
        ...StyleUtils.getUniformShadow('low'),
    },
    inputIcon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        ...Typography.body,
        color: Colors.textPrimary,
    },
    eyeButton: {
        padding: 5,
    },

    passwordRequirements: {
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.1),
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginTop: Spacing.sm,
        marginBottom: Spacing.lg,
        borderLeftWidth: 3,
        borderLeftColor: Colors.secondary,
    },
    requirementsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    requirementsTitle: {
        ...Typography.bodySmall,
        color: Colors.surface,
        fontWeight: '600',
        marginLeft: Spacing.sm,
    },
    requirement: {
        ...Typography.caption,
        color: Colors.surface,
        opacity: 0.8,
        marginBottom: 2,
    },

    resetButton: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...StyleUtils.getUniformShadow('medium'),
    },
    resetButtonDisabled: {
        ...StyleUtils.getUniformShadow('low'),
    },
    resetButtonGradient: {
        position: 'relative',
        paddingVertical: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resetButtonText: {
        ...Typography.button,
        color: Colors.primary,
    },
    buttonAccent: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 30,
        height: 4,
        backgroundColor: Colors.secondary,
        borderBottomLeftRadius: BorderRadius.md,
    },

    successContainer: {
        alignItems: 'center',
    },
    loginButton: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...StyleUtils.getUniformShadow('medium'),
    },
    loginButtonGradient: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        ...Typography.button,
        color: Colors.primary,
    },

    backButton: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        alignItems: 'center',
        marginTop: Spacing.lg,
        ...StyleUtils.getUniformShadow('medium'),
    },
    backButtonText: {
        ...Typography.button,
        color: Colors.primary,
    },
});