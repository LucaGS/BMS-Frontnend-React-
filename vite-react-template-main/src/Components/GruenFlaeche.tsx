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
  Art:string;
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

}, [gruenFlaecheId]);



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
      </div>
      
    </div>  
    
  );
};

export default GruenFlaeche;
