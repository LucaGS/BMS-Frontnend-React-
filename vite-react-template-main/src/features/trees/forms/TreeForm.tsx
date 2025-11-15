import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/shared/config/appConfig';
import { mapTreeFromApi, mapTreeToApiPayload, type NewTree, type Tree } from '@/entities/tree';
import TreeLocationPicker from '@/features/trees/components/TreeLocationPicker';

type TreeFormProps = {
  greenAreaId: number;
  defaultCenter?: [number, number];
  onTreeCreated: (tree?: Tree) => void;
};

const TreeForm: React.FC<TreeFormProps> = ({ greenAreaId, defaultCenter, onTreeCreated }) => {
  const [draftTree, setDraftTree] = useState<NewTree>({
    greenAreaId,
    number: 0,
    species: '',
    latitude: 0,
    longitude: 0,
    treeSizeMeters: 0,
    crownDiameterMeters: 0,
    crownAttachmentHeightMeters: 0,
    numberOfTrunks: 1,
    trunkInclination: 0,
  });
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useEffect(() => {
    setDraftTree((current) => ({ ...current, greenAreaId }));
  }, [greenAreaId]);

  useEffect(() => {
    if (!defaultCenter) {
      return;
    }
    setDraftTree((current) => {
      if (current.latitude !== 0 || current.longitude !== 0) {
        return current;
      }
      return {
        ...current,
        latitude: defaultCenter[0],
        longitude: defaultCenter[1],
      };
    });
  }, [defaultCenter]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = mapTreeToApiPayload({ ...draftTree, greenAreaId });

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
        number: 0,
        species: '',
        latitude: 0,
        longitude: 0,
        treeSizeMeters: 0,
        crownDiameterMeters: 0,
        crownAttachmentHeightMeters: 0,
        numberOfTrunks: 1,
        trunkInclination: 1,
      });
      setShowLocationPicker(false);
    } catch (error) {
      console.error('Error creating tree:', error);
      alert('Fehler beim Hinzufuegen des Baumes');
    }
  };

  const handleCoordinatesSelected = ({ latitude, longitude }: { latitude: number; longitude: number }) => {
    setDraftTree((current) => ({
      ...current,
      latitude,
      longitude,
    }));
  };

  const handleCoordinatesCleared = () => {
    setDraftTree((current) => ({
      ...current,
      latitude: 0,
      longitude: 0,
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
              number: Number.parseInt(event.target.value, 10) ,
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
              latitude: Number.parseFloat(event.target.value) ,
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
              longitude: Number.parseFloat(event.target.value) ,
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
            value={{ latitude: draftTree.latitude, longitude: draftTree.longitude }}
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
              treeSizeMeters: Number.parseFloat(event.target.value) ,
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
              crownDiameterMeters: Number.parseFloat(event.target.value) ,
            }))
          }
          required
          min={0}
          step="any"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="crownAttachmentHeightMeters" className="form-label">
          Kronenansatzhoehe (m)
        </label>
        <input
          type="number"
          className="form-control"
          id="crownAttachmentHeightMeters"
          value={draftTree.crownAttachmentHeightMeters}
          onChange={(event) =>
            setDraftTree((current) => ({
              ...current,
              crownAttachmentHeightMeters: Number.parseFloat(event.target.value) ,
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
              numberOfTrunks: Number.parseInt(event.target.value, 10) ,
            }))
          }
          required
          min={1}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="trunkInclination" className="form-label">
          Stamminneigung (Grad)
        </label>
        <input
          type="number"
          className="form-control"
          id="trunkInclination"
          value={draftTree.trunkInclination}
          onChange={(event) =>
            setDraftTree((current) => ({
              ...current,
              trunkInclination: Number.parseInt(event.target.value, 10) ,
            }))
          }
          required
          min={0}
          max={90}
        />
      </div>
      <button type="submit" className="btn btn-primary">
        Baum hinzufuegen
      </button>
    </form>
  );
};

export default TreeForm;
