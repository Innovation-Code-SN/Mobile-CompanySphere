import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Alert,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Header } from '../../components/ui/Header';
import { Screen } from '../../components/ui/Screen';

import { useAppDispatch, useAppSelector } from '../../store';
import { changePassword, selectAuth, clearError } from '../../store/slices/authSlice';
import {
    Colors,
    Typography,
    Spacing,
    Components,
    Layout
} from '../../constants/theme';

export const ChangePasswordScreen: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const dispatch = useAppDispatch();
    const { isLoading, error, user } = useAppSelector(selectAuth);
    const navigation = useNavigation();

    useEffect(() => {
        if (error) {
            Alert.alert('Erreur', error, [
                {
                    text: 'OK',
                    onPress: () => dispatch(clearError()),
                },
            ]);
        }
    }, [error, dispatch]);

    const validatePassword = (password: string): boolean => {
        const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/;
        return passwordRegex.test(password);
    };

    const handleChangePassword = async () => {
        if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        if (!validatePassword(newPassword)) {
            Alert.alert(
                'Mot de passe invalide',
                'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
            return;
        }

        try {
            await dispatch(
                changePassword({
                    currentPassword,
                    newPassword,
                    confirmPassword,
                })
            ).unwrap();

            Alert.alert(
                'Succès',
                'Votre mot de passe a été modifié avec succès',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Main' as never),
                    },
                ]
            );
        } catch (error) {
            // L'erreur sera gérée par l'useEffect
        }
    };

    return (
        <Screen safeArea={false}>
            <Header
                title="Changer le mot de passe"
                leftIcon="arrow-back"
                onLeftPress={() => navigation.goBack()}
            />

            <ScrollView style={Layout.flex} showsVerticalScrollIndicator={false}>
                <View style={{ padding: Spacing.xl }}>
                    {user?.passwordChangeRequired && (
                        <View style={{
                            ...Layout.flexRow,
                            backgroundColor: Colors.warning + '20',
                            padding: Spacing.lg,
                            borderRadius: 12,
                            marginBottom: Spacing.xxl,
                            borderLeftWidth: 4,
                            borderLeftColor: Colors.warning,
                        }}>
                            <Ionicons name="warning" size={24} color={Colors.warning} />
                            <Text style={[Typography.bodySmall, {
                                flex: 1,
                                marginLeft: Spacing.md,
                                color: Colors.warning,
                                fontWeight: '500',
                            }]}>
                                Vous devez changer votre mot de passe pour continuer.
                            </Text>
                        </View>
                    )}

                    <View style={{ marginBottom: Spacing.xxxl }}>
                        <Input
                            label="Mot de passe actuel"
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="Entrez votre mot de passe actuel"
                            leftIcon="lock-closed-outline"
                            isPassword
                            returnKeyType="next"
                        />

                        <Input
                            label="Nouveau mot de passe"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Entrez votre nouveau mot de passe"
                            leftIcon="key-outline"
                            isPassword
                            returnKeyType="next"
                            helper="Au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial"
                        />

                        <Input
                            label="Confirmer le nouveau mot de passe"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirmez votre nouveau mot de passe"
                            leftIcon="checkmark-circle-outline"
                            isPassword
                            returnKeyType="done"
                            onSubmitEditing={handleChangePassword}
                        />

                        <Button
                            title="Changer le mot de passe"
                            onPress={handleChangePassword}
                            loading={isLoading}
                            variant="primary"
                            size="large"
                            fullWidth
                            style={{ marginTop: Spacing.xxl }}
                            icon={
                                !isLoading && (
                                    <Ionicons name="shield-checkmark" size={20} color={Colors.surface} />
                                )
                            }
                        />
                    </View>

                    <View style={{
                        backgroundColor: Colors.surfaceVariant,
                        padding: Spacing.lg,
                        borderRadius: 12,
                    }}>
                        <Text style={[Typography.labelLarge, { marginBottom: Spacing.sm }]}>
                            Conseils de sécurité :
                        </Text>
                        <Text style={[Typography.bodySmall, {
                            marginBottom: 4,
                            lineHeight: 20
                        }]}>
                            • Utilisez un mot de passe unique pour chaque compte
                        </Text>
                        <Text style={[Typography.bodySmall, {
                            marginBottom: 4,
                            lineHeight: 20
                        }]}>
                            • Évitez d'utiliser des informations personnelles
                        </Text>
                        <Text style={[Typography.bodySmall, {
                            lineHeight: 20
                        }]}>
                            • Changez régulièrement vos mots de passe
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </Screen>
    );
};