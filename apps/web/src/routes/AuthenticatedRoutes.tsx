import { Routes, Route } from 'react-router-dom';
import DashboardPage from '../pages/(authenticated)/DashboardPage';
import NotFoundPage from '../pages/(public)/NotFoundPage';
import { AuthProvider } from '../context/AuthContext';

export default function AuthenticatedRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <AuthProvider>
            <DashboardPage />
          </AuthProvider>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
