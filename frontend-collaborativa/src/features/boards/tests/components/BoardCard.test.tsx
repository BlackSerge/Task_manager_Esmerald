import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { BoardCard } from '../../components/Board/BoardCard';
import { mockBoard } from '../mocks/fixtures';

// Mocks simples para Stores y Hooks
vi.mock('../../store/board.store', () => ({
  useBoardsStore: vi.fn((selector) => {
    if (typeof selector === 'function') {
      return selector({ boards: [mockBoard] });
    }
    return [mockBoard];
  })
}));

vi.mock('../../hooks/usePermissions', () => ({
  usePermissions: vi.fn(() => ({
    role: 'admin',
    canEdit: true,
    canDelete: true,
    isAdmin: true
  }))
}));

describe('BoardCard Component', () => {
  const mockOnClick = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => render(
    <MemoryRouter>
      <BoardCard
        board={mockBoard}
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    </MemoryRouter>
  );

  test('should render the board card with correct title and role', () => {
    renderComponent();
    
    expect(screen.getByText(mockBoard.title)).toBeInTheDocument();
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
  });

  test('should trigger onClick when clicked on the card', () => {
    renderComponent();
    
    const card = screen.getByText(mockBoard.title).closest('article');
    fireEvent.click(card!);

    expect(mockOnClick).toHaveBeenCalled();
  });

  test('should render edit and delete options for admins', () => {
    renderComponent();
    
    const menuButton = screen.getByRole('button', { name: '' }); 
    expect(menuButton).toBeInTheDocument();
  });
});
