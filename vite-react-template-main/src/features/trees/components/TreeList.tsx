import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/shared/config/appConfig';
import { mapTreesFromApi, type Tree } from '@/features/trees/types';

const TreeList: React.FC = () => {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrees = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/Trees/GetAll`, {
          headers: {
            Authorization: `bearer ${localStorage.getItem('token') || ''}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch trees');
        }
        const data = await response.json();
        setTrees(Array.isArray(data) ? mapTreesFromApi(data) : []);
      } catch (fetchError) {
        console.error('Error fetching trees:', fetchError);
        setError('Baeume konnten nicht geladen werden.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrees();
  }, []);

  const handleOpenTree = (tree: Tree) => {
    navigate(`/trees/${tree.id}`, { state: { tree } });
  };

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

    return (
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
              {trees.length} {trees.length === 1 ? 'Baum' : 'Baeume'}
            </div>
          </div>
          {renderContent()}
        </div>
      </div>
    </section>
  );
};

export default TreeList;
