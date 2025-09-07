import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { usePostLoggedinLogout, postLoggedinRefresh } from '@/api/auth/auth';
import type { DtoMessageResponse } from '@/api/models/dtoMessageResponse';
import { useQueryClient, QueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { useLogout } from '@/hooks/useLogout';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => ({
  default: {
    isAxiosError: vi.fn() as unknown as typeof axios.isAxiosError,
  },
  isAxiosError: vi.fn() as unknown as typeof axios.isAxiosError,
}));

type MockedFunction = {
  mockReturnValue: (value: boolean) => void;
  mockImplementation: <T>(fn: T) => void;
  mockResolvedValue: <T>(value: T) => void;
  mockRejectedValue: (reason?: unknown) => void;
  mockClear: () => void;
  mockReset: () => void;
};

// Mock external modules
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
  atom: vi.fn((initialValue) => ({ __isAtom: true, initialValue })),
  useSetAtom: vi.fn(() => vi.fn()),
}));

vi.mock('axios', () => ({
  default: {
    isAxiosError: vi.fn(),
  },
  isAxiosError: vi.fn(),
}));

vi.mock('@/atoms/authAtom', () => ({
  userAtom: {},
  isLoadingAtom: {},
  isAuthenticatedAtom: {},
  subAtom: {},
}));

describe('useLogout', () => {
  const mockNavigate = vi.fn();
  const mockPostLogout = vi.fn();
  const mockRemoveQueries = vi.fn();
  const mockSetSub = vi.fn();
  const mockPostLoggedinRefresh = vi.fn(() => Promise.resolve({}));

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    const mockMutation = {
      mutateAsync: mockPostLogout,
      mutate: vi.fn(),
      reset: vi.fn(),
      status: 'idle' as const,
      isPending: false,
      isSuccess: false,
      isError: false,
      data: undefined as DtoMessageResponse | undefined,
      error: null,
      isIdle: true,
      failureCount: 0,
      isPaused: false,
      failureReason: null,
      isStale: false,
      submittedAt: 0,
      variables: undefined,
      context: undefined,
    };
    
    vi.mocked(usePostLoggedinLogout).mockReturnValue(mockMutation as any);
    vi.mocked(postLoggedinRefresh).mockImplementation(mockPostLoggedinRefresh);
    vi.mocked(useQueryClient).mockReturnValue({
      invalidateQueries: vi.fn(),
      removeQueries: mockRemoveQueries,
      getQueryData: vi.fn(),
      setQueryData: vi.fn(),
      getQueryState: vi.fn(),
      setDefaultOptions: vi.fn(),
      setQueryDefaults: vi.fn(),
      getQueryDefaults: vi.fn(),
      getQueryCache: vi.fn(),
      getMutationCache: vi.fn(),
      isFetching: vi.fn(),
      isMutating: vi.fn(),
      getDefaultOptions: vi.fn(),
      fetchQuery: vi.fn(),
      fetchInfiniteQuery: vi.fn(),
      prefetchQuery: vi.fn(),
      prefetchInfiniteQuery: vi.fn(),
      ensureQueryData: vi.fn(),
      executeMutation: vi.fn(),
      getQueryHooks: vi.fn(),
    } as unknown as QueryClient);
    vi.mocked(useSetAtom).mockReturnValue(mockSetSub);
    (axios.isAxiosError as unknown as MockedFunction).mockReturnValue(false);
  });

  it('should handle logout success', async () => {
    mockPostLogout.mockResolvedValue({});

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      const logout = result.current as () => Promise<void>;
      await logout();
    });

    expect(mockPostLogout).toHaveBeenCalled();
    expect(mockRemoveQueries).toHaveBeenCalledWith({ queryKey: ['/loggedin/user'] });
    expect(mockSetSub).toHaveBeenCalledWith('');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should handle 401 error by refreshing token and retrying logout', async () => {
    mockPostLogout
      .mockRejectedValueOnce({ response: { status: 401 } })
      .mockResolvedValueOnce(undefined); // First call fails, second succeeds
    (axios.isAxiosError as unknown as MockedFunction).mockReturnValue(true);

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      const logout = result.current as () => Promise<void>;
      await logout();
    });

    expect(mockPostLogout).toHaveBeenCalledTimes(2);
    expect(mockPostLoggedinRefresh).toHaveBeenCalled();
    expect(mockSetSub).toHaveBeenCalledWith('');
    expect(mockRemoveQueries).toHaveBeenCalledWith({ queryKey: ['/loggedin/user'] });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should handle refresh token failure', async () => {
    const error = new Error('Refresh failed');
    mockPostLogout.mockRejectedValueOnce({
      response: { status: 401 },
      config: { url: '/api/logout' },
    });
    
    // Mock axios.isAxiosError to return true for this test
    (axios.isAxiosError as unknown as MockedFunction).mockReturnValue(true);
    
    // Mock postLoggedinRefresh to return a rejected promise
    vi.mocked(postLoggedinRefresh).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      const logout = result.current as () => Promise<void>;
      await logout();
    });

    expect(mockPostLogout).toHaveBeenCalled();
    expect(postLoggedinRefresh).toHaveBeenCalled();
    expect(mockRemoveQueries).toHaveBeenCalledWith({ queryKey: ['/loggedin/user'] });
    expect(mockSetSub).toHaveBeenCalledWith('');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should handle non-axios error', async () => {
    const error = new Error('Network error');
    mockPostLogout.mockRejectedValue(error);
    (axios.isAxiosError as unknown as MockedFunction).mockReturnValue(false);

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      const logout = result.current as () => Promise<void>;
      await logout();
    });

    expect(mockPostLogout).toHaveBeenCalled();
    expect(mockRemoveQueries).toHaveBeenCalledWith({ queryKey: ['/loggedin/user'] });
    expect(mockSetSub).toHaveBeenCalledWith('');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
