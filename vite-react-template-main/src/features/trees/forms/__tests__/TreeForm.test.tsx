import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@/test/test-utils';
import TreeForm from '../TreeForm';
import type { Tree } from '@/entities/tree';

vi.mock('@/features/trees/components/TreeLocationPicker', () => ({
  default: () => <div data-testid="tree-location-picker">LocationPicker</div>,
}));

const fetchMock = vi.spyOn(global, 'fetch');

describe('TreeForm', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);
  });

  const fillRequiredFields = async () => {
    fireEvent.change(screen.getByLabelText(/breitengrad/i), { target: { value: '49.1' } });
    fireEvent.change(screen.getByLabelText(/laengengrad/i), { target: { value: '8.4' } });
    fireEvent.change(screen.getByLabelText(/baumhoehe/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/kronendurchmesser/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/anzahl staemme/i), { target: { value: '1' } });
  };

  it('submits tree data and notifies parent on success', async () => {
    const createdTree: Tree = {
      id: 99,
      greenAreaId: 1,
      number: 15,
      species: 'Ahorn',
      latitude: 1,
      longitude: 2,
      treeSizeMeters: 3,
      crownDiameterMeters: 1,
      numberOfTrunks: 1,
      trunkDiameter1: 12.5,
      trunkDiameter2: 0,
      trunkDiameter3: 0,
    };

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(createdTree), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const onTreeCreated = vi.fn();
    render(<TreeForm greenAreaId={1} onTreeCreated={onTreeCreated} defaultCenter={[0, 0]} />);

    await userEvent.type(screen.getByLabelText(/art/i), 'Ahorn');
    fireEvent.change(screen.getByLabelText(/nummer/i), { target: { value: '15' } });
    await fillRequiredFields();
    const trunkDiameterInput = screen.getByLabelText(/stammdurchmesser 1/i);
    await userEvent.clear(trunkDiameterInput);
    await userEvent.type(trunkDiameterInput, '12.5');
    await userEvent.click(screen.getByRole('button', { name: /baum hinzufuegen/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [, requestInit] = fetchMock.mock.calls[0];
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/Trees/Create'),
      expect.objectContaining({ method: 'POST' })
    );
    const body = JSON.parse((requestInit as RequestInit).body as string);
    expect(body).toEqual(
      expect.objectContaining({
        trunkDiameter1: 12.5,
        trunkDiameter2: 0,
        trunkDiameter3: 0,
      })
    );
    expect(onTreeCreated).toHaveBeenCalledWith(expect.objectContaining({ id: createdTree.id }));
  });

  it('requires at least one trunk diameter greater than zero', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ id: 1 }), { status: 200 }));

    render(<TreeForm greenAreaId={1} onTreeCreated={vi.fn()} />);

    expect(screen.getByLabelText(/stammdurchmesser 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stammdurchmesser 2/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stammdurchmesser 3/i)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/art/i), 'Ahorn');
    fireEvent.change(screen.getByLabelText(/nummer/i), { target: { value: '1' } });
    await fillRequiredFields();
    await userEvent.click(screen.getByRole('button', { name: /baum hinzufuegen/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/mindestens ein stammdurchmesser/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
