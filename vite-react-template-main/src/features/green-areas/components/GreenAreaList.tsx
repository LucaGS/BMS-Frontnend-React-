import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/shared/config/appConfig';
import type { GreenArea } from '@/entities/green-area';
import GreenAreaForm from '../forms/GreenAreaForm';

const loadGreenAreas = async (): Promise<GreenArea[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/GruenFlaechen/GetAll`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${localStorage.getItem('token') || ''}`,
      },
    });
    if (!response || !response.ok) {
      throw new Error('Failed to fetch green areas');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching green areas:', error);
    return Promise.resolve([]);
  }
};

const GreenAreaList: React.FC = () => {
  const navigate = useNavigate();
  const [showGreenAreaForm, setShowGreenAreaForm] = useState(false);
  const [greenAreas, setGreenAreas] = useState<GreenArea[]>([]);

  useEffect(() => {
    loadGreenAreas().then(setGreenAreas);
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
              onClick={() => setShowGreenAreaForm((prev) => !prev)}
            >
              {showGreenAreaForm ? 'Formular verbergen' : 'Gruenflaeche hinzufuegen'}
            </button>
          </div>

          {showGreenAreaForm && (
            <div className="bg-light border rounded p-3 mb-4">
              <GreenAreaForm greenAreas={greenAreas} onChange={setGreenAreas} />
            </div>
          )}

          <ul className="list-group list-group-flush">
            {greenAreas.length === 0 && (
              <li className="list-group-item text-center text-muted">
                Keine Gruenflaechen vorhanden.
              </li>
            )}
            {greenAreas.map((greenArea) => (
              <li key={greenArea.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span className="fw-medium">{greenArea.name}</span>
                <button
                  type="button"
                  className="btn btn-outline-success btn-sm"
                  onClick={() => navigate(`/green-areas/${greenArea.id}/${greenArea.name}`)}
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

export default GreenAreaList;
