import React, { useState } from 'react';
import { API_BASE_URL } from '@/shared/config/appConfig';

type InspectionFormProps = {
  treeId: number;
  onInspectionCreated?: () => void;
};

const getDefaultPerformedAt = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

const InspectionForm: React.FC<InspectionFormProps> = ({ treeId, onInspectionCreated }) => {
  const [performedAt, setPerformedAt] = useState<string>(getDefaultPerformedAt());
  const [isSafeForTraffic, setIsSafeForTraffic] = useState<boolean>(true);
  const [newInspectionIntervall, setNewInspectionIntervall] = useState<number>(12);
  const [developmentalStage, setDevelopmentalStage] = useState<string>('');
  const [damageLevel, setDamageLevel] = useState<number>(3);
  const [standStability, setStandStability] = useState<number>(3);
  const [breakageSafety, setBreakageSafety] = useState<number>(3);
  const [vitality, setVitality] = useState<number>(3);
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        treeId,
        performedAt,
        isSafeForTraffic,
        newInspectionIntervall,
        developmentalStage: developmentalStage.trim(),
        damageLevel,
        standStability,
        breakageSafety,
        vitality,
        description: description.trim(),
      };
      const requestUrl = `${API_BASE_URL}/api/Inspections/Create`;

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          Authorization: `bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create inspection');
      }

      onInspectionCreated?.();
      alert('Kontrolle erfolgreich hinzugefuegt');
      setPerformedAt(getDefaultPerformedAt());
      setIsSafeForTraffic(true);
      setNewInspectionIntervall(12);
      setDevelopmentalStage('');
      setDamageLevel(3);
      setStandStability(3);
      setBreakageSafety(3);
      setVitality(3);
      setDescription('');
    } catch (error) {
      console.error('Error creating inspection:', error);
      setError('Fehler beim Hinzufuegen der Kontrolle.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderScoreSlider = (
    id: string,
    label: string,
    value: number,
    onChange: (value: number) => void
  ) => (
    <div className="col-md-4">
      <label htmlFor={id} className="form-label d-flex justify-content-between align-items-center">
        <span>{label}</span>
        <span className="badge bg-secondary">{value}/5</span>
      </label>
      <input
        type="range"
        className="form-range"
        min={0}
        max={5}
        step={1}
        id={id}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        disabled={isSubmitting}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="card shadow-sm border-0 mt-3">
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="performedAt" className="form-label">
              Kontrolldatum
            </label>
            <input
              type="datetime-local"
              className="form-control"
              id="performedAt"
              value={performedAt}
              onChange={(event) => setPerformedAt(event.target.value)}
              disabled={isSubmitting}
              required
            />
            <small className="text-muted">Wann wurde die Kontrolle durchgefuehrt?</small>
          </div>

          <div className="col-md-3">
            <label htmlFor="newInspectionIntervall" className="form-label">
              Kontrollintervall (Tage)
            </label>
            <input
              type="number"
              className="form-control"
              id="newInspectionIntervall"
              min={1}
              step={1}
              value={newInspectionIntervall}
              onChange={(event) => setNewInspectionIntervall(Number(event.target.value) || 0)}
              disabled={isSubmitting}
            />
            <small className="text-muted">Naechste Kontrolle empfohlen in ... Tagen.</small>
          </div>

          <div className="col-md-3">
            <label className="form-label d-block" htmlFor="isSafeForTraffic">
              Verkehrssicherheit
            </label>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="isSafeForTraffic"
                checked={isSafeForTraffic}
                onChange={(event) => setIsSafeForTraffic(event.target.checked)}
                disabled={isSubmitting}
              />
              <label className="form-check-label" htmlFor="isSafeForTraffic">
                {isSafeForTraffic ? 'Sicher' : 'Unsicher'}
              </label>
            </div>
            <small className="text-muted">Ist der Baum aktuell verkehrssicher?</small>
          </div>

          <div className="col-md-6">
            <label htmlFor="developmentalStage" className="form-label">
              Entwicklungsstadium
            </label>
            <input
              type="text"
              className="form-control"
              id="developmentalStage"
              placeholder="z. B. Jungbaum, Reif, Alt"
              value={developmentalStage}
              onChange={(event) => setDevelopmentalStage(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="vitality" className="form-label d-flex justify-content-between">
              <span>Vitalitaet (0-5)</span>
              <span className="badge bg-secondary">{vitality}/5</span>
            </label>
            <input
              type="range"
              className="form-range"
              id="vitality"
              min={0}
              max={5}
              step={1}
              value={vitality}
              onChange={(event) => setVitality(Number(event.target.value))}
              disabled={isSubmitting}
            />
          </div>

          <div className="col-12">
            <div className="border rounded-3 p-3 bg-light">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold">Stabilitaet & Schaeden</span>
                <small className="text-muted">0 = keine Auffaelligkeit, 5 = kritisch</small>
              </div>
              <div className="row g-3">
                {renderScoreSlider('damageLevel', 'Schaedigungsgrad', damageLevel, setDamageLevel)}
                {renderScoreSlider('standStability', 'Standfestigkeit', standStability, setStandStability)}
                {renderScoreSlider('breakageSafety', 'Bruchsicherheit', breakageSafety, setBreakageSafety)}
              </div>
            </div>
          </div>

          <div className="col-12">
            <label htmlFor="description" className="form-label">
              Beschreibung / Massnahmen
            </label>
            <textarea
              className="form-control"
              id="description"
              rows={3}
              placeholder="Anmerkungen zu Schaeden, empfohlenen Massnahmen oder Standortmerkmalen"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="col-12">
              <div className="alert alert-danger mb-0" role="alert">
                {error}
              </div>
            </div>
          )}

          {!error && !isSubmitting && (
            <div className="col-12">
              <small className="text-muted">
                Bewerten Sie Stabilitaet und Schaedigungsgrad ueber die Regler und speichern Sie die
                Kontrolle.
              </small>
            </div>
          )}

          <div className="col-12 d-flex justify-content-end">
            <button type="submit" className="btn btn-success" disabled={isSubmitting}>
              {isSubmitting ? 'Wird gespeichert...' : 'Kontrolle speichern'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default InspectionForm;
