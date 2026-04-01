import { AuthUser, LoginResponse, RegisterResponse } from '../../types';

export const mockAuthUser: AuthUser = {
  id: 100,
  username: 'testadmin',
  email: 'admin@test.com'
};

export const mockLoginResponse: LoginResponse = {
  user: mockAuthUser,
  access: 'fake-access-jwt-token-73891',
  refresh: 'fake-refresh-jwt-token-93821'
};

export const mockRegisterResponse: RegisterResponse = {
  message: "Test registration success",
  user: mockAuthUser,
  access: 'fake-access-jwt-token-73891',
  refresh: 'fake-refresh-jwt-token-93821'
};
