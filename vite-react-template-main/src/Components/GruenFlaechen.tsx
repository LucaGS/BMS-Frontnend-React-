import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';
import GruenFlaechenAdder from './GruenFlaechenAdder';

interface GruenFlaeche {
  id: number;
  name: string;
}

const fetchGruenFlaechen = async (): Promise<GruenFlaeche[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/GruenFlaechen/GetAll`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${localStorage.getItem('token') || ''}`,
      },
    });
    if (!response || !response.ok) {
      throw new Error('Failed to fetch Gruenflaechen');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching GruenFlaechen:', error);
    return Promise.resolve([]);
  }
};

const GruenFlaechen: React.FC = () => {
  const navigate = useNavigate();
  const [showGruenFlaechenAdder, setGruenFlaechenAdder] = useState(false);
  const [gruenFlaechen, setGruenFlaechen] = useState<GruenFlaeche[]>([]);

  useEffect(() => {
    fetchGruenFlaechen().then(setGruenFlaechen);
  }, []);

  return (
    <section>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <div>
              <h1 className="h4 mb-1">Gruenflaechen</h1>
              <p className="text-muted mb-0">
                Ueberblick ueber alle verwalteten Gruenflaechen in Ihrem Bestand.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-success"
              onClick={() => setGruenFlaechenAdder((prev) => !prev)}
            >
              {showGruenFlaechenAdder ? 'Formular verbergen' : 'Gruenflaeche hinzufuegen'}
            </button>
          </div>

          {showGruenFlaechenAdder && (
            <div className="bg-light border rounded p-3 mb-4">
              <GruenFlaechenAdder value={gruenFlaechen} onChange={setGruenFlaechen} />
            </div>
          )}

          <ul className="list-group list-group-flush">
            {gruenFlaechen.length === 0 && (
              <li className="list-group-item text-center text-muted">
                Keine Gruenflaechen vorhanden.
              </li>
            )}
            {gruenFlaechen.map((gf) => (
              <li key={gf.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span className="fw-medium">{gf.name}</span>
                <button
                  type="button"
                  className="btn btn-outline-success btn-sm"
                  onClick={() => navigate(`/GruenFlaechen/${gf.id}`)}
                >
                  Details anzeigen
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default GruenFlaechen;
