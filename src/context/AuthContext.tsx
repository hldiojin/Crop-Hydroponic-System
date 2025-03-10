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
  refeshToken: string; 
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
  changePassword: (data: { oldPassword: string; newPassword: string; confirmPassword: string }) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  getUserInfo: () => Promise<User>;  // Add this line
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
  changePassword
: async () => {},
  submitTicket: async () => {},
  updateTicketStatus: async () => {},
  getUserInfo: async () => ({} as User),  // Add this line
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
  },
  withCredentials: true, 
});

api.interceptors.request.use(
  (config) => {
    const deviceId = Cookies.get('DeviceId') || localStorage.getItem('DeviceId');
    const refreshToken = Cookies.get('RefreshToken') || localStorage.getItem('RefreshToken');
    const authToken = localStorage.getItem('authToken');
    
    console.log(`Request to ${config.url}:`, {
      deviceId: deviceId ? 'exists' : 'missing',
      refreshToken: refreshToken ? 'exists' : 'missing',
      authToken: authToken ? 'exists' : 'missing'
    });
    
    // Create custom cookie header
    if (deviceId && refreshToken && config.headers) {
      const cookieString = `DeviceId=${deviceId}; RefreshToken=${refreshToken}`;
      
      try {
        config.headers.set('Cookie', cookieString);
      } catch (e) {
        config.headers['Cookie'] = cookieString;
      }
    }
    
    // Add individual headers as before
    if (deviceId && config.headers) {
      // Try both methods to set headers for compatibility
      try {
        config.headers.set('DeviceId', deviceId);
      } catch (e) {
        config.headers['DeviceId'] = deviceId;
      }
    }
    
    // Add refresh token to headers if available
    if (refreshToken && config.headers) {
      try {
        config.headers.set('RefreshToken', refreshToken);
      } catch (e) {
        config.headers['RefreshToken'] = refreshToken;
      }
    }
    
    // Add authorization header
    if (authToken && config.headers) {
      try {
        config.headers.set('Authorization', `Bearer ${authToken}`);
      } catch (e) {
        config.headers['Authorization'] = `Bearer ${authToken}`;
      }
    }
    
    // Ensure content type headers are set
    if (config.headers) {
      try {
        config.headers.set('Content-Type', 'application/json');
        config.headers.set('Accept', 'application/json');
      } catch (e) {
        config.headers['Content-Type'] = 'application/json';
        config.headers['Accept'] = 'application/json';
      }
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

    // Thiết lập các tùy chọn cho cookie
    const saveAuthToCookies = (authData: AuthData) => {
      const isLocalhost = window.location.hostname === 'localhost';
    
      const cookieOptions = {
        expires: 7,
        path: '/',
        domain: 'hmes.buubuu.id.vn', // Đảm bảo domain phù hợp
        secure: window.location.protocol === 'https:',
        sameSite: (isLocalhost ? 'lax' : 'strict') as 'lax' | 'strict', // Ép kiểu trực tiếp
      };
    
      Cookies.remove('DeviceId', { path: '/' });
      Cookies.remove('RefreshToken', { path: '/' });
    
      Cookies.set('DeviceId', authData.deviceId, cookieOptions);
      Cookies.set('RefreshToken', authData.refeshToken, cookieOptions);
    
      localStorage.setItem('DeviceId', authData.deviceId);
      localStorage.setItem('RefreshToken', authData.refeshToken);
      localStorage.setItem('authToken', authData.token);
    };
  
  // Helper function to clear auth cookies
  const clearAuthCookies = () => {
    Cookies.remove('DeviceId', { path: '/' });
    Cookies.remove('RefreshToken', { path: '/' });
  };

  const login = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/auth/login', data);
      console.log('Login response:', response.data);
      const userData = response.data?.data || response.data?.response?.data;
      if (userData) {
        setUser(userData);
        if (userData.auth) {
  setToken(userData.auth.token);
  
  saveAuthToCookies(userData.auth);


  
  setTimeout(() => {
    const deviceId = Cookies.get('DeviceId');
    const refreshToken = Cookies.get('RefreshToken');
    
    console.log('Cookies after login:', {
      DeviceId: deviceId || 'missing',
      RefreshToken: refreshToken || 'missing',
      AllCookies: document.cookie
    });
    
    // If cookies weren't set properly, try using document.cookie directly
    if (!deviceId || !refreshToken) {
      console.warn('Cookies not set via js-cookie, trying direct method');
      
      // Set cookies manually as a fallback
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      document.cookie = `DeviceId=${userData.auth.deviceId}; path=/; expires=${expires.toUTCString()}`;
      document.cookie = `RefreshToken=${userData.auth.refeshToken}; path=/; expires=${expires.toUTCString()}`;
    }
  }, 100);
  
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
        let errorMessage = 'Incorrect email or password. Please try again.';
        
        if (err.response) {
          // If we have a response, check the status code
          if (err.response.status === 401) {
            errorMessage = 'Incorrect email or password. Please try again.';
          } else if (err.response.status === 404) {
            errorMessage = 'Account not found. Please check your email address.';
          } else if (err.response.data?.message) {
            errorMessage = err.response.data.message;
          }
        } else if (err.code === 'ERR_NETWORK') {
          errorMessage = 'Network error: Unable to connect to the server. Please try again later.';
        }
        
        setError(errorMessage);
        console.error('Login error:', errorMessage);
      } else if (err instanceof Error) {
        setError(err.message);
        console.error('Login error:', err.message);
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
    // Send registration request
    const response = await api.post('/api/auth/register', data);
    console.log('Register response:', response.data);
    
    // Check if registration was successful
    if (response.data?.statusCodes === 200 || response.data?.response?.message) {
      // Registration successful - now log in with the same credentials
      console.log('Registration successful, attempting login...');
      
      // Automatically log in the user after successful registration
      try {
        await login({
          email: data.email,
          password: data.password
        });
        
        // If login succeeds, function will return naturally
        return;
      } catch (loginErr) {
        // If auto-login fails, throw a more specific error
        console.error('Auto-login after registration failed:', loginErr);
        throw new Error('Registration successful, but automatic login failed. Please try logging in manually.');
      }
    } else if (response.data?.error || response.data?.response?.error) {
      // API returned an error message
      const errorMessage = response.data?.error || response.data?.response?.error || 'Registration failed';
      throw new Error(errorMessage);
    } else {
      // Unexpected response format
      console.error('Register response structure:', JSON.stringify(response.data, null, 2));
      throw new Error('Unexpected response from server');
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      // Handle API errors
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.response?.message 
        || 'Registration failed. Please try again.';
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
    } else if (err instanceof Error) {
      // Handle custom errors
      setError(err.message);
      console.error('Register error:', err.message);
    } else {
      // Handle unexpected errors
      setError('An unexpected error occurred');
      console.error('Unexpected register error:', err);
    }
    throw err;
  } finally {
    setLoading(false);
  }
};

const getUserInfo = async () => {
  setLoading(true);
  setError(null);

  try {
    // Lấy authToken từ localStorage
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
      console.error('Missing authentication token');
      throw new Error('Authentication required. Please log in again.');
    }

    // Tạo headers cho request
    console.log('Making request to /api/user/me with cookies included');

    // Gửi request với Axios
    const deviceId = Cookies.get('DeviceId');
    const refreshToken = Cookies.get('RefreshToken');
    
    console.log('document.cookie:', deviceId);
    const response = await axios({
      method: 'GET',
      url: 'https://api.hmes.buubuu.id.vn/api/user/me',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cookie': document.cookie,
      },
      withCredentials: true, 
    });

    console.log('User info response:', response.data);

    if (response.data?.statusCodes === 200 || response.data?.data) {
      const userData = response.data?.data || response.data?.response?.data;

      if (userData) {
        setUser(prevUser => ({
          ...prevUser,
          ...userData,
        }));
        return userData;
      }
    }

    throw new Error('Failed to fetch user information');
  } catch (err: unknown) { // Explicitly type the error as unknown
    console.error('Error fetching user info:', err);
    
    // Type guard to handle the error properly
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('An error occurred while fetching user information.');
    }
    
    // Ensure we return a rejected promise
    return Promise.reject(err);
  } finally {
    setLoading(false);
  }
};


