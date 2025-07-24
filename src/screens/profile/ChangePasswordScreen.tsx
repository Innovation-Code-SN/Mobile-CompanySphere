// src/screens/profile/ChangePasswordScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// 🎨 IMPORTS DE LA CHARTE UNIFORME
import { Colors, Gradients, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { StyleUtils } from '../../constants/styleUtils';

// Services
import { useAuth } from '@/context/AuthContext';
import { passwordService } from '@/services/passwordService';

interface PasswordRequirement {
    regex: RegExp;
    text: string;
    met: boolean;
}

export default function ChangePasswordScreen() {
    const navigation = useNavigation();
    const { logout } = useAuth();

    // États du formulaire
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // États UI
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newPasswordFocused, setNewPasswordFocused] = useState(false);

    // Exigences du mot de passe
    const passwordRequirements: PasswordRequirement[] = [
        {
            regex: /.{8,}/,
            text: 'Au moins 8 caractères',
            met: newPassword.length >= 8,
        },
        {
            regex: /[a-z]/,
            text: 'Au moins une lettre minuscule',
            met: /[a-z]/.test(newPassword),
        },
        {
            regex: /[A-Z]/,
            text: 'Au moins une lettre majuscule',
            met: /[A-Z]/.test(newPassword),
        },
        {
            regex: /[0-9]/,
            text: 'Au moins un chiffre',
            met: /[0-9]/.test(newPassword),
        },
        {
            regex: /[@#$%^&+=!]/,
            text: 'Au moins un caractère spécial (@#$%^&+=!)',
            met: /[@#$%^&+=!]/.test(newPassword),
        },
    ];

    const allRequirementsMet = passwordRequirements.every(req => req.met);

    const validateForm = (): string | null => {
        if (!currentPassword.trim()) {
            return 'Veuillez entrer votre mot de passe actuel';
        }

        if (!newPassword.trim()) {
            return 'Veuillez entrer un nouveau mot de passe';
        }

        if (!allRequirementsMet) {
            return 'Le nouveau mot de passe ne respecte pas toutes les exigences';
        }

        if (!confirmPassword.trim()) {
            return 'Veuillez confirmer votre nouveau mot de passe';
        }

        if (newPassword !== confirmPassword) {
            return 'Les mots de passe ne correspondent pas';
        }

        if (currentPassword === newPassword) {
            return 'Le nouveau mot de passe doit être différent de l\'ancien';
        }

        return null;
    };

    const handleChangePassword = async () => {
        try {
            // Validation
            const error = validateForm();
            if (error) {
                Alert.alert('Erreur', error);
                return;
            }

            setIsLoading(true);
            console.log('🔐 Changement de mot de passe...');

            const response = await passwordService.changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });

            if (response.success) {
                console.log('✅ Mot de passe changé avec succès');

                Alert.alert(
                    'Succès',
                    'Votre mot de passe a été modifié avec succès. Veuillez vous reconnecter.',
                    [
                        {
                            text: 'OK',
                            onPress: async () => {
                                // Déconnexion automatique après changement
                                await logout();
                            },
                        },
                    ]
                );
            } else {
                Alert.alert('Erreur', response.message || 'Impossible de changer le mot de passe');
            }
        } catch (error) {
            console.error('❌ Erreur changement mot de passe:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors du changement de mot de passe');
        } finally {
            setIsLoading(false);
        }
    };

    const renderPasswordInput = (
        label: string,
        value: string,
        onChangeText: (text: string) => void,
        showPassword: boolean,
        onToggleShow: () => void,
        placeholder: string,
        onFocus?: () => void,
        onBlur?: () => void
    ) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.inputContainer}>
                <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={Colors.primary}
                    style={styles.inputIcon}
                />
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
                <TouchableOpacity onPress={onToggleShow} style={styles.eyeButton}>
                    <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={Colors.textMuted}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* 🎨 HEADER AVEC GRADIENT BLEU */}
                <LinearGradient colors={Gradients.primary} style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors.surface} />
                    </TouchableOpacity>

                    <View style={styles.headerContent}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="key-outline" size={40} color={Colors.surface} />
                        </View>
                        <Text style={styles.headerTitle}>Changer le mot de passe</Text>
                        <Text style={styles.headerSubtitle}>
                            Sécurisez votre compte avec un nouveau mot de passe
                        </Text>
                    </View>
                </LinearGradient>

                {/* 🎨 FORMULAIRE */}
                <View style={styles.formContainer}>
                    {/* Mot de passe actuel */}
                    {renderPasswordInput(
                        'Mot de passe actuel',
                        currentPassword,
                        setCurrentPassword,
                        showCurrentPassword,
                        () => setShowCurrentPassword(!showCurrentPassword),
                        'Entrez votre mot de passe actuel'
                    )}

                    {/* Nouveau mot de passe */}
                    {renderPasswordInput(
                        'Nouveau mot de passe',
                        newPassword,
                        setNewPassword,
                        showNewPassword,
                        () => setShowNewPassword(!showNewPassword),
                        'Entrez votre nouveau mot de passe',
                        () => setNewPasswordFocused(true),
                        () => setNewPasswordFocused(false)
                    )}

                    {/* Exigences du mot de passe */}
                    {(newPasswordFocused || newPassword.length > 0) && (
                        <View style={styles.requirementsContainer}>
                            <Text style={styles.requirementsTitle}>Exigences du mot de passe :</Text>
                            {passwordRequirements.map((req, index) => (
                                <View key={index} style={styles.requirementRow}>
                                    <Ionicons
                                        name={req.met ? 'checkmark-circle' : 'close-circle'}
                                        size={16}
                                        color={req.met ? Colors.success : Colors.textMuted}
                                    />
                                    <Text
                                        style={[
                                            styles.requirementText,
                                            req.met && styles.requirementMet
                                        ]}
                                    >
                                        {req.text}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Confirmer le mot de passe */}
                    {renderPasswordInput(
                        'Confirmer le nouveau mot de passe',
                        confirmPassword,
                        setConfirmPassword,
                        showConfirmPassword,
                        () => setShowConfirmPassword(!showConfirmPassword),
                        'Confirmez votre nouveau mot de passe'
                    )}

                    {/* Message de correspondance */}
                    {confirmPassword.length > 0 && (
                        <View style={styles.matchContainer}>
                            <Ionicons
                                name={
                                    newPassword === confirmPassword
                                        ? 'checkmark-circle'
                                        : 'close-circle'
                                }
                                size={16}
                                color={
                                    newPassword === confirmPassword
                                        ? Colors.success
                                        : Colors.error
                                }
                            />
                            <Text
                                style={[
                                    styles.matchText,
                                    newPassword === confirmPassword
                                        ? styles.matchSuccess
                                        : styles.matchError
                                ]}
                            >
                                {newPassword === confirmPassword
                                    ? 'Les mots de passe correspondent'
                                    : 'Les mots de passe ne correspondent pas'}
                            </Text>
                        </View>
                    )}

                    {/* Boutons d'action */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                (!allRequirementsMet || newPassword !== confirmPassword) &&
                                styles.submitButtonDisabled
                            ]}
                            onPress={handleChangePassword}
                            disabled={isLoading || !allRequirementsMet || newPassword !== confirmPassword}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={Colors.surface} />
                            ) : (
                                <>
                                    <Ionicons name="shield-checkmark" size={20} color={Colors.surface} />
                                    <Text style={styles.submitButtonText}>Changer le mot de passe</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => navigation.goBack()}
                            disabled={isLoading}
                        >
                            <Text style={styles.cancelButtonText}>Annuler</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Note de sécurité */}
                    <View style={styles.securityNote}>
                        <Ionicons name="information-circle" size={16} color={Colors.info} />
                        <Text style={styles.securityNoteText}>
                            Pour votre sécurité, vous devrez vous reconnecter après avoir changé votre mot de passe.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// =============================================================================
// 🎨 STYLES AVEC CHARTE GRAPHIQUE UNIFORME
// =============================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: Spacing.huge,
    },

    // 🎨 HEADER UNIFORME
    header: {
        paddingHorizontal: Spacing.lg,
        paddingTop: 50,
        paddingBottom: Spacing.xxxl,
    },

    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.2),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },

    headerContent: {
        alignItems: 'center',
    },

    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: StyleUtils.withOpacity(Colors.surface, 0.2),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },

    headerTitle: {
        ...Typography.h4,
        color: Colors.surface,
        marginBottom: Spacing.sm,
    },

    headerSubtitle: {
        ...Typography.body,
        color: StyleUtils.withOpacity(Colors.surface, 0.8),
        textAlign: 'center',
    },

    // 🎨 FORMULAIRE
    formContainer: {
        padding: Spacing.lg,
    },

    inputGroup: {
        marginBottom: Spacing.lg,
    },

    inputLabel: {
        ...Typography.bodySmall,
        fontWeight: '500',
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        ...StyleUtils.getUniformShadow('low'),
    },

    inputIcon: {
        marginRight: Spacing.sm,
    },

    input: {
        flex: 1,
        ...Typography.body,
        color: Colors.textPrimary,
        paddingVertical: Spacing.md,
    },

    eyeButton: {
        padding: Spacing.sm,
    },

    // 🎨 EXIGENCES MOT DE PASSE
    requirementsContainer: {
        backgroundColor: Colors.surfaceVariant,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginTop: -Spacing.sm,
        marginBottom: Spacing.lg,
    },

    requirementsTitle: {
        ...Typography.bodySmall,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },

    requirementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },

    requirementText: {
        ...Typography.caption,
        color: Colors.textMuted,
        marginLeft: Spacing.xs,
    },

    requirementMet: {
        color: Colors.success,
        fontWeight: '500',
    },

    // 🎨 CORRESPONDANCE MOT DE PASSE
    matchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: -Spacing.sm,
        marginBottom: Spacing.lg,
    },

    matchText: {
        ...Typography.caption,
        marginLeft: Spacing.xs,
    },

    matchSuccess: {
        color: Colors.success,
        fontWeight: '500',
    },

    matchError: {
        color: Colors.error,
    },

    // 🎨 BOUTONS D'ACTION
    actionButtons: {
        marginTop: Spacing.xl,
    },

    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md,
        marginBottom: Spacing.md,
        ...StyleUtils.getUniformShadow('medium'),
    },

    submitButtonDisabled: {
        backgroundColor: StyleUtils.withOpacity(Colors.primary, 0.5),
    },

    submitButtonText: {
        ...Typography.button,
        color: Colors.surface,
        marginLeft: Spacing.sm,
    },

    cancelButton: {
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },

    cancelButtonText: {
        ...Typography.body,
        color: Colors.primary,
        fontWeight: '500',
    },

    // 🎨 NOTE DE SÉCURITÉ
    securityNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: StyleUtils.withOpacity(Colors.info, 0.1),
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginTop: Spacing.xl,
    },

    securityNoteText: {
        ...Typography.caption,
        color: Colors.info,
        marginLeft: Spacing.sm,
        flex: 1,
        lineHeight: 18,
    },
});