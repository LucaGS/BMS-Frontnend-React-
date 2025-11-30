import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/shared/config/appConfig';
import { mapTreeFromApi, mapTreeToApiPayload, type Tree } from '@/entities/tree';
import TreeLocationPicker from '@/features/trees/components/TreeLocationPicker';

type TreeFormProps = {
  greenAreaId: number;
  defaultCenter?: [number, number];
  onTreeCreated: (tree?: Tree) => void;
};

type TreeFormState = {
  greenAreaId: number;
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

const TreeForm: React.FC<TreeFormProps> = ({ greenAreaId, defaultCenter, onTreeCreated }) => {
  const [draftTree, setDraftTree] = useState<TreeFormState>({
    greenAreaId,
    number: '',
    species: '',
    latitude: '',
    longitude: '',
    treeSizeMeters: '',
    crownDiameterMeters: '',
    numberOfTrunks: '',
    trunkDiameter1: '',
    trunkDiameter2: '',
    trunkDiameter3: '',
    trafficSafetyExpectation: '',
  });
  const [diameterError, setDiameterError] = useState<string | null>(null);
  const [trafficSafetyError, setTrafficSafetyError] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useEffect(() => {
    setDraftTree((current) => ({ ...current, greenAreaId }));
  }, [greenAreaId]);

  useEffect(() => {
    if (!defaultCenter) {
      return;
    }
    setDraftTree((current) => {
      if (current.latitude !== '' || current.longitude !== '') {
        return current;
      }
      return {
        ...current,
        latitude: String(defaultCenter[0]),
        longitude: String(defaultCenter[1]),
      };
    });
  }, [defaultCenter]);

  const parseNonNegativeNumber = (value: string) => {
    const parsed = Number.parseFloat(value);
    if (Number.isNaN(parsed) || parsed < 0) {
      return 0;
    }
    return parsed;
  };

  const parseNumber = (value: string) => {
    const parsed = Number.parseFloat(value);
    if (Number.isNaN(parsed)) {
      return 0;
    }
    return parsed;
  };

  const parseInteger = (value: string) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      return 0;
    }
    return parsed;
  };

  const hasAnyTrunkDiameterValue = (
    tree: Pick<TreeFormState, 'trunkDiameter1' | 'trunkDiameter2' | 'trunkDiameter3'>
  ) => [tree.trunkDiameter1, tree.trunkDiameter2, tree.trunkDiameter3].some(
      (value) => parseNonNegativeNumber(value) > 0
    );

  const handleTrunkDiameterChange =
    (key: 'trunkDiameter1' | 'trunkDiameter2' | 'trunkDiameter3') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      setDraftTree((current) => {
        const updated = { ...current, [key]: nextValue };
        if (diameterError && hasAnyTrunkDiameterValue(updated)) {
          setDiameterError(null);
        }
        return updated;
      });
    };

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
    const payload = mapTreeToApiPayload({
      greenAreaId,
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
    });

    try {
      console.log('Creating tree with payload:', payload);
      const response = await fetch(`${API_BASE_URL}/api/Trees/Create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response || !response.ok) {
        throw new Error('Failed to create tree');
      }
      let createdTree: Tree | undefined;
      try {
        const apiTree = await response.json();
        createdTree = mapTreeFromApi(apiTree);
      } catch {
        createdTree = undefined;
      }
      onTreeCreated(createdTree);
      alert('Baum erfolgreich hinzugefuegt');
      setDraftTree({
        greenAreaId,
        number: '',
        species: '',
        latitude: '',
        longitude: '',
        treeSizeMeters: '',
        crownDiameterMeters: '',
        numberOfTrunks: '',
        trunkDiameter1: '',
        trunkDiameter2: '',
        trunkDiameter3: '',
        trafficSafetyExpectation: '',
      });
      setDiameterError(null);
      setTrafficSafetyError(null);
      setShowLocationPicker(false);
    } catch (error) {
      console.error('Error creating tree:', error);
      alert('Fehler beim Hinzufuegen des Baumes');
    }
  };

  const handleCoordinatesSelected = ({ latitude, longitude }: { latitude: number; longitude: number }) => {
    setDraftTree((current) => ({
      ...current,
      latitude: String(latitude),
      longitude: String(longitude),
    }));
  };

  const handleCoordinatesCleared = () => {
    setDraftTree((current) => ({
      ...current,
      latitude: '',
      longitude: '',
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="species" className="form-label">
          Art
        </label>
        <input
          type="text"
          className="form-control"
          id="species"
          value={draftTree.species ?? ''}
          onChange={(event) => setDraftTree((current) => ({ ...current, species: event.target.value }))}
          required
        />
        <label htmlFor="number" className="form-label">
          Nummer
        </label>
        <input
          type="number"
          className="form-control"
          id="number"
          value={draftTree.number}
          onChange={(event) =>
            setDraftTree((current) => ({
              ...current,
              number: event.target.value,
            }))
          }
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="latitude" className="form-label">
          Breitengrad
        </label>
        <input
          type="number"
          className="form-control"
          id="latitude"
          value={draftTree.latitude}
          onChange={(event) =>
            setDraftTree((current) => ({
              ...current,
              latitude: event.target.value,
            }))
          }
          required
          step="any"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="longitude" className="form-label">
          Laengengrad
        </label>
        <input
          type="number"
          className="form-control"
          id="longitude"
          value={draftTree.longitude}
          onChange={(event) =>
            setDraftTree((current) => ({
              ...current,
              longitude: event.target.value,
            }))
          }
          required
          step="any"
        />
      </div>
      <div className="mb-3">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
          <div>
            <span className="form-label d-block mb-1">Koordinaten ueber Karte bestimmen</span>
            <small className="text-muted">
              Optional: Die Koordinaten koennen weiterhin manuell eingegeben werden.
            </small>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm align-self-md-start"
            onClick={() => setShowLocationPicker((current) => !current)}
          >
            {showLocationPicker ? 'Karte ausblenden' : 'Karte anzeigen'}
          </button>
        </div>
        {showLocationPicker && (
          <TreeLocationPicker
            value={{ latitude: parseNumber(draftTree.latitude), longitude: parseNumber(draftTree.longitude) }}
            defaultCenter={defaultCenter}
            onChange={handleCoordinatesSelected}
            onClear={handleCoordinatesCleared}
          />
        )}
      </div>
      <div className="mb-3">
        <label htmlFor="treeSizeMeters" className="form-label">
          Baumhoehe (m)
        </label>
        <input
          type="number"
          className="form-control"
          id="treeSizeMeters"
          value={draftTree.treeSizeMeters}
          onChange={(event) =>
            setDraftTree((current) => ({
              ...current,
              treeSizeMeters: event.target.value,
            }))
          }
          required
          min={0}
          step="any"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="crownDiameterMeters" className="form-label">
          Kronendurchmesser (m)
        </label>
        <input
          type="number"
          className="form-control"
          id="crownDiameterMeters"
          value={draftTree.crownDiameterMeters}
          onChange={(event) =>
            setDraftTree((current) => ({
              ...current,
              crownDiameterMeters: event.target.value,
            }))
          }
          required
          min={0}
          step="any"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="numberOfTrunks" className="form-label">
          Anzahl Staemme
        </label>
        <input
          type="number"
          className="form-control"
          id="numberOfTrunks"
          value={draftTree.numberOfTrunks}
          onChange={(event) =>
            setDraftTree((current) => ({
              ...current,
              numberOfTrunks: event.target.value,
            }))
          }
          required
          min={1}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="trafficSafetyExpectation" className="form-label">
          Sicherheitserwartung Verkehr
        </label>
        <select
          id="trafficSafetyExpectation"
          className={`form-select ${trafficSafetyError ? 'is-invalid' : ''}`}
          value={draftTree.trafficSafetyExpectation}
          onChange={(event) => {
            const nextValue = event.target.value;
            setDraftTree((current) => ({ ...current, trafficSafetyExpectation: nextValue }));
            if (nextValue) {
              setTrafficSafetyError(null);
            }
          }}
          required
        >
          <option value="Keine">Keine</option>
          <option value="Höher">Höher</option>
          <option value="Niedriger">Niedriger</option>
        </select>
        {trafficSafetyError ? (
          <div className="invalid-feedback d-block">{trafficSafetyError}</div>
        ) : (
          <div className="text-muted small">Bitte waehlen Sie die Sicherheitserwartung fuer den Verkehr.</div>
        )}
      </div>
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-baseline mb-1">
          <span className="form-label mb-0">Stammdurchmesser</span>
          <small className="text-muted">Mindestens ein Wert &gt; 0</small>
        </div>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <label htmlFor="trunkDiameter1" className="form-label">
              Stammdurchmesser 1
            </label>
            <input
              type="number"
              className="form-control"
              id="trunkDiameter1"
              placeholder="z. B. 12.5"
              value={draftTree.trunkDiameter1}
              onChange={handleTrunkDiameterChange('trunkDiameter1')}
              min={0}
              step="any"
            />
          </div>
          <div className="col-12 col-md-4">
            <label htmlFor="trunkDiameter2" className="form-label">
              Stammdurchmesser 2 (optional)
            </label>
            <input
              type="number"
              className="form-control"
              id="trunkDiameter2"
              placeholder="z. B. 12.5"
              value={draftTree.trunkDiameter2}
              onChange={handleTrunkDiameterChange('trunkDiameter2')}
              min={0}
              step="any"
            />
          </div>
          <div className="col-12 col-md-4">
            <label htmlFor="trunkDiameter3" className="form-label">
              Stammdurchmesser 3 (optional)
            </label>
            <input
              type="number"
              className="form-control"
              id="trunkDiameter3"
              placeholder="z. B. 12.5"
              value={draftTree.trunkDiameter3}
              onChange={handleTrunkDiameterChange('trunkDiameter3')}
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
      <button type="submit" className="btn btn-primary">
        Baum hinzufuegen
      </button>
    </form>
  );
};

export default TreeForm;
