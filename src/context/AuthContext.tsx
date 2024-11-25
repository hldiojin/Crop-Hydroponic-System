// src/context/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { User, LoginForm, RegisterForm } from '../types/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: LoginForm) => Promise<void>;
  register: (data: RegisterForm) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (data: LoginForm) => {
    // Mock login process
    const mockUser = { id: '1', email: data.email, name: 'Test User' };
    const mockToken = 'mock-token';
    setUser(mockUser);
    setToken(mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', mockToken);
  };

  const register = async (data: RegisterForm) => {
    // Mock registration process
    const mockUser = { id: '1', email: data.email, name: data.name };
    const mockToken = 'mock-token';
    setUser(mockUser);
    setToken(mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', mockToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);