import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/shared/config/appConfig';
import { mapTreeFromApi, type Tree } from '@/entities/tree';
import TreeLocationPicker from '@/features/trees/components/TreeLocationPicker';

type TreeEditFormProps = {
  tree: Tree;
  defaultCenter?: [number, number];
  onUpdated?: (tree?: Tree) => void;
};

type TreeEditState = {
  number: string;
  species: string;
  latitude: string;
  longitude: string;
  treeSizeMeters: string;
  crownDiameterMeters: string;
  numberOfTrunks: string;
  trunkDiameter1: string;
  trunkDiameter2: string;
  trunkDiameter3: string;
  trafficSafetyExpectation: string;
};

const TreeEditForm: React.FC<TreeEditFormProps> = ({ tree, defaultCenter, onUpdated }) => {
  const [draftTree, setDraftTree] = useState<TreeEditState>({
    number: String(tree.number ?? tree.id ?? ''),
    species: tree.species ?? '',
    latitude: tree.latitude != null ? String(tree.latitude) : '',
    longitude: tree.longitude != null ? String(tree.longitude) : '',
    treeSizeMeters: tree.treeSizeMeters != null ? String(tree.treeSizeMeters) : '',
    crownDiameterMeters: tree.crownDiameterMeters != null ? String(tree.crownDiameterMeters) : '',
    numberOfTrunks: tree.numberOfTrunks != null ? String(tree.numberOfTrunks) : '1',
    trunkDiameter1: tree.trunkDiameter1 != null ? String(tree.trunkDiameter1) : '',
    trunkDiameter2: tree.trunkDiameter2 != null ? String(tree.trunkDiameter2) : '',
    trunkDiameter3: tree.trunkDiameter3 != null ? String(tree.trunkDiameter3) : '',
    trafficSafetyExpectation: tree.trafficSafetyExpectation ?? '',
  });
  const [diameterError, setDiameterError] = useState<string | null>(null);
  const [trafficSafetyError, setTrafficSafetyError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setDraftTree({
      number: String(tree.number ?? tree.id ?? ''),
      species: tree.species ?? '',
      latitude: tree.latitude != null ? String(tree.latitude) : '',
      longitude: tree.longitude != null ? String(tree.longitude) : '',
      treeSizeMeters: tree.treeSizeMeters != null ? String(tree.treeSizeMeters) : '',
      crownDiameterMeters: tree.crownDiameterMeters != null ? String(tree.crownDiameterMeters) : '',
      numberOfTrunks: tree.numberOfTrunks != null ? String(tree.numberOfTrunks) : '1',
      trunkDiameter1: tree.trunkDiameter1 != null ? String(tree.trunkDiameter1) : '',
      trunkDiameter2: tree.trunkDiameter2 != null ? String(tree.trunkDiameter2) : '',
      trunkDiameter3: tree.trunkDiameter3 != null ? String(tree.trunkDiameter3) : '',
      trafficSafetyExpectation: tree.trafficSafetyExpectation ?? '',
    });
  }, [tree]);

  const parseNonNegativeNumber = (value: string) => {
    const parsed = Number.parseFloat(value);
    if (Number.isNaN(parsed) || parsed < 0) {
      return 0;
    }
    return parsed;
  };

  const parseNumber = (value: string) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const parseInteger = (value: string) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const hasAnyTrunkDiameterValue = (state: Pick<TreeEditState, 'trunkDiameter1' | 'trunkDiameter2' | 'trunkDiameter3'>) =>
    [state.trunkDiameter1, state.trunkDiameter2, state.trunkDiameter3].some((value) => parseNonNegativeNumber(value) > 0);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let hasError = false;
    if (!draftTree.trafficSafetyExpectation) {
      setTrafficSafetyError('Bitte Sicherheitserwartung Verkehr auswaehlen.');
      hasError = true;
    } else {
      setTrafficSafetyError(null);
    }
    if (!hasAnyTrunkDiameterValue(draftTree)) {
      setDiameterError('Mindestens ein Stammdurchmesser muss groesser als 0 sein.');
      hasError = true;
    } else {
      setDiameterError(null);
    }
    if (hasError) {
      return;
    }

    const payload = {
      greenAreaId: tree.greenAreaId,
      number: parseInteger(draftTree.number),
      species: draftTree.species,
      longitude: parseNumber(draftTree.longitude),
      latitude: parseNumber(draftTree.latitude),
      treeSizeMeters: parseNonNegativeNumber(draftTree.treeSizeMeters),
      crownDiameterMeters: parseNonNegativeNumber(draftTree.crownDiameterMeters),
      numberOfTrunks: Math.max(1, parseInteger(draftTree.numberOfTrunks)),
      trunkDiameter1: parseNonNegativeNumber(draftTree.trunkDiameter1),
      trunkDiameter2: parseNonNegativeNumber(draftTree.trunkDiameter2),
      trunkDiameter3: parseNonNegativeNumber(draftTree.trunkDiameter3),
      trafficSafetyExpectation: draftTree.trafficSafetyExpectation,
    };

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/Trees/${tree.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Update failed');
      }
      const updated = mapTreeFromApi(await response.json());
      onUpdated?.(updated);
      alert('Baum erfolgreich aktualisiert.');
    } catch (updateError) {
      console.error('Error updating tree:', updateError);
      alert('Baum konnte nicht aktualisiert werden.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card shadow-sm border-0 mt-3">
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="editSpecies" className="form-label">
              Art
            </label>
            <input
              id="editSpecies"
              type="text"
              className="form-control"
              value={draftTree.species}
              onChange={(event) => setDraftTree((current) => ({ ...current, species: event.target.value }))}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="editNumber" className="form-label">
              Nummer
            </label>
            <input
              id="editNumber"
              type="number"
              className="form-control"
              value={draftTree.number}
              onChange={(event) => setDraftTree((current) => ({ ...current, number: event.target.value }))}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="editLatitude" className="form-label">
              Breitengrad
            </label>
            <input
              id="editLatitude"
              type="number"
              className="form-control"
              value={draftTree.latitude}
              onChange={(event) => setDraftTree((current) => ({ ...current, latitude: event.target.value }))}
              step="any"
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="editLongitude" className="form-label">
              Laengengrad
            </label>
            <input
              id="editLongitude"
              type="number"
              className="form-control"
              value={draftTree.longitude}
              onChange={(event) => setDraftTree((current) => ({ ...current, longitude: event.target.value }))}
              step="any"
              required
            />
          </div>

          <div className="col-12">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
              <div>
                <span className="form-label d-block mb-1 small fw-semibold">Koordinaten ueber Karte bestimmen</span>
                <small className="text-muted">Marker ziehen oder in Karte klicken, um Koordinaten zu setzen.</small>
              </div>
            </div>
            <TreeLocationPicker
              value={{ latitude: parseNumber(draftTree.latitude), longitude: parseNumber(draftTree.longitude) }}
              defaultCenter={defaultCenter}
              onChange={({ latitude, longitude }) =>
                setDraftTree((current) => ({
                  ...current,
                  latitude: String(latitude),
                  longitude: String(longitude),
                }))
              }
              onClear={() =>
                setDraftTree((current) => ({
                  ...current,
                  latitude: '',
                  longitude: '',
                }))
              }
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="editTreeSizeMeters" className="form-label">
              Baumhoehe (m)
            </label>
            <input
              id="editTreeSizeMeters"
              type="number"
              className="form-control"
              value={draftTree.treeSizeMeters}
              onChange={(event) => setDraftTree((current) => ({ ...current, treeSizeMeters: event.target.value }))}
              min={0}
              step="any"
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="editCrownDiameterMeters" className="form-label">
              Kronendurchmesser (m)
            </label>
            <input
              id="editCrownDiameterMeters"
              type="number"
              className="form-control"
              value={draftTree.crownDiameterMeters}
              onChange={(event) =>
                setDraftTree((current) => ({ ...current, crownDiameterMeters: event.target.value }))
              }
              min={0}
              step="any"
              required
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="editNumberOfTrunks" className="form-label">
              Anzahl Staemme
            </label>
            <input
              id="editNumberOfTrunks"
              type="number"
              className="form-control"
              value={draftTree.numberOfTrunks}
              onChange={(event) => setDraftTree((current) => ({ ...current, numberOfTrunks: event.target.value }))}
              min={1}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="trafficSafetyExpectation" className="form-label">
              Sicherheitserwartung Verkehr
            </label>
            <select
              id="trafficSafetyExpectation"
              className={`form-select ${trafficSafetyError ? 'is-invalid' : ''}`}
              value={draftTree.trafficSafetyExpectation}
              onChange={(event) => {
                const next = event.target.value;
                setDraftTree((current) => ({ ...current, trafficSafetyExpectation: next }));
                if (next) {
                  setTrafficSafetyError(null);
                }
              }}
              required
            >
              <option value="">None</option>
              <option value="Higher">Higher</option>
              <option value="Lower">Lower</option>
            </select>
            {trafficSafetyError ? (
              <div className="invalid-feedback d-block">{trafficSafetyError}</div>
            ) : (
              <div className="text-muted small">Bitte waehlen Sie die Sicherheitserwartung fuer den Verkehr.</div>
            )}
          </div>

          <div className="col-12">
            <div className="d-flex justify-content-between align-items-baseline mb-1">
              <span className="form-label mb-0">Stammdurchmesser</span>
              <small className="text-muted">Mindestens ein Wert &gt; 0</small>
            </div>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label htmlFor="editTrunkDiameter1" className="form-label">
                  Stammdurchmesser 1
                </label>
                <input
                  id="editTrunkDiameter1"
                  type="number"
                  className="form-control"
                  value={draftTree.trunkDiameter1}
                  onChange={(event) =>
                    setDraftTree((current) => ({ ...current, trunkDiameter1: event.target.value }))
                  }
                  min={0}
                  step="any"
                  required={false}
                />
              </div>
              <div className="col-12 col-md-4">
                <label htmlFor="editTrunkDiameter2" className="form-label">
                  Stammdurchmesser 2 (optional)
                </label>
                <input
                  id="editTrunkDiameter2"
                  type="number"
                  className="form-control"
                  value={draftTree.trunkDiameter2}
                  onChange={(event) =>
                    setDraftTree((current) => ({ ...current, trunkDiameter2: event.target.value }))
                  }
                  min={0}
                  step="any"
                />
              </div>
              <div className="col-12 col-md-4">
                <label htmlFor="editTrunkDiameter3" className="form-label">
                  Stammdurchmesser 3 (optional)
                </label>
                <input
                  id="editTrunkDiameter3"
                  type="number"
                  className="form-control"
                  value={draftTree.trunkDiameter3}
                  onChange={(event) =>
                    setDraftTree((current) => ({ ...current, trunkDiameter3: event.target.value }))
                  }
                  min={0}
                  step="any"
                />
              </div>
            </div>
            {diameterError ? (
              <div className="text-danger small mt-2" role="alert">
                {diameterError}
              </div>
            ) : (
              <div className="text-muted small mt-2">
                Optional; mindestens ein Stammdurchmesser muss groesser als 0 sein.
              </div>
            )}
          </div>

          <div className="col-12 d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary" onClick={() => onUpdated?.(tree)} disabled={isSubmitting}>
              Abbrechen
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Wird gespeichert...' : 'Baum aktualisieren'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default TreeEditForm;
