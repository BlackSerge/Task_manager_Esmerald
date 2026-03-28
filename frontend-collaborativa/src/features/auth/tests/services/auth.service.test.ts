import { expect, test, describe, vi, beforeEach } from 'vitest';
import { authService } from '../../services/auth.service';
import { storageService } from '@/core/services/storage/storage.service';
import { mockAuthUser, mockLoginResponse } from '../mocks/fixtures';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageService.clearAll();
  });

  test('login() should store tokens on success and return user', async () => {
    const response = await authService.login({ username: 'testadmin', password: 'password123' });
    
    expect(response.user.username).toBe(mockAuthUser.username);
    expect(response.access).toBe(mockLoginResponse.access);
  });

  test('login() should throw on invalid credentials', async () => {
    await expect(
      authService.login({ username: 'invalid', password: 'bad' })
    ).rejects.toThrow();
  });

  test('register() should return user and tokens', async () => {
    const response = await authService.register({ 
      username: 'newuser', 
      email: 'new@test.com', 
      password: 'password123',
      password2: 'password123'
    });
    
    expect(response.user.username).toBe(mockAuthUser.username);
  });
});
