import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGetLoggedinUser } from '../../api/auth/auth';
import { useNavigate } from 'react-router-dom';

type User = {
  id: number;
  name: string;
  email: string;
};

const DashboardPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { data, isLoading, isError } = useGetLoggedinUser();

  useEffect(() => {
    // ログイン状態の確認
    const token = document.cookie.split(';').some((item) => item.trim().startsWith('accessTokenFromGoBackend='));
    if (!token) {
      navigate('/login'); // トークンが無い場合、ログインページへリダイレクト
      return;
    }

    if (data) {
      setUser(
        data.data
          ? {
              id: data.data.id ?? 0,
              name: (data.data.name as unknown as string) ?? '',
              email: (data.data.email as unknown as string) ?? '',
            }
          : null
      );
    }
    setLoading(isLoading);
    if (isError) {
      setError('ユーザー情報の取得に失敗しました');
    }
  }, [data, isLoading, isError, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login'); // ログアウト後はログインページへリダイレクト
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">ダッシュボード</h1>
            </div>
            <div className="flex items-center">
              <button type="button" onClick={handleLogout} className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">ユーザー情報</h2>

            {user && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">ID</p>
                  <p className="mt-1 text-sm text-gray-900">{user.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">名前</p>
                  <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">メールアドレス</p>
                  <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
