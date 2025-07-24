// context/AuthContext.tsx - VERSION CORRIGÉE
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
    isAuthenticated: boolean;
    setIsAuthenticated: (value: boolean) => void;
    logout: () => Promise<void>;
    handleAuthExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const logout = async () => {
        try {
            console.log('🚪 === LOGOUT VIA CONTEXTE - DÉBUT ===');
            console.log('🔍 État isAuthenticated AVANT:', isAuthenticated);

            // Nettoyer TOUTES les données d'authentification possibles
            console.log('🗑️ Suppression des données AsyncStorage...');

            await Promise.all([
                // Clés utilisées par authService (principales)
                AsyncStorage.removeItem('auth_token'),
                AsyncStorage.removeItem('user_data'),
                // Clés legacy (au cas où)
                AsyncStorage.removeItem('token'),
                AsyncStorage.removeItem('user'),
                // Autres données
                AsyncStorage.removeItem('employee_profile'),
            ]);

            console.log('✅ Toutes les données supprimées');

            // ✅ TEST CRITIQUE : Mettre à jour l'état d'authentification
            console.log('🔄 Mise à jour isAuthenticated vers false...');
            setIsAuthenticated(false);
            console.log('✅ setIsAuthenticated(false) appelé');

            // ✅ VÉRIFICATION : L'état a-t-il changé ?
            setTimeout(() => {
                console.log('🔍 État isAuthenticated APRÈS (dans 100ms):', isAuthenticated);
            }, 100);

            console.log('✅ État d\'authentification mis à jour vers false');
            console.log('🏁 === LOGOUT VIA CONTEXTE - FIN ===');

        } catch (error) {
            console.log('❌ Erreur logout:', error);
            console.log('❌ Forcer la déconnexion quand même...');
            // Forcer la déconnexion même en cas d'erreur
            setIsAuthenticated(false);
        }
    };

    const handleAuthExpired = () => {
        console.log('🔒 Session expirée, déconnexion...');
        setIsAuthenticated(false);
        Alert.alert(
            'Session expirée',
            'Votre session a expiré. Veuillez vous reconnecter.',
            [{ text: 'OK' }]
        );
    };

    // Stocker la fonction globalement pour l'intercepteur
    useEffect(() => {
        (global as any).handleAuthExpired = handleAuthExpired;
        return () => {
            (global as any).handleAuthExpired = null;
        };
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isAuthenticated) {
            interval = setInterval(async () => {
                const authToken = await AsyncStorage.getItem('auth_token');
                const userData = await AsyncStorage.getItem('user_data');

                // Déconnecter seulement si le token manque
                if (!authToken) {
                    console.log('🔒 Token expiré, déconnexion...');
                    setIsAuthenticated(false);
                }
            }, 30000); // Toutes les 30 secondes
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isAuthenticated]);

    // Log des changements d'état pour débogage
    useEffect(() => {
        console.log('🔄 AuthContext: isAuthenticated changé vers', isAuthenticated);
    }, [isAuthenticated]);

    const value = {
        isAuthenticated,
        setIsAuthenticated,
        logout,
        handleAuthExpired,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};