import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    Dimensions,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Components
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

// Redux
import { useAppDispatch, useAppSelector } from '../../store';
import { login, selectAuth, clearError } from '../../store/slices/authSlice';

// Theme
import {
    Colors,
    Gradients,
    Typography,
    Layout,
    Spacing,
    Components,
    Shadows
} from '../../constants/theme';

const { width, height } = Dimensions.get('window');

export const LoginScreen: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));

    const dispatch = useAppDispatch();
    const { isLoading, error, isAuthenticated } = useAppSelector(selectAuth);
    const navigation = useNavigation();

    useEffect(() => {
        // Animation d'entrée
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            navigation.navigate('Main' as never);
        }
    }, [isAuthenticated, navigation]);

    useEffect(() => {
        if (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Erreur de connexion', error, [
                {
                    text: 'OK',
                    onPress: () => dispatch(clearError()),
                },
            ]);
        }
    }, [error, dispatch]);

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        try {
            await dispatch(login({ username: username.trim(), password })).unwrap();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            // L'erreur sera gérée par l'useEffect
        }
    };

    const handleForgotPassword = () => {
        Alert.alert(
            'Mot de passe oublié',
            'Contactez votre administrateur système pour réinitialiser votre mot de passe.',
            [{ text: 'OK' }]
        );
    };

    return (
        <>
            <StatusBar style="light" />
            <LinearGradient
                colors={Gradients.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            <KeyboardAvoidingView
                style={Layout.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Animated.View
                    style={[
                        {
                            flex: 1,
                            justifyContent: 'space-between',
                            paddingHorizontal: Spacing.xxl,
                            paddingTop: 60,
                            paddingBottom: Spacing.huge,
                            zIndex: 1,
                        },
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* Logo et titre */}
                    <View style={{ alignItems: 'center', marginTop: Spacing.huge }}>
                        <View style={{
                            width: 120,
                            height: 120,
                            borderRadius: 60,
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: Spacing.xl,
                            ...Shadows.large,
                        }}>
                            <Ionicons name="business" size={80} color={Colors.surface} />
                        </View>
                        <Text style={[Typography.h1, {
                            color: Colors.surface,
                            letterSpacing: 2,
                            textAlign: 'center'
                        }]}>
                            IC COMPANY
                        </Text>
                        <Text style={[Typography.h3, {
                            color: Colors.secondary,
                            letterSpacing: 1,
                            marginTop: -4
                        }]}>
                            SPHERE
                        </Text>
                        <Text style={[Typography.body, {
                            color: 'rgba(255, 255, 255, 0.8)',
                            marginTop: Spacing.sm,
                            textAlign: 'center'
                        }]}>
                            Votre annuaire d'entreprise
                        </Text>
                    </View>

                    {/* Formulaire de connexion */}
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        maxWidth: 400,
                        width: '100%',
                        alignSelf: 'center',
                    }}>
                        <View style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: Spacing.xxl,
                            padding: Spacing.xxxl,
                            ...Shadows.xlarge,
                        }}>
                            <Input
                                label="Nom d'utilisateur"
                                value={username}
                                onChangeText={setUsername}
                                placeholder="Entrez votre nom d'utilisateur"
                                leftIcon="person-outline"
                                variant="filled"
                                autoCapitalize="none"
                                autoCorrect={false}
                                returnKeyType="next"
                            />

                            <Input
                                label="Mot de passe"
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Entrez votre mot de passe"
                                leftIcon="lock-closed-outline"
                                variant="filled"
                                isPassword
                                returnKeyType="done"
                                onSubmitEditing={handleLogin}
                            />

                            <Button
                                title="Se connecter"
                                onPress={handleLogin}
                                loading={isLoading}
                                variant="gradient"
                                size="large"
                                fullWidth
                                style={{
                                    marginTop: Spacing.xxl,
                                    ...Shadows.medium,
                                }}
                                icon={
                                    !isLoading && (
                                        <Ionicons name="log-in-outline" size={20} color={Colors.surface} />
                                    )
                                }
                            />

                            <Button
                                title="Mot de passe oublié ?"
                                onPress={handleForgotPassword}
                                variant="ghost"
                                style={{
                                    marginTop: Spacing.lg,
                                    alignSelf: 'center'
                                }}
                                textStyle={{ color: Colors.primary, fontSize: 14 }}
                            />
                        </View>
                    </View>

                    {/* Version */}
                    <View style={{ alignItems: 'center', marginTop: Spacing.xl }}>
                        <Text style={[Typography.caption, {
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginBottom: 4
                        }]}>
                            Version 1.0.0
                        </Text>
                        <Text style={[Typography.caption, {
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontWeight: '500'
                        }]}>
                            Développé par Innovation Code
                        </Text>
                    </View>
                </Animated.View>

                {/* Décoration de fond */}
                <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 0,
                }}>
                    <View style={{
                        position: 'absolute',
                        width: 200,
                        height: 200,
                        borderRadius: 100,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        top: -100,
                        right: -100,
                    }} />
                    <View style={{
                        position: 'absolute',
                        width: 150,
                        height: 150,
                        borderRadius: 75,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        bottom: 100,
                        left: -75,
                    }} />
                    <View style={{
                        position: 'absolute',
                        width: 100,
                        height: 100,
                        borderRadius: 50,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        top: '30%',
                        left: -50,
                    }} />
                </View>
            </KeyboardAvoidingView>
        </>
    );
};
