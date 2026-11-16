import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';
import { authApi } from '../services/api';
import i18n from '../i18n';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: 'user' | 'agent' | 'admin') => Promise<{ success: boolean; error?: string }>;
  signup: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const userData = await SecureStore.getItemAsync('user_data');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string,
    role: 'user' | 'agent' | 'admin'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.login({ email, password, role });

      if (response.success && response.user) {
        const userData: User = response.user;
        setUser(userData);
        await SecureStore.setItemAsync('auth_token', response.token || '');
        await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: response.message || i18n.t('auth.loginFailed') };
    } catch (error: any) {
      return { success: false, error: error.message || i18n.t('auth.networkError') };
    }
  };

  const signup = async (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.signup({
        ...data,
        confirm_password: data.password,
      });

      if (response.success && response.user) {
        const userData: User = response.user;
        setUser(userData);
        if (response.token) {
          await SecureStore.setItemAsync('auth_token', response.token);
        }
        await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: response.message || i18n.t('auth.signupFailed') };
    } catch (error: any) {
      return { success: false, error: error.message || i18n.t('auth.networkError') };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};