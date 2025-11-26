import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import GreenAreaForm from '../GreenAreaForm';

const fetchMock = vi.spyOn(global, 'fetch');

describe('GreenAreaForm', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('posts a new green area and updates the list', async () => {
    const onChange = vi.fn();
    const existing = [{ id: 1, name: 'Park', longitude: 1, latitude: 2 }];

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 2, name: 'Neue Flaeche', longitude: 3, latitude: 4 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    render(<GreenAreaForm greenAreas={existing as any} onChange={onChange} />);

    await userEvent.type(screen.getByLabelText(/name der gruenflaeche/i), 'Neue Flaeche');
    await userEvent.type(screen.getByPlaceholderText(/breitengrad/i), '3');
    await userEvent.type(screen.getByPlaceholderText(/ngengrad/i), '4');
    await userEvent.click(screen.getByRole('button', { name: /hinzufuegen/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 2, name: 'Neue Flaeche' })])
    );
  });

  it('shows a validation error when name is missing', async () => {
    render(<GreenAreaForm greenAreas={[]} onChange={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/name der gruenflaeche/i), ' ');
    await userEvent.click(screen.getByRole('button', { name: /hinzufuegen/i }));

    expect(await screen.findByText(/bitte einen namen eintragen/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
