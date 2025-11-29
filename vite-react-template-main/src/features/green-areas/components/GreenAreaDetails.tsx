import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '@/shared/config/appConfig';
import { mapInspectionFromApi } from '@/features/inspections';
import { mapTreesFromApi, type Tree } from '@/features/trees/types';
import TreeForm from '@/features/trees/forms/TreeForm';
import GreenAreaMap from '../maps/GreenAreaMap';
import type { GreenArea } from '@/features/green-areas/types';
import { buildMapPreviewDataUrl, buildTreeMapPreviewDataUrl } from '@/shared/maps/mapPreview';
import GreenAreaPdfDocument, {
  type LastInspectionDetail,
  type TreeInspectionExport,
} from './GreenAreaPdfDocument';

type GreenAreaRouteParams = {
  greenAreaId: string;
  greenAreaName: string;
};

type GreenAreaLocationState = {
  longitude?: number;
  latitude?: number;
};

const DEFAULT_GREEN_AREA_CENTER: [number, number] = [49.659, 9.9962];

const deriveCenterFromState = (state?: GreenAreaLocationState): [number, number] | null => {
  if (typeof state?.latitude === 'number' && typeof state?.longitude === 'number') {
    return [state.latitude, state.longitude];
  }
  return null;
};

const formatCoordinate = (value?: number | null) =>
  typeof value === 'number' && !Number.isNaN(value) ? value.toFixed(5) : 'n/v';

const GreenAreaDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as GreenAreaLocationState | undefined;
  const { greenAreaId, greenAreaName } = useParams<GreenAreaRouteParams>();
  const [error, setError] = useState<string | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [inspectionLookup, setInspectionLookup] = useState<Record<number, LastInspectionDetail | null>>({});
  const [showTreeForm, setShowTreeForm] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [pdfData, setPdfData] = useState<{
    entries: TreeInspectionExport[];
    centerLabel: string;
  } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    deriveCenterFromState(locationState) ?? DEFAULT_GREEN_AREA_CENTER,
  );

  const fetchLatestInspections = useCallback(
    async (currentTrees: Tree[]): Promise<Record<number, LastInspectionDetail | null>> => {
      if (!currentTrees.length) {
        return {};
      }

      const token = localStorage.getItem('token') || '';
      const results = await Promise.all(
        currentTrees.map(async (tree) => {
          if (!tree.lastInspectionId) {
            return { treeId: tree.id, inspection: null };
          }

          try {
            const response = await fetch(`${API_BASE_URL}/api/Inspections/${tree.lastInspectionId}`, {
              headers: {
                Authorization: `bearer ${token}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to load last inspection.');
            }

            const data = await response.json();
            const base = mapInspectionFromApi(data);
            const detailed: LastInspectionDetail = {
              ...base,
              crownInspection: data.crownInspection ?? data.crown ?? null,
              trunkInspection: data.trunkInspection ?? data.trunk ?? null,
              stemBaseInspection: data.stemBaseInspection ?? data.stemBase ?? data.root ?? null,
            };
            return { treeId: tree.id, inspection: detailed };
          } catch (inspectionError) {
            console.error(`Error fetching last inspection for tree ${tree.id}:`, inspectionError);
            return { treeId: tree.id, inspection: null };
          }
        }),
      );

      return results.reduce<Record<number, LastInspectionDetail | null>>((acc, { treeId, inspection }) => {
        acc[treeId] = inspection;
        return acc;
      }, {});
    },
    [],
  );

  const fetchTrees = useCallback(async () => {
    if (!greenAreaId) {
      setError('Keine Gruenflaeche ausgewaehlt.');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/Trees/GetByGreenAreaId/${greenAreaId}`, {
        headers: {
          Authorization: `bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to load trees for the selected green area.');
      }
      const data = await response.json();
      setTrees(Array.isArray(data) ? mapTreesFromApi(data) : []);
      setError(null);
    } catch (fetchError) {
      console.error('Error fetching trees:', fetchError);
      setError(fetchError instanceof Error ? fetchError.message : 'Unbekannter Fehler beim Laden der Baeume.');
    }
  }, [greenAreaId]);

  useEffect(() => {
    fetchTrees();
  }, [fetchTrees]);

  useEffect(() => {
    let isCancelled = false;
    if (trees.length === 0) {
      setInspectionLookup({});
      return undefined;
    }

    fetchLatestInspections(trees)
      .then((lookup) => {
        if (!isCancelled) {
          setInspectionLookup(lookup);
        }
      })
      .catch((lookupError) => {
        if (!isCancelled) {
          console.error('Error while loading latest inspections:', lookupError);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [trees, fetchLatestInspections]);

  useEffect(() => {
    const centerFromState = deriveCenterFromState(locationState);
    if (centerFromState) {
      setMapCenter(centerFromState);
    }
  }, [locationState]);

  useEffect(() => {
    const centerFromState = deriveCenterFromState(locationState);
    if (centerFromState || !greenAreaId) {
      return;
    }

    const numericGreenAreaId = Number.parseInt(greenAreaId, 10);
    if (Number.isNaN(numericGreenAreaId)) {
      return;
    }

    let isCancelled = false;

    const fetchGreenAreaCenter = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/GreenAreas/GetAll`, {
          headers: {
            Authorization: `bearer ${localStorage.getItem('token') || ''}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load green areas.');
        }

        const data = (await response.json()) as GreenArea[];
        if (!Array.isArray(data)) {
          return;
        }

        const currentGreenArea = data.find((area) => area.id === numericGreenAreaId);

        if (
          !isCancelled &&
          currentGreenArea &&
          typeof currentGreenArea.latitude === 'number' &&
          typeof currentGreenArea.longitude === 'number'
        ) {
          setMapCenter([currentGreenArea.latitude, currentGreenArea.longitude]);
        }
      } catch (centerError) {
        if (isCancelled) {
          return;
        }
        console.error('Error fetching green area coordinates:', centerError);
        setError(
          (existing) =>
            existing ?? 'Koordinaten der ausgewaehlten Gruenflaeche konnten nicht geladen werden.',
        );
      }
    };

    fetchGreenAreaCenter();

    return () => {
      isCancelled = true;
    };
  }, [greenAreaId, locationState]);

  const handleTreeCreated = (createdTree?: Tree) => {
    if (createdTree) {
      setTrees((prev) => [...prev, createdTree]);
      setError(null);
      return;
    }

    fetchTrees();
  };

  const handleOpenTree = (tree: Tree) => {
    navigate(`/trees/${tree.id}`, { state: { tree } });
  };

  const handleOpenPdf = useCallback(async () => {
    if (!greenAreaId) {
      setError('Keine Gruenflaeche ausgewaehlt.');
      return;
    }
    if (trees.length === 0) {
      setError('Keine Baeume zum Export vorhanden.');
      return;
    }

    setIsExporting(true);
    try {
      const latestInspections = await fetchLatestInspections(trees);
      setInspectionLookup(latestInspections);

      const entries: TreeInspectionExport[] = trees.map((tree) => ({
        tree,
        inspection: latestInspections[tree.id] ?? inspectionLookup[tree.id] ?? null,
        mapImage: buildTreeMapPreviewDataUrl(tree, mapCenter),
      }));

      setPdfData({
        entries,
        centerLabel: `${formatCoordinate(mapCenter[0])}, ${formatCoordinate(mapCenter[1])}`,
      });
      setShowPdf(true);
    } catch (exportError) {
      console.error('Error exporting green area PDF:', exportError);
      setError('PDF-Export fehlgeschlagen. Bitte erneut versuchen.');
    } finally {
      setIsExporting(false);
    }
  }, [fetchLatestInspections, greenAreaId, greenAreaName, inspectionLookup, mapCenter, trees]);

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <h1 className="h4 mb-5">
          {greenAreaId} | {greenAreaName}
        </h1>

        <div className="mt-4 d-flex flex-wrap align-items-center gap-2">
          <button
            type="button"
            className="btn btn-success"
            onClick={() => setShowTreeForm((prev) => !prev)}
          >
            {showTreeForm ? 'Formular verbergen' : 'Baum hinzufuegen'}
          </button>
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={() => navigate('/green-areas')}
          >
            Zurueck zur Uebersicht
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenPdf}
            disabled={isExporting || trees.length === 0}
          >
            {isExporting ? 'Erstelle PDF...' : 'PDF anzeigen (Baeume + letzte Kontrolle)'}
          </button>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => setShowMap((prev) => !prev)}
          >
            {showMap ? 'Karte verbergen' : 'Karte anzeigen'}
          </button>
        </div>

        {showTreeForm && (
          <div className="bg-light border rounded p-3 my-4">
            <TreeForm
              greenAreaId={Number.parseInt(greenAreaId ?? '0', 10)}
              defaultCenter={mapCenter}
              onTreeCreated={handleTreeCreated}
            />
          </div>
        )}

        {showMap && (
          <div className="bg-light border rounded p-3 my-4">
            <GreenAreaMap
              trees={trees}
              onError={setError}
              defaultCenter={mapCenter}
              greenAreaName={greenAreaName}
            />
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {trees.length === 0 && !error && <p className="text-muted mb-0">Noch keine Baeume in dieser Gruenflaeche.</p>}

        {trees.length > 0 && (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3 mt-3">
            {trees.map((tree) => {
              const inspection = inspectionLookup[tree.id];
              const lastInspectionLabel = inspection
                ? `${new Date(inspection.performedAt).toLocaleDateString()} (${inspection.isSafeForTraffic ? 'OK' : 'Nicht OK'})`
                : 'Keine Kontrolle';
              return (
                <div className="col" key={tree.id}>
                  <button
                    type="button"
                    className="click-card w-100 text-start"
                    onClick={() => handleOpenTree(tree)}
                  >
                    <div className="card h-100 shadow-sm border-0">
                      <div className="card-body">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="badge rounded-pill bg-success-subtle text-success-emphasis">
                            Nr. {tree.number ?? tree.id}
                          </span>
                          <span className="badge text-bg-light border">{lastInspectionLabel}</span>
                        </div>
                        <h2 className="h6 fw-semibold mb-1">{tree.species || 'Unbekannte Art'}</h2>
                        <p className="text-muted small mb-0">
                          {tree.crownDiameterMeters ? `Kronendurchmesser ${tree.crownDiameterMeters} m` : 'Keine Angaben'}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {showPdf && pdfData && (
          <div className="mt-4">
            <div className="alert alert-info">
              <div className="fw-semibold">Druckansicht</div>
              <div className="small mb-2">
                Bitte Browser-Druck (z.B. STRG+P) nutzen und als PDF speichern. So werden Karten korrekt uebernommen.
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-sm btn-primary" onClick={() => window.print()}>
                  Drucken / als PDF speichern
                </button>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowPdf(false)}>
                  Vorschau schliessen
                </button>
              </div>
            </div>
            <div className="border rounded p-3 bg-white">
              <GreenAreaPdfDocument
                greenAreaId={greenAreaId}
                greenAreaName={greenAreaName}
                trees={pdfData.entries}
                mapCenterLabel={pdfData.centerLabel}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GreenAreaDetails;
