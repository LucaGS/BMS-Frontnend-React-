import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@/test/test-utils';
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

    fireEvent.change(screen.getByLabelText(/kontrolldatum/i), {
      target: { value: '2024-05-01T12:00' },
    });
    await userEvent.clear(screen.getByLabelText(/kontrollintervall/i));
    await userEvent.type(screen.getByLabelText(/kontrollintervall/i), '18');
    await userEvent.type(screen.getByLabelText(/entwicklungsstadium/i), 'Jungbaum');
    await userEvent.type(screen.getByLabelText(/beschreibung/i), 'Keine Maengel');
    fireEvent.change(screen.getByLabelText(/vitalitaet/i), { target: { value: 4 } });
    fireEvent.change(screen.getByLabelText(/schaedigungsgrad/i), { target: { value: 5 } });
    fireEvent.change(screen.getByLabelText(/standfestigkeit/i), { target: { value: 2 } });
    fireEvent.change(screen.getByLabelText(/bruchsicherheit/i), { target: { value: 1 } });
    await userEvent.type(screen.getByLabelText(/notizen krone/i), 'Krone ok');
    await userEvent.type(screen.getByLabelText(/notizen stamm/i), 'Stamm ok');
    await userEvent.type(screen.getByLabelText(/notizen stammfuss/i), 'Stammfuss ok');
    await userEvent.click(screen.getByLabelText(/abiotische stoerung \(krone\)/i));
    await userEvent.click(screen.getByLabelText(/wunde mit kallusrand \(stamm\)/i));
    await userEvent.click(screen.getByLabelText(/wuergewurzel \(stammfuss\)/i));
    await userEvent.click(screen.getByLabelText(/verkehrssicherheit/i));

    await userEvent.click(screen.getByRole('button', { name: /kontrolle speichern/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [requestUrl, requestInit] = fetchMock.mock.calls[0];
    expect(requestUrl).toContain('/api/Inspections/Create');
    const body = JSON.parse((requestInit?.body as string) || '{}');

    expect(body).toMatchObject({
      treeId: 5,
      performedAt: '2024-05-01T12:00',
      isSafeForTraffic: false,
      newInspectionIntervall: 18,
      developmentalStage: 'Jungbaum',
      damageLevel: 5,
      standStability: 2,
      breakageSafety: 1,
      vitality: 4,
      description: 'Keine Maengel',
      crownInspection: expect.objectContaining({
        notes: 'Krone ok',
        abioticDisturbance: true,
      }),
      trunkInspection: expect.objectContaining({
        notes: 'Stamm ok',
        woundWithCallusRidge: true,
      }),
      stemBaseInspection: expect.objectContaining({
        notes: 'Stammfuss ok',
        girdlingRoot: true,
      }),
    });
    expect(onCreated).toHaveBeenCalled();
  });

  it('shows an error message when the request fails', async () => {
    fetchMock.mockResolvedValueOnce(new Response('error', { status: 500 }));

    render(<InspectionForm treeId={8} />);

    await userEvent.click(screen.getByRole('button', { name: /kontrolle speichern/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/fehler beim hinzufuegen/i);
  });
});
