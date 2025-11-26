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
      crownAttachmentHeightMeters: 2,
      numberOfTrunks: 1,
      trunkInclination: 0,
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
    await userEvent.click(screen.getByRole('button', { name: /baum hinzufuegen/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/Trees/Create'),
      expect.objectContaining({ method: 'POST' })
    );
    expect(onTreeCreated).toHaveBeenCalledWith(expect.objectContaining({ id: createdTree.id }));
  });
});
