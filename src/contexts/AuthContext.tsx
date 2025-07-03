import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // API base URL - replace with your backend URL
  const API_BASE_URL = 'http://localhost:3001/api';

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Verify token with backend
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('auth_token');
      toast({
        title: "Backend Connection Failed",
        description: "Cannot connect to the authentication server. Please ensure your backend is running on http://localhost:3001",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          throw new Error(error.message || 'Login failed');
        } else {
          const text = await response.text();
          console.error('Login failed, non-JSON response:', text);
          throw new Error('Login failed: Server returned non-JSON response');
        }
      }

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      } else {
        const text = await response.text();
        console.error('Login failed, non-JSON response:', text);
        throw new Error('Login failed: Server returned non-JSON response');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please ensure your backend is running on http://localhost:3001');
      }
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          throw new Error(error.message || 'Signup failed');
        } else {
          const text = await response.text();
          console.error('Signup failed, non-JSON response:', text);
          throw new Error('Signup failed: Server returned non-JSON response');
        }
      }

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        toast({
          title: "Account created!",
          description: "Welcome to SmartSpend!",
        });
      } else {
        const text = await response.text();
        console.error('Signup failed, non-JSON response:', text);
        throw new Error('Signup failed: Server returned non-JSON response');
      }
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please ensure your backend is running on http://localhost:3001');
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
