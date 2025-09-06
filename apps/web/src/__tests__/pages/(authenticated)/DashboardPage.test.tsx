import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import DashboardPage from '@/pages/(authenticated)/DashboardPage';
import * as jotai from 'jotai';
import * as authAtoms from '@/atoms/authAtom';
import * as useLogoutHook from '@/hooks/useLogout';

// Mock the necessary hooks and utilities
vi.mock('jotai', () => ({
  atom: vi.fn((initialValue) => initialValue), // Mock atom to return its initial value
  useSetAtom: vi.fn(),
  useAtom: vi.fn(),
}));
vi.mock('@/atoms/authAtom');
vi.mock('@/hooks/useLogout');

describe('DashboardPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Mock useAtom for userAtom, isLoadingAtom, isAuthenticatedAtom
    vi.mocked(jotai.useAtom).mockImplementation((atom) => {
      if (atom === authAtoms.userAtom) {
        return [
          {
            data: {
              id: '123',
              name: 'Test User',
              email: 'test@example.com',
            },
          },
          vi.fn(),
        ] as any;
      } else if (atom === authAtoms.isLoadingAtom) {
        return [false, vi.fn()] as any;
      } else if (atom === authAtoms.isAuthenticatedAtom) {
        return [true, vi.fn()] as any;
      }
      return [undefined, vi.fn()] as any;
    });

    // Mock useLogout
    vi.mocked(useLogoutHook.useLogout).mockReturnValue(vi.fn() as any);
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
