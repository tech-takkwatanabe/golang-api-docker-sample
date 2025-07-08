import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '@/pages/(public)/LoginPage';
import * as authHooks from '@/api/auth/auth';
import * as authUtils from '@/utils/getIsAuthenticatedCookie';

// Mock the necessary hooks and utilities
jest.mock('@/api/auth/auth');
jest.mock('jotai', () => ({
  atom: jest.fn((initialValue) => initialValue), // Mock atom to return its initial value
  useSetAtom: jest.fn(),
  useAtom: jest.fn(),
}));
jest.mock('@/utils/getIsAuthenticatedCookie');

describe('LoginPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock usePostLogin to return a successful status by default
    (authHooks.usePostLogin as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      status: 'success',
    });

    // Mock getIsAuthenticatedCookie to return false by default (not authenticated)
    (authUtils.default as jest.Mock).mockReturnValue(false);
  });

  test('renders LoginPage component with correct elements', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /ログイン/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument();
    expect(screen.getByText(/アカウントをお持ちでない方は/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /登録する/i })).toBeInTheDocument();
  });
});
