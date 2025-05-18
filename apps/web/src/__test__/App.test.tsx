import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock your page components
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

// Mock your AuthProvider
jest.mock('../providers/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

describe('<App />', () => {
  it('renders the BrowserRouter', () => {
    render(<App />);
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });

  it('renders the public routes', () => {
    render(<App />);
    expect(screen.getByTestId('route-/')).toHaveTextContent('Home Page');
    expect(screen.getByTestId('route-/login')).toHaveTextContent('Login Page');
    expect(screen.getByTestId('route-/register')).toHaveTextContent('Register Page');
    expect(screen.getByTestId('route-*')).toHaveTextContent('Not Found Page');
  });

  it('renders the protected route within AuthProvider', () => {
    render(<App />);
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
  });
});
