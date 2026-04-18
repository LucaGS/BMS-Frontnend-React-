import React, { useEffect, useRef, useState } from 'react';
import { crownCheckboxes, stemBaseCheckboxes, trunkCheckboxes } from '@/features/inspections/forms/inspectionFormConfig';
import type {
  CrownInspectionState,
  StemBaseInspectionState,
  TrunkInspectionState,
} from '@/features/inspections/forms/inspectionFormConfig';
import type { Inspection } from '@/features/inspections';
import type { Tree } from '@/features/trees/types';
import type { ArboriculturalMeasure } from '@/entities/arboriculturalMeasure';
import { DEFAULT_MAP_CENTER, MAX_MAP_ZOOM, ensureLeafletAssets, hasValidCoordinates, type LeafletWindow } from '@/shared/maps/leafletUtils';
import { getNextInspectionDaysLabel, getNextInspectionStatus } from '@/features/trees/utils/nextInspection';
import { normalizeVitality } from '@/entities/inspection';
import { formatCoordinateDisplay } from '@/shared/lib/coordinateFormatting';
import { formatDateDisplay } from '@/shared/lib/dateFormatting';

const PdfStyles: React.FC = () => (
  <style>
    {`
      .ga-print {
        --ga-text: #10203a;
        --ga-muted: #5d6b82;
        --ga-border: rgba(255, 255, 255, 0.72);
        --ga-surface: rgba(255, 255, 255, 0.72);
        --ga-surface-strong: rgba(255, 255, 255, 0.84);
        --ga-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
        --ga-shadow-soft: 0 14px 30px rgba(15, 23, 42, 0.08);
        font-family: 'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', sans-serif;
        color: var(--ga-text);
        background:
          radial-gradient(circle at top left, rgba(135, 206, 235, 0.34), transparent 28%),
          radial-gradient(circle at top right, rgba(122, 208, 167, 0.24), transparent 22%),
          linear-gradient(180deg, #f4f8fb 0%, #eef3f8 46%, #e6edf5 100%);
        line-height: 1.45;
        max-width: 100%;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .ga-print::before {
        content: '';
        position: fixed;
        inset: 0;
        pointer-events: none;
        background:
          radial-gradient(circle at 15% 18%, rgba(255, 255, 255, 0.65), transparent 0 23%),
          radial-gradient(circle at 85% 8%, rgba(255, 255, 255, 0.5), transparent 0 18%);
      }
      .ga-print h1, .ga-print h2, .ga-print h3, .ga-print h4, .ga-print h5, .ga-print h6 {
        letter-spacing: -0.02em;
        color: var(--ga-text);
      }
      .ga-card {
        position: relative;
        background: var(--ga-surface);
        border: 1px solid var(--ga-border);
        border-radius: 28px;
        box-shadow: var(--ga-shadow-soft);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        padding: 22px;
        overflow: hidden;
      }
      .ga-card::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
      }
      .ga-hero {
        background:
          linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(238, 243, 248, 0.78)),
          linear-gradient(135deg, rgba(10, 132, 255, 0.08), rgba(19, 138, 87, 0.08));
        border-radius: 32px;
        box-shadow: var(--ga-shadow);
      }
      .ga-hero-kicker {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: #0b6bcb;
        font-weight: 700;
        margin-bottom: 8px;
      }
      .ga-hero-title {
        font-size: 28px;
        line-height: 1.1;
        margin: 0 0 6px;
      }
      .ga-hero-subtitle {
        color: var(--ga-muted);
        font-size: 13px;
      }
      .ga-chip-group {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 10px;
      }
      .ga-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        font-size: 13px;
        overflow: hidden;
        border-radius: 18px;
        border: 1px solid rgba(214, 223, 235, 0.9);
        background: rgba(255, 255, 255, 0.78);
      }
      .ga-table th,
      .ga-table td {
        border-right: 1px solid rgba(214, 223, 235, 0.9);
        border-bottom: 1px solid rgba(214, 223, 235, 0.9);
        padding: 10px 12px;
        vertical-align: top;
      }
      .ga-table th:last-child,
      .ga-table td:last-child {
        border-right: 0;
      }
      .ga-table tbody tr:last-child th,
      .ga-table tbody tr:last-child td {
        border-bottom: 0;
      }
      .ga-table th {
        background: rgba(244, 248, 251, 0.92);
        font-weight: 700;
        color: var(--ga-text);
      }
      .ga-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 12px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.82);
        color: var(--ga-text);
        border: 1px solid rgba(255, 255, 255, 0.82);
        font-weight: 600;
        font-size: 12px;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72), 0 8px 18px rgba(15, 23, 42, 0.06);
      }
      .ga-pill--success {
        background: rgba(236, 253, 243, 0.95);
        color: #166534;
        border-color: rgba(187, 247, 208, 0.95);
      }
      .ga-pill--danger {
        background: rgba(254, 242, 242, 0.95);
        color: #991b1b;
        border-color: rgba(254, 205, 211, 0.95);
      }
      .ga-pill--neutral {
        background: rgba(238, 242, 255, 0.95);
        color: #3730a3;
        border-color: rgba(199, 210, 254, 0.95);
      }
      .ga-meta-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
        gap: 12px;
      }
      .ga-meta-item {
        padding: 12px 14px;
        border: 1px solid rgba(255, 255, 255, 0.78);
        border-radius: 18px;
        background: var(--ga-surface-strong);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.68);
      }
      .ga-meta-label {
        font-size: 11px;
        color: var(--ga-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 5px;
      }
      .ga-meta-value {
        font-weight: 700;
        color: var(--ga-text);
        font-size: 13px;
      }
      .ga-section-title {
        font-size: 13px;
        font-weight: 800;
        color: var(--ga-text);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 8px;
      }
      .ga-muted {
        color: var(--ga-muted);
        font-size: 12px;
      }
      .ga-print-card {
        page-break-inside: avoid;
        margin-bottom: 22px;
      }
      .ga-map-shell {
        border: 1px solid rgba(255, 255, 255, 0.78);
        border-radius: 24px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.82);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.76);
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .ga-tree-marker__bubble {
        min-width: 26px;
        height: 26px;
        padding: 0 6px;
        border-radius: 999px;
        background: #0ea341;
        color: #fff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 700;
        border: 2px solid #e2e8f0;
        box-shadow: 0 6px 12px rgba(15, 23, 42, 0.35);
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      @media print {
        .ga-map-shell {
          height: 120mm !important;
          max-height: 120mm !important;
          width: 100%;
          box-shadow: none;
        }
      }
      .ga-tree-marker__bubble--fallback {
        background: #15803d;
      }
      .ga-tree-marker {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      }
      .ga-tree-marker__label {
        background: #0ea341;
        color: #fff;
        border-radius: 999px;
        padding: 2px 8px;
        font-size: 12px;
        font-weight: 700;
        border: 2px solid #e2e8f0;
        box-shadow: 0 6px 12px rgba(15, 23, 42, 0.35);
        line-height: 1.1;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .ga-tree-marker__dot {
        width: 12px;
        height: 12px;
        border-radius: 999px;
        background: #0ea341;
        border: 2px solid #e2e8f0;
        box-shadow: 0 6px 12px rgba(15, 23, 42, 0.35);
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      img, canvas {
        max-width: 100%;
      }
      @page {
        size: A4 portrait;
        margin: 12mm;
      }
      @media print {
        body {
          background: #ffffff !important;
        }
        body * {
          visibility: hidden !important;
        }
        .ga-print,
        .ga-print * {
          visibility: visible !important;
        }
        .ga-print {
          position: absolute;
          inset: 0;
          width: 100%;
          padding: 0;
          margin: 0;
          background:
            radial-gradient(circle at top left, rgba(135, 206, 235, 0.34), transparent 28%),
            radial-gradient(circle at top right, rgba(122, 208, 167, 0.24), transparent 22%),
            linear-gradient(180deg, #f4f8fb 0%, #eef3f8 46%, #e6edf5 100%);
        }
      }
    `}
  </style>
);

