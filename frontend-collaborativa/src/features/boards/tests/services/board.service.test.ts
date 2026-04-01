import { expect, test, describe } from 'vitest';
import { boardService } from '../../services/board.service';
import { mockBoard } from '../mocks/fixtures';

describe('boardService', () => {
  test('getBoards() should fetch and map boards correctly', async () => {
    const boards = await boardService.getBoards();
    expect(boards).toHaveLength(1);
    expect(boards[0].id).toBe(mockBoard.id);
    expect(boards[0].title).toBe(mockBoard.title);
  });

  test('getBoardDetail() should return isolated board correctly', async () => {
    const board = await boardService.getBoardDetail(mockBoard.id);
    expect(board.id).toBe(mockBoard.id);
    expect(board.title).toBe(mockBoard.title);
    expect(board.columns).toHaveLength(1);
  });

  test('createBoard() should post new board Title', async () => {
    const title = "New Strategy Board";
    const board = await boardService.createBoard(title);
    expect(board.title).toBe(title);
  });
});
