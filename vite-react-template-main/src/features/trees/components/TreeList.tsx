import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/shared/config/appConfig';
import { mapTreesFromApi, type Tree } from '@/features/trees/types';
import { getNextInspectionStatus } from '@/features/trees/utils/nextInspection';
import type { GreenArea } from '@/features/green-areas/types';

const TreeList: React.FC = () => {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [greenAreas, setGreenAreas] = useState<GreenArea[]>([]);
  const [selectedGreenAreaId, setSelectedGreenAreaId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [treesResponse, greenAreasResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/Trees/GetAll`, {
            headers: {
              Authorization: `bearer ${localStorage.getItem('token') || ''}`,
            },
          }),
          fetch(`${API_BASE_URL}/api/GreenAreas/GetAll`, {
            headers: {
              Authorization: `bearer ${localStorage.getItem('token') || ''}`,
            },
          }),
        ]);

        if (!treesResponse.ok) {
          throw new Error('Failed to fetch trees');
        }
        if (!greenAreasResponse.ok) {
          throw new Error('Failed to fetch green areas');
        }

        const [treesData, greenAreasData] = await Promise.all([treesResponse.json(), greenAreasResponse.json()]);
        setTrees(Array.isArray(treesData) ? mapTreesFromApi(treesData) : []);
        setGreenAreas(Array.isArray(greenAreasData) ? greenAreasData : []);
      } catch (fetchError) {
        console.error('Error fetching trees:', fetchError);
        setError('Baeume konnten nicht geladen werden.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenTree = (tree: Tree) => {
    navigate(`/trees/${tree.id}`, { state: { tree } });
  };

  const filteredTrees = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return trees.filter((tree) => {
      const matchesGreenArea = selectedGreenAreaId === 'all' || tree.greenAreaId === Number(selectedGreenAreaId);
      const matchesTerm =
        term.length === 0 ||
        String(tree.number).toLowerCase().includes(term) ||
        (tree.species ?? '').toLowerCase().includes(term);
      return matchesGreenArea && matchesTerm;
    });
  }, [searchTerm, selectedGreenAreaId, trees]);

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-muted mb-0">Baeume werden geladen...</p>;
    }

    if (error) {
      return (
        <div className="alert alert-danger mb-0" role="alert">
          {error}
        </div>
      );
    }

    if (trees.length === 0) {
      return <p className="text-muted mb-0">Noch keine Baeume vorhanden.</p>;
    }

    if (filteredTrees.length === 0) {
      return <p className="text-muted mb-0">Keine Treffer fuer die aktuelle Suche/Filter.</p>;
    }

    return (
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
        {filteredTrees.map((tree) => {
          const nextInspectionStatus = getNextInspectionStatus(tree.nextInspection);
          const nextInspectionLabel = nextInspectionStatus.hasValue
            ? nextInspectionStatus.relativeLabel ?? nextInspectionStatus.shortLabel
            : 'Keine naechste Kontrolle';

          return (
            <div className="col" key={tree.id}>
              <button
                type="button"
                className="click-card w-100 text-start"
                onClick={() => handleOpenTree(tree)}
              >
                <div
                  className={`card h-100 shadow-sm border-0 ${
                    nextInspectionStatus.isOverdue ? 'border border-danger' : ''
                  }`}
                >
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                      <span className="badge rounded-pill bg-success-subtle text-success-emphasis">
                        Nr. {tree.number ?? tree.id}
                      </span>
                      <span
                        className={`badge ${
                          nextInspectionStatus.isOverdue ? 'bg-danger text-white' : 'text-bg-light border'
                        }`}
                        title={nextInspectionStatus.label}
                      >
                        {nextInspectionLabel}
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
          );
        })}
      </div>
    );
  };

  return (
    <section>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
            <div>
              <div className="text-uppercase text-muted small fw-semibold">Baeume</div>
              <h1 className="h4 mb-0">Baumliste</h1>
              <p className="text-muted mb-0">Waehlen Sie einen Baum, um Details und Kontrollen zu oeffnen.</p>
            </div>
            <div className="badge text-bg-light">
              {filteredTrees.length}/{trees.length} {trees.length === 1 ? 'Baum' : 'Baeume'}
            </div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-12 col-md-4">
              <input
                type="search"
                className="form-control"
                placeholder="Suche nach Nummer oder Art"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <select
                className="form-select"
                value={selectedGreenAreaId}
                onChange={(event) => setSelectedGreenAreaId(event.target.value)}
              >
                <option value="all">Alle Gruenflaechen</option>
                {greenAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {renderContent()}
        </div>
      </div>
    </section>
  );
};

export default TreeList;
