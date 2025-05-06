import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './providers/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';

import HomePage from './pages/(public)/HomePage';
import LoginPage from './pages/(public)/LoginPage';
import RegisterPage from './pages/(public)/RegisterPage';
import NotFoundPage from './pages/(public)/NotFoundPage';
import DashboardPage from './pages/(authenticated)/DashboardPage';

const queryClient = new QueryClient();

// 認証が必要なルートをまとめるレイアウト
const AuthenticatedLayout = () => (
  <AuthProvider>
    <ProtectedRoute>
      <Outlet /> {/* ネストされたルートがここに描画される */}
    </ProtectedRoute>
  </AuthProvider>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />

          {/* Protected Routes */}
          <Route element={<AuthenticatedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Routes>
        <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      </Router>
    </QueryClientProvider>
  );
}
