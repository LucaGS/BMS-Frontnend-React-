import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  ensureLeafletAssets,
  hasValidCoordinates,
  type LeafletWindow,
  MAX_MAP_ZOOM,
} from '@/shared/maps/leafletUtils';

type TreeLocationPickerProps = {
  value?: { latitude?: number; longitude?: number } | null;
  onChange: (coordinates: { latitude: number; longitude: number }) => void;
  onClear?: () => void;
  defaultCenter?: [number, number];
};

const TreeLocationPicker: React.FC<TreeLocationPickerProps> = ({
  value,
  onChange,
  onClear,
  defaultCenter,
}) => {
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any | null>(null);
  const markerRef = useRef<any | null>(null);
  const mapClickCleanupRef = useRef<(() => void) | null>(null);
  const onChangeRef = useRef(onChange);

  const hasSelection = hasValidCoordinates(value?.latitude, value?.longitude, { allowZero: false });

  const resolvedCenter: [number, number] = useMemo(() => {
    if (hasSelection && typeof value?.latitude === 'number' && typeof value?.longitude === 'number') {
      return [value.latitude, value.longitude];
    }

    if (
      Array.isArray(defaultCenter) &&
      typeof defaultCenter[0] === 'number' &&
      typeof defaultCenter[1] === 'number'
    ) {
      return defaultCenter;
    }

    return DEFAULT_MAP_CENTER;
  }, [defaultCenter, hasSelection, value?.latitude, value?.longitude]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let isMounted = true;
    ensureLeafletAssets()
      .then(() => {
        if (!isMounted) {
          return;
        }
        const leafletWindow = window as LeafletWindow;
        if (!leafletWindow.L || !mapContainerRef.current) {
          return;
        }

        const L = leafletWindow.L;
        if (!mapRef.current) {
          mapRef.current = L.map(mapContainerRef.current, {
            maxZoom: MAX_MAP_ZOOM,
            minZoom: 3,
            zoomControl: true,
          }).setView(resolvedCenter, DEFAULT_MAP_ZOOM);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap-Mitwirkende',
            maxZoom: MAX_MAP_ZOOM,
          }).addTo(mapRef.current);

          const handleClick = (event: any) => {
            const { lat, lng } = event.latlng;
            if (!L || !mapRef.current) {
              return;
            }
            if (!markerRef.current) {
              markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
            } else {
              markerRef.current.setLatLng([lat, lng]);
            }
            onChangeRef.current?.({ latitude: lat, longitude: lng });
          };

          mapRef.current.on('click', handleClick);
          mapClickCleanupRef.current = () => {
            if (mapRef.current) {
              mapRef.current.off('click', handleClick);
            }
          };
        } else if (typeof mapRef.current.setView === 'function') {
          const currentZoom =
            typeof mapRef.current.getZoom === 'function'
              ? mapRef.current.getZoom()
              : DEFAULT_MAP_ZOOM;
          mapRef.current.setView(resolvedCenter, currentZoom);
        }

        setIsMapReady(true);
        setMapError(null);
      })
      .catch((loadError) => {
        console.error('Error loading Leaflet:', loadError);
        if (isMounted) {
          setMapError('Karte konnte nicht geladen werden.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [resolvedCenter]);

  useEffect(() => {
    const leafletWindow = window as LeafletWindow;
    if (!isMapReady || !mapRef.current || !leafletWindow.L) {
      return;
    }

    const L = leafletWindow.L;
    if (hasSelection && typeof value?.latitude === 'number' && typeof value?.longitude === 'number') {
      const coords: [number, number] = [value.latitude, value.longitude];
      if (!markerRef.current) {
        markerRef.current = L.marker(coords).addTo(mapRef.current);
      } else {
        markerRef.current.setLatLng(coords);
      }
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [hasSelection, isMapReady, value?.latitude, value?.longitude]);

  useEffect(() => {
    return () => {
      mapClickCleanupRef.current?.();
      mapClickCleanupRef.current = null;

      if (markerRef.current && typeof markerRef.current.remove === 'function') {
        markerRef.current.remove();
      }
      markerRef.current = null;

      if (mapRef.current && typeof mapRef.current.remove === 'function') {
        mapRef.current.remove();
      }
      mapRef.current = null;
    };
  }, []);

  const handleClear = () => {
    if (!hasSelection) {
      return;
    }
    if (markerRef.current && typeof markerRef.current.remove === 'function') {
      markerRef.current.remove();
      markerRef.current = null;
    }
    onClear?.();
  };

  return (
    <div className="my-3">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2">
        <span className="small text-muted">
          Klicken Sie auf die Karte, um die Koordinaten zu uebernehmen. Die Felder werden automatisch ausgefuellt.
        </span>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-light text-dark border">
            {hasSelection && typeof value?.latitude === 'number' && typeof value?.longitude === 'number'
              ? `${value.latitude.toFixed(5)}, ${value.longitude.toFixed(5)}`
              : 'Keine Auswahl'}
          </span>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={handleClear}
            disabled={!hasSelection}
          >
            Auswahl loeschen
          </button>
        </div>
      </div>
      <div className="position-relative border rounded" style={{ height: '360px', overflow: 'hidden' }}>
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
        {!isMapReady && (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-75">
            <span>Karte wird geladen...</span>
          </div>
        )}
      </div>
      {mapError && (
        <div className="alert alert-danger mt-2 mb-0">
          {mapError}
        </div>
      )}
    </div>
  );
};

export default TreeLocationPicker;
