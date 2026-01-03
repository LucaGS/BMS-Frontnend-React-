import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  LeafletWindow,
  MAX_MAP_ZOOM,
  ensureLeafletAssets,
  hasValidCoordinates,
} from '@/shared/maps/leafletUtils';

type TreeLocationMapProps = {
  latitude?: number | null;
  longitude?: number | null;
  treeNumber?: number | null;
};

const VIEW_ZOOM_WHEN_FOCUSED = 18;

const TreeLocationMap: React.FC<TreeLocationMapProps> = ({ latitude, longitude, treeNumber }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any | null>(null);
  const markerRef = useRef<any | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const hasCoords = hasValidCoordinates(latitude, longitude, { allowZero: false });
  const resolvedCenter = useMemo(
    () => (hasCoords ? [latitude as number, longitude as number] : DEFAULT_MAP_CENTER),
    [hasCoords, latitude, longitude],
  );

  const bindMarkerLabel = useCallback((marker: any) => {
    if (!marker || typeof marker.bindTooltip !== 'function') {
      return;
    }
    const numberLabel = typeof treeNumber === 'number' ? treeNumber : '-';
    if (typeof marker.unbindTooltip === 'function') {
      marker.unbindTooltip();
    }
    marker
      .bindTooltip(`Nr. ${numberLabel}`, {
        direction: 'top',
        permanent: true,
        opacity: 1,
        className: 'tree-number-tooltip',
      })
      .openTooltip();
  }, [treeNumber]);

  useEffect(() => {
    let isMounted = true;

    ensureLeafletAssets()
      .then(() => {
        if (!isMounted) {
          return;
        }

        const leafletWindow = window as LeafletWindow;
        if (!leafletWindow.L || !containerRef.current) {
          return;
        }

        const L = leafletWindow.L;

        if (!mapRef.current) {
          mapRef.current = L.map(containerRef.current, {
            maxZoom: MAX_MAP_ZOOM,
            minZoom: 3,
            zoomControl: true,
          }).setView(resolvedCenter, hasCoords ? VIEW_ZOOM_WHEN_FOCUSED : DEFAULT_MAP_ZOOM);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap-Mitwirkende',
            maxZoom: MAX_MAP_ZOOM,
          }).addTo(mapRef.current);
        } else if (typeof mapRef.current.setView === 'function') {
          mapRef.current.setView(
            resolvedCenter,
            hasCoords ? VIEW_ZOOM_WHEN_FOCUSED : mapRef.current.getZoom() ?? DEFAULT_MAP_ZOOM,
          );
        }

        if (hasCoords) {
          if (!markerRef.current) {
            markerRef.current = L.marker(resolvedCenter).addTo(mapRef.current);
          } else {
            markerRef.current.setLatLng(resolvedCenter);
          }
          bindMarkerLabel(markerRef.current);
        } else if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }

        setIsMapReady(true);
        setMapError(null);
      })
      .catch((error) => {
        console.error('Leaflet map failed to load', error);
        if (isMounted) {
          setMapError('Karte konnte nicht geladen werden.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [bindMarkerLabel, hasCoords, resolvedCenter]);

  useEffect(() => {
    return () => {
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

  return (
    <div className="h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center gap-2">
          <span className="fw-semibold">Karte</span>
          <span className="badge bg-light text-dark border">
            {hasCoords && typeof latitude === 'number' && typeof longitude === 'number'
              ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
              : 'Keine Koordinaten'}
          </span>
        </div>
        <small className="text-muted">OpenStreetMap Vorschau</small>
      </div>
      <div className="position-relative border rounded" style={{ height: '420px', overflow: 'hidden' }}>
        <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
        {!isMapReady && (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-75">
            <span>Karte wird geladen...</span>
          </div>
        )}
        {!hasCoords && isMapReady && (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
            <span className="badge bg-light text-dark border">Keine Koordinaten vorhanden</span>
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

export default TreeLocationMap;
