import { useNavigate } from 'react-router-dom';
import { usePostLoggedinLogout } from '@/api/auth/auth';
import { useQueryClient } from '@tanstack/react-query';

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: postLogout } = usePostLoggedinLogout();

  const logout = () => {
    postLogout(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/loggedin/user'] });
        navigate('/login');
      },
      onError: (error) => {
        console.error('Logout failed', error);
      },
    });
  };

  return logout;
};
