import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '@/shared/config/appConfig';
import { mapInspectionsFromApi, type Inspection } from '@/features/inspections';
import { mapTreeFromApi, mapTreeToApiPayload, type Tree } from '@/features/trees/types';
import InspectionForm from '@/features/inspections/forms/InspectionForm';
import TreeLocationMap from './TreeLocationMap';
import TreeImageUploader from './TreeImageUploader';
import { getNextInspectionStatus } from '@/features/trees/utils/nextInspection';

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
  const [currentTree, setCurrentTree] = useState<Tree | null>(tree ?? null);
  const [editMode, setEditMode] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    species: tree?.species ?? '',
    number: tree?.number ? String(tree.number) : '',
    latitude: tree?.latitude != null ? String(tree.latitude) : '',
    longitude: tree?.longitude != null ? String(tree.longitude) : '',
    treeSizeMeters: tree?.treeSizeMeters != null ? String(tree.treeSizeMeters) : '',
    crownDiameterMeters: tree?.crownDiameterMeters != null ? String(tree.crownDiameterMeters) : '',
    numberOfTrunks: tree?.numberOfTrunks != null ? String(tree.numberOfTrunks) : '',
    trunkDiameter1: tree?.trunkDiameter1 != null ? String(tree.trunkDiameter1) : '',
    trunkDiameter2: tree?.trunkDiameter2 != null ? String(tree.trunkDiameter2) : '',
    trunkDiameter3: tree?.trunkDiameter3 != null ? String(tree.trunkDiameter3) : '',
  });

  useEffect(() => {
    setCurrentTree(tree ?? null);
    setDraft({
      species: tree?.species ?? '',
      number: tree?.number ? String(tree.number) : '',
      latitude: tree?.latitude != null ? String(tree.latitude) : '',
      longitude: tree?.longitude != null ? String(tree.longitude) : '',
      treeSizeMeters: tree?.treeSizeMeters != null ? String(tree.treeSizeMeters) : '',
      crownDiameterMeters: tree?.crownDiameterMeters != null ? String(tree.crownDiameterMeters) : '',
      numberOfTrunks: tree?.numberOfTrunks != null ? String(tree.numberOfTrunks) : '',
      trunkDiameter1: tree?.trunkDiameter1 != null ? String(tree.trunkDiameter1) : '',
      trunkDiameter2: tree?.trunkDiameter2 != null ? String(tree.trunkDiameter2) : '',
      trunkDiameter3: tree?.trunkDiameter3 != null ? String(tree.trunkDiameter3) : '',
    });
  }, [tree]);

  useEffect(() => {
    if (!currentTree) {
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
        const response = await fetch(`${API_BASE_URL}/api/Inspections/ByTreeId/${currentTree.id}`, {
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
  }, [currentTree, inspectionsRefreshIndex]);

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

  const nextInspectionStatus = getNextInspectionStatus(currentTree?.nextInspection);

  const parseNumber = (value: string | number | null | undefined) => {
    const num =
      typeof value === 'number'
        ? value
        : typeof value === 'string' && value.trim().length > 0
          ? Number(value)
          : null;
    return Number.isFinite(num) ? Number(num) : null;
  };

  const handleUpdateTree = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentTree) {
      return;
    }
    setEditSaving(true);
    setEditError(null);

    const parsedNumber = Number.parseInt(draft.number || '0', 10);
    const parsedTrunks = Number.parseInt(String(draft.numberOfTrunks || ''), 10);

    const payload = mapTreeToApiPayload({
      greenAreaId: currentTree.greenAreaId,
      number: Number.isNaN(parsedNumber) ? 0 : parsedNumber,
      species: draft.species,
      longitude: parseNumber(draft.longitude) ?? 0,
      latitude: parseNumber(draft.latitude) ?? 0,
      treeSizeMeters: parseNumber(draft.treeSizeMeters) ?? 0,
      crownDiameterMeters: parseNumber(draft.crownDiameterMeters) ?? 0,
      numberOfTrunks: Number.isNaN(parsedTrunks) ? 1 : Math.max(1, parsedTrunks),
      trunkDiameter1: parseNumber(draft.trunkDiameter1) ?? 0,
      trunkDiameter2: parseNumber(draft.trunkDiameter2) ?? 0,
      trunkDiameter3: parseNumber(draft.trunkDiameter3) ?? 0,
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/Trees/${currentTree.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 400) {
        const text = await response.text();
        throw new Error(text || 'Konflikt: Baum-Nummer bereits vergeben?');
      }
      if (!response.ok) {
        throw new Error('Aktualisierung fehlgeschlagen');
      }

      const updatedApiTree = await response.json();
      const mapped = mapTreeFromApi(updatedApiTree);
      setCurrentTree(mapped);
      setDraft({
        species: mapped.species ?? '',
        number: mapped.number ? String(mapped.number) : '',
        latitude: mapped.latitude != null ? String(mapped.latitude) : '',
        longitude: mapped.longitude != null ? String(mapped.longitude) : '',
        treeSizeMeters: mapped.treeSizeMeters != null ? String(mapped.treeSizeMeters) : '',
        crownDiameterMeters: mapped.crownDiameterMeters != null ? String(mapped.crownDiameterMeters) : '',
        numberOfTrunks: mapped.numberOfTrunks != null ? String(mapped.numberOfTrunks) : '',
        trunkDiameter1: mapped.trunkDiameter1 != null ? String(mapped.trunkDiameter1) : '',
        trunkDiameter2: mapped.trunkDiameter2 != null ? String(mapped.trunkDiameter2) : '',
        trunkDiameter3: mapped.trunkDiameter3 != null ? String(mapped.trunkDiameter3) : '',
      });
      setEditMode(false);
    } catch (error) {
      console.error('Error updating tree:', error);
      setEditError(
        error instanceof Error ? error.message : 'Baum konnte nicht aktualisiert werden (Nummer evtl. doppelt?).',
      );
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteTree = async () => {
    if (!currentTree) {
      return;
    }
    const confirmed = window.confirm('Diesen Baum wirklich loeschen? Dies kann nicht rueckgaengig gemacht werden.');
    if (!confirmed) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/Trees/${currentTree.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      if (!response.ok) {
        throw new Error('Loeschen fehlgeschlagen');
      }
      alert('Baum wurde geloescht.');
      onBack?.();
    } catch (error) {
      console.error('Error deleting tree:', error);
      alert('Baum konnte nicht geloescht werden.');
    }
  };

  const treeMetaRows = useMemo(
    () =>
      currentTree
        ? [
            { label: 'Breitengrad', value: currentTree.latitude },
            { label: 'Laengengrad', value: currentTree.longitude },
            { label: 'Letzte Kontrolle', value: currentTree.lastInspectionId ?? 'Keine' },
            {
              label: 'Naechste Kontrolle',
              value: nextInspectionStatus.relativeLabel ?? nextInspectionStatus.label,
              highlight: nextInspectionStatus.isOverdue,
            },
            { label: 'Baumhoehe (m)', value: currentTree.treeSizeMeters ?? '-' },
            { label: 'Kronendurchmesser (m)', value: currentTree.crownDiameterMeters ?? '-' },
            { label: 'Anzahl Staemme', value: currentTree.numberOfTrunks ?? '-' },
            { label: 'Stammdurchmesser 1', value: currentTree.trunkDiameter1 ?? '-' },
            { label: 'Stammdurchmesser 2', value: currentTree.trunkDiameter2 ?? '-' },
            { label: 'Stammdurchmesser 3', value: currentTree.trunkDiameter3 ?? '-' },
          ]
        : [],
    [currentTree, nextInspectionStatus.label, nextInspectionStatus.relativeLabel, nextInspectionStatus.isOverdue],
  );

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
                {currentTree ? `Baum ${currentTree.number ?? currentTree.id}` : 'Baumdetails'}
              </li>
            </ol>
          </nav>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h4 mb-0">Baum verwalten</h1>
            {renderHeaderAction()}
          </div>

          {!currentTree && (
            <p className="text-muted mb-0">
              Kein Baum ausgewaehlt. Bitte waehlen Sie einen Baum aus der Liste.
            </p>
          )}

          {currentTree && (
            <>
              {nextInspectionStatus.isOverdue && (
                <div className="alert alert-warning d-flex align-items-center gap-2" role="alert">
                  <span className="badge bg-danger text-white">Kontrolle faellig</span>
                  <span className="mb-0">
                    Naechste Kontrolle war faellig am {nextInspectionStatus.label}.
                    {nextInspectionStatus.relativeLabel ? ` (${nextInspectionStatus.relativeLabel})` : ''} Bitte zeitnah
                    einplanen.
                  </span>
                </div>
              )}
              <p className="text-muted mb-3">Details zum ausgewaehlten Baum.</p>
              <div className="row g-4 align-items-start">
                <div className="col-lg-5 col-xl-4">
                  <div className="bg-light border rounded-3 p-3 h-100">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <div className="text-uppercase text-muted small fw-semibold">Baum</div>
                        <div className="fs-5 fw-semibold mb-0">
                          {currentTree.species || 'Unbekannte Art'}
                        </div>
                        <div className="text-muted small">Nr. {currentTree.number}</div>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => setEditMode((prev) => !prev)}
                        >
                          {editMode ? 'Abbrechen' : 'Bearbeiten'}
                        </button>
                        <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleDeleteTree}>
                          Loeschen
                        </button>
                      </div>
                    </div>
                    {editMode && (
                      <form className="mt-3" onSubmit={handleUpdateTree}>
                        <div className="row g-2">
                          <div className="col-12 col-sm-6">
                            <label className="form-label small">Art</label>
                            <input
                              className="form-control form-control-sm"
                              value={draft.species}
                              onChange={(e) => setDraft((prev) => ({ ...prev, species: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="col-12 col-sm-6">
                            <label className="form-label small">Nummer</label>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={draft.number}
                              onChange={(e) => setDraft((prev) => ({ ...prev, number: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="col-12 col-sm-6">
                            <label className="form-label small">Breitengrad</label>
                            <input
                              type="number"
                              step="any"
                              className="form-control form-control-sm"
                              value={draft.latitude as number | string}
                              onChange={(e) => setDraft((prev) => ({ ...prev, latitude: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="col-12 col-sm-6">
                            <label className="form-label small">Laengengrad</label>
                            <input
                              type="number"
                              step="any"
                              className="form-control form-control-sm"
                              value={draft.longitude as number | string}
                              onChange={(e) => setDraft((prev) => ({ ...prev, longitude: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="col-12 col-sm-6">
                            <label className="form-label small">Baumhoehe (m)</label>
                            <input
                              type="number"
                              step="any"
                              className="form-control form-control-sm"
                              value={draft.treeSizeMeters as number | string}
                              onChange={(e) => setDraft((prev) => ({ ...prev, treeSizeMeters: e.target.value }))}
                            />
                          </div>
                          <div className="col-12 col-sm-6">
                            <label className="form-label small">Kronendurchmesser (m)</label>
                            <input
                              type="number"
                              step="any"
                              className="form-control form-control-sm"
                              value={draft.crownDiameterMeters as number | string}
                              onChange={(e) => setDraft((prev) => ({ ...prev, crownDiameterMeters: e.target.value }))}
                            />
                          </div>
                          <div className="col-12 col-sm-6">
                            <label className="form-label small">Anzahl Staemme</label>
                            <input
                              type="number"
                              min={1}
                              className="form-control form-control-sm"
                              value={draft.numberOfTrunks as number | string}
                              onChange={(e) => setDraft((prev) => ({ ...prev, numberOfTrunks: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="row g-2 mt-2">
                          <div className="col-12 col-sm-4">
                            <label className="form-label small">Stammdurchmesser 1</label>
                            <input
                              type="number"
                              step="any"
                              className="form-control form-control-sm"
                              value={draft.trunkDiameter1 as number | string}
                              onChange={(e) => setDraft((prev) => ({ ...prev, trunkDiameter1: e.target.value }))}
                            />
                          </div>
                          <div className="col-12 col-sm-4">
                            <label className="form-label small">Stammdurchmesser 2</label>
                            <input
                              type="number"
                              step="any"
                              className="form-control form-control-sm"
                              value={draft.trunkDiameter2 as number | string}
                              onChange={(e) => setDraft((prev) => ({ ...prev, trunkDiameter2: e.target.value }))}
                            />
                          </div>
                          <div className="col-12 col-sm-4">
                            <label className="form-label small">Stammdurchmesser 3</label>
                            <input
                              type="number"
                              step="any"
                              className="form-control form-control-sm"
                              value={draft.trunkDiameter3 as number | string}
                              onChange={(e) => setDraft((prev) => ({ ...prev, trunkDiameter3: e.target.value }))}
                            />
                          </div>
                        </div>
                        {editError && (
                          <div className="alert alert-danger py-2 mt-2 mb-0" role="alert">
                            {editError}
                          </div>
                        )}
                        <div className="d-flex gap-2 mt-3">
                          <button type="submit" className="btn btn-primary btn-sm" disabled={editSaving}>
                            {editSaving ? 'Speichere...' : 'Aenderungen speichern'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => setEditMode(false)}
                            disabled={editSaving}
                          >
                            Abbrechen
                          </button>
                        </div>
                      </form>
                    )}
                    <div className="row row-cols-1 row-cols-sm-2 g-2 mt-3">
                      {treeMetaRows.map(({ label, value, highlight }) => (
                        <div className="col" key={label}>
                          <div
                            className={`border rounded-3 px-3 py-2 h-100 ${
                              highlight ? 'bg-danger-subtle border-danger-subtle' : 'bg-white'
                            }`}
                          >
                            <div className="text-muted small">{label}</div>
                            <div className={`fw-semibold ${highlight ? 'text-danger' : ''}`}>
                              {value}
                              {highlight && <span className="badge bg-danger ms-2">Faellig</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-lg-7 col-xl-8">
                  <TreeLocationMap
                    latitude={currentTree.latitude ?? undefined}
                    longitude={currentTree.longitude ?? undefined}
                    treeNumber={currentTree.number ?? currentTree.id}
                  />
                </div>
              </div>
              <TreeImageUploader treeId={currentTree.id} />
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
                              state={{ inspection, tree }}
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
