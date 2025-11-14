import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/shared/config/appConfig';
import { mapInspectionsFromApi, type Inspection } from '@/features/trees/inspections';
import type { Tree } from '@/features/trees/types';
import InspectionForm from '../forms/InspectionForm';

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
        const response = await fetch(`${API_BASE_URL}/api/Inspections/ByTreeId/${tree.id}`, {
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
              <p className="text-muted">Details zum ausgewaehlten Baum.</p>
              <dl className="row">
                <dt className="col-sm-3">ID</dt>
                <dd className="col-sm-9">{tree.id}</dd>

                <dt className="col-sm-3">Nummer</dt>
                <dd className="col-sm-9">{tree.number}</dd>

                <dt className="col-sm-3">Art</dt>
                <dd className="col-sm-9">{tree.species}</dd>

                <dt className="col-sm-3">Gruenflaeche</dt>
                <dd className="col-sm-9">{tree.greenAreaId}</dd>

                <dt className="col-sm-3">Breitengrad</dt>
                <dd className="col-sm-9">{tree.latitude}</dd>

                <dt className="col-sm-3">Laengengrad</dt>
                <dd className="col-sm-9">{tree.longitude}</dd>

                <dt className="col-sm-3">Letzte Kontrolle</dt>
                <dd className="col-sm-9">{tree.lastInspectionId}</dd>

                <dt className="col-sm-3">Baumhoehe (m)</dt>
                <dd className="col-sm-9">{tree.treeSizeMeters ?? '-'}</dd>

                <dt className="col-sm-3">Kronendurchmesser (m)</dt>
                <dd className="col-sm-9">{tree.crownDiameterMeters ?? '-'}</dd>

                <dt className="col-sm-3">Kronenansatzhoehe (m)</dt>
                <dd className="col-sm-9">{tree.crownAttachmentHeightMeters ?? '-'}</dd>

                <dt className="col-sm-3">Anzahl Staemme</dt>
                <dd className="col-sm-9">{tree.numberOfTrunks ?? '-'}</dd>

                <dt className="col-sm-3">Stamminneigung (Grad)</dt>
                <dd className="col-sm-9">{tree.trunkInclination ?? '-'}</dd>
              </dl>
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
                    <ul className="list-group mt-3">
                      {inspections.map((inspection) => {
                        const date = new Date(inspection.date);
                        const formattedDate = Number.isNaN(date.valueOf())
                          ? inspection.date
                          : date.toLocaleString();

                        return (
                          <li
                            key={inspection.id}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            <span>{formattedDate}</span>
                            <span
                              className={`badge ${
                                inspection.trafficSafe ? 'bg-success' : 'bg-danger'
                              }`}
                            >
                              {inspection.trafficSafe ? 'Verkehrssicher' : 'Nicht verkehrssicher'}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
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
