import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithRouter, screen, waitFor } from '@/test/test-utils';
import InspectionDetails from '../InspectionDetails';

const fetchMock = vi.spyOn(global, 'fetch');
const pdfMock = vi.fn();
const toBlobMock = vi.fn();
const createObjectUrlMock = vi.fn(() => 'blob:inspection-pdf');
const revokeObjectUrlMock = vi.fn();
const anchorClickMock = vi.fn();
const originalCreateElement = document.createElement.bind(document);

vi.mock('@react-pdf/renderer', () => ({
  pdf: (...args: unknown[]) => pdfMock(...args),
}));

vi.mock('../InspectionPdfDocument', () => ({
  default: () => null,
}));

describe('InspectionDetails', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    pdfMock.mockReset();
    toBlobMock.mockReset();
    createObjectUrlMock.mockClear();
    revokeObjectUrlMock.mockClear();
    anchorClickMock.mockClear();

    pdfMock.mockReturnValue({
      toBlob: toBlobMock.mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' })),
    });

    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: createObjectUrlMock,
      revokeObjectURL: revokeObjectUrlMock,
    });

    vi.spyOn(document, 'createElement').mockImplementation(((tagName: string) => {
      if (tagName.toLowerCase() === 'a') {
        const anchor = originalCreateElement('a');
        anchor.click = anchorClickMock;
        return anchor;
      }

      return originalCreateElement(tagName);
    }) as typeof document.createElement);
  });

  it('exports the current inspection as pdf', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: 12,
          treeId: 3,
          performedAt: '2026-04-18T00:00:00Z',
          isSafeForTraffic: true,
          newInspectionIntervall: 180,
          developmentalStage: 'Reifungsphase',
          vitality: 'Gut',
          description: 'Regelkontrolle ohne besondere Auffälligkeiten',
          crownInspection: { notes: 'Krone unauffällig' },
          trunkInspection: { notes: 'Stamm intakt' },
          stemBaseInspection: { notes: 'Stammfuß unauffällig' },
          arboriculturalMeasureIds: [],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    renderWithRouter(<InspectionDetails />, {
      route: '/inspections/12',
      path: '/inspections/:inspectionId',
    });

    expect(await screen.findByRole('heading', { name: /reifungsphase/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /kontrolle als pdf/i }));

    await waitFor(() => {
      expect(pdfMock).toHaveBeenCalledTimes(1);
      expect(anchorClickMock).toHaveBeenCalledTimes(1);
    });

    expect(createObjectUrlMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
