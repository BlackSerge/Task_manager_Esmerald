import { setupServer } from 'msw/node';
import { boardHandlers } from '../features/boards/tests/mocks/handlers';
// import { authHandlers } from '../features/auth/tests/mocks/handlers';

export const server = setupServer(...boardHandlers /*, ...authHandlers */);
