import { render, screen } from '@testing-library/react';
import App from '@/App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
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
jest.mock('../providers/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-auth-provider">{children}</div>
  ),
}));

// Mock react-toastify's ToastContainer
jest.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="mock-toast-container" />,
}));

// Mock page components
jest.mock('../pages/(public)/HomePage', () => () => <div data-testid="home-page">Home Page</div>);
jest.mock('../pages/(public)/LoginPage', () => () => (
  <div data-testid="login-page">Login Page</div>
));
jest.mock('../pages/(public)/RegisterPage', () => () => (
  <div data-testid="register-page">Register Page</div>
));
jest.mock('../pages/(public)/NotFoundPage', () => () => (
  <div data-testid="not-found-page">Not Found Page</div>
));
jest.mock('../pages/(authenticated)/DashboardPage', () => () => (
  <div data-testid="dashboard-page">Dashboard Page</div>
));

const queryClient = new QueryClient();

describe('App Component', () => {
  test('renders without crashing', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    expect(screen.getByTestId('mock-browser-router')).toBeInTheDocument();
    expect(screen.getByTestId('mock-routes')).toBeInTheDocument();
    expect(screen.getByTestId('mock-toast-container')).toBeInTheDocument();
  });

  test('renders public routes correctly', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.getByTestId('register-page')).toBeInTheDocument();
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
  });

  test('renders protected routes correctly', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    expect(screen.getByTestId('mock-auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    expect(screen.getByTestId('mock-outlet')).toBeInTheDocument();
  });
});
