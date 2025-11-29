import React, { useEffect, useRef, useState } from 'react';
import { crownCheckboxes, stemBaseCheckboxes, trunkCheckboxes } from '@/features/inspections/forms/inspectionFormConfig';
import type {
  CrownInspectionState,
  StemBaseInspectionState,
  TrunkInspectionState,
} from '@/features/inspections/forms/inspectionFormConfig';
import type { Inspection } from '@/features/inspections';
import type { Tree } from '@/features/trees/types';
import { DEFAULT_MAP_CENTER, MAX_MAP_ZOOM, ensureLeafletAssets, hasValidCoordinates, type LeafletWindow } from '@/shared/maps/leafletUtils';

export type LastInspectionDetail = Inspection & {
  crownInspection?: Partial<CrownInspectionState> | null;
  trunkInspection?: Partial<TrunkInspectionState> | null;
  stemBaseInspection?: Partial<StemBaseInspectionState> | null;
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
  summaryMap?: string | null;
  mapCenterLabel?: string;
};

const formatNumber = (value?: number | null, suffix = '') =>
  typeof value === 'number' && !Number.isNaN(value) ? `${value}${suffix}` : '-';

const formatCoordinate = (value?: number | null) =>
  typeof value === 'number' && !Number.isNaN(value) ? value.toFixed(5) : 'n/v';

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return 'Keine Kontrolle';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return value;
  }
  return parsed.toLocaleString('de-DE');
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
};

const TreeMapInline: React.FC<TreeMapInlineProps> = ({ latitude, longitude, height = 260 }) => {
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

        if (hasCoords) {
          if (!markerRef.current) {
            markerRef.current = L.marker(center).addTo(mapRef.current);
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
    <div className="position-relative border rounded" style={{ height, overflow: 'hidden' }}>
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

const TreeInspectionCard: React.FC<{ entry: TreeInspectionExport }> = ({ entry }) => {
  const { tree, inspection, mapImage } = entry;
  const hasCoords = hasValidCoordinates(tree.latitude, tree.longitude, { allowZero: false });
  const coordsLabel = hasCoords
    ? `${formatCoordinate(tree.latitude)}, ${formatCoordinate(tree.longitude)}`
    : 'Keine Koordinaten';

  const inspectionFields: Array<[string, string]> | null = inspection
    ? [
        ['Kontroll-ID', String(inspection.id)],
        ['Datum', formatDateTime(inspection.performedAt)],
        ['Verkehrssicherheit', inspection.isSafeForTraffic ? 'Verkehrssicher' : 'Nicht verkehrssicher'],
        ['Intervall (Tage)', formatNumber(inspection.newInspectionIntervall)],
        ['Entwicklungsstadium', inspection.developmentalStage || '-'],
        ['Vitalitaet', formatNumber(inspection.vitality)],
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
    <div className="ga-print-card border rounded-3 p-3 mb-3">
      <h3 className="h6 mb-3">
        Baum {tree.number ?? tree.id} - {tree.species || 'Unbekannte Art'}
      </h3>

      <table className="table table-sm align-middle mb-3">
        <tbody>
          <tr>
            <th className="w-25">Baum-ID</th>
            <td className="w-25">{tree.id}</td>
            <th className="w-25">Art</th>
            <td className="w-25">{tree.species || 'Unbekannte Art'}</td>
          </tr>
          <tr>
            <th>Baumnummer</th>
            <td>{formatNumber(tree.number)}</td>
            <th>Koordinaten</th>
            <td>{coordsLabel}</td>
          </tr>
          <tr>
            <th>Baumhoehe (m)</th>
            <td>{formatNumber(tree.treeSizeMeters)}</td>
            <th>Kronendurchmesser (m)</th>
            <td>{formatNumber(tree.crownDiameterMeters)}</td>
          </tr>
          <tr>
            <th>Kronenansatzhoehe (m)</th>
            <td>{formatNumber(tree.crownAttachmentHeightMeters)}</td>
            <th>Anzahl Staemme</th>
            <td>{formatNumber(tree.numberOfTrunks)}</td>
          </tr>
          <tr>
            <th>Stamminneigung (Grad)</th>
            <td>{formatNumber(tree.trunkInclination)}</td>
            <th>Letzte Kontrolle</th>
            <td>
              {inspection ? (
                <>
                  {formatDateTime(inspection.performedAt)}{' '}
                  <span className={`badge ms-1 ${inspection.isSafeForTraffic ? 'bg-success' : 'bg-danger'}`}>
                    {inspection.isSafeForTraffic ? 'Verkehrssicher' : 'Nicht verkehrssicher'}
                  </span>
                </>
              ) : (
                'Keine Kontrolle'
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {hasCoords ? (
        <div className="mb-3">
          <div className="text-muted small mb-1">Karte</div>
          <TreeMapInline latitude={tree.latitude ?? undefined} longitude={tree.longitude ?? undefined} />
        </div>
      ) : mapImage ? (
        <div className="mb-3">
          <div className="text-muted small mb-1">Karte</div>
          <img
            src={mapImage}
            alt="Karte"
            className="w-100 rounded-3 border"
            style={{ maxHeight: 260, objectFit: 'cover' }}
          />
        </div>
      ) : null}

      {inspectionFields ? (
        <>
          <div className="fw-semibold mb-2">Kontrolldaten</div>
          <table className="table table-sm align-middle mb-3">
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

          <div className="fw-semibold mb-2">Notizen & Markierungen</div>
          <table className="table table-sm align-middle">
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
                : 'Keine Auffaelligkeiten markiert.'}
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
  greenAreaId,
  greenAreaName,
  trees,
  summaryMap,
  mapCenterLabel,
}) => (
  <div className="ga-print">
    <div className="mb-3">
      <div className="text-muted small">Gruenflaeche</div>
      <h2 className="h5 mb-0">
        {greenAreaId} {greenAreaName ? `| ${greenAreaName}` : ''}
      </h2>
    </div>

    <div className="border rounded-3 p-3 mb-3">
      <div className="fw-semibold mb-2">Uebersicht</div>
      <div className="row g-2 small">
        <div className="col-6">
          <div className="border rounded-3 p-2 h-100">
            <div className="text-muted small">Anzahl Baeume</div>
            <div className="fw-semibold">{trees.length}</div>
          </div>
        </div>
        {mapCenterLabel ? (
          <div className="col-6">
            <div className="border rounded-3 p-2 h-100">
              <div className="text-muted small">Kartenmittelpunkt</div>
              <div className="fw-semibold">{mapCenterLabel}</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>

    {trees.map((entry) => (
      <TreeInspectionCard key={entry.tree.id} entry={entry} />
    ))}
  </div>
);

export default GreenAreaPdfDocument;
