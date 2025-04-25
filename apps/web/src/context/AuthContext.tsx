import React, { createContext, useContext, useState, useEffect } from 'react';
import { readTokenFromCookie } from '../utils/cookie';

type AuthContextType = {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = readTokenFromCookie('accessTokenFromGoBackend');
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    setToken(token);
  };

  const logout = () => {
    setToken(null);
    document.cookie = `accessTokenFromGoBackend=; Max-Age=0; path=/;`;
  };

  return <AuthContext.Provider value={{ token, login, logout, isLoading }}>{children}</AuthContext.Provider>;
};
