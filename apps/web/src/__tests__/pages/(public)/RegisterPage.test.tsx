import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '@/pages/(public)/RegisterPage';
import * as authHooks from '@/api/auth/auth';
import * as jotai from 'jotai';
import * as authUtils from '@/utils/getIsAuthenticatedCookie';

// Mock the necessary hooks and utilities
jest.mock('@/api/auth/auth');
jest.mock('jotai', () => ({
  atom: jest.fn((initialValue) => initialValue), // Mock atom to return its initial value
  useSetAtom: jest.fn(),
  useAtom: jest.fn(),
}));
jest.mock('@/utils/getIsAuthenticatedCookie');

describe('RegisterPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock usePostRegister to return a successful status by default
    (authHooks.usePostRegister as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      status: 'success',
    });

    // Mock useAtom
    (jotai.useAtom as jest.Mock).mockReturnValue([false]);

    // Mock getIsAuthenticatedCookie to return false by default (not authenticated)
    (authUtils.default as jest.Mock).mockReturnValue(false);
  });

  test('renders RegisterPage component with correct elements', () => {
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
