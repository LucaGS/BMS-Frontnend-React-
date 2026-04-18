import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '@/shared/config/appConfig';
import { mapInspectionFromApi } from '@/features/inspections';
import { mapTreesFromApi, type Tree } from '@/features/trees/types';
import TreeForm from '@/features/trees/forms/TreeForm';
import TreeLocationPicker from '@/features/trees/components/TreeLocationPicker';
import GreenAreaMap from '../maps/GreenAreaMap';
import type { GreenArea } from '@/features/green-areas/types';
import type { LastInspectionDetail, TreeInspectionExport } from './GreenAreaPdfDocument';
import { getNextInspectionStatus } from '@/features/trees/utils/nextInspection';
import { mapMeasuresFromApi, type ArboriculturalMeasure } from '@/entities/arboriculturalMeasure';
import { formatCoordinateDisplay } from '@/shared/lib/coordinateFormatting';
import { formatDateDisplay } from '../../../shared/lib/dateFormatting';
import AppModal from '@/shared/components/AppModal';
import { authFetch } from '@/shared/lib/auth';
import { createExportDateStamp, createExportFileSlug } from '@/shared/lib/exportNaming';

type GreenAreaRouteParams = {
  greenAreaId: string;
  greenAreaName: string;
};

type GreenAreaLocationState = {
  longitude?: number;
  latitude?: number;
};

const DEFAULT_GREEN_AREA_CENTER: [number, number] = [49.659, 9.9962];

const LazyGreenAreaMapPrint = React.lazy(async () => {
  const module = await import('./GreenAreaPdfDocument');
  return { default: module.GreenAreaMapPrint };
});

