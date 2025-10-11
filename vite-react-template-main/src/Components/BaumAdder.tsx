import React, { useState } from 'react';
import { API_BASE_URL } from '../constants';
import { Baum } from '../constants';




type BaumAdderProps = {
  gruenFlaecheId: number;
  onBaumCreated: (baum?: Baum) => void;
};

const BaumAdder: React.FC<BaumAdderProps> = ({gruenFlaecheId, onBaumCreated}) => {
  const [baum ,setBaum] = useState<Baum>();
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = { ...(baum ?? {}), gruenFlaecheId } as Baum;
    console.log('Submitting form');
    console.log(payload);
    try{
      const response = await fetch(API_BASE_URL +'/api/Baum/Create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response || !response.ok) {
        throw new Error('Failed to create Baum');
      }
      let createdBaum: Baum | undefined;
      try {
        createdBaum = await response.json();
      } catch {
        createdBaum = undefined;
      }
      // Inform the parent so it can refresh its list without a full page reload.
      onBaumCreated(createdBaum);
      alert('Baum erfolgreich hinzugefuegt');
      setBaum({} as Baum);
      console.log("response: "+response);
    }catch (error) {
      console.error('Error creating Baum:', error);
      alert('Fehler beim Hinzufuegen des Baumes');
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="art" className="form-label">Art</label>
        <input
          type="text"
          className="form-control"
          id="art"
          value={baum?.art || ''}
          onChange={(e) => setBaum({ ...(baum ?? {}), art: e.target.value } as Baum)}
          required
        />
            <label htmlFor='Nummer' className='form-label'>Nummer</label>
            <input
              type='number'
              className='form-control'
              id='nummer'
              value={baum?.nummer || ''}
              onChange={(e) => setBaum({ ...(baum ?? {}), nummer: parseInt(e.target.value, 10) } as Baum)}
              required
            />
      </div>
      <div className="mb-3">
        <label htmlFor="breitengrad" className="form-label">Breitengrad</label>
        <input
          type="float"
          className="form-control"
          id="breitengrad"
          value={baum?.breitengrad || ''}
          onChange={(e) => setBaum({ ...(baum ?? {}), breitengrad: parseFloat(e.target.value) } as Baum)}
          required
          step="any"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="laengengrad" className="form-label">Laengengrad</label>
        <input
          type="float"
          className="form-control"
          id="laengengrad"
          value={baum?.laengengrad || ''}
          onChange={(e) => setBaum({ ...(baum ?? {}), laengengrad: parseFloat(e.target.value) } as Baum)}
          required
          step="any"
        />  
      </div>
      <button type="submit" className="btn btn-primary">Baum hinzufuegen</button>
    </form>
  );
};
export default BaumAdder;
