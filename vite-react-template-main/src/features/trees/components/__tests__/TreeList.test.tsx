import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

import { renderWithRouter, screen } from '@/test/test-utils';
import TreeList from '../TreeList';

const fetchMock = vi.spyOn(global, 'fetch');

const apiTrees = [
  { id: 1, number: 10, species: 'Eiche', greenAreaId: 1 },
  { id: 2, number: 11, species: 'Buche', greenAreaId: 2 },
] as const;

describe('TreeList', () => {
  beforeEach(() => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(apiTrees), { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
    navigateMock.mockReset();
  });

  it('loads and renders trees from the API', async () => {
    renderWithRouter(<TreeList />, { route: '/trees', path: '/trees' });

    expect(await screen.findByText('Eiche')).toBeInTheDocument();
    expect(screen.getByText('Buche')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/Tree/GetAll'),
      expect.objectContaining({ headers: expect.any(Object) })
    );
  });

  it('navigates to tree details when clicking an item', async () => {
    renderWithRouter(<TreeList />, { route: '/trees', path: '/trees' });

    const listItem = await screen.findByText(/eiche/i);
    await userEvent.click(listItem);

    expect(navigateMock).toHaveBeenCalledWith('/trees/1', expect.any(Object));
  });
});
