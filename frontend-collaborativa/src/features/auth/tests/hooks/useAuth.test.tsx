import { renderHook, act } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLogin, useRegister } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/auth.store';
import { storageService } from '@/core/services/storage/storage.service';
import { mockAuthUser } from '../mocks/fixtures';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

describe('Auth Hooks', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isHydrated: false });
    storageService.clearAll();
    vi.clearAllMocks();
  });

  test('useLogin should authenticate the user and update the store on success', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useLogin(), { wrapper });

    
    expect(useAuthStore.getState().isAuthenticated).toBe(false);

    await act(async () => {
      await result.current.mutateAsync({ username: 'testadmin', password: 'password123' });
    });

    expect(result.current.isSuccess).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.username).toBe(mockAuthUser.username);
  });

  test('useRegister should authenticate the user and update the store on success', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useRegister(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ 
        username: 'newuser', 
        email: 'new@test.com', 
        password: 'password123',
        password2: 'password123'
      });
    });

    expect(result.current.isSuccess).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.username).toBe(mockAuthUser.username);
  });
});
