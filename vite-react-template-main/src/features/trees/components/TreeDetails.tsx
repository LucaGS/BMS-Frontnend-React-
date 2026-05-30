import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '@/shared/config/appConfig';
import { mapInspectionsFromApi, type Inspection } from '@/features/inspections';
import type { Tree } from '@/features/trees/types';
import InspectionForm from '@/features/inspections/forms/InspectionForm';
import TreeLocationMap from './TreeLocationMap';
import TreeImageUploader from './TreeImageUploader';
import TreeEditForm from '@/features/trees/forms/TreeEditForm';
import { formatCoordinateDisplay } from '@/shared/lib/coordinateFormatting';
import { formatDateDisplay } from '@/shared/lib/dateFormatting';
import AppModal from '@/shared/components/AppModal';
import AppBottomSheet from '@/shared/components/AppBottomSheet';
import { authFetch } from '@/shared/lib/auth';

type TreeDetailsProps = {
  tree?: Tree | null;
  embedded?: boolean;
  onClose?: () => void;
  onBack?: () => void;
  initialView?: 'overview' | 'inspections' | 'images';
  autoOpenInspectionForm?: boolean;
};

const TreeDetails: React.FC<TreeDetailsProps> = ({
  tree,
  embedded = false,
  onClose,
  onBack,
  initialView = 'overview',
  autoOpenInspectionForm = false,
}) => {
  const [activeTree, setActiveTree] = useState<Tree | null>(tree ?? null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [inspectionsLoading, setInspectionsLoading] = useState(false);
  const [inspectionsError, setInspectionsError] = useState<string | null>(null);
  const [inspectionsRefreshIndex, setInspectionsRefreshIndex] = useState(0);
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [showTreeEditForm, setShowTreeEditForm] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'inspections' | 'images'>(initialView);
  const [entryIntentApplied, setEntryIntentApplied] = useState(false);

  useEffect(() => {
    setActiveTree(tree ?? null);
  }, [tree]);

  useEffect(() => {
    setActiveView(initialView);
    setEntryIntentApplied(false);
  }, [initialView, tree?.id]);

  useEffect(() => {
    if (!activeTree || entryIntentApplied) {
      return;
    }

    if (initialView === 'inspections') {
      setActiveView('inspections');
    }

    if (autoOpenInspectionForm) {
      setActiveView('inspections');
      setShowInspectionForm(true);
    }

    setEntryIntentApplied(true);
  }, [activeTree, autoOpenInspectionForm, entryIntentApplied, initialView]);

  useEffect(() => {
    if (!activeTree) {
      setInspections([]);
      setInspectionsError(null);
      setInspectionsLoading(false);
      setShowInspectionForm(false);
      return;
    }

    let isActive = true;

    const fetchInspections = async () => {
      setInspectionsLoading(true);
      setInspectionsError(null);

      try {
        const response = await authFetch(`${API_BASE_URL}/api/Inspections/ByTreeId/${activeTree.id}`);

        if (!response.ok) {
          throw new Error('Failed to load inspections.');
        }

        const data = await response.json();

        if (!isActive) {
          return;
        }

        setInspections(Array.isArray(data) ? mapInspectionsFromApi(data) : []);
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.error('Error loading inspections:', error);
        setInspections([]);
        setInspectionsError('Kontrollen konnten nicht geladen werden.');
      } finally {
        if (isActive) {
          setInspectionsLoading(false);
        }
      }
    };

    fetchInspections();

    return () => {
      isActive = false;
    };
  }, [activeTree, inspectionsRefreshIndex]);

  const handleInspectionCreated = () => {
    setInspectionsRefreshIndex((current) => current + 1);
    setShowInspectionForm(false);
  };

  const renderVitalityPill = (label: string, value: Inspection['vitality']) => (
    <span className="badge rounded-pill bg-light border text-dark">
      {label}: {value}
    </span>
  );

  const renderHeaderAction = () => {
    if (embedded) {
      return (
        onClose && (
          <button type="button" className="btn btn-outline-primary" onClick={onClose}>
            Details schließen
          </button>
        )
      );
    }
    return (
      onBack && (
        <button type="button" className="btn btn-outline-primary" onClick={onBack}>
          Zurück
        </button>
      )
    );
  };

  const treeFacts = activeTree
    ? [
        { label: 'Sicherheitserwartung Verkehr', value: activeTree.trafficSafetyExpectation || 'None' },
        { label: 'Breitengrad', value: formatCoordinateDisplay(activeTree.latitude) },
        { label: 'Längengrad', value: formatCoordinateDisplay(activeTree.longitude) },
        { label: 'Letzte Kontrolle', value: activeTree.lastInspectionId ?? 'Keine' },
        { label: 'Baumhöhe (m)', value: activeTree.treeSizeMeters ?? '-' },
        { label: 'Kronendurchmesser (m)', value: activeTree.crownDiameterMeters ?? '-' },
        { label: 'Anzahl Stämme', value: activeTree.numberOfTrunks ?? '-' },
        { label: 'Stammdurchmesser 1', value: activeTree.trunkDiameter1 ?? '-' },
        { label: 'Stammdurchmesser 2', value: activeTree.trunkDiameter2 ?? '-' },
        { label: 'Stammdurchmesser 3', value: activeTree.trunkDiameter3 ?? '-' },
      ]
    : [];

  return (
    <section>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <nav aria-label="breadcrumb" className="mb-3">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/">Start</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/trees">Bäume</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {tree ? `Baum ${tree.number ?? tree.id}` : 'Baumdetails'}
              </li>
            </ol>
          </nav>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h4 mb-0">Baum verwalten</h1>
            {renderHeaderAction()}
          </div>

          {!activeTree && (
            <p className="text-muted mb-0">
              Kein Baum ausgewählt. Bitte wählen Sie einen Baum aus der Liste.
            </p>
          )}

          {activeTree && (
            <>
              <p className="text-muted mb-3">Details zum ausgewählten Baum.</p>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div className="view-toggle view-toggle--triple" role="tablist" aria-label="Baumansicht umschalten">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeView === 'overview'}
                    className={`view-toggle__button${activeView === 'overview' ? ' view-toggle__button--active' : ''}`}
                    onClick={() => setActiveView('overview')}
                  >
                    Übersicht
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeView === 'inspections'}
                    className={`view-toggle__button${activeView === 'inspections' ? ' view-toggle__button--active' : ''}`}
                    onClick={() => setActiveView('inspections')}
                  >
                    Kontrollen
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeView === 'images'}
                    className={`view-toggle__button${activeView === 'images' ? ' view-toggle__button--active' : ''}`}
                    onClick={() => setActiveView('images')}
                  >
                    Bilder
                  </button>
                </div>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowActionSheet(true)}>
                  Mehr Aktionen
                </button>
              </div>

              {activeView === 'overview' && (
                <>
                  <div className="row g-4 align-items-start">
                    <div className="col-lg-5 col-xl-4">
                      <div className="bg-light border rounded-3 p-3 h-100">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <div className="text-uppercase text-muted small fw-semibold">Baum</div>
                            <div className="fs-5 fw-semibold mb-0">
                              {activeTree.species || 'Unbekannte Art'}
                            </div>
                            <div className="text-muted small">Nr. {activeTree.number}</div>
                          </div>
                        </div>
                        <div className="table-responsive">
                          <table className="table table-sm align-middle mb-0 tree-facts-table">
                            <tbody>
                              {treeFacts.map(({ label, value }) => (
                                <tr key={label}>
                                  <th scope="row">{label}</th>
                                  <td>{value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-7 col-xl-8">
                      <TreeLocationMap
                        latitude={activeTree.latitude ?? undefined}
                        longitude={activeTree.longitude ?? undefined}
                        treeNumber={activeTree.number ?? activeTree.id}
                      />
                    </div>
                  </div>
                </>
              )}

              {activeView === 'images' && <TreeImageUploader treeId={activeTree.id} />}

              {activeView === 'inspections' && (
                <>
                  <div className="quick-actions d-flex justify-content-between align-items-center mt-4 mb-2 flex-wrap gap-2">
                    <h2 className="h5 mb-0">Kontrollen</h2>
                    <button
                      type="button"
                      className={`btn btn-add${showInspectionForm ? ' btn-add--open' : ''}`}
                      onClick={() => setShowInspectionForm((current) => !current)}
                      disabled={inspectionsLoading}
                      aria-label={showInspectionForm ? 'Formular verbergen' : 'Kontrolle hinzufügen'}
                      title={showInspectionForm ? 'Formular verbergen' : 'Kontrolle hinzufügen'}
                    >
                      {showInspectionForm ? '×' : '+'}
                    </button>
                  </div>
                  {inspectionsLoading && (
                    <p className="text-muted mt-3 mb-0">Kontrollen werden geladen...</p>
                  )}
                  {inspectionsError && (
                    <div className="alert alert-danger mt-3 mb-0" role="alert">
                      {inspectionsError}
                    </div>
                  )}
                  {!inspectionsLoading && !inspectionsError && (
                    <>
                      {inspections.length > 0 ? (
                        <div className="row row-cols-1 row-cols-md-2 g-3 mt-1">
                          {inspections.map((inspection) => {
                            const formattedDate = formatDateDisplay(inspection.performedAt, inspection.performedAt);

                            return (
                              <div className="col" key={inspection.id}>
                                <Link
                                  to={`/inspections/${inspection.id}`}
                                  state={{ inspection, tree: tree! }}
                                  className="click-card w-100 text-start text-decoration-none text-dark"
                                >
                                  <div className="card h-100 shadow-sm border-0">
                                    <div className="card-body">
                                      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                                        <div>
                                          <div className="fw-semibold">{formattedDate}</div>
                                          <div className="text-muted small">
                                            Entwicklungsphase: {inspection.developmentalStage || '-'}
                                          </div>
                                          <div className="text-muted small">
                                            Intervall: {inspection.newInspectionIntervall} Monate | Vitalität: {inspection.vitality}
                                          </div>
                                        </div>
                                        <span
                                          className={`badge ${inspection.isSafeForTraffic ? 'bg-success' : 'bg-danger'}`}
                                        >
                                          {inspection.isSafeForTraffic ? 'Verkehrssicher' : 'Nicht verkehrssicher'}
                                        </span>
                                      </div>
                                      <div className="d-flex flex-wrap gap-2 mt-2">
                                        {renderVitalityPill('Vitalität', inspection.vitality)}
                                      </div>

                                      {inspection.description && (
                                        <p className="text-muted small mb-0 mt-3">{inspection.description}</p>
                                      )}
                                    </div>
                                  </div>
                                </Link>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-muted mt-3 mb-0">Noch keine Kontrollen vorhanden.</p>
                      )}
                    </>
                  )}
                </>
              )}

              {showInspectionForm && (
                <AppModal title="Kontrolle hinzufügen" onClose={() => setShowInspectionForm(false)} size="wide">
                  <InspectionForm treeId={activeTree.id} onInspectionCreated={handleInspectionCreated} />
                </AppModal>
              )}

              {showActionSheet && (
                <AppBottomSheet title="Baum Aktionen" onClose={() => setShowActionSheet(false)}>
                  <div className="d-grid gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => {
                        setShowActionSheet(false);
                        setShowTreeEditForm(true);
                      }}
                    >
                      Baum bearbeiten
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        setShowActionSheet(false);
                        setActiveView('inspections');
                        setShowInspectionForm(true);
                      }}
                    >
                      Kontrolle hinzufügen
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setShowActionSheet(false);
                        setActiveView('images');
                      }}
                    >
                      Zu Bildern
                    </button>
                  </div>
                </AppBottomSheet>
              )}

              {showTreeEditForm && (
                <AppModal title="Baum bearbeiten" onClose={() => setShowTreeEditForm(false)} size="wide">
                  <TreeEditForm
                    tree={activeTree}
                    defaultCenter={[activeTree.latitude ?? 0, activeTree.longitude ?? 0]}
                    onUpdated={(updated) => {
                      if (updated) {
                        setActiveTree(updated);
                      }
                      setShowTreeEditForm(false);
                    }}
                  />
                </AppModal>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default TreeDetails;
