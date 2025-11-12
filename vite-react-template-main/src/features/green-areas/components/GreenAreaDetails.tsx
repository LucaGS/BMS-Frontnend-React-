import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '@/shared/config/appConfig';
import { mapTreesFromApi, type Tree } from '@/features/trees/types';
import TreeForm from '@/features/trees/forms/TreeForm';
import GreenAreaMap from '../maps/GreenAreaMap';

type GreenAreaRouteParams = {
  greenAreaId: string;
  greenAreaName: string;
};

const GreenAreaDetails: React.FC = () => {
  const navigate = useNavigate();
  const { greenAreaId, greenAreaName } = useParams<GreenAreaRouteParams>();
  const [error, setError] = useState<string | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [showTreeForm, setShowTreeForm] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const fetchTrees = useCallback(async () => {
    if (!greenAreaId) {
      setError('Keine Gruenflaeche ausgewaehlt.');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/Tree/GetByGreenAreaId/${greenAreaId}`, {
        headers: {
          Authorization: `bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to load trees for the selected green area.');
      }
      const data = await response.json();
      setTrees(Array.isArray(data) ? mapTreesFromApi(data) : []);
      setError(null);
    } catch (fetchError) {
      console.error('Error fetching trees:', fetchError);
      setError(fetchError instanceof Error ? fetchError.message : 'Unbekannter Fehler beim Laden der Baeume.');
    }
  }, [greenAreaId]);

  useEffect(() => {
    fetchTrees();
  }, [fetchTrees]);

  const handleTreeCreated = (createdTree?: Tree) => {
    if (createdTree) {
      setTrees((prev) => [...prev, createdTree]);
      setError(null);
      return;
    }

    fetchTrees();
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <h1 className="h4 mb-5">
          {greenAreaId} | {greenAreaName}
        </h1>

        <div className="mt-4">
          <button
            type="button"
            className="btn btn-success me-2"
            onClick={() => setShowTreeForm((prev) => !prev)}
          >
            {showTreeForm ? 'Formular verbergen' : 'Baum hinzufuegen'}
          </button>
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={() => navigate('/green-areas')}
          >
            Zurueck zur Uebersicht
          </button>
        </div>

        {showTreeForm && (
          <div className="bg-light border rounded p-3 my-4">
            <TreeForm
              greenAreaId={Number.parseInt(greenAreaId ?? '0', 10)}
              onTreeCreated={handleTreeCreated}
            />
          </div>
        )}

        <button
          type="button"
          className="btn btn-outline-primary mb-3"
          onClick={() => setShowMap((prev) => !prev)}
        >
          Karte
        </button>

        {showMap && (
          <div className="bg-light border rounded p-3 my-4">
            <GreenAreaMap trees={trees} onError={setError} />
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <ul className="list-group list-group-vertical flex-wrap">
          {trees.map((tree) => (
            <li
              key={tree.id}
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              role="button"
              onClick={() => navigate(`/trees/${tree.id}`, { state: { tree } })}
            >
              {tree.number} - {tree.species}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GreenAreaDetails;
