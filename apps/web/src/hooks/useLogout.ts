import { useNavigate } from 'react-router-dom';
import { postLoggedinRefresh, usePostLoggedinLogout } from '@/api/auth/auth';
import { useQueryClient } from '@tanstack/react-query';
import { subAtom } from '@/atoms/authAtom';
import { useSetAtom } from 'jotai';
import axios from 'axios';

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutateAsync: postLogout } = usePostLoggedinLogout();
  const setSub = useSetAtom(subAtom);

  const logout = async () => {
    try {
      await postLogout();
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        try {
          await postLoggedinRefresh();
          await postLogout();
        } catch (finalError) {
          console.error('Logout failed after refresh', finalError);
        }
      } else {
        console.error('Logout failed', error);
      }
    } finally {
      setSub('');
      queryClient.removeQueries({ queryKey: ['/loggedin/user'] });
      navigate('/login');
    }
  };

  return logout;
};
