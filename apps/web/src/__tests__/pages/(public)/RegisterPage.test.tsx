import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RegisterPage from '@/pages/(public)/RegisterPage';
import * as authHooks from '@/api/auth/auth';
import * as jotai from 'jotai';
import * as authUtils from '@/utils/getIsAuthenticatedCookie';

// Mock the necessary hooks and utilities
vi.mock('@/api/auth/auth');
vi.mock('jotai', () => ({
  atom: vi.fn((initialValue) => initialValue), // Mock atom to return its initial value
  useSetAtom: vi.fn(),
  useAtom: vi.fn(),
}));
vi.mock('@/utils/getIsAuthenticatedCookie');

describe('RegisterPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Mock usePostRegister to return a successful status by default
    vi.mocked(authHooks.usePostRegister).mockReturnValue({
      mutate: vi.fn(),
      status: 'success',
    } as any);

    // Mock useAtom
    vi.mocked(jotai.useAtom).mockReturnValue([false, vi.fn()]);

    // Mock getIsAuthenticatedCookie to return false by default (not authenticated)
    vi.mocked(authUtils.default).mockReturnValue(false);
  });

  it('renders RegisterPage component with correct elements', () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /アカウント登録/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/名前/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登録する/i })).toBeInTheDocument();
    expect(screen.getByText(/すでにアカウントをお持ちの方は/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ログイン/i })).toBeInTheDocument();
  });
});
