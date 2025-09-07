import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider } from '@/providers/AuthProvider';
import { useGetLoggedinUser } from '@/api/auth/auth';
import getRefreshTokenExistsCookie from '@/utils/getRefreshTokenExistsCookie';
import type { DtoUserDTO } from '@/api/models/dtoUserDTO';
import * as jotai from 'jotai';

// Simple mock implementations
vi.mock('@/api/auth/auth', () => ({
  useGetLoggedinUser: vi.fn(),
}));

vi.mock('jotai', () => ({
  useAtom: vi.fn(),
  useSetAtom: vi.fn(),
  atom: vi.fn((init) => init),
}));

vi.mock('@/utils/getRefreshTokenExistsCookie', () => ({
  default: vi.fn(),
}));

type UserData = DtoUserDTO;

// Mock functions
const mockUseGetLoggedinUser = useGetLoggedinUser as ReturnType<typeof vi.fn>;
const mockGetRefreshTokenExistsCookie = getRefreshTokenExistsCookie as ReturnType<typeof vi.fn>;
const mockUseAtom = jotai.useAtom as ReturnType<typeof vi.fn>;
const mockUseSetAtom = jotai.useSetAtom as ReturnType<typeof vi.fn>;

describe('AuthProvider', () => {
  const MockChild = () => <div>Child Component</div>;
  let setAtomMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    setAtomMock = vi.fn();
    
    // Setup default mocks
    mockUseAtom.mockImplementation(() => [null, setAtomMock]);
    mockUseSetAtom.mockImplementation(() => setAtomMock);
    mockGetRefreshTokenExistsCookie.mockReturnValue(false);
  });

  it('renders children when not loading', () => {
    mockUseGetLoggedinUser.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      isSuccess: false,
      status: 'idle',
    });

    render(
      <AuthProvider>
        <MockChild />
      </AuthProvider>
    );

    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('sets user data on successful load', async () => {
    const userData: UserData = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockUseGetLoggedinUser.mockReturnValue({
      data: userData,
      isSuccess: true,
      status: 'success',
      isLoading: false,
      isError: false,
    });

    render(
      <AuthProvider>
        <MockChild />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(setAtomMock).toHaveBeenCalledWith(userData);
      expect(setAtomMock).toHaveBeenCalledWith(false);
    });
  });

  it('handles errors during user data fetch', async () => {
    const error = new Error('Test error');
    mockUseGetLoggedinUser.mockReturnValue({
      error,
      isError: true,
      status: 'error',
      isLoading: false,
      isSuccess: false,
    });

    render(
      <AuthProvider>
        <MockChild />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(setAtomMock).toHaveBeenCalledWith(null);
      expect(setAtomMock).toHaveBeenCalledWith(false);
    });
  });
});
