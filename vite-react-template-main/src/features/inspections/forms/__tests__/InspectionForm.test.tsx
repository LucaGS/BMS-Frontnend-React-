import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@/test/test-utils';
import InspectionForm from '../InspectionForm';
import { VITALITY_OPTIONS } from '@/entities/inspection';

const fetchMock = vi.spyOn(global, 'fetch');

describe('InspectionForm', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('creates an inspection and notifies the parent', async () => {
    const onCreated = vi.fn();
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 1 }), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    render(<InspectionForm treeId={5} onInspectionCreated={onCreated} />);

    expect(screen.queryByLabelText(/notizen krone/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^notizen stamm$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/notizen stammfuss/i)).not.toBeInTheDocument();

    for (const toggle of screen.getAllByRole('button', { name: /ausklappen/i })) {
      await userEvent.click(toggle);
    }

    fireEvent.change(screen.getByLabelText(/kontrolldatum/i), {
      target: { value: '2024-05-01T12:00' },
    });
    await userEvent.clear(screen.getByLabelText(/kontrollintervall/i));
    await userEvent.type(screen.getByLabelText(/kontrollintervall/i), '18');
    await userEvent.selectOptions(screen.getByLabelText(/entwicklungsstadium/i), 'Reifungsphase');
    await userEvent.type(screen.getByLabelText(/beschreibung/i), 'Keine Mängel');
    fireEvent.change(screen.getByLabelText(/vitalität/i), { target: { value: VITALITY_OPTIONS[3] } });
    await userEvent.click(screen.getByRole('button', { name: /weiter/i }));
    const toggles = await screen.findAllByRole('button', { name: /ausklappen/i });
    for (const toggle of toggles) {
      await userEvent.click(toggle);
    }
    await userEvent.type(screen.getByLabelText(/notizen krone/i), 'Krone ok');
    await userEvent.type(screen.getByLabelText(/^notizen stamm$/i), 'Stamm ok');
    await userEvent.type(screen.getByLabelText(/notizen stammfuss/i), 'Stammfuss ok');
    await userEvent.click(document.getElementById('crown-abioticDisturbance') as HTMLElement);
    await userEvent.click(document.getElementById('trunk-woundCallusRidge') as HTMLElement);
    await userEvent.click(screen.getByLabelText(/^würgewurzel$/i));
    await userEvent.click(screen.getByLabelText(/verkehrssicherheit/i));

    await userEvent.click(screen.getByRole('button', { name: /kontrolle speichern/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const [requestUrl, requestInit] = fetchMock.mock.calls[1];
    expect(requestUrl).toContain('/api/Inspections/Create');
    const body = JSON.parse((requestInit?.body as string) || '{}');

    expect(body).toMatchObject({
      treeId: 5,
      performedAt: '2024-05-01T12:00',
      isSafeForTraffic: false,
      newInspectionIntervall: 18,
      developmentalStage: 'Reifungsphase',
      vitality: VITALITY_OPTIONS[3],
      description: 'Keine Mängel',
      crownInspection: expect.objectContaining({
        notes: 'Krone ok',
        abioticDisturbance: true,
      }),
      trunkInspection: expect.objectContaining({
        notes: 'Stamm ok',
        woundCallusRidge: true,
      }),
      stemBaseInspection: expect.objectContaining({
        notes: 'Stammfuss ok',
        girdlingRoot: true,
      }),
    });
    expect(onCreated).toHaveBeenCalled();
  });

  it('defaults to no prefill', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    render(<InspectionForm treeId={3} />);

    expect(screen.getByRole('button', { name: /keine vorbefüllung/i, pressed: true })).toBeInTheDocument();
  });

  it('shows an error message when the request fails', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response('error', { status: 500 }));

    render(<InspectionForm treeId={8} />);

    await userEvent.click(screen.getByRole('button', { name: /kontrolle speichern/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/fehler beim hinzufügen/i);
  });
});
