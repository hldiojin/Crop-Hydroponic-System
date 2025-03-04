// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import Cookies from 'js-cookie'; // Make sure to install: npm install js-cookie @types/js-cookie

interface Ticket {
  id: string;
  userId: number;
  userName: string;
  email: string;
  issueType: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

interface AuthData {
  deviceId: string;
  token: string;
  refeshToken: string; // Note: API returns "refeshToken" (typo in API)
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  status?: string;
  attachment?: string | null;
  auth?: AuthData;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  tickets: Ticket[];
  submitTicket: (ticketData: Omit<Ticket, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: Ticket['status']) => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone: string; address: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

interface StoredUser extends Omit<User, 'auth'> {
  password: string;
}

// Create a default context
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  tickets: [],
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: async () => {},
  submitTicket: async () => {},
  updateTicketStatus: async () => {},
  isAuthenticated: false,
  isAdmin: false,
  loading: false,
  error: null,
  clearError: () => {},
});

// Create an axios instance for API calls
const api = axios.create({
  baseURL: 'https://api.hmes.buubuu.id.vn',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Set up axios interceptor to include cookies in requests
// Set up axios interceptor to include cookies in requests
api.interceptors.request.use(
  (config) => {
    // Add deviceId from cookies if available
    const deviceId = Cookies.get('DeviceId');
    if (deviceId && config.headers) {
      config.headers['DeviceId'] = deviceId;
    }
    
    // Add refresh token if available
    const refreshToken = Cookies.get('RefreshToken');
    if (refreshToken && config.headers) {
      config.headers['RefreshToken'] = refreshToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null); 
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const socket = useRef<Socket>();

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  // Clear any error messages
  const clearError = () => setError(null);

  // Helper function to save auth data to cookies with security options
const saveAuthToCookies = (authData: AuthData) => {
  // Set cookies with secure options (adjust expiry as needed)
  const cookieOptions = { 
    expires: 7, // 7 days
    secure: window.location.protocol === 'https:', // Only send over HTTPS
    sameSite: 'strict' as const // Protect against CSRF
  };
  
  // Only store DeviceId and RefreshToken in cookies
  Cookies.set('DeviceId', authData.deviceId, cookieOptions);
  Cookies.set('RefreshToken', authData.refeshToken, cookieOptions);
  
  // Store token in memory only (not in cookies)
};
  
  // Helper function to clear auth cookies
  const clearAuthCookies = () => {
    Cookies.remove('DeviceId');
    Cookies.remove('RefreshToken');
  };

  const login = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/auth/login', data);
      console.log('Login response:', response.data); // Debug log
      
      // Extract user data from the response, checking both possible structures
      const userData = response.data?.data || response.data?.response?.data;
      
      if (userData) {
        // Store user data in state
        setUser(userData);
        
        // If auth data is available, save token and set cookies
        if (userData.auth) {
          // Store token in state
          setToken(userData.auth.token);
          
          // Save auth data to cookies
          saveAuthToCookies(userData.auth);
          
          console.log('Login successful:', userData);
        } else {
          throw new Error('Authentication data missing from response');
        }
      } else {
        console.error('Login response structure:', JSON.stringify(response.data, null, 2));
        throw new Error(response.data?.message || 'Invalid response format');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Handle API errors
        const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
        setError(errorMessage);
        console.error('Login error:', errorMessage);
        
        // For CORS or network errors, provide more specific messages
        if (err.code === 'ERR_NETWORK') {
          setError('Network error: Unable to connect to the server. Please try again later.');
        } else if (err.response?.status === 403) {
          setError('Access denied. Please check your credentials.');
        } else if (err.response?.status === 429) {
          setError('Too many attempts. Please try again later.');
        }
      } else {
        setError('An unexpected error occurred');
        console.error('Unexpected login error:', err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

// Add this function after the login function
const register = async (data: { name: string; email: string; password: string; phone: string; address: string }) => {
  setLoading(true);
  setError(null);
  
  try {
    const response = await api.post('/api/auth/register', data);
    console.log('Register response:', response.data);
    
    // Extract user data from the response, checking both possible structures
    const userData = response.data?.data || response.data?.response?.data;
    
    if (userData) {
      // Store user data in state
      setUser(userData);
      
      // If auth data is available, save token and set cookies
      if (userData.auth) {
        // Store token in state
        setToken(userData.auth.token);
        
        // Save auth data to cookies
        saveAuthToCookies(userData.auth);
        
        console.log('Registration successful:', userData);
      } else {
        throw new Error('Authentication data missing from response');
      }
    } else {
      console.error('Register response structure:', JSON.stringify(response.data, null, 2));
      throw new Error(response.data?.message || 'Invalid response format');
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      // Handle API errors
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      console.error('Register error:', errorMessage);
      
      // For CORS or network errors, provide more specific messages
      if (err.code === 'ERR_NETWORK') {
        setError('Network error: Unable to connect to the server. Please try again later.');
      } else if (err.response?.status === 409) {
        setError('Email already in use. Please use a different email address.');
      } else if (err.response?.status === 400) {
        setError('Invalid information provided. Please check your details.');
      }
    } else {
      setError('An unexpected error occurred');
      console.error('Unexpected register error:', err);
    }
    throw err;
  } finally {
    setLoading(false);
  }
};

  // Submit a support ticket
  const submitTicket = async (ticketData: Omit<Ticket, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    
    try {
      // If API is available, use it
      const response = await api.post('/api/tickets', ticketData);
      
      if (response.data && response.data.data) {
        const newTicket = response.data.data;
        setTickets(prev => [...prev, newTicket]);
        return;
      }
      
      // Fallback to local storage if API fails or doesn't exist
      const newTicket: Ticket = {
        ...ticketData,
        id: Date.now().toString(),
        userId: parseInt(user?.id || '0'),
        userName: user?.name || "",
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const storedTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
      localStorage.setItem('tickets', JSON.stringify([...storedTickets, newTicket]));

      socket.current?.emit('submitTicket', newTicket);
      setTickets(prev => [...prev, newTicket]);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || 'Failed to submit ticket.';
        setError(errorMessage);
        console.error('Ticket submission error:', errorMessage);
      } else {
        setError('An unexpected error occurred');
        console.error('Unexpected ticket submission error:', err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update ticket status
  const updateTicketStatus = async (ticketId: string, status: Ticket['status']) => {
    setLoading(true);
    setError(null);
    
    try {
      // If API is available, use it
      const response = await api.patch(`/api/tickets/${ticketId}`, { status });
      
      if (response.data && response.data.success) {
        // Update local tickets state with the updated ticket
        const updatedTickets = tickets.map(ticket => {
          if (ticket.id === ticketId) {
            return { ...ticket, status, updatedAt: new Date() };
          }
          return ticket;
        });
        
        setTickets(updatedTickets);
        return;
      }
      
      // Fallback to local storage if API fails
      const updatedTickets = tickets.map(ticket => {
        if (ticket.id === ticketId) {
          return { ...ticket, status, updatedAt: new Date() };
        }
        return ticket;
      });

      localStorage.setItem('tickets', JSON.stringify(updatedTickets));
      socket.current?.emit('updateTicket', { ticketId, status });
      setTickets(updatedTickets);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || 'Failed to update ticket.';
        setError(errorMessage);
        console.error('Ticket update error:', errorMessage);
      } else {
        setError('An unexpected error occurred');
        console.error('Unexpected ticket update error:', err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // User logout
  const logout = () => {
    // Clear user data from state
    setUser(null);
    setToken(null);
    
    // Clear cookies
    clearAuthCookies();
    
    // Clear local storage items if needed
    localStorage.removeItem('user');
    
    // Redirect to login page if needed
    // window.location.href = '/login';
  };

  // Update user profile
  const updateProfile = async (data: Partial<User>) => {
    setLoading(true);
    setError(null);
    
    try {
      // If API is available, use it
      const response = await api.patch('/api/auth/profile', data);
      
      if (response.data && response.data.data) {
        const updatedUser = response.data.data;
        setUser(updatedUser);
        return;
      }
      
      // Fallback to local storage
      const updatedUser = { ...user, ...data } as User;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Update tickets if username changed
      if (data.name && tickets.length > 0) {
        const updatedTickets = tickets.map(ticket => {
          if (ticket.userId === parseInt(user?.id || '0')) {
            return { ...ticket, userName: data.name as string };
          }
          return ticket;
        });
        localStorage.setItem('tickets', JSON.stringify(updatedTickets));
        setTickets(updatedTickets);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || 'Failed to update profile.';
        setError(errorMessage);
        console.error('Profile update error:', errorMessage);
      } else {
        setError('An unexpected error occurred');
        console.error('Unexpected profile update error:', err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuth = async () => {
      // Check if we have auth cookies
      const savedToken = Cookies.get('token');
      const savedDeviceId = Cookies.get('DeviceId');
      
      if (savedToken && savedDeviceId) {
        setLoading(true);
        
        try {
          // Get user info using the saved token
          const response = await api.get('/api/auth/me');
          
          if (response.data && response.data.data) {
            setUser(response.data.data);
            setToken(savedToken);
          }
        } catch (err) {
          console.error('Failed to restore session:', err);
          // If token is invalid or expired, clear everything
          clearAuthCookies();
          setToken(null);
        } finally {
          setLoading(false);
        }
      }
      
      // Load tickets from localStorage for fallback
      const storedTickets = localStorage.getItem('tickets');
      if (storedTickets) {
        setTickets(JSON.parse(storedTickets));
      }
    };
    
    checkAuth();
    
    // Optional: Setup WebSocket connection for real-time updates
    // socket.current = io('wss://api.hmes.buubuu.id.vn');
    // socket.current.on('connect', () => {
    //   console.log('Connected to WebSocket');
    // });
    
    // return () => {
    //   socket.current?.disconnect();
    // };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        tickets,
        login,
        register,
        logout,
        updateProfile,
        submitTicket,
        updateTicketStatus,
        isAuthenticated,
        isAdmin,
        loading,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default api; // Export the API instance for direct use