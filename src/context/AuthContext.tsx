// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name: string; email: string }) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface StoredUser extends User {
  password: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: async () => {},
  isAuthenticated: false,
  isAdmin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  const adminUser: User = {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  };

  const login = async (data: { email: string; password: string }) => {
    // Hardcoded admin login
    if (data.email === 'admin@example.com' && data.password === 'admin') {
      setUser(adminUser);
      setToken('admin-token');
      localStorage.setItem('user', JSON.stringify(adminUser));
      localStorage.setItem('token', 'admin-token');
    } else {
      // Simulate user login
      const storedUsers: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = storedUsers.find((u) => u.email === data.email && u.password === data.password);
      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        setToken('user-token');
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        localStorage.setItem('token', 'user-token');
      } else {
        throw new Error('Invalid email or password');
      }
    }
  };

  const register = async (data: { name: string; email: string; password: string }) => {
    // Simulate user registration
    const newUser: StoredUser = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      role: 'user',
      password: data.password,
    };
    const storedUsers: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
    storedUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(storedUsers));
    const { password, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    setToken('user-token');
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    localStorage.setItem('token', 'user-token');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateProfile = async (data: { name: string; email: string }) => {
    const response = await fetch('/api/update-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    setUser(result.user);
    localStorage.setItem('user', JSON.stringify(result.user));
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, updateProfile, isAuthenticated, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};