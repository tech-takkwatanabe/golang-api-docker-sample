// Mock external modules
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));
jest.mock('@/api/auth/auth', () => ({
  usePostLoggedinLogout: jest.fn(),
  postLoggedinRefresh: jest.fn(),
}));
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(),
}));
jest.mock('jotai', () => ({
  atom: jest.fn((initialValue) => ({ __isAtom: true, initialValue: initialValue })),
  useSetAtom: jest.fn(() => jest.fn()),
}));
jest.mock('axios', () => ({
  isAxiosError: jest.fn(),
}));
jest.mock('@/atoms/authAtom', () => ({
  userAtom: {},
  isLoadingAtom: {},
  isAuthenticatedAtom: {},
  subAtom: {},
}));

import { renderHook, act } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { usePostLoggedinLogout, postLoggedinRefresh } from '@/api/auth/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import axios from 'axios';
import { useLogout } from '@/hooks/useLogout';

describe('useLogout', () => {
  const mockNavigate = jest.fn();
  const mockPostLogout = jest.fn();
  const mockPostLoggedinRefresh = jest.fn();
  const mockInvalidateQueries = jest.fn();
  const mockSetSub = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (usePostLoggedinLogout as jest.Mock).mockReturnValue({
      mutateAsync: mockPostLogout,
    });
    (postLoggedinRefresh as jest.Mock).mockImplementation(mockPostLoggedinRefresh);
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
    (useSetAtom as jest.Mock).mockReturnValue(mockSetSub);
    (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(false); // Default to not an Axios error

    // Mock console.error to prevent it from polluting test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should successfully logout and navigate to login page', async () => {
    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current();
    });

    expect(mockPostLogout).toHaveBeenCalledTimes(1);
    expect(mockSetSub).toHaveBeenCalledWith('');
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['/loggedin/user'] });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should handle 401 error by refreshing token and retrying logout', async () => {
    mockPostLogout
      .mockRejectedValueOnce({ response: { status: 401 } })
      .mockResolvedValueOnce(undefined); // First call fails, second succeeds
    (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current();
    });

    expect(mockPostLogout).toHaveBeenCalledTimes(2);
    expect(mockPostLoggedinRefresh).toHaveBeenCalledTimes(1);
    expect(mockSetSub).toHaveBeenCalledWith('');
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['/loggedin/user'] });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should handle 401 error where refresh also fails', async () => {
    mockPostLogout.mockRejectedValueOnce({ response: { status: 401 } });
    mockPostLoggedinRefresh.mockRejectedValueOnce(new Error('Refresh failed'));
    (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current();
    });

    expect(mockPostLogout).toHaveBeenCalledTimes(1);
    expect(mockPostLoggedinRefresh).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Logout failed after refresh', expect.any(Error));
    expect(mockSetSub).toHaveBeenCalledWith('');
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['/loggedin/user'] });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should handle other logout errors', async () => {
    const genericError = new Error('Network error');
    mockPostLogout.mockRejectedValueOnce(genericError);
    (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current();
    });

    expect(mockPostLogout).toHaveBeenCalledTimes(1);
    expect(mockPostLoggedinRefresh).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Logout failed', genericError);
    expect(mockSetSub).toHaveBeenCalledWith('');
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['/loggedin/user'] });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
