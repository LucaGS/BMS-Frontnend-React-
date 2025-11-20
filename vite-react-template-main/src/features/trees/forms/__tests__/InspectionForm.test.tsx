import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import InspectionForm from '../InspectionForm';

const fetchMock = vi.spyOn(global, 'fetch');

describe('InspectionForm', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('creates an inspection and notifies the parent', async () => {
    const onCreated = vi.fn();
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ id: 1 }), { status: 200 }));

    render(<InspectionForm treeId={5} onInspectionCreated={onCreated} />);

    await userEvent.selectOptions(screen.getByLabelText(/verkehrssicher/i), 'false');
    await userEvent.click(screen.getByRole('button', { name: /hinzufuegen/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/Inspections/Create'),
      expect.objectContaining({ method: 'POST' })
    );
    expect(onCreated).toHaveBeenCalled();
  });

  it('shows an error message when the request fails', async () => {
    fetchMock.mockResolvedValueOnce(new Response('error', { status: 500 }));

    render(<InspectionForm treeId={8} />);

    await userEvent.click(screen.getByRole('button', { name: /hinzufuegen/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/fehler beim hinzufuegen/i);
  });
});
