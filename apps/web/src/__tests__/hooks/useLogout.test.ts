import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { usePostLoggedinLogout, postLoggedinRefresh } from '@/api/auth/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { useLogout } from '@/hooks/useLogout';
import type { AxiosError } from 'axios';

// Helper type for mocks
type MockFn = {
  (): any;
  mockReturnValue: (value: any) => void;
  mockImplementation: (fn: any) => void;
  mockResolvedValue: (value: any) => void;
  mockRejectedValue: (error: any) => void;
  mockResolvedValueOnce: (value: any) => void;
  mockRejectedValueOnce: (error: any) => void;
  mockClear: () => void;
};

// Mock all the required modules
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('@/api/auth/auth', () => ({
  usePostLoggedinLogout: vi.fn(),
  postLoggedinRefresh: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(),
}));

vi.mock('jotai', () => ({
  useSetAtom: vi.fn(),
}));

// Mock axios
vi.mock('axios', () => ({
  __esModule: true,
  default: {
    isAxiosError: (value: any) => value?.isAxiosError === true,
  },
  isAxiosError: (value: any) => value?.isAxiosError === true,
}));

// Mock auth atoms
vi.mock('@/atoms/authAtom', () => ({
  userAtom: {},
  isLoadingAtom: {},
  isAuthenticatedAtom: {},
  subAtom: {},
}));

// Type for our mock axios error
// Mock error types
interface MockAxiosError extends Error {
  isAxiosError: boolean;
  response?: {
    status: number;
    data?: unknown;
  };
  config?: unknown;
}

// Type assertion helpers
const asMock = <T>(fn: T): T & MockFn => fn as unknown as T & MockFn;

describe('useLogout', () => {
  // Create mock functions
  const mockNavigate = asMock(vi.fn());
  const mockPostLogout = asMock(vi.fn());
  const mockPostLoggedinRefresh = asMock(vi.fn());
  const mockRemoveQueries = asMock(vi.fn());
  const mockSetSub = asMock(vi.fn());

  // Setup mocks
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock implementations
    asMock(useNavigate).mockReturnValue(mockNavigate);
    asMock(usePostLoggedinLogout).mockReturnValue({
      mutateAsync: mockPostLogout,
    });
    asMock(postLoggedinRefresh).mockImplementation(mockPostLoggedinRefresh);
    asMock(useQueryClient).mockReturnValue({
      removeQueries: mockRemoveQueries,
      getDefaultOptions: vi.fn(),
      fetchQuery: vi.fn(),
      fetchInfiniteQuery: vi.fn(),
      prefetchQuery: vi.fn(),
      prefetchInfiniteQuery: vi.fn(),
      ensureQueryData: vi.fn(),
      executeMutation: vi.fn(),
      getQueryHooks: vi.fn(),
    });
    asMock(useSetAtom).mockReturnValue(mockSetSub);
  });

  it('should handle logout success', async () => {
    // Setup
    mockPostLogout.mockResolvedValue(undefined);

    // Execute
    const { result } = renderHook(() => useLogout());
    await act(async () => {
      const logout = result.current as () => Promise<void>;
      await logout();
    });

    // Verify
    expect(mockPostLogout).toHaveBeenCalled();
    expect(mockRemoveQueries).toHaveBeenCalled();
    expect(mockSetSub).toHaveBeenCalledWith('');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should handle 401 error and attempt refresh', async () => {
    // Setup
    const error = {
      isAxiosError: true,
      response: {
        status: 401,
      },
      name: 'Test Error',
      message: 'Unauthorized',
    };

    mockPostLogout.mockRejectedValueOnce(error);
    mockPostLoggedinRefresh.mockResolvedValueOnce({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    // Execute
    const { result } = renderHook(() => useLogout());
    await act(async () => {
      const logout = result.current as () => Promise<void>;
      await logout();
    });

    // Verify
    expect(mockPostLogout).toHaveBeenCalled();
    expect(mockPostLoggedinRefresh).toHaveBeenCalled();
  });

  it('should handle refresh failure', async () => {
    // Setup
    const error = {
      isAxiosError: true,
      response: {
        status: 401,
      },
      name: 'Test Error',
      message: 'Unauthorized',
    };

    mockPostLogout.mockRejectedValueOnce(error);
    mockPostLoggedinRefresh.mockRejectedValueOnce(new Error('Refresh failed'));

    // Execute
    const { result } = renderHook(() => useLogout());
    await act(async () => {
      const logout = result.current as () => Promise<void>;
      await logout();
    });

    // Verify
    expect(mockPostLogout).toHaveBeenCalled();
    expect(mockPostLoggedinRefresh).toHaveBeenCalled();
    expect(mockSetSub).toHaveBeenCalledWith('');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should handle non-401 error', async () => {
    // Setup
    const error = new Error('Network error');
    mockPostLogout.mockRejectedValueOnce(error);

    // Execute
    const { result } = renderHook(() => useLogout());
    await act(async () => {
      const logout = result.current as () => Promise<void>;
      await logout();
    });

    // Verify
    expect(mockPostLogout).toHaveBeenCalled();
    expect(mockPostLoggedinRefresh).not.toHaveBeenCalled();
    expect(mockSetSub).toHaveBeenCalledWith('');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
