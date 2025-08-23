import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

export interface CurrentUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  employeId?: string;
  roles?: string[];
  permissions?: string[];
}

export const useCurrentUser = () => {
  const { isAuthenticated } = useAuth();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!isAuthenticated) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return { user, loading, refetch: loadUser };
};