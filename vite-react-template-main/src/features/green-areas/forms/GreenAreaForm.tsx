import React, { useState } from 'react';
import { API_BASE_URL } from '@/shared/config/appConfig';
import type { GreenArea } from '@/features/green-areas/types';
import TreeLocationPicker from '@/features/trees/components/TreeLocationPicker';
import { DEFAULT_MAP_CENTER } from '@/shared/maps/leafletUtils';

interface GreenAreaDto {
  name: string;
  longitude?: number;
  latitude?: number;
}

interface GreenAreaFormProps {
  greenAreas: GreenArea[];
  onChange: (next: GreenArea[]) => void;
}

const GreenAreaForm: React.FC<GreenAreaFormProps> = ({ greenAreas, onChange }) => {
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');
  const [error, setError] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const handleAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Bitte einen Namen eintragen.');
      return;
    }

    const newGreenArea: GreenAreaDto = {
      name: name.trim(),
      longitude: typeof longitude === 'number' ? longitude : undefined,
      latitude: typeof latitude === 'number' ? latitude : undefined,
    };

    try {
      setError('');
      const response = await fetch(`${API_BASE_URL}/api/GreenAreas/Create`, {
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
        longitude: data.longitude,
        latitude: data.latitude,
      };
      onChange([...greenAreas, createdGreenArea]);
      setName('');
      setLatitude('');
      setLongitude('');
      setShowLocationPicker(false);
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
        <input
          id="latitude"
          type="number"
          className="form-control mt-2"
          placeholder="Breitengrad"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value === '' ? '' : parseFloat(e.target.value))}
          step="any"
        />
        <input
          id="longitude"
          type="number"
          className="form-control mt-2"
          placeholder="Laengengrad"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value === '' ? '' : parseFloat(e.target.value))}
          step="any"
        />
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mt-2">
          <div>
            <span className="form-label d-block mb-1 small fw-semibold">Koordinaten ueber Karte waehlen</span>
            <small className="text-muted">Optional: Marker bewegen oder Karte klicken, um Koordinaten zu setzen.</small>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm align-self-md-start"
            onClick={() => setShowLocationPicker((current) => !current)}
          >
            {showLocationPicker ? 'Karte ausblenden' : 'Karte anzeigen'}
          </button>
        </div>
        {showLocationPicker && (
          <div className="mt-2">
            <TreeLocationPicker
              value={{
                latitude: typeof latitude === 'number' ? latitude : undefined,
                longitude: typeof longitude === 'number' ? longitude : undefined,
              }}
              defaultCenter={DEFAULT_MAP_CENTER}
              onChange={({ latitude: lat, longitude: lng }) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
              onClear={() => {
                setLatitude('');
                setLongitude('');
              }}
            />
          </div>
        )}
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
