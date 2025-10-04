import React, { use, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../constants';
import Baum from './Baeume';
import BaumAdder from './BaumAdder';

interface Baum{
  nummer: number;
  id: number;
  gruenFlaecheId: number;
  Breitengrad: number;
  Laengengrad: number;
  art:string;
}
const GruenFlaeche: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { gruenFlaecheId } = useParams<{ gruenFlaecheId: string }>();
  const {gruenFlaecheName} = useParams<{ gruenFlaecheName: string }>();
  const [error, setError] = useState<string | null>(null);
const [Baeume, setBaeume] = useState<Baum[]>([]);
const[showBaumAdder, setBaumAdder] = useState(false);

useEffect(() => {
    const fetchBaeume = async () => {
      try {
        const response = await fetch(API_BASE_URL+'/api/Baum/GetByGruenFlaechenId/'+gruenFlaecheId, {
          headers: {
            Authorization: `bearer ${localStorage.getItem('token') || ''}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch Baeume');
        }
        const data = await response.json();
        console.log(data);
        setBaeume(data.result);
        console.log(data.result);
      }catch (error) {
        console.error('Error fetching Baeume:', error);
      }
      
    };
    fetchBaeume();
  }, []);



  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <h1 className="h4 mb-5">{gruenFlaecheId} | {gruenFlaecheName}</h1>
        <dl className="row mb-0">
        </dl>
        <div className="mt-4">
          <button
          type='button'
          className='btn btn-success me-2'
          onClick={()=>setBaumAdder((prev)=>!prev)}>
            {showBaumAdder ? 'Formular verbergen' : 'Baum hinzufuegen'}
          </button>
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={() => navigate('/GruenFlaechen')}
          >
            Zurueck zur Uebersicht
          </button>
        </div>
         {showBaumAdder && (
            <div className="bg-light border rounded p-3 mb-4">
              <BaumAdder/>
            </div>
          )}
          <ul className="list-group list-group-horizontal">
              {Baeume.map((baum) => (
                <li key={baum.id} className="list-group-item d-flex justify-content-between align-items-center">
                  {baum.art} 
                </li>
              ))}
            </ul>
      </div>
      
    </div>  
    
  );
};

export default GruenFlaeche;
