import { Link } from 'react-router-dom';
import Button from '@/components/Button';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">認証アプリ</h1>
            </div>
            <div className="flex items-center">
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  ログイン
                </Link>
                <Link to="/register" className="ml-4">
                  <Button variant="primary">登録</Button>
                </Link>
              </>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Go + React 認証アプリケーション
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              JWT認証を使用したシンプルなアプリケーション
            </p>
            <div className="mt-8 flex justify-center">
              <Link to="/register">
                <Button variant="primary" size="large">
                  今すぐ始める
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
