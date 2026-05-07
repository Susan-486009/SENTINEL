import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session from tokens
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('as_access_token');
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await authService.me();
        setUser(data);
      } catch (err) {
        console.error('Session initialization failed:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      
      // Save tokens
      localStorage.setItem('as_access_token',  data.accessToken);
      localStorage.setItem('as_refresh_token', data.refreshToken);
      
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      return data.user;
    } catch (err) {
      toast.error(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      
      // Save tokens
      localStorage.setItem('as_access_token',  data.accessToken);
      localStorage.setItem('as_refresh_token', data.refreshToken);
      
      setUser(data);
      toast.success('Account created successfully!');
      return data;
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('as_access_token');
    localStorage.removeItem('as_refresh_token');
    toast.info('Signed out successfully.');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register,
      logout, 
      isAuthenticated: !!user, 
      isAdmin: user?.role === 'admin',
      loading 
    }}>
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