export type LastInspectionDetail = Inspection & {
  crownInspection?: Partial<CrownInspectionState> | null;
  trunkInspection?: Partial<TrunkInspectionState> | null;
  stemBaseInspection?: Partial<StemBaseInspectionState> | null;
  arboriculturalMeasures?: ArboriculturalMeasure[] | null;
};

export type TreeInspectionExport = {
  tree: Tree;
  inspection?: LastInspectionDetail | null;
  mapImage?: string | null;
};

type GreenAreaPdfDocumentProps = {
  greenAreaId?: string;
  greenAreaName?: string;
  trees: TreeInspectionExport[];
  mapCenterLabel?: string;
};

const formatNumber = (value?: number | null, suffix = '') =>
  typeof value === 'number' && !Number.isNaN(value) ? `${value}${suffix}` : '-';

const formatVitality = (value?: string | number | null) => {
  if (typeof value === 'string') {
    return value.trim() || '-';
  }
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return normalizeVitality(value);
  }
  return '-';
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return 'Keine Kontrolle';
  }
  return formatDateDisplay(value, value);
};

const getActiveMarkings = <T extends Record<string, unknown>>(
  items: { key: keyof T; label: string }[],
  data?: Partial<T> | null,
) =>
  items
    .filter(({ key }) => Boolean(data?.[key]))
    .map(({ key, label }) => {
      const descriptionKey = `${String(key)}Description` as keyof T;
      const rawDescription = (data as any)?.[descriptionKey];
      const description =
        typeof rawDescription === 'string' && rawDescription.trim().length > 0 ? rawDescription.trim() : null;
      return { label, description };
    });

