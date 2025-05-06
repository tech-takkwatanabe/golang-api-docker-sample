// apps/web/src/providers/AuthProvider.tsx
import React, { useEffect } from 'react';
import { useGetLoggedinUser } from '@/api/auth/auth';
import { useSetAtom } from 'jotai';
import { userAtom, isLoadingAtom } from '@/atoms/authAtom';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setUser = useSetAtom(userAtom);
  const setLoading = useSetAtom(isLoadingAtom);
  const { data, isLoading, isError } = useGetLoggedinUser({ query: { retry: false } });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (!isLoading) {
      setUser(!isError && data ? data : null);
    }
  }, [data, isLoading, isError, setUser]);

  return <>{children}</>;
};
