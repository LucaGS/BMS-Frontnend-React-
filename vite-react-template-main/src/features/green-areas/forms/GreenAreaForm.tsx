import React, { useState } from 'react';
import { API_BASE_URL } from '@/shared/config/appConfig';
import type { GreenArea } from '@/entities/green-area';

interface GreenAreaDto {
  name: string;
}

interface GreenAreaFormProps {
  greenAreas: GreenArea[];
  onChange: (next: GreenArea[]) => void;
}

const GreenAreaForm: React.FC<GreenAreaFormProps> = ({ greenAreas, onChange }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Bitte einen Namen eintragen.');
      return;
    }

    const newGreenArea: GreenAreaDto = {
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
        body: JSON.stringify(newGreenArea),
      });

      if (!response || !response.ok) {
        throw new Error('Failed to add green area');
      }

      const data = await response.json();
      const createdGreenArea: GreenArea = {
        id: data.id,
        name: data.name,
      };
      onChange([...greenAreas, createdGreenArea]);
      setName('');
    } catch (submitError) {
      console.error('Error adding green area:', submitError);
      setError('Fehler beim Hinzufuegen der Gruenflaeche.');
    }
  };

  return (
    <form onSubmit={handleAdd} className="row g-3 align-items-end">
      <div className="col-sm-8">
        <label htmlFor="newGreenArea" className="form-label">
          Name der Gruenflaeche
        </label>
        <input
          id="newGreenArea"
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

export default GreenAreaForm;
