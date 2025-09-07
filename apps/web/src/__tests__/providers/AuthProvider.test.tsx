import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider } from '@/providers/AuthProvider';
import { useGetLoggedinUser } from '@/api/auth/auth';
import getRefreshTokenExistsCookie from '@/utils/getRefreshTokenExistsCookie';
import { userAtom, isLoadingAtom } from '@/atoms/authAtom';
import type { DtoUserDTO } from '@/api/models/dtoUserDTO';
import type { DtoErrorResponse } from '@/api/models/dtoErrorResponse';

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

type UserData = DtoUserDTO;

// Simplified mock query result type
type MockQueryResult<TData, TError> = {
  data: TData | undefined;
  error: TError | null;
  isError: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  refetch: () => Promise<unknown>;
  status: string;
  queryKey: string[];
  [key: string]: unknown; // For other properties we might need
};

// Helper function to create a mock query result
const createMockQueryResult = <TData, TError>(
  overrides: Partial<MockQueryResult<TData, TError>>
): MockQueryResult<TData, TError> => ({
  data: undefined,
  error: null,
  isError: false,
  isLoading: false,
  isSuccess: false,
  refetch: vi.fn().mockResolvedValue({}),
  status: 'pending',
  queryKey: [],
  ...overrides,
});

describe('AuthProvider', () => {
  const MockChild = () => <div>Child Component</div>;

  beforeEach(() => {
    vi.clearAllMocks();
    const setAtom = vi.fn();

    // Mock implementation with proper types
    (mockUseAtom as any).mockImplementation((atom: unknown) => {
      if (atom === userAtom || atom === isLoadingAtom) {
        return [null, setAtom];
      }
      return [null, vi.fn()];
    });

    (mockUseSetAtom as any).mockImplementation((atom: unknown) => {
      if (atom === userAtom || atom === isLoadingAtom) {
        return setAtom;
      }
      return vi.fn();
    });

    mockGetRefreshTokenExistsCookie.mockReturnValue(false);
  });

  it('should render children when not loading', () => {
    const mockResult = createMockQueryResult<UserData, DtoErrorResponse>({
      status: 'pending',
      queryKey: ['user'],
      isLoading: false,
    });

    // Type assertion to bypass TypeScript error for the test
    (mockUseGetLoggedinUser as any).mockReturnValue(mockResult);

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
      if (atom === userAtom) return mockSetUser as unknown as () => void;
      if (atom === isLoadingAtom) return mockSetLoading as unknown as () => void;
      return vi.fn();
    });

    const userData: UserData = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockSuccessResult = createMockQueryResult<UserData, DtoErrorResponse>({
      data: userData,
      isSuccess: true,
      status: 'success',
      queryKey: ['user'],
    });

    // Type assertion to bypass TypeScript error for the test
    (mockUseGetLoggedinUser as any).mockReturnValue(mockSuccessResult);

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
      if (atom === userAtom) return mockSetUser as unknown as () => void;
      if (atom === isLoadingAtom) return mockSetLoading as unknown as () => void;
      return vi.fn();
    });

    const mockQuery = createMockQueryResult<UserData, DtoErrorResponse>({
      error: { message: 'Failed to fetch' } as DtoErrorResponse,
      isError: true,
      isSuccess: false,
      status: 'error',
      queryKey: ['user'],
    });

    // Type assertion to bypass TypeScript error for the test
    (mockUseGetLoggedinUser as any).mockReturnValue(mockQuery);

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
