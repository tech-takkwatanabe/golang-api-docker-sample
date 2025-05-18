import { ReactNode } from 'react';

export const BrowserRouter = ({ children }: { children: ReactNode }) => (
  <div data-testid="router">{children}</div>
);

export const Routes = ({ children }: { children: ReactNode }) => (
  <div data-testid="routes">{children}</div>
);

export const Route = ({
  path,
  element,
  children,
}: {
  path?: string;
  element?: ReactNode;
  children?: ReactNode;
}) => {
  const routePath = path || (element ? 'dashboard' : '/');
  if (element) {
    return <div data-testid={`route-${routePath}`}>{element}</div>;
  }
  if (children) {
    return <div data-testid={`route-${routePath}`}>{children}</div>;
  }
  return null;
};

export const Outlet = () => <div data-testid="dashboard-page">Dashboard Page</div>;

export const Link = ({ to, children }: { to: string; children: ReactNode }) => (
  <a href={to} data-testid={`link-${to}`}>
    {children}
  </a>
);

export const useNavigate = jest.fn();
export const useParams = jest.fn(() => ({}));
export const useLocation = jest.fn(() => ({ pathname: '/' }));
export const useRouteMatch = jest.fn(() => null);
