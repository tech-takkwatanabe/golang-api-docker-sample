import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import type { DtoUserDTO } from '@/api/models/dtoUserDTO';
import DashboardPage from '@/pages/(authenticated)/DashboardPage';
import { useLogout } from '@/hooks/useLogout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WritableAtom } from 'jotai';

// Types for our test atoms
type TestAtom<T> = WritableAtom<T, [T], void> & { key: string };

type Mock = ReturnType<typeof vi.fn>;

declare module 'jotai' {
  function useAtom<T>(atom: TestAtom<T>): [T, (value: T) => void];
}

// Mock Jotai
vi.mock('jotai', () => ({
  useAtom: vi.fn(),
  useSetAtom: vi.fn(),
  atom: vi.fn((_, key) => ({ key })),
}));

// Mock auth atoms
vi.mock('@/atoms/authAtom', () => ({
  userAtom: { key: 'user' },
  isLoadingAtom: { key: 'isLoading' },
  isAuthenticatedAtom: { key: 'isAuthenticated' },
}));

// Mock useLogout
const mockLogout = vi.fn().mockResolvedValue(undefined);
vi.mock('@/hooks/useLogout', () => ({
  useLogout: vi.fn(() => mockLogout),
}));

// Import Jotai after mocks are set up
import * as jotai from 'jotai';

const queryClient = new QueryClient();

const renderDashboardPage = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('DashboardPage', () => {
  const mockSetUser = vi.fn();
  const mockSetIsLoading = vi.fn();
  const mockSetIsAuthenticated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock implementations with proper typing
    (jotai.useAtom as Mock).mockImplementation((atom: { key: string }) => {
      if (atom.key === 'user') return [null, mockSetUser];
      if (atom.key === 'isLoading') return [false, mockSetIsLoading];
      if (atom.key === 'isAuthenticated') return [false, mockSetIsAuthenticated];
      return [null, vi.fn()];
    });
  });

  const mockUser: DtoUserDTO = {
    id: 123,
    name: 'Test User',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  test('renders loading state initially', () => {
    (jotai.useAtom as Mock).mockImplementation((atom: { key: string }) => {
      if (atom.key === 'isLoading') return [true, vi.fn()];
      if (atom.key === 'user') return [null, vi.fn()];
      if (atom.key === 'isAuthenticated') return [false, vi.fn()];
      return [null, vi.fn()];
    });

    renderDashboardPage();

    expect(screen.getByText('loading...')).toBeInTheDocument();
  });

  test('renders user data when loaded', () => {
    (jotai.useAtom as Mock).mockImplementation((atom: { key: string }) => {
      if (atom.key === 'user') return [mockUser, mockSetUser];
      if (atom.key === 'isLoading') return [false, mockSetIsLoading];
      if (atom.key === 'isAuthenticated') return [true, mockSetIsAuthenticated];
      return [null, vi.fn()];
    });

    renderDashboardPage();

    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    expect(screen.getByText('ユーザー情報')).toBeInTheDocument();
    expect(screen.getByText('ログアウト')).toBeInTheDocument();
  });

  test('calls logout when logout button is clicked', async () => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mocks
    (jotai.useAtom as Mock).mockImplementation((atom: { key: string }) => {
      if (atom.key === 'user') return [mockUser, mockSetUser];
      if (atom.key === 'isLoading') return [false, mockSetIsLoading];
      if (atom.key === 'isAuthenticated') return [true, mockSetIsAuthenticated];
      return [null, vi.fn()];
    });

    // Set up the mock implementation
    mockLogout.mockResolvedValue(undefined);
    (useLogout as Mock).mockReturnValue(mockLogout);

    // Render the component
    renderDashboardPage();

    // Find and click the logout button
    const logoutButton = screen.getByRole('button', { name: 'ログアウト' });
    await userEvent.click(logoutButton);

    // Wait for the async logout to be called
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  test('renders dashboard with user information when authenticated', () => {
    (jotai.useAtom as Mock).mockImplementation((atom: { key: string }) => {
      if (atom.key === 'user') return [mockUser, mockSetUser];
      if (atom.key === 'isLoading') return [false, mockSetIsLoading];
      if (atom.key === 'isAuthenticated') return [true, mockSetIsAuthenticated];
      if (atom.key === 'isLoading') return [false, mockSetIsLoading];
      if (atom.key === 'isAuthenticated') return [true, mockSetIsAuthenticated];
      return [null, vi.fn()];
    });

    renderDashboardPage();

    // Check for static text
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    expect(screen.getByText('ユーザー情報')).toBeInTheDocument();

    // Check for user data labels
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('名前')).toBeInTheDocument();
    expect(screen.getByText('メールアドレス')).toBeInTheDocument();

    // Check for logout button
    expect(screen.getByRole('button', { name: 'ログアウト' })).toBeInTheDocument();
  });
});
