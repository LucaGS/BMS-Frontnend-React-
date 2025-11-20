import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@/test/test-utils';
import React from 'react';

const mapHandlers: Record<string, (event: any) => void> = {};
const markerMock = {
  setLatLng: vi.fn(),
  addTo: vi.fn(() => markerMock),
  remove: vi.fn(),
  bindTooltip: vi.fn(),
};

const mapMock = {
  on: vi.fn((event: string, handler: (event: any) => void) => {
    mapHandlers[event] = handler;
  }),
  off: vi.fn(),
  setView: vi.fn(() => mapMock),
  getZoom: vi.fn(() => 10),
  remove: vi.fn(),
  fitBounds: vi.fn(),
};

(window as any).L = {
  map: vi.fn(() => mapMock),
  tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
  marker: vi.fn(() => markerMock),
  circleMarker: vi.fn(() => markerMock),
  latLngBounds: vi.fn(() => ({ bounds: [] })),
};

vi.mock('@/shared/maps/leafletUtils', () => ({
  DEFAULT_MAP_CENTER: [0, 0] as [number, number],
  DEFAULT_MAP_ZOOM: 12,
  MAX_MAP_ZOOM: 18,
  ensureLeafletAssets: vi.fn(() => Promise.resolve()),
  hasValidCoordinates: vi.fn(
    (lat?: number | null, lng?: number | null, { allowZero = true } = {}) =>
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      (allowZero || (lat !== 0 && lng !== 0))
  ),
}));

import TreeLocationPicker from '../TreeLocationPicker';
import { ensureLeafletAssets, hasValidCoordinates } from '@/shared/maps/leafletUtils';

const Wrapper: React.FC = () => {
  const [coords, setCoords] = React.useState<{ latitude?: number; longitude?: number } | null>(
    null
  );

  return (
    <TreeLocationPicker
      value={coords}
      onChange={setCoords}
      onClear={() => setCoords(null)}
      defaultCenter={[1, 2]}
    />
  );
};

describe('TreeLocationPicker', () => {
  it('allows selecting and clearing coordinates via the map', async () => {
    render(<Wrapper />);

    await waitFor(() => expect(ensureLeafletAssets).toHaveBeenCalled());
    await waitFor(() => expect(mapMock.on).toHaveBeenCalledWith('click', expect.any(Function)));

    act(() => {
      mapHandlers.click?.({ latlng: { lat: 49.12345, lng: 8.54321 } });
    });

    await waitFor(() =>
      expect(screen.getByText(/49\.12345, 8\.54321/)).toBeInTheDocument()
    );

    const clearButton = screen.getByRole('button', { name: /auswahl loeschen/i });
    await userEvent.click(clearButton);

    expect(hasValidCoordinates).toHaveBeenCalled();
    expect(screen.getByText(/keine auswahl/i)).toBeInTheDocument();
  });
});
