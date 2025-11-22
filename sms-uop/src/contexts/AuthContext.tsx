import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import apiService from '../services/api';

interface AuthContextType {
  user: User | null;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to check if the user is currently logged in via session cookie
  const checkAuthStatus = async () => {
    try {
      // We don't set loading true here to avoid flickering on navigations
      const response = await apiService.admin.getCurrentUser();
      if (response.data && response.data.email) {
        setUser(response.data);
        setError(null);
      }
    } catch (err) {
      // If 401 or 403, user is not logged in
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Check authentication on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const loginWithGoogle = () => {
    setLoading(true);
    setError(null);
    // Redirect browser to backend OAuth endpoint
    // The backend will redirect back to the frontend on success
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
    window.location.href = `${backendUrl}/oauth2/authorization/google`;
  };

  const logout = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
      // We redirect to the logout endpoint which handles session invalidation
      // and then redirects back to the home page
      window.location.href = `${backendUrl}/api/auth/logout`;
      setUser(null);
    } catch (err) {
      console.error('Logout failed', err);
      setUser(null);
    }
  };

  const isAuthenticated = !!user;
  // Check if user has one of the admin roles
  const isAdmin = user?.role !== undefined &&
      ['dean', 'assistant_registrar', 'vice_chancellor', 'student_service'].includes(user.role.toLowerCase());

  return (
      <AuthContext.Provider value={{
        user,
        loginWithGoogle,
        logout,
        isAuthenticated,
        isAdmin,
        loading,
        error,
        checkAuthStatus
      }}>
        {children}
      </AuthContext.Provider>
  );
};