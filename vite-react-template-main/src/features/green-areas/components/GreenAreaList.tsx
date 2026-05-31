import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/shared/config/appConfig';
import { formatCoordinatePairDisplay } from '@/shared/lib/coordinateFormatting';
import AppModal from '@/shared/components/AppModal';
import { authFetch } from '@/shared/lib/auth';
import type { GreenArea } from '@/features/green-areas/types';
import GreenAreaForm from '../forms/GreenAreaForm';

const loadGreenAreas = async (): Promise<GreenArea[]> => {
  try {
    const response = await authFetch(`${API_BASE_URL}/api/GreenAreas/GetAll`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    loadGreenAreas()
      .then(setGreenAreas)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <div>
              <div className="text-uppercase text-muted small fw-semibold mb-1">Grünflächen</div>
              <h1 className="h4 mb-1">Grünflächen</h1>
              <p className="text-muted mb-0">
                Überblick über alle verwalteten Grünflächen in Ihrem Bestand.
              </p>
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="badge text-bg-light border px-3 py-2">
                {greenAreas.length} {greenAreas.length === 1 ? 'Fläche' : 'Flächen'}
              </span>
              <button
                type="button"
                className={`btn btn-add${showGreenAreaForm ? ' btn-add--open' : ''}`}
                onClick={() => setShowGreenAreaForm((prev) => !prev)}
                aria-label={showGreenAreaForm ? 'Formular verbergen' : 'Grünfläche hinzufügen'}
                title={showGreenAreaForm ? 'Formular verbergen' : 'Grünfläche hinzufügen'}
              >
                {showGreenAreaForm ? '×' : '+'}
              </button>
            </div>
          </div>

          {showGreenAreaForm && (
            <AppModal title="Grünfläche hinzufügen" onClose={() => setShowGreenAreaForm(false)}>
              <GreenAreaForm
                greenAreas={greenAreas}
                onChange={setGreenAreas}
                onSubmitted={() => setShowGreenAreaForm(false)}
              />
            </AppModal>
          )}

          {isLoading && <div className="text-center text-muted py-4">Grünflächen werden geladen...</div>}

          {!isLoading && greenAreas.length === 0 && (
            <div className="text-center text-muted py-4">Keine Grünflächen vorhanden.</div>
          )}

          {!isLoading && greenAreas.length > 0 && (
            <div className="green-area-results">
              <div className="d-md-none">
                <div className="list-group mobile-entity-list green-area-mobile-list">
                  {greenAreas.map((greenArea) => (
                    <button
                      type="button"
                      className="list-group-item list-group-item-action mobile-entity-list__item green-area-mobile-list__item"
                      key={greenArea.id}
                      onClick={() =>
                        navigate(`/green-areas/${greenArea.id}/${greenArea.name}`, {
                          state: {
                            longitude: greenArea.longitude,
                            latitude: greenArea.latitude,
                          },
                        })
                      }
                    >
                      <div className="mobile-entity-list__header">
                        <span className="badge text-bg-light border">Öffnen</span>
                      </div>
                      <div className="fw-semibold mb-1">{greenArea.name}</div>
                      <div className="text-muted small">
                        {formatCoordinatePairDisplay(greenArea.latitude, greenArea.longitude)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="d-none d-md-block">
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
                  {greenAreas.map((greenArea) => (
                    <div className="col" key={greenArea.id}>
                      <button
                        type="button"
                        className="click-card w-100 text-start"
                        onClick={() =>
                          navigate(`/green-areas/${greenArea.id}/${greenArea.name}`, {
                            state: {
                              longitude: greenArea.longitude,
                              latitude: greenArea.latitude,
                            },
                          })
                        }
                      >
                        <div className="card h-100 shadow-sm border-0">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="text-muted small">
                                {formatCoordinatePairDisplay(greenArea.latitude, greenArea.longitude)}
                              </span>
                              <span className="badge text-bg-light border">Öffnen</span>
                            </div>
                            <h2 className="h6 fw-semibold mb-1">{greenArea.name}</h2>
                            <p className="text-muted small mb-0">Tippen, um Details und Karte zu öffnen.</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="d-md-none app-sticky-primary-bar">
        <button
          type="button"
          className="btn btn-success w-100"
          onClick={() => setShowGreenAreaForm(true)}
        >
          Grünfläche hinzufügen
        </button>
      </div>
    </section>
  );
};

export default GreenAreaList;
