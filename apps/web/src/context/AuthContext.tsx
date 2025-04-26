import React, { createContext, useContext } from 'react';
import { useGetLoggedinUser, usePostLoggedinLogout } from '@/api/auth/auth';
import { useQueryClient } from '@tanstack/react-query';
import { DtoUserDTOResponse } from '@/api/models';

type AuthContextType = {
  user: DtoUserDTOResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
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
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    isError,
  } = useGetLoggedinUser({
    query: {
      retry: false,
    },
  });

  const { mutate: postLogout } = usePostLoggedinLogout();

  const logout = () => {
    postLogout(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/loggedin/user'] });
      },
      onError: (error) => {
        console.error('Logout failed', error);
      },
    });
  };

  const isAuthenticated = !isLoading && !isError && !!user;

  return <AuthContext.Provider value={{ user: user ?? null, isAuthenticated, isLoading, logout }}>{children}</AuthContext.Provider>;
};
