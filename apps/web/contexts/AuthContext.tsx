'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API Configuration - use local API in development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';
const AWS_API_URL = 'https://zdsrl1mlbg.execute-api.us-east-1.amazonaws.com/Prod';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se há usuário logado no localStorage ao carregar
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          setIsLoading(false);
          return true;
        }
      }
      
      // Fallback to test credentials if AWS fails
      if (username === 'admin' && password === 'admin') {
        const fallbackUser = {
          id: '1',
          username: 'admin',
          role: 'admin' as const
        };
        setUser(fallbackUser);
        localStorage.setItem('user', JSON.stringify(fallbackUser));
        setIsLoading(false);
        return true;
      }
      
      if (username === 'geekathon' && password === 'geekathon') {
        const fallbackUser = {
          id: '2',
          username: 'geekathon',
          role: 'user' as const
        };
        setUser(fallbackUser);
        localStorage.setItem('user', JSON.stringify(fallbackUser));
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback to test credentials if AWS fails
      if (username === 'admin' && password === 'admin') {
        const fallbackUser = {
          id: '1',
          username: 'admin',
          role: 'admin' as const
        };
        setUser(fallbackUser);
        localStorage.setItem('user', JSON.stringify(fallbackUser));
        setIsLoading(false);
        return true;
      }
      
      if (username === 'geekathon' && password === 'geekathon') {
        const fallbackUser = {
          id: '2',
          username: 'geekathon',
          role: 'user' as const
        };
        setUser(fallbackUser);
        localStorage.setItem('user', JSON.stringify(fallbackUser));
        setIsLoading(false);
        return true;
      }
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
