// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

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
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  photoURL?: string;
  address?: string;
  phone?: string;
}

interface StoredUser extends User {
  password: string;
}

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
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const socket = useRef<Socket>();

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  const adminUser: User = {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  };

  useEffect(() => {
    socket.current = io('http://localhost:3000');

    socket.current.on('ticketUpdated', (updatedTicket: Ticket) => {
      setTickets(prev => prev.map(ticket => 
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      ));
    });

    socket.current.on('newTicket', (ticket: Ticket) => {
      setTickets(prev => [...prev, ticket]);
    });

    const storedTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    setTickets(storedTickets);

    return () => {
      socket.current?.disconnect();
    };
  }, []);

  const login = async (data: { email: string; password: string }) => {
    if (data.email === 'admin@example.com' && data.password === 'admin') {
      setUser(adminUser);
      setToken('admin-token');
      localStorage.setItem('user', JSON.stringify(adminUser));
      localStorage.setItem('token', 'admin-token');
    } else {
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

  const register = async (data: { name: string; email: string; password: string; phone: string; address: string }) => {
    const newUser: StoredUser = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      role: 'user',
      password: data.password,
      phone: data.phone,
      address: data.address,
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

  const submitTicket = async (ticketData: Omit<Ticket, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const newTicket: Ticket = {
      ...ticketData,
      id: Date.now().toString(),
      userId: user?.id ?? 0,
      userName: user?.name ?? "",
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const storedTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    localStorage.setItem('tickets', JSON.stringify([...storedTickets, newTicket]));

    socket.current?.emit('submitTicket', newTicket);
    setTickets(prev => [...prev, newTicket]);
  };

  const updateTicketStatus = async (ticketId: string, status: Ticket['status']) => {
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return { ...ticket, status, updatedAt: new Date() };
      }
      return ticket;
    });

    localStorage.setItem('tickets', JSON.stringify(updatedTickets));
    socket.current?.emit('updateTicket', { ticketId, status });
    setTickets(updatedTickets);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateProfile = async (data: Partial<User>) => {
    const updatedUser = { ...user, ...data };
    setUser(updatedUser as User);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    if (data.name && tickets.length > 0) {
      const updatedTickets = tickets.map(ticket => {
        if (ticket.userId === user?.id) {
          return { ...ticket, userName: data.name as string };
        }
        return ticket;
      });
      localStorage.setItem('tickets', JSON.stringify(updatedTickets));
      setTickets(updatedTickets);
    }
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