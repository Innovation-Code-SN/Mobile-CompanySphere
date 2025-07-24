import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const Theme = {
    Colors: {
        primary: '#1E88E5',
        secondary: '#FF6347',
        surface: '#FFFFFF',
        text: '#333333',
        textMuted: '#666666',
    },
    gradients: {
        primary: ['#1E88E5', '#1976D2'] as const,
    }
};

export default function EnterTokenScreen({ navigation }: any) {
    const [token, setToken] = useState('');

    const handleContinue = () => {
        if (!token.trim()) {
            Alert.alert('Erreur', 'Veuillez saisir le code de réinitialisation');
            return;
        }

        navigation.navigate('ResetPassword', { token: token.trim() });
    };

    const handleBackToLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <LinearGradient colors={Theme.gradients.primary} style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBackToLogin}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color={Theme.Colors.surface} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Code de réinitialisation</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <View style={styles.iconContainer}>
                    <View style={styles.iconBackground}>
                        <Ionicons name="key-outline" size={50} color={Theme.Colors.primary} />
                    </View>
                </View>

                <Text style={styles.title}>Saisissez le code</Text>
                <Text style={styles.description}>
                    Entrez le code de réinitialisation reçu par email
                </Text>

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <Ionicons
                            name="key-outline"
                            size={20}
                            color={Theme.Colors.textMuted}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Code de réinitialisation"
                            value={token}
                            onChangeText={setToken}
                            autoCapitalize="none"
                            autoCorrect={false}
                            placeholderTextColor={Theme.Colors.textMuted}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleContinue}
                    activeOpacity={0.8}
                >
                    <Text style={styles.continueButtonText}>Continuer</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 40,
        paddingTop: 50,
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
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
        marginBottom: 40,
        lineHeight: 24,
    },
    inputContainer: {
        marginBottom: 30,
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
    continueButton: {
        backgroundColor: Theme.Colors.surface,
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    continueButtonText: {
        color: Theme.Colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
});