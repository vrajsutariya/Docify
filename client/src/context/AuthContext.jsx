import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('docify_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('docify_token') || null;
  });

  const [isLoading, setIsLoading] = useState(true);

  // Initialize and verify session on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('docify_token');
      if (!savedToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // If it's an offline guest demo token, keep existing guest session without calling /me
      if (savedToken.startsWith('guest_demo_token')) {
        try {
          const stored = localStorage.getItem('docify_user');
          if (stored) {
            setUser(JSON.parse(stored));
          }
        } catch {}
        setIsLoading(false);
        return;
      }

      try {
        const res = await authService.getMe();
        if (res?.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('docify_user', JSON.stringify(res.data.user));

          // Sync saved preferences if available
          if (res.data.user.preferredLanguage) {
            localStorage.setItem('docify-lang', res.data.user.preferredLanguage);
          }
          if (res.data.user.theme) {
            localStorage.setItem('docify-theme', res.data.user.theme);
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Session verification note:', err?.message);
        // Don't violently boot if offline; check if stored user exists
        const storedUser = localStorage.getItem('docify_user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            authService.logout();
            setUser(null);
            setToken(null);
          }
        } else {
          authService.logout();
          setUser(null);
          setToken(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      const { user: userData, token: userToken } = res.data;

      setUser(userData);
      setToken(userToken);
      localStorage.setItem('docify_token', userToken);
      localStorage.setItem('docify_user', JSON.stringify(userData));

      if (userData.preferredLanguage) {
        localStorage.setItem('docify-lang', userData.preferredLanguage);
        document.documentElement.lang = userData.preferredLanguage;
      }
      if (userData.theme) {
        localStorage.setItem('docify-theme', userData.theme);
        if (userData.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      return { success: true, user: userData };
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Login failed. Please check your credentials.',
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      const { user: userData, token: userToken } = res.data;

      setUser(userData);
      setToken(userToken);
      localStorage.setItem('docify_token', userToken);
      localStorage.setItem('docify_user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Registration failed. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const guestLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await authService.guestLogin();
      const userData = res.data?.user || {
        _id: 'guest_demo_user',
        name: 'Guest Explorer',
        email: 'guest@docify.demo',
        role: 'user',
        preferredLanguage: 'en',
        theme: 'dark',
      };
      const userToken = res.data?.token || 'guest_demo_token_' + Date.now();

      setUser(userData);
      setToken(userToken);
      localStorage.setItem('docify_token', userToken);
      localStorage.setItem('docify_user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch {
      const fallbackUser = {
        _id: 'guest_demo_user',
        name: 'Guest Explorer',
        email: 'guest@docify.demo',
        role: 'user',
        preferredLanguage: 'en',
        theme: 'dark',
      };
      const fallbackToken = 'guest_demo_token_' + Date.now();
      setUser(fallbackUser);
      setToken(fallbackToken);
      localStorage.setItem('docify_token', fallbackToken);
      localStorage.setItem('docify_user', JSON.stringify(fallbackUser));
      return { success: true, user: fallbackUser };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('docify_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        guestLogin,
        logout,
        updateUser,
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

export default AuthContext;
