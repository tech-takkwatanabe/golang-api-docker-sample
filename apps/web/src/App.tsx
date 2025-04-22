import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

// 保護されたルートコンポーネント
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
	const { token, isLoading } = useAuth();

	if (isLoading) {
		return <div className="flex justify-center items-center h-screen">Loading...</div>;
	}

	if (!token) {
		return <Navigate to="/login" />;
	}

	return <>{children}</>;
};

const AppRoutes = () => {
	return (
		<Routes>
			<Route path="/" element={<HomePage />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/register" element={<RegisterPage />} />
			<Route
				path="/dashboard"
				element={
					<ProtectedRoute>
						<DashboardPage />
					</ProtectedRoute>
				}
			/>
		</Routes>
	);
};

function App() {
	return (
		<AuthProvider>
			<Router>
				<AppRoutes />
			</Router>
		</AuthProvider>
	);
}

export default App;
