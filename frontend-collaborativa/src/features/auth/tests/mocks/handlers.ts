import { http, HttpResponse } from 'msw';
import { API_ENDPOINTS } from '@/core/constants/endpoints';
import { mockLoginResponse, mockRegisterResponse } from './fixtures';

export const authHandlers = [
  http.post(API_ENDPOINTS.AUTH.LOGIN, async ({ request }) => {
    const data = await request.json() as { username?: string, password?: string };
    if (!data.username || !data.password) {
      return HttpResponse.json({ error: "Missing credentials" }, { status: 400 });
    }
    if (data.username === 'invalid') {
      return HttpResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }
    return HttpResponse.json(mockLoginResponse, { status: 200 });
  }),

  http.post(API_ENDPOINTS.AUTH.REGISTER, async ({ request }) => {
    const data = await request.json() as { username?: string };
    if (data.username === 'taken') {
      return HttpResponse.json({ username: ["Este usuario ya existe"] }, { status: 400 });
    }
    return HttpResponse.json(mockRegisterResponse, { status: 201 });
  })
];
