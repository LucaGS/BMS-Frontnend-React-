import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/shared/config/appConfig';
import { mapTreeFromApi, mapTreeToApiPayload, type NewTree, type Tree } from '@/entities/tree';

type TreeFormProps = {
  greenAreaId: number;
  onTreeCreated: (tree?: Tree) => void;
};

const TreeForm: React.FC<TreeFormProps> = ({ greenAreaId, onTreeCreated }) => {
  const [draftTree, setDraftTree] = useState<NewTree>({
    greenAreaId,
    number: 0,
    species: '',
    latitude: null,
    longitude: null,
    userId: null,
    lastInspectionId: null,
  });

  useEffect(() => {
    setDraftTree((current) => ({ ...current, greenAreaId }));
  }, [greenAreaId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = mapTreeToApiPayload({ ...draftTree, greenAreaId });

    try {
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
        latitude: null,
        longitude: null,
        userId: null,
        lastInspectionId: null,
      });
    } catch (error) {
      console.error('Error creating tree:', error);
      alert('Fehler beim Hinzufuegen des Baumes');
    }
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
          value={draftTree.number || ''}
          onChange={(event) =>
            setDraftTree((current) => ({
              ...current,
              number: Number.parseInt(event.target.value, 10) || 0,
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
          value={draftTree.latitude ?? ''}
          onChange={(event) =>
            setDraftTree((current) => ({
              ...current,
              latitude: event.target.value ? Number.parseFloat(event.target.value) : null,
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
          value={draftTree.longitude ?? ''}
          onChange={(event) =>
            setDraftTree((current) => ({
              ...current,
              longitude: event.target.value ? Number.parseFloat(event.target.value) : null,
            }))
          }
          required
          step="any"
        />
      </div>
      <button type="submit" className="btn btn-primary">
        Baum hinzufuegen
      </button>
    </form>
  );
};

export default TreeForm;
