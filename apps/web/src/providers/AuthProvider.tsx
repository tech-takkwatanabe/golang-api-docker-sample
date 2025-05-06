import React, { useEffect } from 'react';
import { useGetLoggedinUser } from '@/api/auth/auth';
import { useAtom, useSetAtom } from 'jotai';
import { userAtom, isLoadingAtom, isAuthenticatedAtom } from '@/atoms/authAtom';
import getRefreshTokenExistsCookie from '@/utils/getRefreshTokenExistsCookie';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const checkeRefreshTokenExistsCookie = getRefreshTokenExistsCookie();
  useEffect(() => {
    if (!checkeRefreshTokenExistsCookie) {
      window.location.href = '/login';
    }
  }, []);

  const setUser = useSetAtom(userAtom);
  const setLoading = useSetAtom(isLoadingAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);

  const { data, isLoading, isError } = useGetLoggedinUser({ query: { retry: false } });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (!isLoading) {
      setUser(!isError && data ? data : null);
    }
  }, [data, isLoading, isError, setUser]);

  if (isLoading || (!isAuthenticated && checkeRefreshTokenExistsCookie)) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return <>{children}</>;
};
