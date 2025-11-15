import React, { useEffect, useRef, useState } from 'react';
import type { Tree } from '@/entities/tree';
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  ensureLeafletAssets,
  hasValidCoordinates,
  type LeafletWindow,
  MAX_MAP_ZOOM,
} from '@/shared/maps/leafletUtils';

interface GreenAreaMapProps {
  trees: Tree[];
  onError?: (message: string | null) => void;
  defaultCenter?: [number, number];
  greenAreaName?: string;
}

const TREE_MARKER_STYLE = {
  color: "#064d25",
  fillColor: "#0a6b30",
  fillOpacity: 0.9,
  radius: 8,
  weight: 2,
};

const GreenAreaMap: React.FC<GreenAreaMapProps> = ({
  trees,
  onError,
  defaultCenter,
  greenAreaName,
}) => {
  const [isMapReady, setIsMapReady] = useState(false);
  const [temporaryMarkers, setTemporaryMarkers] = useState<Array<{ lat: number; lng: number }>>([]);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const temporaryMarkerRefs = useRef<any[]>([]);
  const treeMarkerRefs = useRef<any[]>([]);
  const areaMarkerRef = useRef<any | null>(null);
  const mapClickCleanupRef = useRef<(() => void) | null>(null);
  const resolvedCenter: [number, number] = defaultCenter ?? DEFAULT_MAP_CENTER;
  const [centerLat, centerLng] = resolvedCenter;
  const effectiveCenter: [number, number] = resolvedCenter;

  useEffect(() => {
    let isMounted = true;
    ensureLeafletAssets()
      .then(() => {
        if (!isMounted) {
          return;
        }
        const leafletWindow = window as LeafletWindow;
        if (!mapRef.current && mapContainerRef.current && leafletWindow.L) {
          const L = leafletWindow.L;
          mapRef.current = L.map(mapContainerRef.current, {
            maxZoom: MAX_MAP_ZOOM,
            minZoom: 3,
            zoomControl: true,
          }).setView(effectiveCenter, DEFAULT_MAP_ZOOM);
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap-Mitwirkende",
            maxZoom: MAX_MAP_ZOOM,
          }).addTo(mapRef.current);

          const handleClick = (event: any) => {
            const { lat, lng } = event.latlng;
            const marker = L.marker([lat, lng]).addTo(mapRef.current);
            temporaryMarkerRefs.current.push(marker);
            setTemporaryMarkers((current) => [...current, { lat, lng }]);
          };

          mapRef.current.on("click", handleClick);
          mapClickCleanupRef.current = () => {
            if (mapRef.current) {
              mapRef.current.off("click", handleClick);
            }
          };

          setIsMapReady(true);
        }
      })
      .catch((loadError) => {
        console.error(loadError);
        if (isMounted) {
          onError?.(loadError instanceof Error ? loadError.message : "Unbekannter Fehler beim Laden der Karte.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [onError, centerLat, centerLng]);

  useEffect(() => {
    const leafletWindow = window as LeafletWindow;
    if (!isMapReady || !mapRef.current || !leafletWindow.L) {
      return;
    }

    const L = leafletWindow.L;

    treeMarkerRefs.current.forEach((marker) => {
      if (marker && typeof marker.remove === "function") {
        marker.remove();
      }
    });
    treeMarkerRefs.current = [];

    const positions: [number, number][] = [];

    trees.forEach((tree) => {
      if (!hasValidCoordinates(tree.latitude, tree.longitude, { allowZero: false })) {
        return;
      }
      const coords: [number, number] = [tree.latitude!, tree.longitude!];
      positions.push(coords);

      const marker = L.circleMarker(coords, TREE_MARKER_STYLE).addTo(mapRef.current);
      marker.bindTooltip(
        `<strong>${tree.species ?? "Baum"}</strong><br/>${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`,
        {
          direction: "top",
          opacity: 0.9,
        },
      );
      treeMarkerRefs.current.push(marker);
    });

    if (positions.length === 1) {
      const currentZoom = typeof mapRef.current.getZoom === "function"
        ? mapRef.current.getZoom()
        : DEFAULT_MAP_ZOOM;
          const targetZoom = Math.min(MAX_MAP_ZOOM, Math.max(currentZoom, 16));
          mapRef.current.setView(positions[0], targetZoom);
        } else if (positions.length > 1) {
          const bounds = L.latLngBounds(positions);
          mapRef.current.fitBounds(bounds, { padding: [24, 24], maxZoom: MAX_MAP_ZOOM });
        } else if (typeof mapRef.current.setView === "function") {
          mapRef.current.setView(effectiveCenter, DEFAULT_MAP_ZOOM);
        }
  }, [trees, isMapReady, centerLat, centerLng]);

  useEffect(() => {
    const leafletWindow = window as LeafletWindow;
    if (!isMapReady || !mapRef.current || !leafletWindow.L) {
      return;
    }

    if (areaMarkerRef.current && typeof areaMarkerRef.current.remove === "function") {
      areaMarkerRef.current.remove();
      areaMarkerRef.current = null;
    }

    if (!hasValidCoordinates(centerLat, centerLng)) {
      return;
    }

    const L = leafletWindow.L;
    const marker = L.marker([centerLat, centerLng]).addTo(mapRef.current);
    if (greenAreaName) {
      marker.bindTooltip(greenAreaName, { direction: "top" });
    }
    areaMarkerRef.current = marker;
  }, [isMapReady, centerLat, centerLng, greenAreaName]);

  useEffect(() => {
    return () => {
      mapClickCleanupRef.current?.();
      mapClickCleanupRef.current = null;

      treeMarkerRefs.current.forEach((marker) => {
        if (marker && typeof marker.remove === "function") {
          marker.remove();
        }
      });
      treeMarkerRefs.current = [];

      temporaryMarkerRefs.current.forEach((marker) => {
        if (marker && typeof marker.remove === "function") {
          marker.remove();
        }
      });
      temporaryMarkerRefs.current = [];

      if (areaMarkerRef.current && typeof areaMarkerRef.current.remove === "function") {
        areaMarkerRef.current.remove();
      }
      areaMarkerRef.current = null;

      if (mapRef.current && typeof mapRef.current.remove === "function") {
        mapRef.current.remove();
      }
      mapRef.current = null;
    };
  }, []);

  const clearTemporaryMarkers = () => {
    temporaryMarkerRefs.current.forEach((marker) => {
      if (marker && typeof marker.remove === "function") {
        marker.remove();
      }
    });
    temporaryMarkerRefs.current = [];
    setTemporaryMarkers([]);
  };

  return (
    <div className="my-4">
      <div
        className="position-relative border rounded"
        style={{ height: "420px", overflow: "hidden" }}
      >
        <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
        {!isMapReady && (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-75">
            <span>Karte wird geladen...</span>
          </div>
        )}
      </div>
      <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={clearTemporaryMarkers}
          disabled={temporaryMarkers.length === 0}
        >
          Temporaere Markierungen loeschen
        </button>
        {temporaryMarkers.length > 0 && (
          <span className="text-muted small">
            {temporaryMarkers.length} temporaere Markierung{temporaryMarkers.length > 1 ? "en" : ""} gesetzt
          </span>
        )}
      </div>
    </div>
  );
};

export default GreenAreaMap;