// Change password function
const changePassword = async (data: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
  setLoading(true);
  setError(null);
  
  try {
    // Validate that new password and confirm password match
    if (data.newPassword !== data.confirmPassword) {
      throw new Error('New password and confirm password do not match');
    }

    if (!user || !user.id) {
      throw new Error('You must be logged in to change');
    }
    
    // Call the API to change password
    const deviceId = Cookies.get('DeviceId');
    const refreshToken = Cookies.get('RefreshToken');

    if (!deviceId || !refreshToken) {
      throw new Error('Device ID or refresh token missing. Please log in again.');
    }

    console.log('Using tokens:', { deviceId, refreshToken});

    const response = await api.post('/api/auth/me/change-password', {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword
    },  
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'DeviceId':deviceId,
        'RefreshToken' : refreshToken
      }
    }
  );
    
    console.log('Change password response:', response.data);
    
    // Check if password change was successful
    if (response.data?.statusCode === 200 || 
        response.data?.message === 'Password changed successfully' ||
        response.data?.response?.message) {
      return;
    } else {
      // API returned an error or unexpected format
      const errorMessage = 
        response.data?.error || 
        response.data?.message || 
        response.data?.response?.message || 
        'Failed to change password';
      throw new Error(errorMessage);
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      // Handle API errors
      let errorMessage = 'Failed to change password. Please try again.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Current password is incorrect.';
        } else if (err.response.status === 400) {
          errorMessage = err.response?.data?.message || 'Password validation failed. Please check password requirements.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Network error: Unable to connect to the server. Please try again later.';
      }
      
      setError(errorMessage);
      console.error('Change password error:', errorMessage);
    } else if (err instanceof Error) {
      setError(err.message);
      console.error('Change password error:', err.message);
    } else {
      setError('An unexpected error occurred');
      console.error('Unexpected change password error:', err);
    }
    throw err;
  } finally {
    setLoading(false);
  }
};

// Update the logout function in your AuthContext.tsx file

// Replace the async logout function with this version
const logout = () => {
  setLoading(true);
  setError(null);
  
  // Clear user data from state first for immediate UI feedback
  setUser(null);
  setToken(null);
  
  // Clear cookies
  clearAuthCookies();
  
  // Clear local storage items
  localStorage.removeItem('user');
  localStorage.removeItem('cart');  // Also clear cart if you have one
  
  // Send logout request to the API (don't await it)
  if (user?.email) {
    api.post('/api/auth/logout', {
      email: user.email,
      password: "" // Required by API
    }).catch(err => {
      console.error('Logout error:', err);
      // We don't need to handle this error in the UI since user is already logged out locally
    }).finally(() => {
      setLoading(false);
    });
  } else {
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
        changePassword,
        submitTicket,
        updateTicketStatus,
        getUserInfo,
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