// providers/AuthProvider.js
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

const STORAGE_KEY = 'auth_state';
const API_URL = process.env.REACT_APP_API_URL || '';

// Axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await api.post('/refresh_token.php', { refreshToken });
        const { token } = response.data;
        localStorage.setItem('token', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    token: localStorage.getItem('token'),
    loading: true,
    error: null
  });

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        setState(JSON.parse(savedState));
      }
      if (state.token) {
        await validateToken();
      }
    } catch (error) {
      console.error('Auth state restoration failed:', error);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const validateToken = async () => {
    try {
      const response = await api.get('/validate_token.php');
      setState(prev => ({ ...prev, user: response.data.user }));
    } catch (error) {
      handleLogout();
    }
  };

  const handleLogin = async (email, password, remember = false) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await api.post('/login.php', { email, password });
      const { user, token, refreshToken } = response.data;

      const authState = {
        user,
        token,
        loading: false,
        error: null
      };

      setState(authState);
      localStorage.setItem('token', token);
      
      if (remember) {
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
      }

      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Authentication failed';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  };

  const handleLogout = async () => {
    try {
      if (state.token) {
        await api.post('/logout.php');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem(STORAGE_KEY);
      setState({
        user: null,
        token: null,
        loading: false,
        error: null
      });
    }
  };

  const handleUpdateProfile = async (userData) => {
    try {
      const response = await api.put('/update_profile.php', userData);
      setState(prev => ({
        ...prev,
        user: { ...prev.user, ...response.data.user }
      }));
    } catch (error) {
      throw new Error('Profile update failed');
    }
  };

  const isAuthenticated = !!state.token && !!state.user;
  const hasRole = (role) => state.user?.roles?.includes(role);

  const value = {
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated,
    hasRole,
    login: handleLogin,
    logout: handleLogout,
    updateProfile: handleUpdateProfile
  };

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
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

export default AuthProvider;