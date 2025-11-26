import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '@/shared/config/appConfig';
import { mapTreesFromApi, type Tree } from '@/features/trees/types';
import TreeForm from '@/features/trees/forms/TreeForm';
import GreenAreaMap from '../maps/GreenAreaMap';
import type { GreenArea } from '@/features/green-areas/types';

type GreenAreaRouteParams = {
  greenAreaId: string;
  greenAreaName: string;
};

type GreenAreaLocationState = {
  longitude?: number;
  latitude?: number;
};

const DEFAULT_GREEN_AREA_CENTER: [number, number] = [49.6590, 9.9962];

const deriveCenterFromState = (
  state?: GreenAreaLocationState,
): [number, number] | null => {
  if (
    typeof state?.latitude === 'number' &&
    typeof state?.longitude === 'number'
  ) {
    return [state.latitude, state.longitude];
  }
  return null;
};

const GreenAreaDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as GreenAreaLocationState | undefined;
  const { greenAreaId, greenAreaName } = useParams<GreenAreaRouteParams>();
  const [error, setError] = useState<string | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [showTreeForm, setShowTreeForm] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    deriveCenterFromState(locationState) ?? DEFAULT_GREEN_AREA_CENTER,
  );

  const fetchTrees = useCallback(async () => {
    if (!greenAreaId) {
      setError('Keine Gruenflaeche ausgewaehlt.');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/Trees/GetByGreenAreaId/${greenAreaId}`, {
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

  useEffect(() => {
    const centerFromState = deriveCenterFromState(locationState);
    if (centerFromState) {
      setMapCenter(centerFromState);
    }
  }, [locationState]);

  useEffect(() => {
    const centerFromState = deriveCenterFromState(locationState);
    if (centerFromState || !greenAreaId) {
      return;
    }

    const numericGreenAreaId = Number.parseInt(greenAreaId, 10);
    if (Number.isNaN(numericGreenAreaId)) {
      return;
    }

    let isCancelled = false;

    const fetchGreenAreaCenter = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/GreenAreas/GetAll`, {
          headers: {
            Authorization: `bearer ${localStorage.getItem('token') || ''}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load green areas.');
        }

        const data = (await response.json()) as GreenArea[];
        if (!Array.isArray(data)) {
          return;
        }

        const currentGreenArea = data.find(
          (area) => area.id === numericGreenAreaId,
        );

        if (
          !isCancelled &&
          currentGreenArea &&
          typeof currentGreenArea.latitude === 'number' &&
          typeof currentGreenArea.longitude === 'number'
        ) {
          setMapCenter([currentGreenArea.latitude, currentGreenArea.longitude]);
        }
      } catch (centerError) {
        if (isCancelled) {
          return;
        }
        console.error('Error fetching green area coordinates:', centerError);
        setError(
          (existing) =>
            existing ??
            'Koordinaten der ausgewaehlten Gruenflaeche konnten nicht geladen werden.',
        );
      }
    };

    fetchGreenAreaCenter();

    return () => {
      isCancelled = true;
    };
  }, [greenAreaId, locationState]);

  const handleTreeCreated = (createdTree?: Tree) => {
    if (createdTree) {
      setTrees((prev) => [...prev, createdTree]);
      setError(null);
      return;
    }

    fetchTrees();
  };

  const handleOpenTree = (tree: Tree) => {
    navigate(`/trees/${tree.id}`, { state: { tree } });
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
              defaultCenter={mapCenter}
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
            <GreenAreaMap
              trees={trees}
              onError={setError}
              defaultCenter={mapCenter}
              greenAreaName={greenAreaName}
            />
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {trees.length === 0 && !error && (
          <p className="text-muted mb-0">Noch keine Baeume in dieser Gruenflaeche.</p>
        )}

        {trees.length > 0 && (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
            {trees.map((tree) => (
              <div className="col" key={tree.id}>
                <button
                  type="button"
                  className="click-card w-100 text-start"
                  onClick={() => handleOpenTree(tree)}
                >
                  <div className="card h-100 shadow-sm border-0">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge rounded-pill bg-success-subtle text-success-emphasis">
                          Nr. {tree.number ?? tree.id}
                        </span>
                      </div>
                      <h2 className="h6 fw-semibold mb-1">{tree.species || 'Unbekannte Art'}</h2>
                      <p className="text-muted small mb-0">
                        {tree.crownDiameterMeters
                          ? `Kronendurchmesser ${tree.crownDiameterMeters} m`
                          : 'Keine Angaben'}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GreenAreaDetails;
