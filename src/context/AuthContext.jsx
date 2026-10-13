import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiLogin, apiRegister, apiGetCurrentUser, apiUpdateSalary, getStoredToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('cacheflow_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(getStoredToken());
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('cacheflow_token');
    localStorage.removeItem('cacheflow_user');
    setToken(null);
    setUser(null);
  }, []);

  // Listen to 401 unauthorized events from api client
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  // Check current user if token exists on initial load
  useEffect(() => {
    const initAuth = async () => {
      const stored = getStoredToken();
      if (stored) {
        try {
          const profile = await apiGetCurrentUser();
          setUser(profile);
          localStorage.setItem('cacheflow_user', JSON.stringify(profile));
        } catch (err) {
          console.warn('Initial session validation failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [logout]);

  const login = async (username, password) => {
    const res = await apiLogin(username, password);
    const { token: jwtToken, ...userInfo } = res;
    localStorage.setItem('cacheflow_token', jwtToken);
    localStorage.setItem('cacheflow_user', JSON.stringify(userInfo));
    setToken(jwtToken);
    setUser(userInfo);
    return userInfo;
  };

  const register = async (username, email, password) => {
    const res = await apiRegister(username, email, password);
    const { token: jwtToken, ...userInfo } = res;
    localStorage.setItem('cacheflow_token', jwtToken);
    localStorage.setItem('cacheflow_user', JSON.stringify(userInfo));
    setToken(jwtToken);
    setUser(userInfo);
    return userInfo;
  };

  const updateUserSalary = async (newSalary) => {
    const updated = await apiUpdateSalary(newSalary);
    setUser(prev => {
      const next = { ...prev, salary: updated.salary };
      localStorage.setItem('cacheflow_user', JSON.stringify(next));
      return next;
    });
    return updated;
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
    updateUserSalary,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
