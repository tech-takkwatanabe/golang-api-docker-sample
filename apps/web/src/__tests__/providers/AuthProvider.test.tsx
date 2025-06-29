import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '@/providers/AuthProvider';
import { useGetLoggedinUser } from '@/api/auth/auth';
import { useAtom, useSetAtom } from 'jotai';
import getRefreshTokenExistsCookie from '@/utils/getRefreshTokenExistsCookie';
import { userAtom, isLoadingAtom } from '@/atoms/authAtom';

// Mock the necessary modules
jest.mock('@/api/auth/auth');
jest.mock('jotai', () => ({
  atom: jest.fn((initialValue) => initialValue),
  useAtom: jest.fn(),
  useSetAtom: jest.fn(),
}));
jest.mock('@/utils/getRefreshTokenExistsCookie');

const mockUseGetLoggedinUser = useGetLoggedinUser as jest.Mock;
const mockUseAtom = useAtom as jest.Mock;
const mockUseSetAtom = useSetAtom as jest.Mock;
const mockGetRefreshTokenExistsCookie = getRefreshTokenExistsCookie as jest.Mock;

describe('AuthProvider', () => {
  const MockChild = () => <div>Child Component</div>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Default mock implementations
    mockUseSetAtom.mockReturnValue(jest.fn()); // For setUser and setLoading
    mockUseAtom.mockReturnValue([false, jest.fn()]); // For isAuthenticatedAtom

    mockGetRefreshTokenExistsCookie.mockReturnValue(false);
  });

  it('should display loading message when isLoading is true and isAuthenticated is false but refresh token exists', () => {
    mockUseGetLoggedinUser.mockReturnValue({ data: null, isLoading: true, isError: false });
    mockGetRefreshTokenExistsCookie.mockReturnValue(true);
    mockUseAtom.mockReturnValue([false, jest.fn()]); // isAuthenticated is false

    render(
      <AuthProvider>
        <MockChild />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Child Component')).not.toBeInTheDocument();
  });

  it('should render children when not loading and refresh token does not exist', () => {
    mockUseGetLoggedinUser.mockReturnValue({ data: null, isLoading: false, isError: true });
    mockGetRefreshTokenExistsCookie.mockReturnValue(false);
    mockUseAtom.mockReturnValue([false, jest.fn()]); // isAuthenticated is false

    render(
      <AuthProvider>
        <MockChild />
      </AuthProvider>
    );

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('should render children when authenticated', async () => {
    mockUseGetLoggedinUser.mockReturnValue({
      data: { user: { id: 1, name: 'Test User' } },
      isLoading: false,
      isError: false,
    });
    mockUseAtom.mockReturnValue([true, jest.fn()]); // isAuthenticated is true

    render(
      <AuthProvider>
        <MockChild />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByText('Child Component')).toBeInTheDocument();
    });
  });

  it('should set user data when data is available and not an error', async () => {
    const mockSetUser = jest.fn();
    const mockSetLoading = jest.fn();

    mockUseSetAtom.mockImplementation((atom) => {
      if (atom === userAtom) return mockSetUser;
      if (atom === isLoadingAtom) return mockSetLoading;
      return jest.fn();
    });
    mockUseAtom.mockReturnValue([false, jest.fn()]); // isAuthenticated is false

    const userData = { user: { id: 1, name: 'Test User' } };
    mockUseGetLoggedinUser.mockReturnValue({ data: userData, isLoading: false, isError: false });

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

  it('should set user to null when there is an error', async () => {
    const mockSetUser = jest.fn();
    const mockSetLoading = jest.fn();

    mockUseSetAtom.mockImplementation((atom) => {
      if (atom === userAtom) return mockSetUser;
      if (atom === isLoadingAtom) return mockSetLoading;
      return jest.fn();
    });
    mockUseAtom.mockReturnValue([false, jest.fn()]); // isAuthenticated is false

    mockUseGetLoggedinUser.mockReturnValue({ data: null, isLoading: false, isError: true });

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

  it('should set loading state correctly', async () => {
    const mockSetLoading = jest.fn();
    mockUseSetAtom.mockImplementation((atom) => {
      if (atom === isLoadingAtom) return mockSetLoading;
      return jest.fn();
    });
    mockUseAtom.mockReturnValue([false, jest.fn()]); // isAuthenticated is false

    // Simulate loading state
    mockUseGetLoggedinUser.mockReturnValue({ data: null, isLoading: true, isError: false });
    const { rerender } = render(
      <AuthProvider>
        <MockChild />
      </AuthProvider>
    );
    expect(mockSetLoading).toHaveBeenCalledWith(true);

    // Simulate loaded state
    mockUseGetLoggedinUser.mockReturnValue({ data: null, isLoading: false, isError: false });
    rerender(
      <AuthProvider>
        <MockChild />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });
  });
});
