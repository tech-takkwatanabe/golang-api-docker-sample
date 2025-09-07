import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider } from '@/providers/AuthProvider';
import { useGetLoggedinUser } from '@/api/auth/auth';
import getRefreshTokenExistsCookie from '@/utils/getRefreshTokenExistsCookie';
import { userAtom, isLoadingAtom } from '@/atoms/authAtom';

// Mock modules
vi.mock('@/api/auth/auth');
vi.mock('jotai', () => ({
  useAtom: vi.fn(),
  useSetAtom: vi.fn(),
  atom: vi.fn((init) => init),
}));
vi.mock('@/utils/getRefreshTokenExistsCookie');

// Import after mocks are set up
import * as jotai from 'jotai';

// Create mock functions
const mockUseGetLoggedinUser = vi.mocked(useGetLoggedinUser);
const mockGetRefreshTokenExistsCookie = vi.mocked(getRefreshTokenExistsCookie);
const mockUseAtom = vi.mocked(jotai.useAtom);
const mockUseSetAtom = vi.mocked(jotai.useSetAtom);

type UserData = {
  id: string;
  name: string;
};

describe('AuthProvider', () => {
  const MockChild = () => <div>Child Component</div>;

  beforeEach(() => {
    vi.clearAllMocks();
    const setAtom = vi.fn();
    
    // Simple mock implementation that satisfies TypeScript
    mockUseAtom.mockImplementation(() => [null, setAtom] as any);
    mockUseSetAtom.mockImplementation(() => setAtom);
    mockGetRefreshTokenExistsCookie.mockReturnValue(false);
  });

  it('should render children when not loading', () => {
    const mockResult = {
      data: undefined,
      dataUpdatedAt: 0,
      error: null,
      errorUpdateCount: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      isError: false,
      isFetched: false,
      isFetchedAfterMount: false,
      isFetching: false,
      isPaused: false,
      isLoading: false,
      isLoadingError: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      isSuccess: false,
      refetch: vi.fn(),
      status: 'pending',
      fetchStatus: 'idle',
      queryKey: ['user'],
    };

    mockUseGetLoggedinUser.mockReturnValue(mockResult as any);

    render(
      <AuthProvider>
        <MockChild />
      </AuthProvider>
    );

    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('should set user data when loaded', async () => {
    const mockSetUser = vi.fn();
    const mockSetLoading = vi.fn();

    mockUseSetAtom.mockImplementation((atom) => {
      if (atom === userAtom) return mockSetUser;
      if (atom === isLoadingAtom) return mockSetLoading;
      return vi.fn();
    });

    const userData = { id: '1', name: 'Test User' } as UserData;
    const mockSuccessResult = {
      data: userData,
      dataUpdatedAt: Date.now(),
      error: null,
      errorUpdateCount: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      isError: false,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isPaused: false,
      isLoading: false,
      isLoadingError: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      isSuccess: true,
      refetch: vi.fn(),
      status: 'success',
      fetchStatus: 'idle',
      queryKey: ['user'],
    };

    mockUseGetLoggedinUser.mockReturnValue(mockSuccessResult as any);

    render(
      <AuthProvider>
        <MockChild />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith(userData);
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });
  });

  it('should handle errors', async () => {
    const mockSetUser = vi.fn();
    const mockSetLoading = vi.fn();

    mockUseSetAtom.mockImplementation((atom) => {
      if (atom === userAtom) return mockSetUser;
      if (atom === isLoadingAtom) return mockSetLoading;
      return vi.fn();
    });

    const mockQuery = {
      data: undefined,
      error: new Error('Failed to fetch'),
      isError: true,
      isLoading: false,
      isSuccess: false,
      status: 'error',
      refetch: vi.fn(),
      queryKey: ['user'],
      isPending: false,
      isFetching: false,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      errorUpdatedAt: 0,
      dataUpdatedAt: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isInitialLoading: false,
      isLoadingError: true,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      fetchStatus: 'idle',
    } as const;

    mockUseGetLoggedinUser.mockReturnValue(mockQuery as unknown as ReturnType<typeof useGetLoggedinUser>);

    render(
      <AuthProvider>
        <MockChild />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith(null);
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });
  });
});
