import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithRouter, screen, waitFor } from '@/test/test-utils';
import GreenAreaList from '../GreenAreaList';

const fetchMock = vi.spyOn(global, 'fetch');

describe('GreenAreaList', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('loads and displays green areas', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify([{ id: 1, name: 'Stadtpark', longitude: 1, latitude: 2 }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    renderWithRouter(<GreenAreaList />, { route: '/green-areas', path: '/green-areas' });

    expect(await screen.findByText(/stadtpark/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/GreenAreas/GetAll'),
      expect.any(Object)
    );
  });

  it('toggles the green area form visibility', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));

    renderWithRouter(<GreenAreaList />, { route: '/green-areas', path: '/green-areas' });

    const toggleButton = await screen.findByRole('button', { name: /gruenflaeche hinzufuegen/i });
    await userEvent.click(toggleButton);

    expect(screen.getByText(/name der gruenflaeche/i)).toBeInTheDocument();

    await userEvent.click(toggleButton);
    await waitFor(() =>
      expect(screen.queryByText(/name der gruenflaeche/i)).not.toBeInTheDocument()
    );
  });
});