const deriveCenterFromState = (state?: GreenAreaLocationState): [number, number] | null => {
  if (typeof state?.latitude === 'number' && typeof state?.longitude === 'number') {
    return [state.latitude, state.longitude];
  }
  return null;
};

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
  const [isGeneratingMapPrint, setIsGeneratingMapPrint] = useState(false);
  const [isGeneratingDataPdf, setIsGeneratingDataPdf] = useState(false);
  const [showMapPrint, setShowMapPrint] = useState(false);
  const [mapPrintData, setMapPrintData] = useState<{
    entries: TreeInspectionExport[];
    centerLabel: string;
  } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    deriveCenterFromState(locationState) ?? DEFAULT_GREEN_AREA_CENTER,
  );
  const [currentGreenArea, setCurrentGreenArea] = useState<GreenArea | null>(null);
  const [editAreaMode, setEditAreaMode] = useState(false);
  const [editAreaSaving, setEditAreaSaving] = useState(false);
  const [editAreaError, setEditAreaError] = useState<string | null>(null);
  const [showAreaLocationPicker, setShowAreaLocationPicker] = useState(false);
  const previousDocumentTitleRef = useRef<string | null>(null);
  const [areaDraft, setAreaDraft] = useState<{ name: string; latitude: string; longitude: string }>({
    name: greenAreaName ?? '',
    latitude: '',
    longitude: '',
  });
  const exportSlug = useMemo(
    () => createExportFileSlug(currentGreenArea?.name ?? greenAreaName, 'gruenflaeche'),
    [currentGreenArea?.name, greenAreaName],
  );
  const exportDateStamp = useMemo(() => createExportDateStamp(), []);
  const reportFileName = `baumbericht-${exportSlug}-${exportDateStamp}.pdf`;
  const mapPrintTitle = `kartenuebersicht-${exportSlug}-${exportDateStamp}`;

  const fetchLatestInspections = useCallback(
    async (currentTrees: Tree[]): Promise<Record<number, LastInspectionDetail | null>> => {
      if (!currentTrees.length) {
        return {};
      }

      const results = await Promise.all(
        currentTrees.map(async (tree) => {
          if (!tree.lastInspectionId) {
            return { treeId: tree.id, inspection: null };
          }

          try {
            const response = await authFetch(`${API_BASE_URL}/api/Inspections/${tree.lastInspectionId}`);

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
              arboriculturalMeasures: Array.isArray((data as any).arboriculturalMeasures)
                ? mapMeasuresFromApi((data as any).arboriculturalMeasures)
                : null,
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

  const fetchMeasuresLookup = useCallback(async (): Promise<Record<number, ArboriculturalMeasure>> => {
    const response = await authFetch(`${API_BASE_URL}/api/ArboriculturalMeasures/GetAll`);
    if (!response.ok) {
      throw new Error('Failed to load measures for export.');
    }
    const data = await response.json();
    const measures = mapMeasuresFromApi(data);
    return measures.reduce<Record<number, ArboriculturalMeasure>>((lookup, measure) => {
      lookup[measure.id] = measure;
      return lookup;
    }, {});
  }, []);

  const fetchTrees = useCallback(async () => {
    if (!greenAreaId) {
      setError('Keine Grünfläche ausgewählt.');
      return;
    }
    try {
      const response = await authFetch(`${API_BASE_URL}/api/Trees/GetByGreenAreaId/${greenAreaId}`);
      if (!response.ok) {
        throw new Error('Failed to load trees for the selected green area.');
      }
      const data = await response.json();
      setTrees(Array.isArray(data) ? mapTreesFromApi(data) : []);
      setError(null);
    } catch (fetchError) {
      console.error('Error fetching trees:', fetchError);
      setError(fetchError instanceof Error ? fetchError.message : 'Unbekannter Fehler beim Laden der Bäume.');
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
    if (!showMapPrint) {
      if (previousDocumentTitleRef.current !== null) {
        document.title = previousDocumentTitleRef.current;
        previousDocumentTitleRef.current = null;
      }
      return;
    }

    if (previousDocumentTitleRef.current === null) {
      previousDocumentTitleRef.current = document.title;
    }

    document.title = mapPrintTitle;

    return () => {
      if (previousDocumentTitleRef.current !== null) {
        document.title = previousDocumentTitleRef.current;
        previousDocumentTitleRef.current = null;
      }
    };
  }, [mapPrintTitle, showMapPrint]);

  useEffect(() => {
    if (editAreaMode && currentGreenArea) {
      setAreaDraft({
        name: currentGreenArea.name ?? greenAreaName ?? '',
        latitude: currentGreenArea.latitude != null ? String(currentGreenArea.latitude) : '',
        longitude: currentGreenArea.longitude != null ? String(currentGreenArea.longitude) : '',
      });
    }
  }, [editAreaMode, currentGreenArea, greenAreaName]);

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
        const response = await authFetch(`${API_BASE_URL}/api/GreenAreas/GetAll`);

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
          setCurrentGreenArea(currentGreenArea);
          setAreaDraft({
            name: currentGreenArea.name ?? greenAreaName ?? '',
            latitude: String(currentGreenArea.latitude),
            longitude: String(currentGreenArea.longitude),
          });
        }
      } catch (centerError) {
        if (isCancelled) {
          return;
        }
        console.error('Error fetching green area coordinates:', centerError);
        setError(
          (existing) =>
            existing ?? 'Koordinaten der ausgewählten Grünfläche konnten nicht geladen werden.',
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
      setShowTreeForm(false);
      return;
    }

    fetchTrees();
    setShowTreeForm(false);
  };

  const handleOpenTree = (tree: Tree) => {
    navigate(`/trees/${tree.id}`, { state: { tree } });
  };

  const buildExportEntries = useCallback(async (): Promise<TreeInspectionExport[]> => {
    const [latestInspections, measuresLookup] = await Promise.all([
      fetchLatestInspections(trees),
      fetchMeasuresLookup().catch((measureError) => {
        console.error('Error fetching measures for export:', measureError);
        return {} as Record<number, ArboriculturalMeasure>;
      }),
    ]);
    setInspectionLookup(latestInspections);

    const resolvedMeasuresLookup: Record<number, ArboriculturalMeasure> = measuresLookup ?? {};

    return trees.map((tree) => {
      const baseInspection = latestInspections[tree.id] ?? inspectionLookup[tree.id] ?? null;
      if (!baseInspection) {
        return {
          tree,
          inspection: null,
          mapImage: null,
        };
      }

      const resolvedMeasures =
        baseInspection.arboriculturalMeasures && baseInspection.arboriculturalMeasures.length > 0
          ? baseInspection.arboriculturalMeasures
          : baseInspection.arboriculturalMeasureIds && baseInspection.arboriculturalMeasureIds.length > 0
            ? baseInspection.arboriculturalMeasureIds
              .map((id: number) => resolvedMeasuresLookup[id])
                .filter(Boolean) as ArboriculturalMeasure[]
            : null;

      return {
        tree,
        inspection: { ...baseInspection, arboriculturalMeasures: resolvedMeasures ?? null },
        mapImage: null,
      };
    });
  }, [fetchLatestInspections, fetchMeasuresLookup, inspectionLookup, trees]);

  const handleOpenMapPrint = useCallback(async () => {
    if (!greenAreaId) {
      setError('Keine Grünfläche ausgewählt.');
      return;
    }
    if (trees.length === 0) {
      setError('Keine Bäume zum Export vorhanden.');
      return;
    }

    setIsGeneratingMapPrint(true);
    try {
      const entries = await buildExportEntries();
      setMapPrintData({
        entries,
        centerLabel: `${formatCoordinateDisplay(mapCenter[0])}, ${formatCoordinateDisplay(mapCenter[1])}`,
      });
      setShowMapPrint(true);
    } catch (exportError) {
      console.error('Error preparing map print:', exportError);
      setError('Druckansicht konnte nicht vorbereitet werden.');
    } finally {
      setIsGeneratingMapPrint(false);
    }
  }, [buildExportEntries, greenAreaId, mapCenter, trees]);

  const handleDownloadDataPdf = useCallback(async () => {
    if (!greenAreaId) {
      setError('Keine Grünfläche ausgewählt.');
      return;
    }
    if (trees.length === 0) {
      setError('Keine Bäume zum Export vorhanden.');
      return;
    }

    setIsGeneratingDataPdf(true);
    try {
      const entries = await buildExportEntries();
      const [{ pdf }, { default: GreenAreaDataPdfDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./GreenAreaDataPdfDocument'),
      ]);

      const blob = await pdf(
        <GreenAreaDataPdfDocument
          greenAreaId={greenAreaId}
          greenAreaName={greenAreaName}
          trees={entries}
          exportedAt={new Date()}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = reportFileName;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 500);
    } catch (exportError) {
      console.error('Error exporting green area PDF:', exportError);
      setError('PDF-Export fehlgeschlagen. Bitte erneut versuchen.');
    } finally {
      setIsGeneratingDataPdf(false);
    }
  }, [buildExportEntries, greenAreaId, greenAreaName, mapCenter, reportFileName, trees]);

  const parseNumber = (value: string) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const handleUpdateGreenArea = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!greenAreaId) return;
    setEditAreaSaving(true);
    setEditAreaError(null);
    try {
      const payload = {
        name: areaDraft.name.trim(),
        longitude: parseNumber(areaDraft.longitude),
        latitude: parseNumber(areaDraft.latitude),
      };
      const response = await authFetch(`${API_BASE_URL}/api/GreenAreas/${greenAreaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Aktualisierung fehlgeschlagen');
      }
      const updated = (await response.json()) as GreenArea;
      setCurrentGreenArea(updated);
      setAreaDraft({
        name: updated.name,
        latitude: String(updated.latitude ?? ''),
        longitude: String(updated.longitude ?? ''),
      });
      if (typeof updated.latitude === 'number' && typeof updated.longitude === 'number') {
        setMapCenter([updated.latitude, updated.longitude]);
      }
      setEditAreaMode(false);
    } catch (updateError) {
      console.error('Error updating green area:', updateError);
      setEditAreaError('Grünfläche konnte nicht aktualisiert werden.');
    } finally {
      setEditAreaSaving(false);
    }
  };

  const handleDeleteGreenArea = async () => {
    if (!greenAreaId) return;
    const confirmed = window.confirm('Diese Grünfläche wirklich löschen? Alle zugehörigen Bäume könnten betroffen sein.');
    if (!confirmed) return;
    try {
      const response = await authFetch(`${API_BASE_URL}/api/GreenAreas/${greenAreaId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Delete failed');
      }
      navigate('/green-areas');
    } catch (deleteError) {
      console.error('Error deleting green area:', deleteError);
      setEditAreaError('Grünfläche konnte nicht gelöscht werden.');
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
          <div>
            <div className="text-uppercase text-muted small fw-semibold mb-1">Grünfläche</div>
            <h1 className="h4 mb-0">
              {greenAreaId} | {currentGreenArea?.name ?? greenAreaName}
            </h1>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => setEditAreaMode((prev) => !prev)}
            >
              {editAreaMode ? 'Abbrechen' : 'Grünfläche bearbeiten'}
            </button>
            <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleDeleteGreenArea}>
              Löschen
            </button>
          </div>
        </div>

        {editAreaMode && (
          <AppModal title="Grünfläche bearbeiten" onClose={() => setEditAreaMode(false)}>
            <div className="border rounded-3 p-3 bg-light">
            <form className="row g-3" onSubmit={handleUpdateGreenArea}>
              <div className="col-12 col-md-4">
                <label className="form-label small">Name</label>
                <input
                  className="form-control form-control-sm"
                  value={areaDraft.name}
                  onChange={(e) => setAreaDraft((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small">Breitengrad</label>
                <input
                  className="form-control form-control-sm"
                  type="number"
                  step="any"
                  value={areaDraft.latitude}
                  onChange={(e) => setAreaDraft((prev) => ({ ...prev, latitude: e.target.value }))}
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small">Längengrad</label>
                <input
                  className="form-control form-control-sm"
                  type="number"
                  step="any"
                  value={areaDraft.longitude}
                  onChange={(e) => setAreaDraft((prev) => ({ ...prev, longitude: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2">
                  <div>
                    <span className="form-label d-block mb-1 small fw-semibold">Koordinaten über Karte wählen</span>
                    <small className="text-muted">
                      Optional: Marker verschieben oder auf die Karte klicken, um Breitengrad und Längengrad zu setzen.
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm align-self-md-start"
                    onClick={() => setShowAreaLocationPicker((current) => !current)}
                  >
                    {showAreaLocationPicker ? 'Karte ausblenden' : 'Karte anzeigen'}
                  </button>
                </div>
                {showAreaLocationPicker && (
                  <TreeLocationPicker
                    value={{
                      latitude: parseNumber(areaDraft.latitude),
                      longitude: parseNumber(areaDraft.longitude),
                    }}
                    defaultCenter={mapCenter}
                    onChange={({ latitude, longitude }) =>
                      setAreaDraft((prev) => ({
                        ...prev,
                        latitude: String(latitude),
                        longitude: String(longitude),
                      }))
                    }
                    onClear={() =>
                      setAreaDraft((prev) => ({
                        ...prev,
                        latitude: '',
                        longitude: '',
                      }))
                    }
                  />
                )}
              </div>
              {editAreaError && (
                <div className="col-12">
                  <div className="alert alert-danger py-2 mb-0" role="alert">
                    {editAreaError}
                  </div>
                </div>
              )}
              <div className="col-12 d-flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm" disabled={editAreaSaving}>
                  {editAreaSaving ? 'Speichere...' : 'Speichern'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setEditAreaMode(false)}
                  disabled={editAreaSaving}
                >
                  Abbrechen
                </button>
              </div>
            </form>
            </div>
          </AppModal>
        )}

        <div className="quick-actions mt-4 mb-3 d-flex flex-wrap align-items-center gap-2">
          <button
            type="button"
            className="btn btn-success"
            onClick={() => setShowTreeForm((prev) => !prev)}
          >
            {showTreeForm ? 'Formular verbergen' : 'Baum hinzufügen'}
          </button>
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={() => navigate('/green-areas')}
          >
            Zur Grünflächenliste
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenMapPrint}
            disabled={isGeneratingMapPrint || trees.length === 0}
          >
            {isGeneratingMapPrint ? 'Bereite Karte vor...' : 'Druckansicht (Karte)'}
          </button>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={handleDownloadDataPdf}
            disabled={isGeneratingDataPdf || trees.length === 0}
          >
            {isGeneratingDataPdf ? 'Exportiere PDF...' : 'PDF Export (Baumdaten)'}
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
          <AppModal title="Baum hinzufügen" onClose={() => setShowTreeForm(false)} size="wide">
            <div className="bg-light border rounded p-3">
            <TreeForm
              greenAreaId={Number.parseInt(greenAreaId ?? '0', 10)}
              defaultCenter={mapCenter}
              onTreeCreated={handleTreeCreated}
            />
            </div>
          </AppModal>
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

        {trees.length === 0 && !error && <p className="text-muted mb-0">Noch keine Bäume in dieser Grünfläche.</p>}

        {trees.length > 0 && (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3 mt-3">
            {trees.map((tree) => {
              const inspection = inspectionLookup[tree.id];
              const lastInspectionLabel = inspection
                ? `${formatDateDisplay(inspection.performedAt, inspection.performedAt)} (${inspection.isSafeForTraffic ? 'OK' : 'Nicht OK'})`
                : 'Keine Kontrolle';
              const nextInspectionStatus = getNextInspectionStatus(tree.nextInspection);
              const nextInspectionLabel = nextInspectionStatus.hasValue
                ? nextInspectionStatus.relativeLabel ?? nextInspectionStatus.shortLabel
                : 'Keine nächste Kontrolle';
              return (
                <div className="col" key={tree.id}>
                  <button
                    type="button"
                    className="click-card w-100 text-start"
                    onClick={() => handleOpenTree(tree)}
                  >
                    <div className="card h-100 shadow-sm border-0">
                      <div className="card-body">
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                          <span className="badge rounded-pill bg-success-subtle text-success-emphasis">
                            Nr. {tree.number ?? tree.id}
                          </span>
                          <span
                            className={`badge ${
                              nextInspectionStatus.isOverdue ? 'bg-danger text-white' : 'text-bg-light border'
                            }`}
                            title={nextInspectionStatus.label}
                          >
                            {nextInspectionLabel}
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

        {showMapPrint && mapPrintData && (
          <div className="mt-4">
            <div className="alert alert-info">
              <div className="fw-semibold">Karten-Druckansicht</div>
              <div className="small mb-2">
                Diese Ansicht ist nur für Karte und Ausdruck gedacht. Der separate Button "Baumdaten als PDF laden" erzeugt den eigentlichen Baumdaten-Bericht.
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-sm btn-primary" onClick={() => window.print()}>
                  Drucken oder als PDF sichern
                </button>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowMapPrint(false)}>
                  Vorschau schließen
                </button>
              </div>
            </div>
            <div className="border rounded p-3 bg-white">
              <Suspense fallback={<div className="text-muted small">Druckansicht wird geladen...</div>}>
                <LazyGreenAreaMapPrint
                  greenAreaId={greenAreaId}
                  greenAreaName={greenAreaName}
                  trees={mapPrintData.entries}
                  mapCenterLabel={mapPrintData.centerLabel}
                />
              </Suspense>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GreenAreaDetails;
