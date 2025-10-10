import React, { useEffect, useRef, useState } from "react";
import { Baum } from "../constants";

interface GruenFlaecheMapProps {
  baeume: Baum[];
  onError?: (message: string | null) => void;
}

interface LeafletWindow extends Window {
  L?: any;
}

const LEAFLET_SCRIPT_ID = "leaflet-script";
const LEAFLET_CSS_ID = "leaflet-css";
const DEFAULT_CENTER: [number, number] = [51.1657, 10.4515];
const DEFAULT_ZOOM = 12;
const MAX_ZOOM = 21;

const ensureLeafletAssets = (): Promise<void> => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.resolve();
  }

  const leafletWindow = window as LeafletWindow;
  if (leafletWindow.L) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const handleResolve = () => resolve();
    const handleReject = () => reject(new Error("Leaflet konnte nicht geladen werden."));

    const existingScript = document.getElementById(LEAFLET_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", handleResolve, { once: true });
      existingScript.addEventListener("error", handleReject, { once: true });
      return;
    }

    if (!document.getElementById(LEAFLET_CSS_ID)) {
      const cssLink = document.createElement("link");
      cssLink.id = LEAFLET_CSS_ID;
      cssLink.rel = "stylesheet";
      cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(cssLink);
    }

    const script = document.createElement("script");
    script.id = LEAFLET_SCRIPT_ID;
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = handleResolve;
    script.onerror = handleReject;
    document.body.appendChild(script);
  });
};

const GruenFlaecheMap: React.FC<GruenFlaecheMapProps> = ({ baeume, onError }) => {
  const [isMapReady, setIsMapReady] = useState(false);
  const [temporaryMarkers, setTemporaryMarkers] = useState<Array<{ lat: number; lng: number }>>([]);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const temporaryMarkerRefs = useRef<any[]>([]);
  const treeMarkerRefs = useRef<any[]>([]);
  const mapClickCleanupRef = useRef<(() => void) | null>(null);

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
            maxZoom: MAX_ZOOM,
            minZoom: 3,
            zoomControl: true,
          }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap-Mitwirkende",
            maxZoom: MAX_ZOOM,
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
  }, [onError]);

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

    baeume.forEach((baum) => {
      if (typeof baum.breitengrad !== "number" || typeof baum.laengengrad !== "number") {
        return;
      }
      const coords: [number, number] = [baum.breitengrad, baum.laengengrad];
      positions.push(coords);
      const marker = L.marker(coords)
        .addTo(mapRef.current)
        .bindPopup(`<strong>${baum.art ?? "Baum"}</strong><br/>Nr. ${baum.nummer ?? "-"}`);
      treeMarkerRefs.current.push(marker);
    });

    if (positions.length === 1) {
      const currentZoom = typeof mapRef.current.getZoom === "function"
        ? mapRef.current.getZoom()
        : DEFAULT_ZOOM;
      const targetZoom = Math.min(MAX_ZOOM, Math.max(currentZoom, 16));
      mapRef.current.setView(positions[0], targetZoom);
    } else if (positions.length > 1) {
      const bounds = L.latLngBounds(positions);
      mapRef.current.fitBounds(bounds, { padding: [24, 24], maxZoom: MAX_ZOOM });
    }
  }, [baeume, isMapReady]);

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

export default GruenFlaecheMap;



