import React, { use, useEffect, useState } from 'react';
import BaumAdder from './BaumAdder';
import { API_BASE_URL } from '../constants';


interface Baum {
  nummer: number;
  id: number;
  gruenFlaecheId: number;
  Breitengrad: number;
  Laengengrad: number;
  art:string;
}

const Baeume: React.FC = () => {
  const [BaeumeList, setBaeumeList] = useState<Baum[]>([]);

  useEffect(() => {
    const fetchBaeume = async () => {
      try {
        const response = await fetch(API_BASE_URL+'/api/Baum/GetAll', {
          headers: {
            Authorization: `bearer ${localStorage.getItem('token') || ''}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch Baeume');
        }
        const data = await response.json();
        setBaeumeList(data.result);
        console.log(data.result);
      }catch (error) {
        console.error('Error fetching Baeume:', error);
      }
      
    };
    fetchBaeume();
  }, []);

  return (
    <section>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h1 className="h4 mb-1">Baeume verwalten</h1>
            </div>
            <ul className="list-group list-group-horizontal">
              {BaeumeList.map((baum) => (
                <li key={baum.id} className="list-group-item d-flex justify-content-between align-items-center">
                  {baum.art} 
                </li>
              ))}
            </ul>
            
        
          </div>
         
        </div>
      </div>
    </section>
  );
};

export default Baeume;
