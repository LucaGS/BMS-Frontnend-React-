import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, renderWithRouter, screen, waitFor } from '@/test/test-utils';
import type { Tree } from '@/features/trees/types';

const inspectionFormSpy = vi.fn();
const imageUploaderSpy = vi.fn();

vi.mock('@/features/inspections/forms/InspectionForm', () => ({
  default: (props: any) => {
    inspectionFormSpy(props);
    return <div data-testid="inspection-form-mock">InspectionForm</div>;
  },
}));

vi.mock('@/features/trees/components/TreeImageUploader', () => ({
  default: (props: any) => {
    imageUploaderSpy(props);
    return <div data-testid="tree-image-uploader-mock">ImageUploader</div>;
  },
}));

import TreeDetails from '../TreeDetails';

const fetchMock = vi.spyOn(global, 'fetch');

const tree: Tree = {
  id: 1,
  number: 42,
  species: 'Eiche',
  greenAreaId: 7,
  latitude: 49.1,
  longitude: 8.6,
  crownDiameterMeters: 3,
  treeSizeMeters: 5,
  numberOfTrunks: 1,
  trunkDiameter1: 10,
  trunkDiameter2: 0,
  trunkDiameter3: 0,
};

describe('TreeDetails', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('renders placeholder when no tree is selected', () => {
    renderWithRouter(<TreeDetails tree={null} />);
    expect(
      screen.getByText(/kein baum ausgewaehlt/i)
    ).toBeInTheDocument();
  });

  it('loads inspections and renders details for a tree', async () => {
    const inspections = [
      {
        id: 1,
        treeId: 1,
        performedAt: '2024-01-01T12:00:00Z',
        isSafeForTraffic: true,
        newInspectionIntervall: 12,
        developmentalStage: 'Jungbaum',
        vitality: 4,
        description: 'Keine Maengel sichtbar.',
      },
      {
        id: 2,
        treeId: 1,
        performedAt: '2024-02-01T12:00:00Z',
        isSafeForTraffic: false,
        newInspectionIntervall: 24,
        developmentalStage: 'Altbaum',
        vitality: 2,
        description: 'Rueckschnitt empfohlen.',
      },
    ];
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(inspections), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    renderWithRouter(<TreeDetails tree={tree} />);

    expect(await screen.findByText(/baum verwalten/i)).toBeInTheDocument();
    expect(screen.getByText(tree.species!)).toBeInTheDocument();
    expect(await screen.findAllByText(/verkehrssicher/i)).not.toHaveLength(0);
    expect(screen.getByText(/jungbaum/i)).toBeInTheDocument();
    expect(screen.getByText(/intervall: 12 tage/i)).toBeInTheDocument();
    expect(screen.getAllByText(/vitalitaet: 4\/5/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/vitalitaet: 2\/5/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/stammdurchmesser 1/i)).toBeInTheDocument();
    expect(imageUploaderSpy).toHaveBeenCalledWith(expect.objectContaining({ treeId: tree.id }));
  });

  it('shows an error alert when inspections fail to load', async () => {
    fetchMock.mockResolvedValueOnce(new Response('error', { status: 500 }));

    renderWithRouter(<TreeDetails tree={tree} />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/kontrollen konnten nicht geladen werden/i);
  });

  it('toggles the inspection form visibility', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } })
    );

    renderWithRouter(<TreeDetails tree={tree} />);

    const toggleButton = await screen.findByRole('button', { name: /kontrolle hinzufuegen/i });
    expect(screen.queryByTestId('inspection-form-mock')).not.toBeInTheDocument();

    await userEvent.click(toggleButton);
    expect(await screen.findByTestId('inspection-form-mock')).toBeInTheDocument();

    await userEvent.click(toggleButton);
    await waitFor(() =>
      expect(screen.queryByTestId('inspection-form-mock')).not.toBeInTheDocument()
    );
  });
});
