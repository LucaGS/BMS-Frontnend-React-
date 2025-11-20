import userEvent from '@testing-library/user-event';
import { act, render, screen, waitFor } from '@/test/test-utils';
import { describe, expect, it, vi } from 'vitest';

const mapHandlers: Record<string, (event: any) => void> = {};
const markerFactory = () => ({
  remove: vi.fn(),
  addTo: vi.fn(function addTo() {
    return this;
  }),
  bindTooltip: vi.fn(),
});

const circleMarkerMock = vi.fn(() => markerFactory());
const markerMock = vi.fn(() => markerFactory());

const mapMock = {
  on: vi.fn((event: string, handler: (event: any) => void) => {
    mapHandlers[event] = handler;
  }),
  off: vi.fn(),
  setView: vi.fn(() => mapMock),
  getZoom: vi.fn(() => 12),
  remove: vi.fn(),
  fitBounds: vi.fn(),
};

(window as any).L = {
  map: vi.fn(() => mapMock),
  tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
  marker: markerMock,
  circleMarker: circleMarkerMock,
  latLngBounds: vi.fn(() => ({ bounds: [] })),
};

vi.mock('@/shared/maps/leafletUtils', () => ({
  DEFAULT_MAP_CENTER: [0, 0] as [number, number],
  DEFAULT_MAP_ZOOM: 12,
  MAX_MAP_ZOOM: 18,
  ensureLeafletAssets: vi.fn(() => Promise.resolve()),
  hasValidCoordinates: vi.fn(() => true),
}));

import GreenAreaMap from '../GreenAreaMap';
import { ensureLeafletAssets, hasValidCoordinates } from '@/shared/maps/leafletUtils';

describe('GreenAreaMap', () => {
  it('renders tree markers and allows clearing temporary markers', async () => {
    render(
      <GreenAreaMap
        trees={[{ id: 1, number: 1, greenAreaId: 1, latitude: 1, longitude: 2, species: 'Eiche' } as any]}
        onError={vi.fn()}
        defaultCenter={[1, 2]}
        greenAreaName="Park"
      />
    );

    await waitFor(() => expect(ensureLeafletAssets).toHaveBeenCalled());
    await waitFor(() => expect(circleMarkerMock).toHaveBeenCalled());

    act(() => {
      mapHandlers.click?.({ latlng: { lat: 10, lng: 20 } });
    });

    const clearButton = screen.getByRole('button', { name: /temporaere markierungen loeschen/i });
    expect(clearButton).toBeEnabled();
    expect(await screen.findByText(/1\s+temporaere markierung/i)).toBeInTheDocument();

    await userEvent.click(clearButton);

    await waitFor(() => expect(clearButton).toBeDisabled());
  });
});