type TreeMapInlineProps = {
  latitude?: number | null;
  longitude?: number | null;
  height?: number;
  label?: string | number;
};

const TreeMapInline: React.FC<TreeMapInlineProps> = ({ latitude, longitude, height = 260, label }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any | null>(null);
  const markerRef = useRef<any | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const hasCoords = hasValidCoordinates(latitude, longitude, { allowZero: false });
  const center = hasCoords ? [latitude as number, longitude as number] : DEFAULT_MAP_CENTER;

  useEffect(() => {
    let isMounted = true;
    ensureLeafletAssets()
      .then(() => {
        if (!isMounted || !containerRef.current) {
          return;
        }
        const leafletWindow = window as LeafletWindow;
        if (!leafletWindow.L) {
          return;
        }
        const L = leafletWindow.L;

        if (!mapRef.current) {
          mapRef.current = L.map(containerRef.current, {
            maxZoom: MAX_MAP_ZOOM,
            minZoom: 3,
            zoomControl: false,
            attributionControl: false,
          }).setView(center, hasCoords ? 17 : 6);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap-Mitwirkende',
            maxZoom: MAX_MAP_ZOOM,
          }).addTo(mapRef.current);
        } else if (typeof mapRef.current.setView === 'function') {
          mapRef.current.setView(center, hasCoords ? 17 : mapRef.current.getZoom() ?? 6);
        }

        if (mapRef.current && typeof mapRef.current.invalidateSize === 'function') {
          requestAnimationFrame(() => mapRef.current?.invalidateSize());
        }

        if (hasCoords) {
          if (!markerRef.current) {
            const icon = L.divIcon({
              className: '',
              html: `<div class="ga-tree-marker"><div class="ga-tree-marker__label">${label ?? '-'}</div><div class="ga-tree-marker__dot"></div></div>`,
            });
            markerRef.current = L.marker(center, { icon }).addTo(mapRef.current);
          } else {
            markerRef.current.setLatLng(center);
          }
        } else if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }

        setIsReady(true);
        setMapError(null);
      })
      .catch((err) => {
        console.error('Leaflet map failed to load', err);
        if (isMounted) {
          setMapError('Karte konnte nicht geladen werden.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [center, hasCoords, latitude, longitude]);

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
    <div className="position-relative border rounded ga-map-shell" style={{ height, width: '100%', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
      {!isReady && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-75">
          <span className="small text-muted">Karte wird geladen...</span>
        </div>
      )}
      {!hasCoords && isReady && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
          <span className="badge bg-light text-dark border">Keine Koordinaten vorhanden</span>
        </div>
      )}
      {mapError && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-75">
          <span className="text-danger small">{mapError}</span>
        </div>
      )}
    </div>
  );
};

type AllTreesMapProps = {
  trees: TreeInspectionExport[];
  height?: number;
  initialZoom?: number;
  fitBoundsMaxZoom?: number;
};

const AllTreesMap: React.FC<AllTreesMapProps> = ({
  trees,
  height = 360,
  initialZoom = 6,
  fitBoundsMaxZoom = 12,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any | null>(null);
  const markersRef = useRef<any[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const positions = trees
    .map((entry) => ({
      id: entry.tree.id,
      number: entry.tree.number ?? entry.tree.id,
      lat: entry.tree.latitude,
      lng: entry.tree.longitude,
    }))
    .filter((pos) => hasValidCoordinates(pos.lat, pos.lng, { allowZero: false }));

  useEffect(() => {
    let isMounted = true;

    ensureLeafletAssets()
      .then(() => {
        if (!isMounted || !containerRef.current) {
          return;
        }
        const leafletWindow = window as LeafletWindow;
        const L = leafletWindow.L;
        if (!L) {
          return;
        }

        if (!mapRef.current) {
          mapRef.current = L.map(containerRef.current, {
            maxZoom: MAX_MAP_ZOOM,
            minZoom: 3,
            zoomControl: false,
            attributionControl: false,
          }).setView(DEFAULT_MAP_CENTER, initialZoom);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap-Mitwirkende',
            maxZoom: MAX_MAP_ZOOM,
          }).addTo(mapRef.current);
        }

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        if (positions.length > 0) {
          const bounds = L.latLngBounds([]);
          positions.forEach((pos) => {
            const icon = L.divIcon({
              className: '',
              html: `<div class="ga-tree-marker"><div class="ga-tree-marker__label">${pos.number}</div><div class="ga-tree-marker__dot"></div></div>`,
            });
            const marker = L.marker([pos.lat as number, pos.lng as number], { icon }).addTo(mapRef.current);
            markersRef.current.push(marker);
            bounds.extend(marker.getLatLng());
          });
          mapRef.current.fitBounds(bounds, {
            padding: [40, 40],
            maxZoom: Math.min(fitBoundsMaxZoom, MAX_MAP_ZOOM),
          });
        }

        if (mapRef.current && typeof mapRef.current.invalidateSize === 'function') {
          requestAnimationFrame(() => mapRef.current?.invalidateSize());
        }

        setIsReady(true);
        setMapError(null);
      })
      .catch((err) => {
        console.error('Leaflet map failed to load (all trees map)', err);
        if (isMounted) {
          setMapError('Karte konnte nicht geladen werden.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fitBoundsMaxZoom, initialZoom, positions]);

  useEffect(() => () => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    if (mapRef.current && typeof mapRef.current.remove === 'function') {
      mapRef.current.remove();
    }
    mapRef.current = null;
  }, []);

  const hasAnyCoords = positions.length > 0;

  return (
    <div className="ga-map-shell position-relative" style={{ height, width: '100%' }}>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
      {!isReady && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-75">
          <span className="small text-muted">Karte wird geladen...</span>
        </div>
      )}
      {!hasAnyCoords && isReady && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
          <span className="ga-pill ga-pill--neutral">Keine Koordinaten vorhanden</span>
        </div>
      )}
      {mapError && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-75">
          <span className="text-danger small">{mapError}</span>
        </div>
      )}
    </div>
  );
};

export const GreenAreaMapPrint: React.FC<{
  greenAreaId?: string;
  greenAreaName?: string;
  trees: TreeInspectionExport[];
  mapCenterLabel?: string;
}> = ({greenAreaName, trees, mapCenterLabel }) => {
  const generatedAt = formatDateDisplay(new Date());
  return (
    <div className="ga-print">
      <PdfStyles />
      <div className="ga-card mb-3">
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div>
            <div className="ga-meta-label">Grünfläche</div>
            <h2 className="h5 mb-1">
             {greenAreaName ? `| ${greenAreaName}` : ''}
            </h2>
            <div className="ga-muted">Exportiert am {generatedAt}</div>
          </div>
          <div className="d-flex flex-column align-items-end gap-2">
            <span className="ga-pill">Bäume: {trees.length}</span>
            {mapCenterLabel ? <span className="ga-pill ga-pill--neutral">Standort Koordinaten {mapCenterLabel}</span> : null}
          </div>
        </div>
      </div>

      <div className="ga-card mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="ga-section-title mb-0">Karte der Bäume</div>
          <span className="ga-muted small">Übersichtlicher Zoom für die gesamte Fläche</span>
        </div>
        <AllTreesMap trees={trees} height={420} fitBoundsMaxZoom={14} initialZoom={10} />
      </div>
    </div>
  );
};

const TreeInspectionCard: React.FC<{ entry: TreeInspectionExport }> = ({ entry }) => {
  const { tree, inspection, mapImage } = entry;
  const hasCoords = hasValidCoordinates(tree.latitude, tree.longitude, { allowZero: false });
  const coordsLabel = hasCoords
    ? `${formatCoordinateDisplay(tree.latitude)}, ${formatCoordinateDisplay(tree.longitude)}`
    : 'Keine Koordinaten';
  const nextInspectionStatus = getNextInspectionStatus(tree.nextInspection);
  const trafficSafetyExpectationLabel =
    typeof tree.trafficSafetyExpectation === 'string' && tree.trafficSafetyExpectation.trim().length > 0
      ? tree.trafficSafetyExpectation
      : 'None';
  const measuresLabel =
    inspection?.arboriculturalMeasures && inspection.arboriculturalMeasures.length > 0
      ? inspection.arboriculturalMeasures
          .map((measure) => (measure.description ? `${measure.measureName} (${measure.description})` : measure.measureName))
          .join(', ')
      : inspection?.arboriculturalMeasureIds && inspection.arboriculturalMeasureIds.length > 0
        ? 'Massnahmen hinterlegt'
        : 'Keine Massnahmen erfasst';

  const inspectionFields: Array<[string, string]> | null = inspection
    ? [
        ['Datum', formatDateTime(inspection.performedAt)],
        ['Verkehrssicherheit', inspection.isSafeForTraffic ? 'Verkehrssicher' : 'Nicht verkehrssicher'],
        ['Intervall (Monate)', formatNumber(inspection.newInspectionIntervall)],
        ['Entwicklungsstadium', inspection.developmentalStage || '-'],
        ['Vitalität', formatVitality(inspection.vitality)],
        ['Pflegemassnahmen', measuresLabel],
      ]
    : null;

  const sectionData =
    inspection != null
      ? [
          {
            title: 'Krone',
            notes: inspection.crownInspection?.notes,
            markings: getActiveMarkings<CrownInspectionState>(crownCheckboxes, inspection.crownInspection),
          },
          {
            title: 'Stamm',
            notes: inspection.trunkInspection?.notes,
            markings: getActiveMarkings<TrunkInspectionState>(trunkCheckboxes, inspection.trunkInspection),
          },
          {
            title: 'Stammfuss & Wurzelbereich',
            notes: inspection.stemBaseInspection?.notes,
            markings: getActiveMarkings<StemBaseInspectionState>(stemBaseCheckboxes, inspection.stemBaseInspection),
          },
        ]
      : [];

  return (
    <div className="ga-print-card ga-card mb-4">
      <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
        <div>
          <div className="ga-section-title">Baumprofil</div>
          <h3 className="h6 mb-1">
            Baum {formatNumber(tree.number)} · {tree.species || 'Unbekannte Art'}
          </h3>
        </div>
        <div className="d-flex flex-column align-items-end gap-2">
          <span
            className={`ga-pill ${
              inspection ? (inspection.isSafeForTraffic ? 'ga-pill--success' : 'ga-pill--danger') : 'ga-pill--neutral'
            }`}
          >
            {inspection ? (inspection.isSafeForTraffic ? 'Verkehrssicher' : 'Nicht verkehrssicher') : 'Keine Kontrolle'}
          </span>
          <span className="ga-pill">Sicherheitserwartung: {trafficSafetyExpectationLabel}</span>
        </div>
      </div>

      <div className="ga-meta-grid mb-3">
        <div className="ga-meta-item">
          <div className="ga-meta-label">Baumnummer</div>
          <div className="ga-meta-value">{formatNumber(tree.number)}</div>
        </div>
        <div className="ga-meta-item">
          <div className="ga-meta-label">Koordinaten</div>
          <div className="ga-meta-value">{coordsLabel}</div>
        </div>
        <div className="ga-meta-item">
          <div className="ga-meta-label">Baumhöhe (m)</div>
          <div className="ga-meta-value">{formatNumber(tree.treeSizeMeters)}</div>
        </div>
        <div className="ga-meta-item">
          <div className="ga-meta-label">Kronendurchmesser (m)</div>
          <div className="ga-meta-value">{formatNumber(tree.crownDiameterMeters)}</div>
        </div>
        <div className="ga-meta-item">
          <div className="ga-meta-label">Letzte Kontrolle</div>
          <div className="ga-meta-value">
            {inspection ? formatDateTime(inspection.performedAt) : 'Keine Kontrolle'}
          </div>
        </div>
        <div className="ga-meta-item">
          <div className="ga-meta-label">Nächste Kontrolle</div>
          <div className="ga-meta-value">
            {getNextInspectionDaysLabel(nextInspectionStatus)}
          </div>
        </div>
        <div className="ga-meta-item">
        </div>
      </div>

      <table className="ga-table mb-3">
        <tbody>
          <tr>
            <th className="w-25">Stammdaten</th>
            <td className="w-25">Anzahl Stämme: {formatNumber(tree.numberOfTrunks)}</td>
            <th className="w-25">Stammdurchmesser 1</th>
            <td className="w-25">{formatNumber(tree.trunkDiameter1)}</td>
          </tr>
          <tr>
            <th>Stammdurchmesser 2</th>
            <td>{formatNumber(tree.trunkDiameter2)}</td>
            <th>Stammdurchmesser 3</th>
            <td>{formatNumber(tree.trunkDiameter3)}</td>
          </tr>
          <tr>
            <th>Nächste Kontrolle (Tage)</th>
            <td colSpan={3}>{getNextInspectionDaysLabel(nextInspectionStatus)}</td>
          </tr>
        </tbody>
      </table>

      {hasCoords ? (
        <div className="mb-3">
          <div className="ga-section-title">Karte</div>
          <TreeMapInline
            latitude={tree.latitude ?? undefined}
            longitude={tree.longitude ?? undefined}
            label={tree.number ?? tree.id}
          />
        </div>
      ) : mapImage ? (
        <div className="mb-3">
          <div className="ga-section-title">Karte</div>
          <div className="ga-map-shell position-relative" style={{ height: 240, width: '100%' }}>
            <img
              src={mapImage}
              alt="Karte"
              className="w-100 h-100"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      ) : null}

      {inspectionFields ? (
        <>
          <div className="ga-section-title">Kontrolldaten</div>
          <table className="ga-table mb-3">
            <tbody>
              {inspectionFields.map(([label, value]) => (
                <tr key={label}>
                  <th className="w-40">{label}</th>
                  <td>{value}</td>
                </tr>
              ))}
              <tr>
                <th>Beschreibung</th>
                <td>{inspection?.description?.trim() ? inspection.description : 'Keine Beschreibung erfasst.'}</td>
              </tr>
            </tbody>
          </table>

          <div className="ga-section-title">Notizen & Markierungen</div>
          <table className="ga-table">
            <thead>
              <tr>
                <th>Bereich</th>
                <th>Notizen</th>
                <th>Markierungen</th>
              </tr>
            </thead>
            <tbody>
              {sectionData.map((section) => (
                <tr key={section.title}>
                  <td className="fw-semibold">{section.title}</td>
                  <td>{section.notes?.trim() ? section.notes : 'Keine Notizen erfasst.'}</td>
                  <td>
              {section.markings.length
                ? section.markings.map(({ label, description }) => (description ? `${label} (${description})` : label)).join(', ')
                : 'Keine Auffälligkeiten markiert.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <div className="mt-2 text-muted">Keine Kontrolle vorhanden.</div>
      )}
    </div>
  );
};

const GreenAreaPdfDocument: React.FC<GreenAreaPdfDocumentProps> = ({
  greenAreaName,
  trees,
  mapCenterLabel,
}) => {
  const generatedAt = formatDateDisplay(new Date());
  return (
    <div className="ga-print">
      <PdfStyles />
      <div className="ga-card ga-hero mb-3">
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div>
            <div className="ga-hero-kicker">Grünflächenexport</div>
            <h2 className="ga-hero-title">{greenAreaName ?? 'Unbenannt'}</h2>
            <div className="ga-hero-subtitle">Exportiert am {generatedAt}</div>
          </div>
          <div className="ga-chip-group">
            <span className="ga-pill">Bäume: {trees.length}</span>
            {mapCenterLabel ? <span className="ga-pill ga-pill--neutral">Kartenmittelpunkt: {mapCenterLabel}</span> : null}
          </div>
        </div>
      </div>

      <div className="ga-card mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="ga-section-title mb-0">Karte: Bäume in dieser Fläche</div>
          <span className="ga-muted">Marker mit Baumnummer</span>
        </div>
        <AllTreesMap trees={trees} />
      </div>

      {trees.map((entry) => (
        <TreeInspectionCard key={entry.tree.id} entry={entry} />
      ))}
    </div>
  );
};

export default GreenAreaPdfDocument;
