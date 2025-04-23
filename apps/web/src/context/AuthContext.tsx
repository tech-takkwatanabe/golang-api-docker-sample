import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useGetLoggedinUser } from '../api/auth/auth';
import type { DtoUserDTOResponse } from '../api/models/dtoUserDTOResponse';

type AuthContextType = {
  user: DtoUserDTOResponse | undefined;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<DtoUserDTOResponse>();
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // トークンが保存されている場合、ユーザー情報を取得
    const loadUser = () => {
      if (token) {
        try {
          // ここでは生成されたAPIをimportしてユーザー情報を取得します
          const { data } = useGetLoggedinUser();
          setUser(data);
        } catch (error) {
          // console.error('ユーザー情報の取得に失敗しました', error);
          localStorage.removeItem('token');
          setToken(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(undefined);
  };

  const value = {
    user,
    token,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
