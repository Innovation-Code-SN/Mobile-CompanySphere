// screens/auth/ForgotPasswordScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Services
import { passwordResetService } from '../../services/passwordResetService';

// Couleurs du thème adaptées à votre app
const Theme = {
    Colors: {
        primary: '#1E88E5',
        secondary: '#FF6347',
        surface: '#FFFFFF',
        background: '#F5F5F5',
        text: '#333333',
        textMuted: '#666666',
        border: '#E0E0E0',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
    },
    gradients: {
        primary: ['#1E88E5', '#1976D2'] as const,
    }
};

export default function ForgotPasswordScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));

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
    }, []);

    const handleSendResetEmail = async () => {
        if (!email.trim()) {
            Alert.alert('Erreur', 'Veuillez saisir votre adresse email');
            return;
        }

        if (!passwordResetService.validateEmail(email)) {
            Alert.alert('Erreur', 'Veuillez saisir une adresse email valide');
            return;
        }

        setIsLoading(true);

        try {
            const response = await passwordResetService.forgotPassword(email.trim().toLowerCase());

            if (response.success) {
                setIsEmailSent(true);

                Alert.alert(
                    'Email envoyé',
                    'Si cette adresse email existe dans notre système, vous recevrez un lien de réinitialisation dans quelques minutes.',
                    [
                        {
                            text: 'Saisir le code manuellement',
                            onPress: () => navigation.navigate('EnterToken'),
                        },
                        {
                            text: 'Retour à la connexion',
                            onPress: () => navigation.goBack(),
                            style: 'cancel'
                        },
                    ]
                );
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
        navigation.goBack();
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient
                colors={Theme.gradients.primary}
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
                        {/* Header avec bouton retour */}
                        <View style={styles.header}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={handleBackToLogin}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="arrow-back"
                                    size={24}
                                    color={Theme.Colors.surface}
                                />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Mot de passe oublié</Text>
                            <View style={styles.headerSpacer} />
                        </View>

                        {/* Logo/Icône principal */}
                        <View style={styles.logoContainer}>
                            <View style={styles.logoBackground}>
                                <Text style={styles.logoText}>IC</Text>
                                <Text style={styles.logoSubtext}>COMPANY</Text>
                                <Text style={styles.logoSubtext}>SPHERE</Text>
                            </View>
                        </View>

                        {/* Icône email */}
                        <View style={styles.iconContainer}>
                            <View style={styles.iconBackground}>
                                <Ionicons
                                    name="mail-outline"
                                    size={50}
                                    color={Theme.Colors.primary}
                                />
                            </View>
                        </View>

                        {/* Titre et description */}
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>
                                Réinitialiser votre mot de passe
                            </Text>
                            <Text style={styles.description}>
                                Saisissez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                            </Text>
                        </View>

                        {/* Formulaire */}
                        {!isEmailSent && (
                            <View style={styles.formContainer}>
                                <View style={styles.inputContainer}>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons
                                            name="mail-outline"
                                            size={20}
                                            color={Theme.Colors.textMuted}
                                            style={styles.inputIcon}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Adresse email"
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            editable={!isLoading}
                                            placeholderTextColor={Theme.Colors.textMuted}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[
                                        styles.sendButton,
                                        isLoading && styles.sendButtonDisabled
                                    ]}
                                    onPress={handleSendResetEmail}
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.sendButtonText}>
                                        {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Message de confirmation */}
                        {isEmailSent && (
                            <View style={styles.confirmationContainer}>
                                <View style={styles.successIcon}>
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={80}
                                        color={Theme.Colors.success}
                                    />
                                </View>
                                <Text style={styles.confirmationTitle}>
                                    Email envoyé !
                                </Text>
                                <Text style={styles.confirmationText}>
                                    Vérifiez votre boîte de réception et suivez les instructions dans l'email pour réinitialiser votre mot de passe.
                                </Text>
                                <Text style={styles.noteText}>
                                    N'oubliez pas de vérifier votre dossier spam si vous ne voyez pas l'email.
                                </Text>
                            </View>
                        )}

                        {/* Bouton retour à la connexion */}
                        <TouchableOpacity
                            style={styles.backToLoginButton}
                            onPress={handleBackToLogin}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.backToLoginText}>
                                Retour à la connexion
                            </Text>
                        </TouchableOpacity>
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
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 30,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        color: Theme.Colors.surface,
        fontWeight: '600',
    },
    headerSpacer: {
        width: 44,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logoBackground: {
        backgroundColor: Theme.Colors.surface,
        borderRadius: 30,
        paddingVertical: 15,
        paddingHorizontal: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Theme.Colors.primary,
    },
    logoSubtext: {
        fontSize: 10,
        fontWeight: '600',
        color: Theme.Colors.secondary,
        letterSpacing: 1,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    iconBackground: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Theme.Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        color: Theme.Colors.surface,
        textAlign: 'center',
        marginBottom: 15,
        fontWeight: '700',
    },
    description: {
        fontSize: 16,
        color: Theme.Colors.surface,
        textAlign: 'center',
        opacity: 0.9,
        lineHeight: 24,
    },
    formContainer: {
        marginBottom: 40,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.Colors.surface,
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Theme.Colors.text,
    },
    sendButton: {
        backgroundColor: Theme.Colors.surface,
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    sendButtonDisabled: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    sendButtonText: {
        color: Theme.Colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    confirmationContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    successIcon: {
        marginBottom: 20,
    },
    confirmationTitle: {
        fontSize: 24,
        color: Theme.Colors.surface,
        textAlign: 'center',
        marginBottom: 15,
        fontWeight: '700',
    },
    confirmationText: {
        fontSize: 16,
        color: Theme.Colors.surface,
        textAlign: 'center',
        opacity: 0.9,
        lineHeight: 24,
        marginBottom: 15,
    },
    noteText: {
        fontSize: 14,
        color: Theme.Colors.surface,
        textAlign: 'center',
        opacity: 0.8,
        fontStyle: 'italic',
        paddingHorizontal: 20,
    },
    backToLoginButton: {
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginTop: 'auto',
    },
    backToLoginText: {
        fontSize: 16,
        color: Theme.Colors.surface,
        fontWeight: '600',
    },
});