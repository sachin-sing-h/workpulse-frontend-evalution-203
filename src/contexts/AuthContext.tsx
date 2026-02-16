import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../api/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('wp_token');
      const savedUser = localStorage.getItem('wp_user');
      if (savedToken && savedUser && savedUser !== 'undefined') {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Failed to parse saved auth state', error);
      localStorage.removeItem('wp_token');
      localStorage.removeItem('wp_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (data: any) => {
    const { access_token, user } = await authService.login(data);
    setToken(access_token);
    setUser(user);
    localStorage.setItem('wp_token', access_token);
    localStorage.setItem('wp_user', JSON.stringify(user));
  };

  const register = async (data: any) => {
    const { access_token, user } = await authService.register(data);
    setToken(access_token);
    setUser(user);
    localStorage.setItem('wp_token', access_token);
    localStorage.setItem('wp_user', JSON.stringify(user));
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, logout, isLoading }}>
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
