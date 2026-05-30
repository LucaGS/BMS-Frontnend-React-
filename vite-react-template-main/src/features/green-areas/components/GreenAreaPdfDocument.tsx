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
import {
  DEFAULT_MAP_CENTER,
  MAX_MAP_ZOOM,
  ensureLeafletAssets,
  hasValidCoordinates,
  type LeafletWindow,
} from '@/shared/maps/leafletUtils';
import { getNextInspectionStatus } from '@/features/trees/utils/nextInspection';
import { normalizeVitality } from '@/entities/inspection';
import { formatCoordinateDisplay } from '@/shared/lib/coordinateFormatting';
import { formatDateDisplay } from '@/shared/lib/dateFormatting';

const PdfStyles: React.FC = () => (
  <style>
    {`
      .ga-print {
        --ga-text: #182334;
        --ga-muted: #67768d;
        --ga-line: #d9e1ea;
        --ga-surface: #ffffff;
        --ga-surface-soft: #f7f9fc;
        --ga-accent: #0b6bcb;
        --ga-success: #136c45;
        --ga-danger: #a13a3a;
        font-family: 'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', sans-serif;
        color: var(--ga-text);
        background: #f1f5f9;
        line-height: 1.35;
        width: 100%;
        padding: 0 0 10mm;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .ga-print,
      .ga-print * {
        box-sizing: border-box;
      }
      .ga-sheet {
        width: 100%;
      }
      .ga-card {
        background: var(--ga-surface);
        border: 1px solid var(--ga-line);
        border-radius: 14px;
        padding: 14px;
        page-break-inside: avoid;
        break-inside: avoid-page;
      }
      .ga-card + .ga-card {
        margin-top: 12px;
      }
      .ga-header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: flex-start;
      }
      .ga-kicker {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--ga-accent);
        margin-bottom: 6px;
      }
      .ga-title {
        font-size: 24px;
        line-height: 1.1;
        margin: 0 0 4px;
        font-weight: 700;
      }
      .ga-subtitle {
        font-size: 12px;
        color: var(--ga-muted);
      }
      .ga-chip-group {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 6px;
        max-width: 360px;
      }
      .ga-chip {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        border: 1px solid var(--ga-line);
        background: var(--ga-surface-soft);
        padding: 5px 9px;
        font-size: 11px;
        font-weight: 600;
        color: var(--ga-text);
      }
      .ga-chip--info {
        color: var(--ga-accent);
      }
      .ga-chip--success {
        color: var(--ga-success);
      }
      .ga-chip--danger {
        color: var(--ga-danger);
      }
      .ga-section-title {
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--ga-muted);
        margin-bottom: 8px;
      }
      .ga-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        font-size: 11px;
      }
      .ga-table th,
      .ga-table td {
        border: 1px solid var(--ga-line);
        padding: 6px 8px;
        text-align: left;
        vertical-align: top;
        overflow-wrap: anywhere;
      }
      .ga-table th {
        background: var(--ga-surface-soft);
        color: var(--ga-text);
        font-weight: 800;
      }
      .ga-table--meta th {
        width: 22%;
        color: var(--ga-text);
        font-weight: 800;
      }
      .ga-table--summary th,
      .ga-table--summary td,
      .ga-table--notes th,
      .ga-table--notes td {
        font-size: 10.5px;
      }
      .ga-table--summary th:nth-child(1) { width: 8%; }
      .ga-table--summary th:nth-child(2) { width: 17%; }
      .ga-table--summary th:nth-child(3) { width: 17%; }
      .ga-table--summary th:nth-child(4) { width: 16%; }
      .ga-table--summary th:nth-child(5) { width: 12%; }
      .ga-table--summary th:nth-child(6) { width: 15%; }
      .ga-table--summary th:nth-child(7) { width: 15%; }
      .ga-grid {
        display: grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap: 12px;
      }
      .ga-map-shell {
        border: 1px solid var(--ga-line);
        border-radius: 12px;
        overflow: hidden;
        background: #fff;
        page-break-inside: avoid;
        break-inside: avoid-page;
      }
      .ga-tree-block {
        page-break-inside: avoid;
        break-inside: avoid-page;
      }
      .ga-tree-block + .ga-tree-block {
        margin-top: 12px;
      }
      .ga-tree-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 8px;
      }
      .ga-tree-title {
        font-size: 16px;
        margin: 0;
        font-weight: 700;
      }
      .ga-tree-subtitle {
        font-size: 11px;
        color: var(--ga-muted);
        margin-top: 2px;
      }
      .ga-note-text {
        margin: 0;
        white-space: pre-wrap;
        color: var(--ga-text);
        font-size: 11px;
      }
      .ga-empty {
        color: var(--ga-muted);
      }
      .ga-tree-marker {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      }
      .ga-tree-marker__label {
        background: #136c45;
        color: #fff;
        border-radius: 999px;
        padding: 2px 7px;
        font-size: 11px;
        font-weight: 700;
        border: 2px solid #fff;
      }
      .ga-tree-marker__dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: #136c45;
        border: 2px solid #fff;
      }
      @page {
        size: A4 portrait;
        margin: 9mm;
      }
      @media print {
        body { background: #fff !important; }
        body * { visibility: hidden !important; }
        .ga-print,
        .ga-print * { visibility: visible !important; }
        .ga-print {
          position: absolute;
          inset: 0;
          background: #fff;
          padding: 0;
        }
        .ga-chip-group {
          justify-content: flex-start;
          max-width: none;
        }
      }
      @media screen and (max-width: 960px) {
        .ga-grid {
          grid-template-columns: 1fr;
        }
        .ga-header,
        .ga-tree-head {
          flex-direction: column;
        }
        .ga-chip-group {
          justify-content: flex-start;
          max-width: none;
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

const formatNextInspectionDate = (value?: string | null) => {
  if (!value) {
    return 'Keine nächste Kontrolle';
  }

  return formatDateDisplay(value, 'Keine nächste Kontrolle');
};

const getCoordinatesLabel = (tree: Tree) =>
  hasValidCoordinates(tree.latitude, tree.longitude, { allowZero: false })
    ? `${formatCoordinateDisplay(tree.latitude)}, ${formatCoordinateDisplay(tree.longitude)}`
    : 'Keine Koordinaten';

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
      return description ? `${label} (${description})` : label;
    });

type TreeMapInlineProps = {
  latitude?: number | null;
  longitude?: number | null;
  height?: number;
  label?: string | number;
};

const TreeMapInline: React.FC<TreeMapInlineProps> = ({ latitude, longitude, height = 190, label }) => {
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
          }).setView(center, hasCoords ? 17 : 6);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap-Mitwirkende',
            maxZoom: MAX_MAP_ZOOM,
          }).addTo(mapRef.current);
        } else {
          mapRef.current.setView(center, hasCoords ? 17 : mapRef.current.getZoom() ?? 6);
        }

        requestAnimationFrame(() => mapRef.current?.invalidateSize?.());

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
      .catch((error) => {
        console.error('Leaflet map failed to load', error);
        if (isMounted) {
          setMapError('Karte konnte nicht geladen werden.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [center, hasCoords, label]);

  useEffect(() => () => {
    markerRef.current?.remove?.();
    markerRef.current = null;
    mapRef.current?.remove?.();
    mapRef.current = null;
  }, []);

  return (
    <div className="ga-map-shell position-relative" style={{ height, width: '100%' }}>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
      {!isReady && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75">
          <span className="small text-muted">Karte wird geladen...</span>
        </div>
      )}
      {!hasCoords && isReady && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
          <span className="ga-chip ga-chip--info">Keine Koordinaten vorhanden</span>
        </div>
      )}
      {mapError && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75">
          <span className="small text-danger">{mapError}</span>
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
  height = 340,
  initialZoom = 6,
  fitBoundsMaxZoom = 13,
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
            padding: [32, 32],
            maxZoom: Math.min(fitBoundsMaxZoom, MAX_MAP_ZOOM),
          });
        }

        requestAnimationFrame(() => mapRef.current?.invalidateSize?.());
        setIsReady(true);
        setMapError(null);
      })
      .catch((error) => {
        console.error('Leaflet map failed to load (all trees map)', error);
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
    mapRef.current?.remove?.();
    mapRef.current = null;
  }, []);

  return (
    <div className="ga-map-shell position-relative" style={{ height, width: '100%' }}>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
      {!isReady && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75">
          <span className="small text-muted">Karte wird geladen...</span>
        </div>
      )}
      {positions.length === 0 && isReady && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
          <span className="ga-chip ga-chip--info">Keine Koordinaten vorhanden</span>
        </div>
      )}
      {mapError && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75">
          <span className="small text-danger">{mapError}</span>
        </div>
      )}
    </div>
  );
};

const TreeInspectionCard: React.FC<{ entry: TreeInspectionExport }> = ({ entry }) => {
  const { tree, inspection, mapImage } = entry;
  const nextInspectionLabel = formatNextInspectionDate(tree.nextInspection);
  const safetyLabel = inspection
    ? inspection.isSafeForTraffic
      ? 'Verkehrssicher'
      : 'Nicht verkehrssicher'
    : 'Keine Kontrolle';
  const safetyClass = inspection
    ? inspection.isSafeForTraffic
      ? 'ga-chip ga-chip--success'
      : 'ga-chip ga-chip--danger'
    : 'ga-chip ga-chip--info';
  const measures =
    inspection?.arboriculturalMeasures && inspection.arboriculturalMeasures.length > 0
      ? inspection.arboriculturalMeasures.map((measure) =>
          measure.description ? `${measure.measureName} (${measure.description})` : measure.measureName,
        )
      : inspection?.arboriculturalMeasureIds && inspection.arboriculturalMeasureIds.length > 0
        ? ['Massnahmen hinterlegt']
        : [];

  const rows: Array<[string, string]> = [
    ['Baumnummer', formatNumber(tree.number)],
    ['Art', tree.species || 'Unbekannte Art'],
    ['Koordinaten', getCoordinatesLabel(tree)],
    ['Letzte Kontrolle', inspection ? formatDateTime(inspection.performedAt) : 'Keine Kontrolle'],
    ['Nächste Kontrolle', nextInspectionLabel],
    ['Verkehrssicherheit', safetyLabel],
    ['Entwicklungsstadium', inspection?.developmentalStage || '-'],
    ['Vitalität', inspection ? formatVitality(inspection.vitality) : '-'],
    ['Intervall', inspection ? formatNumber(inspection.newInspectionIntervall, ' Monate') : '-'],
    ['Sicherheitserwartung', tree.trafficSafetyExpectation || '-'],
  ];

  const sections = inspection
    ? [
        ['Krone', inspection.crownInspection?.notes, getActiveMarkings<CrownInspectionState>(crownCheckboxes, inspection.crownInspection).join(', ') || 'Keine Auffälligkeiten markiert.'],
        ['Stamm', inspection.trunkInspection?.notes, getActiveMarkings<TrunkInspectionState>(trunkCheckboxes, inspection.trunkInspection).join(', ') || 'Keine Auffälligkeiten markiert.'],
        ['Stammfuss und Wurzelbereich', inspection.stemBaseInspection?.notes, getActiveMarkings<StemBaseInspectionState>(stemBaseCheckboxes, inspection.stemBaseInspection).join(', ') || 'Keine Auffälligkeiten markiert.'],
      ]
    : [];

  return (
    <div className="ga-tree-block ga-card">
      <div className="ga-tree-head">
        <div>
          <h2 className="ga-tree-title">Baum {formatNumber(tree.number)} · {tree.species || 'Unbekannte Art'}</h2>
          <div className="ga-tree-subtitle">Kompakte Stammdaten und Kontrollübersicht</div>
        </div>
        <div className="ga-chip-group">
          <span className={safetyClass}>{safetyLabel}</span>
          <span className="ga-chip ga-chip--info">Nächste Kontrolle: {nextInspectionLabel}</span>
        </div>
      </div>

      <div className="ga-grid">
        <div>
          <div className="ga-section-title">Stammdaten und Kontrolle</div>
          <table className="ga-table ga-table--meta">
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label}>
                  <th>{label}</th>
                  <td>{value}</td>
                </tr>
              ))}
              <tr>
                <th>Beschreibung</th>
                <td>{inspection?.description?.trim() ? inspection.description : 'Keine Beschreibung erfasst.'}</td>
              </tr>
            </tbody>
          </table>

          <div className="ga-section-title" style={{ marginTop: 10 }}>Pflegemassnahmen</div>
          {measures.length > 0 ? (
            <table className="ga-table ga-table--notes">
              <tbody>
                {measures.map((measure, index) => (
                  <tr key={`${index}-${measure}`}>
                    <th style={{ width: '12%' }}>{index + 1}</th>
                    <td>{measure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="ga-note-text ga-empty">Keine Pflegemassnahmen erfasst.</p>
          )}
        </div>

        {hasValidCoordinates(tree.latitude, tree.longitude, { allowZero: false }) ? (
          <div>
            <div className="ga-section-title">Position</div>
            <TreeMapInline latitude={tree.latitude ?? undefined} longitude={tree.longitude ?? undefined} label={tree.number ?? tree.id} />
          </div>
        ) : mapImage ? (
          <div>
            <div className="ga-section-title">Position</div>
            <div className="ga-map-shell position-relative" style={{ height: 190, width: '100%' }}>
              <img src={mapImage} alt="Karte" className="w-100 h-100" style={{ objectFit: 'cover' }} />
            </div>
          </div>
        ) : null}
      </div>

      <div className="ga-section-title" style={{ marginTop: 10 }}>Befundübersicht</div>
      {sections.length > 0 ? (
        <table className="ga-table ga-table--notes">
          <thead>
            <tr>
              <th>Bereich</th>
              <th>Markierungen</th>
              <th>Notizen</th>
            </tr>
          </thead>
          <tbody>
            {sections.map(([title, notes, markings]) => (
              <tr key={title}>
                <td>{title}</td>
                <td>{markings}</td>
                <td>{notes && String(notes).trim() ? String(notes) : 'Keine Notizen erfasst.'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="ga-note-text ga-empty">Keine Kontrolle vorhanden.</p>
      )}
    </div>
  );
};

export const GreenAreaMapPrint: React.FC<{
  greenAreaId?: string;
  greenAreaName?: string;
  trees: TreeInspectionExport[];
  mapCenterLabel?: string;
}> = ({ greenAreaName, trees, mapCenterLabel }) => {
  const generatedAt = formatDateDisplay(new Date());

  return (
    <div className="ga-print">
      <PdfStyles />
      <div className="ga-sheet">
        <div className="ga-card">
          <div className="ga-header">
            <div>
              <div className="ga-kicker">Kartenexport</div>
              <h1 className="ga-title">{greenAreaName ?? 'Unbenannt'}</h1>
              <div className="ga-subtitle">Gesamtübersicht aller Bäume mit Positionsmarkern</div>
            </div>
            <div className="ga-chip-group">
              <span className="ga-chip">Exportiert am {generatedAt}</span>
              <span className="ga-chip ga-chip--info">Bäume: {trees.length}</span>
              {mapCenterLabel ? <span className="ga-chip">Kartenmittelpunkt: {mapCenterLabel}</span> : null}
            </div>
          </div>
        </div>

        <div className="ga-card">
          <div className="ga-section-title">Übersichtskarte</div>
          <AllTreesMap trees={trees} height={430} fitBoundsMaxZoom={14} initialZoom={10} />
        </div>
      </div>
    </div>
  );
};

const GreenAreaPdfDocument: React.FC<GreenAreaPdfDocumentProps> = ({
  greenAreaName,
  trees,
}) => {
  const generatedAt = formatDateDisplay(new Date());
  const inspectedCount = trees.filter((entry) => Boolean(entry.inspection)).length;
  const overdueCount = trees.filter((entry) => getNextInspectionStatus(entry.tree.nextInspection).isOverdue).length;

  return (
    <div className="ga-print">
      <PdfStyles />
      <div className="ga-sheet">
        <div className="ga-card">
          <div className="ga-header">
            <div>
              <div className="ga-kicker">Grünflächenexport</div>
              <h1 className="ga-title">{greenAreaName ?? 'Unbenannt'}</h1>
              <div className="ga-subtitle">Kompakt, tabellarisch und für Ausdruck optimiert</div>
            </div>
            <div className="ga-chip-group">
              <span className="ga-chip">Exportiert am {generatedAt}</span>
              <span className="ga-chip ga-chip--info">Bäume: {trees.length}</span>
              <span className="ga-chip">Kontrolliert: {inspectedCount}</span>
              <span className={overdueCount > 0 ? 'ga-chip ga-chip--danger' : 'ga-chip ga-chip--success'}>
                Überfällig: {overdueCount}
              </span>
            </div>
          </div>
        </div>

        <div className="ga-card">
          <div className="ga-section-title">Karte der Bäume</div>
          <AllTreesMap trees={trees} />
        </div>

        {trees.map((entry) => (
          <TreeInspectionCard key={entry.tree.id} entry={entry} />
        ))}
      </div>
    </div>
  );
};

export default GreenAreaPdfDocument;
