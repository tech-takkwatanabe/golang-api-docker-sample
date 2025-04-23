import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePostLogin } from '../api/auth/auth';
import { useAuth } from '../context/AuthContext';
import type { DtoErrorResponse } from '../api/models';
import { useState } from 'react';
import { emailSchema, loginPasswordSchema } from '../schemas/auth';

const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate: loginMutation, status } = usePostLogin({
    mutation: {
      onSuccess: (data) => {
        if (data?.data?.token) {
          login(data.data.token);
          navigate('/dashboard');
        } else {
          setErrorMessage('ログインに失敗しました');
        }
      },
      onError: (error: DtoErrorResponse) => {
        setErrorMessage(error?.error || 'ログインに失敗しました');
      },
    },
  });

  const isLoading = status === 'pending';

  const onSubmit = (data: LoginForm) => {
    setErrorMessage('');
    loginMutation({ data });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">ログイン</h2>

        {errorMessage && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{errorMessage}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              メールアドレス
            </label>
            <input id="email" type="email" {...register('email')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="your@email.com" />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              パスワード
            </label>
            <input id="password" type="password" {...register('password')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="******" />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div className="mb-6">
            <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isLoading}>
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>
          </div>

          <div className="text-center">
            <p>
              アカウントをお持ちでない方は{' '}
              <a href="/register" className="text-blue-500 hover:text-blue-600">
                登録する
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
