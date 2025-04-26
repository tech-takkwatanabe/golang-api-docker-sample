import React, { useEffect } from 'react';
import { useGetLoggedinUser } from '@/api/auth/auth';
import { useSetAtom } from 'jotai';
import { userAtom, isLoadingAtom } from '@/atoms/authAtom';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setUser = useSetAtom(userAtom);
  const setLoading = useSetAtom(isLoadingAtom);

  const { data, isLoading, isError } = useGetLoggedinUser({
    query: { retry: false },
  });

  useEffect(() => {
    setLoading(isLoading);

    if (!isLoading) {
      if (!isError && data) {
        setUser(data);
      } else {
        setUser(null);
      }
    }
  }, [data, isLoading, isError, setUser, setLoading]);

  return <>{children}</>;
};
