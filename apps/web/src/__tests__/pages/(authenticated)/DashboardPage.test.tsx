import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import DashboardPage from '@/pages/(authenticated)/DashboardPage';
import * as jotai from 'jotai';
import * as authAtoms from '@/atoms/authAtom';
import * as useLogoutHook from '@/hooks/useLogout';
import type { DtoUserDTOResponse } from '@/api/models/dtoUserDTOResponse';
import type { DtoUserDTO } from '@/api/models/dtoUserDTO';

// Mock the necessary hooks and utilities
vi.mock('jotai', () => ({
  atom: vi.fn((initialValue) => initialValue), // Mock atom to return its initial value
  useSetAtom: vi.fn(),
  useAtom: vi.fn(),
}));
vi.mock('@/atoms/authAtom');
vi.mock('@/hooks/useLogout');

describe('DashboardPage', () => {
  const mockSetUser = vi.fn();
  const mockSetIsLoading = vi.fn();
  const mockSetIsAuthenticated = vi.fn();
  const mockLogout = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Mock useAtom for userAtom, isLoadingAtom, isAuthenticatedAtom
    (jotai.useAtom as any).mockImplementation((atom: any) => {
      if (atom === authAtoms.userAtom) {
        const mockUser: DtoUserDTO = {
          id: 123,
          name: 'Test User',
          email: 'test@example.com',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        };
        const mockUserResponse: DtoUserDTOResponse = { data: mockUser };
        return [mockUserResponse, mockSetUser];
      } else if (atom === authAtoms.isLoadingAtom) {
        return [false, mockSetIsLoading];
      } else if (atom === authAtoms.isAuthenticatedAtom) {
        return [true, mockSetIsAuthenticated];
      }
      return [undefined, vi.fn()];
    });

    // Mock useLogout
    vi.mocked(useLogoutHook.useLogout).mockReturnValue(mockLogout);
  });

  it('renders DashboardPage component with user information when authenticated', () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /ダッシュボード/i })).toBeInTheDocument();
    expect(screen.getByText('ユーザー情報')).toBeInTheDocument();
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText('名前')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ログアウト/i })).toBeInTheDocument();
  });
});
