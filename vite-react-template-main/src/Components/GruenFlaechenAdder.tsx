import React, { useState } from 'react';
import { API_BASE_URL } from '../constants';

interface GruenFlaeche {
  id: number;
  name: string;
}

interface GruenFlaecheDto {
  name: string;
}

interface GruenFlaechenAdderProps {
  value: GruenFlaeche[];
  onChange: (next: GruenFlaeche[]) => void;
}

const GruenFlaechenAdder: React.FC<GruenFlaechenAdderProps> = ({ value, onChange }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Bitte einen Namen eintragen.');
      return;
    }

    const newGruenFlaeche: GruenFlaecheDto = {
      name: name.trim(),
    };

    try {
      setError('');
      const response = await fetch(`${API_BASE_URL}/api/GruenFlaechen/Create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(newGruenFlaeche),
      });

      if (!response || !response.ok) {
        throw new Error('Failed to add Gruenflaeche');
      }

      const data = await response.json();
      const createdGruenFlaeche: GruenFlaeche = {
        id: data.id,
        name: data.name,
      };
      onChange([...value, createdGruenFlaeche]);
      setName('');
    } catch (submitError) {
      console.error('Error adding GruenFlaeche:', submitError);
      setError('Fehler beim Hinzufuegen der Gruenflaeche.');
    }
  };

  return (
    <form onSubmit={handleAdd} className="row g-3 align-items-end">
      <div className="col-sm-8">
        <label htmlFor="newGruenFlaeche" className="form-label">
          Name der Gruenflaeche
        </label>
        <input
          id="newGruenFlaeche"
          type="text"
          className="form-control"
          placeholder="z. B. Stadtpark"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>
      <div className="col-sm-4 d-grid">
        <button type="submit" className="btn btn-success">
          Hinzufuegen
        </button>
      </div>
      {error && (
        <div className="col-12">
          <div className="alert alert-danger mb-0" role="alert">
            {error}
          </div>
        </div>
      )}
    </form>
  );
};

export default GruenFlaechenAdder;
