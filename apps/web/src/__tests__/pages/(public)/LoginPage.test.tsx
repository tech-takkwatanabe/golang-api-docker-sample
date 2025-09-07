import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
type Mock = ReturnType<typeof vi.fn>;
import LoginPage from '@/pages/(public)/LoginPage';
import * as authHooks from '@/api/auth/auth';
import * as authUtils from '@/utils/getIsAuthenticatedCookie';
import type { DtoLoginResponse } from '@/api/models/dtoLoginResponse';

// Mock the necessary hooks and utilities
vi.mock('@/api/auth/auth', () => ({
  usePostLogin: vi.fn(),
  // Add other exports from auth if needed
}));

vi.mock('jotai', () => ({
  atom: vi.fn((initialValue) => initialValue), // Mock atom to return its initial value
  useSetAtom: vi.fn(),
  useAtom: vi.fn(),
}));

vi.mock('@/utils/getIsAuthenticatedCookie', () => ({
  default: vi.fn(),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Create a mock mutation object with proper typing
    const mockMutation = {
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue({
        accessToken: 'test-token',
        refreshToken: 'test-refresh-token',
      } as DtoLoginResponse),
      reset: vi.fn(),
      status: 'success' as const,
      isPending: false,
      isSuccess: true,
      isError: false,
      data: {
        accessToken: 'test-token',
        refreshToken: 'test-refresh-token',
      } as DtoLoginResponse,
      error: null,
      isIdle: false,
      failureCount: 0,
      isPaused: false,
      failureReason: null,
      submittedAt: Date.now(),
      variables: { data: { email: 'test@example.com', password: 'password' } },
      context: undefined,
    };

    // Set up the mock implementation
    (authHooks.usePostLogin as Mock).mockImplementation(() => mockMutation);

    // Mock getIsAuthenticatedCookie to return false by default (not authenticated)
    (authUtils.default as Mock).mockReturnValue(false);
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
