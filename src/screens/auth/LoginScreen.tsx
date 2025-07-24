// screens/auth/LoginScreen.tsx - VERSION UNIFORME AVEC LOGO
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// 🎨 IMPORTS DE LA CHARTE UNIFORME
import { Colors, Gradients, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { StyleUtils } from '../../constants/styleUtils';

// Services
import { useAuth } from '../../context/AuthContext';
import { authService } from '@/services/authService';

export default function LoginScreen({ navigation }: any) {
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { setIsAuthenticated } = useAuth();

    const handleLogin = async () => {
        if (!credentials.username.trim() || !credentials.password.trim()) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        try {
            setIsLoading(true);
            console.log('🔐 Tentative de connexion...');

            const response = await authService.login(credentials);

            if (response.success) {
                console.log('✅ Connexion réussie');
                setIsAuthenticated(true);
            } else {
                Alert.alert('Erreur', response.message || 'Identifiants incorrects');
            }
        } catch (error) {
            console.error('❌ Erreur lors de la connexion:', error);
            Alert.alert('Erreur', 'Erreur de connexion');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
        navigation.navigate('ForgotPassword');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* 🎨 GRADIENT BLEU PRINCIPAL (selon la charte) */}
            <LinearGradient colors={Gradients.primary} style={styles.gradient}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* 🎨 HEADER UNIFORME AVEC LOGO */}
                    <View style={styles.header}>
                        {/* 🖼️ LOGO IC COMPANY SPHERE */}
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../../assets/logo.jpg')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>

                        <Text style={styles.title}>IC Company Sphere</Text>
                        <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
                    </View>

                    {/* 🎨 FORMULAIRE AVEC STYLES UNIFIÉS */}
                    <View style={styles.formContainer}>
                        {/* Input Nom d'utilisateur */}
                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="person-outline"
                                size={20}
                                color={Colors.secondary} // Icône orange
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Nom d'utilisateur"
                                placeholderTextColor={Colors.textMuted}
                                value={credentials.username}
                                onChangeText={(text) => setCredentials({ ...credentials, username: text })}
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isLoading}
                            />
                        </View>

                        {/* Input Mot de passe */}
                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                color={Colors.secondary} // Icône orange
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Mot de passe"
                                placeholderTextColor={Colors.textMuted}
                                value={credentials.password}
                                onChangeText={(text) => setCredentials({ ...credentials, password: text })}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isLoading}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={Colors.secondary} // Icône orange
                                />
                            </TouchableOpacity>
                        </View>

                        {/* 🎨 BOUTON DE CONNEXION UNIFORME AVEC GRADIENT BLEU-ORANGE */}
                        <TouchableOpacity
                            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {!isLoading && (
                                <LinearGradient
                                    colors={[Colors.primary, Colors.secondary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.loginButtonGradient}
                                >
                                    <Text style={styles.loginButtonText}>Se connecter</Text>
                                </LinearGradient>
                            )}
                            {isLoading && (
                                <View style={styles.loginButtonLoading}>
                                    <ActivityIndicator color={Colors.surface} />
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Lien mot de passe oublié */}
                        <TouchableOpacity
                            style={styles.forgotPassword}
                            onPress={handleForgotPassword}
                            disabled={isLoading}
                        >
                            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 🎨 FOOTER UNIFORME */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Version 1.0.0 • IC Company Sphere
                        </Text>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

// =============================================================================
// 🎨 STYLES AVEC CHARTE GRAPHIQUE UNIFORME
// =============================================================================

const styles = StyleSheet.create({
    // Container principal
    container: {
        flex: 1,
    },

    // 🎨 GRADIENT UNIFORME
    gradient: {
        flex: 1,
    },

    // Scroll content
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.xxxl,
        paddingVertical: Spacing.massive,
    },

    // 🎨 HEADER UNIFORME
    header: {
        alignItems: 'center',
        marginBottom: Spacing.massive,
    },

    // 🎨 LOGO CONTAINER UNIFORME AVEC BORDURE ORANGE
    logoContainer: {
        width: 140,
        height: 100,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
        padding: Spacing.md,
        borderWidth: 2,
        borderColor: Colors.secondary, // Bordure orange
        ...StyleUtils.getUniformShadow('medium'),
    },

    // 🖼️ LOGO IMAGE
    logo: {
        width: '100%',
        height: '100%',
    },

    // 🎨 TITRE UNIFORME
    title: {
        ...Typography.h2,
        color: Colors.surface,
        textAlign: 'center',
        marginBottom: Spacing.sm,
        fontWeight: '700',
    },

    // 🎨 SOUS-TITRE UNIFORME
    subtitle: {
        ...Typography.body,
        color: StyleUtils.withOpacity(Colors.surface, 0.8),
        textAlign: 'center',
    },

    // 🎨 CONTAINER FORMULAIRE UNIFORME
    formContainer: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xxxl,
        ...StyleUtils.getUniformShadow('high'),
    },

    // 🎨 CONTAINER INPUT UNIFORME AVEC ACCENT ORANGE
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.lg,
        paddingHorizontal: Spacing.md,
        backgroundColor: Colors.surfaceVariant,
    },

    // État focus pour les inputs
    inputContainerFocused: {
        borderColor: Colors.secondary, // Bordure orange au focus
        borderWidth: 2,
    },

    // Icône input
    inputIcon: {
        marginRight: Spacing.md,
    },

    // 🎨 INPUT UNIFORME
    input: {
        flex: 1,
        paddingVertical: Spacing.md,
        ...Typography.body,
        color: Colors.textPrimary,
    },

    // Bouton œil
    eyeButton: {
        padding: Spacing.xs,
    },

    // 🎨 BOUTON DE CONNEXION UNIFORME AVEC GRADIENT
    loginButton: {
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        marginBottom: Spacing.lg,
        ...StyleUtils.getUniformShadow('medium'),
        overflow: 'hidden',
    },

    // Bouton désactivé
    loginButtonDisabled: {
        backgroundColor: Colors.textMuted,
        ...StyleUtils.getUniformShadow('low'),
    },

    // 🎨 GRADIENT DU BOUTON
    loginButtonGradient: {
        width: '100%',
        paddingVertical: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Loading state
    loginButtonLoading: {
        width: '100%',
        paddingVertical: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.textMuted,
    },

    // 🎨 TEXTE BOUTON UNIFORME
    loginButtonText: {
        ...Typography.button,
        color: Colors.surface,
        fontSize: 18,
    },

    // Lien mot de passe oublié
    forgotPassword: {
        alignItems: 'center',
    },

    forgotPasswordText: {
        ...Typography.bodySmall,
        color: Colors.secondary, // Texte orange au lieu de bleu
        fontWeight: '500',
    },

    // 🎨 FOOTER UNIFORME
    footer: {
        alignItems: 'center',
        marginTop: Spacing.huge,
    },

    footerText: {
        ...Typography.caption,
        color: StyleUtils.withOpacity(Colors.surface, 0.7),
    },
});