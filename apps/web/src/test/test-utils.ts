import { vi } from 'vitest';
import type { 
  QueryClient,
  UseQueryResult,
  UseMutationResult
} from '@tanstack/react-query';
import type { NavigateFunction } from 'react-router-dom';

// Simple mock function
export const createMockFn = vi.fn;

// Mock React Query hooks
export const mockReactQueryHooks = () => ({
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
  useQueryClient: vi.fn(),
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useIsFetching: vi.fn().mockReturnValue(0),
  useIsMutating: vi.fn().mockReturnValue(0)
});

// Mock React Router
export const mockReactRouter = () => ({
  useNavigate: vi.fn() as () => NavigateFunction,
  useLocation: vi.fn().mockReturnValue({ pathname: '/' }),
  useParams: vi.fn().mockReturnValue({}),
  useSearchParams: vi.fn().mockReturnValue([new URLSearchParams(), vi.fn()])
});

// Create a mock query client
export function createMockQueryClient(): QueryClient {
  return {
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    removeQueries: vi.fn(),
    invalidateQueries: vi.fn().mockResolvedValue(undefined),
    cancelQueries: vi.fn(),
    isFetching: vi.fn().mockReturnValue(0),
    isMutating: vi.fn().mockReturnValue(0)
  } as unknown as QueryClient;
}

// Create a mock query result
export function createMockQueryResult<TData, TError = Error>(
  data: TData | undefined = undefined,
  overrides: Partial<UseQueryResult<TData, TError>> = {}
): UseQueryResult<TData, TError> {
  return {
    data,
    error: null as TError | null,
    isError: false,
    isLoading: false,
    isSuccess: true,
    status: 'success',
    ...overrides
  } as UseQueryResult<TData, TError>;
}

// Create a mock mutation result
export function createMockMutationResult<TData, TVariables, TError = Error>(
  overrides: Partial<UseMutationResult<TData, TError, TVariables>> = {}
): UseMutationResult<TData, TError, TVariables> {
  return {
    data: undefined,
    error: null,
    isError: false,
    isIdle: true,
    isLoading: false,
    isSuccess: false,
    status: 'idle',
    ...overrides
  } as unknown as UseMutationResult<TData, TError, TVariables>;
}
