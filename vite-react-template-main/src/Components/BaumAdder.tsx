import React, { useState } from 'react';
import { API_BASE_URL } from '../constants';
import { Baum } from '../constants';
const BaumAdder: React.FC = () => {
  const [Baum ,setBaum] = useState<Baum>();
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Submitting form');
    console.log(Baum);
    try{
      const response = await fetch(API_BASE_URL +'/api/Baum/Create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(Baum),
      });
      if (!response || !response.ok) {
        throw new Error('Failed to create Baum');
      }
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
          value={Baum?.art || ''}
          onChange={(e) => setBaum({ ...Baum, art: e.target.value } as Baum)}
          required
        />
            <label htmlFor='Nummer' className='form-label'>Nummer</label>
            <input
              type='number'
              className='form-control'
              id='nummer'
              value={Baum?.nummer || ''}
              onChange={(e) => setBaum({ ...Baum, nummer: parseInt(e.target.value, 10) } as Baum)}
              required
            />
      </div>
      <div className="mb-3">
        <label htmlFor="breitengrad" className="form-label">Breitengrad</label>
        <input
          type="float"
          className="form-control"
          id="breitengrad"
          value={Baum?.breitengrad || ''}
          onChange={(e) => setBaum({ ...Baum, breitengrad: parseFloat(e.target.value) } as Baum)}
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
          value={Baum?.laengengrad || ''}
          onChange={(e) => setBaum({ ...Baum, laengengrad: parseFloat(e.target.value) } as Baum)}
          required
          step="any"
        />  
      </div>
      <button type="submit" className="btn btn-primary">Baum hinzufuegen</button>
    </form>
  );
};
export default BaumAdder;
