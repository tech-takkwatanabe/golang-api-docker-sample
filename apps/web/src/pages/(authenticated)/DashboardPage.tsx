import { useAtom } from 'jotai';
import { userAtom, isLoadingAtom, isAuthenticatedAtom } from '@/atoms/authAtom';
import { useNavigate } from 'react-router-dom';
import { useLogout } from '@/hooks/useLogout';
import Button from '@/components/Button';

const DashboardPage = () => {
  const [user] = useAtom(userAtom);
  const [isLoading] = useAtom(isLoadingAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const navigate = useNavigate();
  const logout = useLogout();

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // 認証されていない場合、またはユーザー情報がない場合にリダイレクト
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">ダッシュボード</h1>
            </div>
            <div className="flex items-center">
              <Button variant="danger" onClick={handleLogout} className="ml-4">
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">ユーザー情報</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">ID</p>
                <p className="mt-1 text-sm text-gray-900">{user?.data?.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">名前</p>
                <p className="mt-1 text-sm text-gray-900">{String(user?.data?.name || '')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">メールアドレス</p>
                <p className="mt-1 text-sm text-gray-900">{String(user?.data?.email || '')}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
