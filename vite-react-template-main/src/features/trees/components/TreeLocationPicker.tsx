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
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [bestAccuracy, setBestAccuracy] = useState<number | null>(null);
  const bestAccuracyRef = useRef<number | null>(null);
  const accuracyCircleRef = useRef<any | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any | null>(null);
  const markerRef = useRef<any | null>(null);
  const mapClickCleanupRef = useRef<(() => void) | null>(null);
  const onChangeRef = useRef(onChange);
  const geoWatchIdRef = useRef<number | null>(null);
  const geoWatchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const stopGeoWatch = () => {
    if (geoWatchIdRef.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(geoWatchIdRef.current);
    }
    geoWatchIdRef.current = null;
    if (geoWatchTimeoutRef.current) {
      clearTimeout(geoWatchTimeoutRef.current);
    }
    geoWatchTimeoutRef.current = null;
  };

  useEffect(() => {
    return () => {
      mapClickCleanupRef.current?.();
      mapClickCleanupRef.current = null;
      stopGeoWatch();

      if (markerRef.current && typeof markerRef.current.remove === 'function') {
        markerRef.current.remove();
      }
      markerRef.current = null;
      if (accuracyCircleRef.current && typeof accuracyCircleRef.current.remove === 'function') {
        accuracyCircleRef.current.remove();
      }
      accuracyCircleRef.current = null;

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

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation wird von diesem Browser nicht unterstuetzt.');
      return;
    }
    setIsLocating(true);
    setLocationError(null);
    setBestAccuracy(null);
    bestAccuracyRef.current = null;

    const applyPosition = (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = pos.coords;
      const coords: [number, number] = [latitude, longitude];
      if (bestAccuracyRef.current == null || accuracy < bestAccuracyRef.current) {
        bestAccuracyRef.current = accuracy;
        setBestAccuracy(accuracy);
      }
      setUserLocation({ lat: coords[0], lng: coords[1], accuracy });
      const leafletWindow = window as LeafletWindow;
      if (mapRef.current && leafletWindow.L) {
        const L = leafletWindow.L;
        if (!markerRef.current) {
          markerRef.current = L.marker(coords).addTo(mapRef.current);
        } else {
          markerRef.current.setLatLng(coords);
        }
        if (accuracyCircleRef.current) {
          accuracyCircleRef.current.setLatLng(coords);
          accuracyCircleRef.current.setRadius(Math.max(accuracy, 10));
        } else {
          accuracyCircleRef.current = L.circle(coords, {
            radius: Math.max(accuracy, 10),
            color: '#0d6efd',
            fillColor: '#0d6efd',
            fillOpacity: 0.08,
            weight: 1,
          }).addTo(mapRef.current);
        }
        mapRef.current.setView(coords, Math.max(DEFAULT_MAP_ZOOM, 17));
      }
      onChangeRef.current?.({ latitude: coords[0], longitude: coords[1] });
      if (accuracy <= 10) {
        setIsLocating(false);
        stopGeoWatch();
      }
    };

    const onError = (err: GeolocationPositionError) => {
      console.error('Geolocation error:', err);
      setIsLocating(false);
      setLocationError('Standort konnte nicht ermittelt werden.');
      stopGeoWatch();
    };

    geoWatchIdRef.current = navigator.geolocation.watchPosition(applyPosition, onError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 30000,
    });
    geoWatchTimeoutRef.current = setTimeout(() => {
      setIsLocating(false);
      stopGeoWatch();
      if (!userLocation) {
        setLocationError('Keine praezise Position gefunden. Bitte erneut versuchen oder manuell waehlen.');
      } else if (bestAccuracyRef.current != null && bestAccuracyRef.current > 25) {
        setLocationError(
          `Position ist ungenau (~${Math.round(bestAccuracyRef.current)} m). Bitte erneut versuchen oder manuell setzen.`,
        );
      }
    }, 30000);
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
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleLocateMe} disabled={isLocating}>
            {isLocating ? 'Bestimme Position...' : 'Eigene Position'}
          </button>
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
      {!mapError && locationError && (
        <div className="alert alert-warning mt-2 mb-0" role="alert">
          {locationError}
        </div>
      )}
      {userLocation && (
        <div className="text-muted small mt-2">
          Eigene Position: {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
          {userLocation.accuracy != null ? ` (Genauigkeit ~${Math.round(userLocation.accuracy)} m)` : ''}
        </div>
      )}
    </div>
  );
};

export default TreeLocationPicker;
