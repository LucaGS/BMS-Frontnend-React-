import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '@/shared/config/appConfig';
import { mapInspectionsFromApi, type Inspection } from '@/features/inspections';
import type { Tree } from '@/features/trees/types';
import InspectionForm from '@/features/inspections/forms/InspectionForm';
import TreeLocationMap from './TreeLocationMap';
import TreeImageUploader from './TreeImageUploader';

type TreeDetailsProps = {
  tree?: Tree | null;
  embedded?: boolean;
  onClose?: () => void;
  onBack?: () => void;
};

const TreeDetails: React.FC<TreeDetailsProps> = ({ tree, embedded = false, onClose, onBack }) => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [inspectionsLoading, setInspectionsLoading] = useState(false);
  const [inspectionsError, setInspectionsError] = useState<string | null>(null);
  const [inspectionsRefreshIndex, setInspectionsRefreshIndex] = useState(0);
  const [showInspectionForm, setShowInspectionForm] = useState(false);

  useEffect(() => {
    if (!tree) {
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
        const response = await fetch(`${API_BASE_URL}/api/Inspections/ByTreeId/${tree!.id}`, {
          headers: {
            Authorization: `bearer ${localStorage.getItem('token') || ''}`,
          },
        });

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
  }, [tree, inspectionsRefreshIndex]);

  const handleInspectionCreated = () => {
    setInspectionsRefreshIndex((current) => current + 1);
    setShowInspectionForm(false);
  };

  const renderScorePill = (label: string, value: number) => (
    <span className="badge rounded-pill bg-light border text-dark">
      {label}: {value}/5
    </span>
  );

  const renderHeaderAction = () => {
    if (embedded) {
      return (
        onClose && (
          <button type="button" className="btn btn-outline-primary" onClick={onClose}>
            Details schliessen
          </button>
        )
      );
    }
    return (
      onBack && (
        <button type="button" className="btn btn-outline-primary" onClick={onBack}>
          Zurueck
        </button>
      )
    );
  };

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
                <Link to="/trees">Baeume</Link>
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

          {!tree && (
            <p className="text-muted mb-0">
              Kein Baum ausgewaehlt. Bitte waehlen Sie einen Baum aus der Liste.
            </p>
          )}

          {tree && (
            <>
              <p className="text-muted mb-3">Details zum ausgewaehlten Baum.</p>
              <div className="row g-4 align-items-start">
                <div className="col-lg-5 col-xl-4">
                  <div className="bg-light border rounded-3 p-3 h-100">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <div className="text-uppercase text-muted small fw-semibold">Baum</div>
                        <div className="fs-5 fw-semibold mb-0">
                          {tree.species || 'Unbekannte Art'}
                        </div>
                      <div className="text-muted small">Nr. {tree.number}</div>
                    </div>
                  </div>
                  <div className="row row-cols-1 row-cols-sm-2 g-2">
                    {[
                      { label: 'Sicherheitserwartung Verkehr', value: tree.trafficSafetyExpectation || 'None' },
                      { label: 'Breitengrad', value: tree.latitude },
                      { label: 'Laengengrad', value: tree.longitude },
                      { label: 'Letzte Kontrolle', value: tree.lastInspectionId ?? 'Keine' },
                      { label: 'Baumhoehe (m)', value: tree.treeSizeMeters ?? '-' },
                      { label: 'Kronendurchmesser (m)', value: tree.crownDiameterMeters ?? '-' },
                        { label: 'Anzahl Staemme', value: tree.numberOfTrunks ?? '-' },
                        { label: 'Stammdurchmesser 1', value: tree.trunkDiameter1 ?? '-' },
                        { label: 'Stammdurchmesser 2', value: tree.trunkDiameter2 ?? '-' },
                        { label: 'Stammdurchmesser 3', value: tree.trunkDiameter3 ?? '-' },
                      ].map(({ label, value }) => (
                        <div className="col" key={label}>
                          <div className="border rounded-3 px-3 py-2 h-100 bg-white">
                            <div className="text-muted small">{label}</div>
                            <div className="fw-semibold">{value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-lg-7 col-xl-8">
                  <TreeLocationMap
                    latitude={tree.latitude ?? undefined}
                    longitude={tree.longitude ?? undefined}
                    treeNumber={tree.number ?? tree.id}
                  />
                </div>
              </div>
              <TreeImageUploader treeId={tree.id} />
              <div className="d-flex justify-content-between align-items-center mt-4 mb-2">
                <h2 className="h5 mb-0">Kontrollen</h2>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setShowInspectionForm((current) => !current)}
                  disabled={inspectionsLoading}
                >
                  {showInspectionForm ? 'Formular verbergen' : 'Kontrolle hinzufuegen'}
                </button>
              </div>
              {showInspectionForm && (
                <InspectionForm treeId={tree.id} onInspectionCreated={handleInspectionCreated} />
              )}
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
                        const date = new Date(inspection.performedAt);
                        const formattedDate = Number.isNaN(date.valueOf())
                          ? inspection.performedAt
                          : date.toLocaleString();

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
                                        Intervall: {inspection.newInspectionIntervall} Tage | Vitalitaet:{' '}
                                        {inspection.vitality}/5
                                      </div>
                                    </div>
                                    <span
                                      className={`badge ${inspection.isSafeForTraffic ? 'bg-success' : 'bg-danger'}`}
                                    >
                                      {inspection.isSafeForTraffic ? 'Verkehrssicher' : 'Nicht verkehrssicher'}
                                    </span>
                                  </div>
                                  <div className="d-flex flex-wrap gap-2 mt-2">
                                    {renderScorePill('Vitalitaet', inspection.vitality)}
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
        </div>
      </div>
    </section>
  );
};

export default TreeDetails;
