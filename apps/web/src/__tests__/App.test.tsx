import { render, screen } from '@testing-library/react';
import { vi, describe, test, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '@/App';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-browser-router">{children}</div>
  ),
  Routes: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-routes">{children}</div>
  ),
  Route: ({ element, children }: { element?: React.ReactElement; children?: React.ReactNode }) => (
    <div data-testid="mock-route">
      {element}
      {children}
    </div>
  ),
  Outlet: () => <div data-testid="mock-outlet" />,
}));

// Mock the AuthProvider to simplify testing
vi.mock('../providers/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-auth-provider">{children}</div>
  ),
}));

// Mock react-toastify's ToastContainer
vi.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="mock-toast-container" />,
}));

// Mock page components
vi.mock('../pages/(public)/HomePage', () => ({
  default: () => <div data-testid="home-page">Home Page</div>,
}));
vi.mock('../pages/(public)/LoginPage', () => ({
  default: () => <div data-testid="login-page">Login Page</div>,
}));
vi.mock('../pages/(public)/RegisterPage', () => ({
  default: () => <div data-testid="register-page">Register Page</div>,
}));
vi.mock('../pages/(public)/NotFoundPage', () => ({
  default: () => <div data-testid="not-found-page">Not Found Page</div>,
}));
vi.mock('../pages/(authenticated)/DashboardPage', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Helper component to wrap App with providers
const TestApp = () => (
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<TestApp />);
    expect(screen.getByTestId('mock-browser-router')).toBeInTheDocument();
    expect(screen.getByTestId('mock-routes')).toBeInTheDocument();
    expect(screen.getByTestId('mock-toast-container')).toBeInTheDocument();
  });

  test('renders public routes correctly', () => {
    render(<TestApp />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.getByTestId('register-page')).toBeInTheDocument();
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
  });

  test('renders protected routes correctly', () => {
    render(<TestApp />);
    expect(screen.getByTestId('mock-auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    expect(screen.getByTestId('mock-outlet')).toBeInTheDocument();
  });
});
