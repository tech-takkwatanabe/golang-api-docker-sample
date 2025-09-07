import { vi } from 'vitest';

const mockAxios = {
  create: vi.fn(() => ({
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() }
    }
  })),
  isAxiosError: vi.fn().mockReturnValue(false)
};

export default mockAxios;
