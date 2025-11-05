import React, { useState } from 'react';
import { API_BASE_URL } from '@/shared/config/appConfig';

type InspectionFormProps = {
  treeId: number;
  onInspectionCreated?: () => void;
};

const InspectionForm: React.FC<InspectionFormProps> = ({ treeId, onInspectionCreated }) => {
  const [trafficSafe, setTrafficSafe] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        baumId: treeId,
        verkehrssicher: trafficSafe,
      };
      const requestUrl = `${API_BASE_URL}/Create`;

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          Authorization: `bearer ${localStorage.getItem("token") || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create inspection');
      }

      onInspectionCreated?.();
      alert("Kontrolle erfolgreich hinzugefuegt");
      setTrafficSafe(true);
    } catch (error) {
      console.error('Error creating inspection:', error);
      setError("Fehler beim Hinzufuegen der Kontrolle.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="row g-3 align-items-end mt-3">
      <div className="col-sm-8">
        <label htmlFor="trafficSafe" className="form-label">
          Verkehrssicher
        </label>
        <select
          id="trafficSafe"
          className="form-select"
          value={trafficSafe ? "true" : "false"}
          onChange={(event) => setTrafficSafe(event.target.value === "true")}
          disabled={isSubmitting}
        >
          <option value="true">Ja</option>
          <option value="false">Nein</option>
        </select>
      </div>
      <div className="col-sm-4 d-grid">
        <button type="submit" className="btn btn-success" disabled={isSubmitting}>
          {isSubmitting ? 'Wird gespeichert...' : 'Hinzufuegen'}
        </button>
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
            Bitte waehlen Sie aus, ob der Baum verkehrssicher ist und speichern Sie die Kontrolle.
          </small>
        </div>
      )}
    </form>
  );
};

export default InspectionForm;
