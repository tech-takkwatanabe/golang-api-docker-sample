import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './providers/AuthProvider';

import HomePage from './pages/(public)/HomePage';
import LoginPage from './pages/(public)/LoginPage';
import RegisterPage from './pages/(public)/RegisterPage';
import NotFoundPage from './pages/(public)/NotFoundPage';
import DashboardPage from './pages/(authenticated)/DashboardPage';
import { ProtectedRoute } from './components/ProtectedRoute';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<NotFoundPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
        <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      </Router>
    </QueryClientProvider>
  );
}
