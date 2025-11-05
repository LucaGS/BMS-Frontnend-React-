import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/shared/config/appConfig';
import { mapTreesFromApi, type Tree } from '@/features/trees/types';

const TreeList: React.FC = () => {
  const [trees, setTrees] = useState<Tree[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrees = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/Baum/GetAll`, {
          headers: {
            Authorization: `bearer ${localStorage.getItem('token') || ''}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch trees');
        }
        const data = await response.json();
        setTrees(Array.isArray(data) ? mapTreesFromApi(data) : []);
      } catch (error) {
        console.error('Error fetching trees:', error);
      }
    };
    fetchTrees();
  }, []);

  return (
    <section>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h1 className="h4 mb-1">Baeume verwalten</h1>
            </div>
            <ul className="list-group list-group-vertical">
              {trees.map((tree) => (
                <li
                  key={tree.id}
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  role="button"
                  onClick={() => navigate(`/trees/${tree.id}`, { state: { tree } })}
                >
                  {tree.species}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TreeList;
