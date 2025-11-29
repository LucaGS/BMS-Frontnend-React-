import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '@/shared/config/appConfig';
import { mapInspectionFromApi, type Inspection } from '@/features/inspections';
import type { Tree } from '@/features/trees/types';
import {
  CrownInspectionState,
  StemBaseInspectionState,
  TrunkInspectionState,
  crownCheckboxes,
  stemBaseCheckboxes,
  trunkCheckboxes,
} from '@/features/inspections/forms/inspectionFormConfig';

type InspectionDetail = Inspection & {
  crownInspection?: Partial<CrownInspectionState>;
  trunkInspection?: Partial<TrunkInspectionState>;
  stemBaseInspection?: Partial<StemBaseInspectionState>;
};

type LocationState = { inspection?: Inspection; tree?: Tree | null };

const toDateLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return value;
  }
  return date.toLocaleString();
};

const InspectionDetails: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: LocationState };
  const { inspectionId } = useParams<{ inspectionId?: string }>();
  const initialInspection = state?.inspection
    ? ({ ...state.inspection } as InspectionDetail)
    : null;
  const [inspection, setInspection] = useState<InspectionDetail | null>(initialInspection);
  const [isLoading, setIsLoading] = useState(!initialInspection);
  const [error, setError] = useState<string | null>(null);

  const tree = state?.tree;

  useEffect(() => {
    if (!inspectionId) {
      return;
    }

    const hasDetailedData = Boolean(
      initialInspection?.crownInspection ||
        initialInspection?.trunkInspection ||
        initialInspection?.stemBaseInspection,
    );

    if (state?.inspection && hasDetailedData) {
      return;
    }

    let isCancelled = false;

    const loadInspection = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/Inspections/${inspectionId}`, {
          headers: {
            Authorization: `bearer ${localStorage.getItem('token') || ''}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load inspection.');
        }

        const data = await response.json();
        if (isCancelled) {
          return;
        }

        const base = mapInspectionFromApi(data);
        setInspection({
          ...base,
          crownInspection: data.crownInspection ?? data.crown ?? null,
          trunkInspection: data.trunkInspection ?? data.trunk ?? null,
          stemBaseInspection: data.stemBaseInspection ?? data.stemBase ?? data.root ?? null,
        });
      } catch (loadError) {
        if (isCancelled) {
          return;
        }
        console.error('Error loading inspection:', loadError);
        setError('Kontrolle konnte nicht geladen werden.');
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };
    
    loadInspection();

    return () => {
      isCancelled = true;
    };
  }, [initialInspection?.crownInspection, initialInspection?.stemBaseInspection, initialInspection?.trunkInspection, inspectionId, state?.inspection]);

  const inspectionTitle = useMemo(() => {
    if (!inspection) {
      return 'Kontrolle';
    }
    const dateLabel = toDateLabel(inspection.performedAt);
    return inspection.developmentalStage
      ? `${inspection.developmentalStage} – ${dateLabel}`
      : dateLabel;
  }, [inspection]);

  const renderBadgeList = <T extends Record<string, any>>(
    title: string,
    items: { key: keyof T; label: string }[],
    data?: Partial<T>,
  ) => {
    const active = items.filter(({ key }) => Boolean(data?.[key]));
    return (
      <div className="mb-3">
        <div className="text-muted small mb-1">{title}</div>
        {active.length > 0 ? (
          <div className="d-flex flex-wrap gap-2">
            {active.map(({ key, label }) => (
              <span key={String(key)} className="badge text-bg-light border">
                {label}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-muted small">Keine Auffaelligkeiten markiert.</span>
        )}
      </div>
    );
  };

  const renderSection = <T extends Record<string, any>>(
    heading: string,
    notes?: string,
    items?: { key: keyof T; label: string }[],
    data?: Partial<T>,
  ) => (
    <div className="border rounded-3 p-3 bg-white shadow-sm">
      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
        <div>
          <div className="fw-semibold">{heading}</div>
          <div className="text-muted small">Notizen und markierte Befunde</div>
        </div>
      </div>
      <div className="mb-3">
        <div className="text-muted small mb-1">Notizen</div>
        <div className="border rounded-3 p-2 bg-light">
          {notes?.trim() ? notes : <span className="text-muted">Keine Notizen erfasst.</span>}
        </div>
      </div>
      {items && renderBadgeList('Markierungen', items, data)}
    </div>
  );

  if (!inspectionId) {
    return (
      <section>
        <div className="alert alert-warning">Keine Kontrolle ausgewaehlt.</div>
      </section>
    );
  }

  if (isLoading && !inspection) {
    return (
      <section>
        <div className="card shadow-sm border-0">
          <div className="card-body p-5 text-center text-muted">Kontrolle wird geladen...</div>
        </div>
      </section>
    );
  }

  if (error && !inspection) {
    return (
      <section>
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </section>
    );
  }

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
                <Link to="/inspections">Kontrollen</Link>
              </li>
              {inspection?.treeId ? (
                <li className="breadcrumb-item">
                  <Link to={`/trees/${inspection.treeId}`} state={{ tree }}>
                    Baum {tree?.number ?? inspection.treeId}
                  </Link>
                </li>
              ) : null}
              <li className="breadcrumb-item active" aria-current="page">
                Kontrolle
              </li>
            </ol>
          </nav>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <div className="text-uppercase text-muted small fw-semibold mb-1">Kontrolle</div>
              <h1 className="h4 mb-0">{inspectionTitle}</h1>
              <div className="text-muted small">
                {inspection?.isSafeForTraffic ? 'Verkehrssicher' : 'Nicht verkehrssicher'}
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              {inspection?.treeId && (
                <Link
                  to={`/trees/${inspection.treeId}`}
                  className="btn btn-outline-secondary btn-sm"
                  state={{ tree }}
                >
                  Zum Baum
                </Link>
              )}
              <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => navigate(-1)}>
                Zurueck
              </button>
            </div>
          </div>

          {inspection && (
            <>
              <div className="row g-3 mb-4">
                {[
                  { label: 'Datum', value: toDateLabel(inspection.performedAt) },
                  { label: 'Intervall (Tage)', value: inspection.newInspectionIntervall },
                  { label: 'Entwicklungsstadium', value: inspection.developmentalStage || '-' },
                  { label: 'Vitalitaet', value: `${inspection.vitality}/5` },
                ].map(({ label, value }) => (
                  <div className="col-12 col-sm-6 col-lg-4" key={label}>
                    <div className="border rounded-3 px-3 py-2 h-100 bg-light">
                      <div className="text-muted small">{label}</div>
                      <div className="fw-semibold">{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <div className="text-muted small mb-1">Beschreibung / Massnahmen</div>
                <div className="border rounded-3 p-3 bg-white shadow-sm">
                  {inspection.description?.trim() ? (
                    <p className="mb-0">{inspection.description}</p>
                  ) : (
                    <span className="text-muted">Keine Beschreibung erfasst.</span>
                  )}
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12 col-lg-4">
                  {renderSection(
                    'Krone',
                    inspection.crownInspection?.notes,
                    crownCheckboxes,
                    inspection.crownInspection,
                  )}
                </div>
                <div className="col-12 col-lg-4">
                  {renderSection(
                    'Stamm',
                    inspection.trunkInspection?.notes,
                    trunkCheckboxes,
                    inspection.trunkInspection,
                  )}
                </div>
                <div className="col-12 col-lg-4">
                  {renderSection(
                    'Stammfuss & Wurzelbereich',
                    inspection.stemBaseInspection?.notes,
                    stemBaseCheckboxes,
                    inspection.stemBaseInspection,
                  )}
                </div>
              </div>
            </>
          )}

          {error && inspection && (
            <div className="alert alert-warning mt-3 mb-0" role="alert">
              {error}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default InspectionDetails;
