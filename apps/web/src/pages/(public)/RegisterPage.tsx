import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePostRegister } from '@/api/auth/auth';
import type { DtoErrorResponse } from '@/api/models';
import { nameSchema, emailSchema, registPasswordSchema } from '@/schemas/auth';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { isAuthenticatedAtom } from '@/atoms/authAtom';
import getIsAuthenticatedCookie from '@/utils/getIsAuthenticatedCookie';
import Button from '@/components/Button';

const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: registPasswordSchema,
});

type RegisterForm = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkeAuthCookie = getIsAuthenticatedCookie();
    if (checkeAuthCookie) {
      navigate('/dashboard');
    }
  }, []);

  const [isAuthenticated] = useAtom(isAuthenticatedAtom);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const { mutate: registerMutation, status } = usePostRegister();
  const isLoading = status === 'pending';

  const translateError = (errorCode: string): string => {
    switch (errorCode) {
      case 'email already in use':
        return 'すでに登録されているメールアドレスです';
      case 'invalid password':
        return 'パスワードが無効です';
      default:
        return '登録に失敗しました';
    }
  };

  const onSubmit = (data: RegisterForm) => {
    registerMutation(
      { data },
      {
        onSuccess: () => {
          navigate('/login', {
            state: { message: '登録が完了しました。ログインしてください。', email: data.email },
          });
        },
        onError: (error) => {
          const axiosError = error as AxiosError<DtoErrorResponse>;
          const errorCode = axiosError.response?.data?.error ?? 'unknown error';
          const message = translateError(errorCode);
          toast.error(message);
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">アカウント登録</h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              名前
            </label>
            <input
              id="name"
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="山田太郎"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="******"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="mb-6">
            <Button type="submit" variant="primary" loading={isLoading} className="w-full">
              登録する
            </Button>
          </div>

          <div className="text-center">
            <p>
              すでにアカウントをお持ちの方は{' '}
              <a href="/login" className="text-blue-500 hover:text-blue-600">
                ログイン
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
