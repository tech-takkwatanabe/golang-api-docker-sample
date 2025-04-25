import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/(public)/HomePage';
import LoginPage from '../pages/(public)/LoginPage';
import RegisterPage from '../pages/(public)/RegisterPage';
import NotFoundPage from '../pages/(public)/NotFoundPage';

export default function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
