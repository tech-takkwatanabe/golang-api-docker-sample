import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import LoginPage from '@/pages/(public)/LoginPage';
import * as authHooks from '@/api/auth/auth';
import * as authUtils from '@/utils/getIsAuthenticatedCookie';

// Mock the necessary hooks and utilities
vi.mock('@/api/auth/auth');
vi.mock('jotai', () => ({
  atom: vi.fn((initialValue) => initialValue), // Mock atom to return its initial value
  useSetAtom: vi.fn(),
  useAtom: vi.fn(),
}));
vi.mock('@/utils/getIsAuthenticatedCookie');

describe('LoginPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Mock usePostLogin to return a successful status by default
    vi.mocked(authHooks.usePostLogin).mockReturnValue({
      mutate: vi.fn(),
      status: 'success',
    } as any);

    // Mock getIsAuthenticatedCookie to return false by default (not authenticated)
    vi.mocked(authUtils.default).mockReturnValue(false);
  });

  it('renders LoginPage component with correct elements', () => {
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
