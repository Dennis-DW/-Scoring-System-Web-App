// contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Get API URL from environment with fallback
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost/scoringsystem/backend';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  },
  validateStatus: status => status < 500
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
    if (error.response?.status === 401) {
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get('/check_auth.php');
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);


  // contexts/AuthContext.js
  const login = async (email, password, remember = false) => {
    try {
      setError(null);
      console.log('Attempting login...');

      const response = await api.post('/login.php', {
        email,
        password,
        remember
      });

      console.log('Raw response:', response.data);

      // Clean response data;
      let data = response.data;
      if (typeof data === 'string') {
        data = JSON.parse(data.substring(data.indexOf('{')));
      }

      if (!data.success || !data.token || !data.user) {
        throw new Error(data.error || 'Invalid server response');
      }

      localStorage.setItem('token', data.token);
      if (remember && data.refresh_token) {
        localStorage.setItem('refreshToken', data.refresh_token);
      }

      setUser(data.user);
      return data.user;

    } catch (err) {
      console.error('Login error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      const errorMessage = err.response?.data?.error ||
        err.message ||
        'Login failed';

      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      if (user) {
        await api.post('/logout.php');
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
      window.location.href = '/login';
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateUser: (data) => setUser(prev => ({ ...prev, ...data })),
    isAuthenticated: !!user,
    hasRole: (role) => user?.role === role
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
export default AuthProvider;