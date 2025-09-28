import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

interface GruenFlaecheData {
  id: number;
  name: string;
}

const GruenFlaeche: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { gruenFlaecheId } = useParams<{ gruenFlaecheId: string }>();
  const locationState = location.state as GruenFlaecheData | undefined;

  const [gruenFlaeche, setGruenFlaeche] = useState<GruenFlaecheData | null>(locationState ?? null);
  const [isLoading, setIsLoading] = useState(!locationState);
  const [error, setError] = useState<string | null>(null);

  const resolvedId = useMemo(() => {
    if (!gruenFlaecheId) {
      return null;
    }
    const parsed = Number(gruenFlaecheId);
    return Number.isNaN(parsed) ? null : parsed;
  }, [gruenFlaecheId]);

  useEffect(() => {
    if (locationState || resolvedId === null) {
      if (resolvedId === null && !locationState) {
        setError('Keine Gruenflaechen-ID in der URL gefunden.');
        setIsLoading(false);
      }
      return;
    }

    const fetchSelectedGruenFlaeche = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/GruenFlaechen/GetAll`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `bearer ${localStorage.getItem('token') || ''}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load Gruenflaechen');
        }

        const allGruenFlaechen = (await response.json()) as GruenFlaecheData[];
        const match = allGruenFlaechen.find((item) => item.id === resolvedId) ?? null;

        if (!match) {
          setError('Gruenflaeche wurde nicht gefunden.');
        }

        setGruenFlaeche(match);
      } catch (fetchError) {
        console.error('Error fetching GruenFlaeche:', fetchError);
        setError('Fehler beim Laden der Gruenflaeche.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSelectedGruenFlaeche();
  }, [locationState, resolvedId]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Lade...</span>
        </div>
      </div>
    );
  }

  if (error || !gruenFlaeche) {
    return (
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <h1 className="h4 mb-3">Gruenflaeche</h1>
          <div className="alert alert-warning" role="alert">
            {error ?? 'Keine Gruenflaeche ausgewaehlt.'}
          </div>
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={() => navigate('/GruenFlaechen')}
          >
            Zur Uebersicht
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <h1 className="h4 mb-3">{gruenFlaeche.name}</h1>
        <dl className="row mb-0">
          <dt className="col-sm-4">ID aus Route</dt>
          <dd className="col-sm-8">{resolvedId}</dd>
          <dt className="col-sm-4">Daten-ID</dt>
          <dd className="col-sm-8">{gruenFlaeche.id}</dd>
        </dl>
        <div className="mt-4">
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={() => navigate('/GruenFlaechen')}
          >
            Zurueck zur Uebersicht
          </button>
        </div>
      </div>
    </div>
  );
};

export default GruenFlaeche;
