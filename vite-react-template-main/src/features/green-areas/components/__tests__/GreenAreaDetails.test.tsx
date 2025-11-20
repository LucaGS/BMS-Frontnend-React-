import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithRouter, screen, waitFor } from '@/test/test-utils';

const treeFormSpy = vi.fn();
const greenAreaMapSpy = vi.fn();

vi.mock('@/features/trees/forms/TreeForm', () => ({
  default: (props: any) => {
    treeFormSpy(props);
    return <div data-testid="tree-form-mock">TreeForm</div>;
  },
}));

vi.mock('@/features/green-areas/maps/GreenAreaMap', () => ({
  default: (props: any) => {
    greenAreaMapSpy(props);
    return <div data-testid="green-area-map-mock">GreenAreaMap</div>;
  },
}));

import GreenAreaDetails from '../GreenAreaDetails';

const fetchMock = vi.spyOn(global, 'fetch');

describe('GreenAreaDetails', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('renders trees for the selected green area', async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([{ id: 1, number: 5, greenAreaId: 1, species: 'Eiche' }]),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ id: 1, name: 'Park', latitude: 1, longitude: 2 }]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

    renderWithRouter(<GreenAreaDetails />, {
      route: '/green-areas/1/Park',
      path: '/green-areas/:greenAreaId/:greenAreaName',
    });

    expect(await screen.findByText(/eiche/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/Trees/GetByGreenAreaId/1'),
      expect.any(Object)
    );
  });

  it('toggles tree form and map visibility', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ id: 1, name: 'Park', latitude: 1, longitude: 2 }]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

    renderWithRouter(<GreenAreaDetails />, {
      route: '/green-areas/1/Park',
      path: '/green-areas/:greenAreaId/:greenAreaName',
    });

    const addTreeButton = await screen.findByRole('button', { name: /baum hinzufuegen/i });
    await userEvent.click(addTreeButton);
    expect(await screen.findByTestId('tree-form-mock')).toBeInTheDocument();

    const mapToggle = screen.getByRole('button', { name: /^karte$/i });
    await userEvent.click(mapToggle);
    expect(await screen.findByTestId('green-area-map-mock')).toBeInTheDocument();
  });
});
