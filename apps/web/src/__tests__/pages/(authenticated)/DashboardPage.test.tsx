import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from '@/pages/(authenticated)/DashboardPage';
import * as jotai from 'jotai';
import * as authAtoms from '@/atoms/authAtom';
import * as useLogoutHook from '@/hooks/useLogout';

// Mock the necessary hooks and utilities
jest.mock('jotai', () => ({
  atom: jest.fn((initialValue) => initialValue), // Mock atom to return its initial value
  useSetAtom: jest.fn(),
  useAtom: jest.fn(),
}));
jest.mock('@/atoms/authAtom');
jest.mock('@/hooks/useLogout');

describe('DashboardPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock useAtom for userAtom, isLoadingAtom, isAuthenticatedAtom
    (jotai.useAtom as jest.Mock).mockImplementation((atom) => {
      if (atom === authAtoms.userAtom) {
        return [{
          data: {
            id: '123',
            name: 'Test User',
            email: 'test@example.com',
          },
        }, jest.fn()];
      } else if (atom === authAtoms.isLoadingAtom) {
        return [false, jest.fn()];
      } else if (atom === authAtoms.isAuthenticatedAtom) {
        return [true, jest.fn()];
      }
      return [undefined, jest.fn()];
    });

    // Mock useLogout
    (useLogoutHook.useLogout as jest.Mock).mockReturnValue(jest.fn());
  });

  test('renders DashboardPage component with user information when authenticated', () => {
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
