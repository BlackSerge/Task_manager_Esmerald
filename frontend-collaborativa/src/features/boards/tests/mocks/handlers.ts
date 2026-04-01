import { http, HttpResponse } from 'msw';
import { API_ENDPOINTS } from '@/core/constants/endpoints';
import { mockBoard } from './fixtures';

export const boardHandlers = [
  http.get(API_ENDPOINTS.BOARDS.BASE, () => {
    return HttpResponse.json([mockBoard]);
  }),

  http.get(API_ENDPOINTS.BOARDS.DETAIL(mockBoard.id), () => {
    return HttpResponse.json(mockBoard);
  }),

  http.post(API_ENDPOINTS.BOARDS.BASE, async ({ request }) => {
    const { title } = await request.json() as { title: string };
    return HttpResponse.json({ ...mockBoard, id: 2, title }, { status: 201 });
  }),

  http.post(API_ENDPOINTS.COLUMNS.BASE, async ({ request }) => {
    const data = await request.json() as { board: number, title: string };
    return HttpResponse.json({
      id: 20,
      title: data.title,
      order: 1,
      cards: [],
      created_at: new Date().toISOString()
    }, { status: 201 });
  }),
];
