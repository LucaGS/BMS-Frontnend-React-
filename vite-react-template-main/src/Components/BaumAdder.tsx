import React, { useState } from 'react';

const BaumAdder: React.FC = () => {
  const [Baum ,setBaum] = useState<Baum>();

  interface Baum{
  nummer: number;
  id: number;
  gruenFlaecheId: number;
  Breitengrad: number;
  Laengengrad: number;
  Art:string;
}

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // TODO: Backend-Anbindung fuer neue Baeume ergaenzen
    
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="art" className="form-label">Art</label>
        <input
          type="text"
          className="form-control"
          id="art"
          value={Baum?.Art || ''}
          onChange={(e) => setBaum({ ...Baum, Art: e.target.value } as Baum)}
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
          value={Baum?.Breitengrad || ''}
          onChange={(e) => setBaum({ ...Baum, Breitengrad: parseFloat(e.target.value) } as Baum)}
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
          value={Baum?.Laengengrad || ''}
          onChange={(e) => setBaum({ ...Baum, Laengengrad: parseFloat(e.target.value) } as Baum)}
          required
          step="any"
        />  
      </div>
      <button type="submit" className="btn btn-primary">Baum hinzufuegen</button>
    </form>
  );
};

export default BaumAdder;
