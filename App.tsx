// App.tsx - VERSION CORRIGÉE avec Redux Provider
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 🔧 CORRECTION: Import du Provider Redux
import { Provider } from 'react-redux';
import { store } from './src/store';

// Navigation et contextes
import AppNavigator from './src/navigations/AppNavigator';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { authService } from '@/services/authService';

const AppContent: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const { isAuthenticated, setIsAuthenticated } = useAuth();

  useEffect(() => {
    const prepareApp = async () => {
      try {
        console.log('🚀 Démarrage de l\'application...');
        const authenticated = await authService.isAuthenticated();
        console.log('🔐 État d\'authentification:', authenticated);
        setIsAuthenticated(authenticated);
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ Application prête');
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
      } finally {
        setIsReady(true);
      }
    };
    prepareApp();
  }, [setIsAuthenticated]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Initialisation...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" backgroundColor="#1565C0" />
      <AppNavigator isAuthenticated={isAuthenticated} />
    </>
  );
};

export default function App() {
  return (
    // 🔧 ORDRE IMPORTANT: Provider Redux en premier
    <Provider store={store}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1E88E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
});