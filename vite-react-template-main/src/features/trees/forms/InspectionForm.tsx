import React, { useState } from 'react';
import { API_BASE_URL } from '@/shared/config/appConfig';
import {
  CrownInspectionState,
  FormFields,
  OpenSectionsState,
  StemBaseInspectionState,
  TrunkInspectionState,
  createInitialCrownInspection,
  createInitialFormFields,
  createInitialStemBaseInspection,
  createInitialTrunkInspection,
  crownCheckboxes,
  stemBaseCheckboxes,
  trunkCheckboxes,
} from './inspectionFormConfig';
import { InspectionSection, ScoreSlider } from './InspectionFormSections';

type InspectionFormProps = {
  treeId: number;
  onInspectionCreated?: () => void;
};

const InspectionForm: React.FC<InspectionFormProps> = ({ treeId, onInspectionCreated }) => {
  const [form, setForm] = useState<FormFields>(createInitialFormFields());
  const [crownInspection, setCrownInspection] = useState<CrownInspectionState>(createInitialCrownInspection());
  const [trunkInspection, setTrunkInspection] = useState<TrunkInspectionState>(createInitialTrunkInspection());
  const [stemBaseInspection, setStemBaseInspection] = useState<StemBaseInspectionState>(createInitialStemBaseInspection());
  const [openSections, setOpenSections] = useState<OpenSectionsState>({
    crown: true,
    trunk: true,
    stemBase: true,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateFormField = <K extends keyof FormFields>(key: K, value: FormFields[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleSection = (key: keyof OpenSectionsState) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const resetForm = () => {
    setForm(createInitialFormFields());
    setCrownInspection(createInitialCrownInspection());
    setTrunkInspection(createInitialTrunkInspection());
    setStemBaseInspection(createInitialStemBaseInspection());
  };

  const buildPayload = () => ({
    treeId,
    ...form,
    developmentalStage: form.developmentalStage.trim(),
    description: form.description.trim(),
    crownInspection: { ...crownInspection, notes: crownInspection.notes.trim() },
    trunkInspection: { ...trunkInspection, notes: trunkInspection.notes.trim() },
    stemBaseInspection: { ...stemBaseInspection, notes: stemBaseInspection.notes.trim() },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = buildPayload();
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
      resetForm();
    } catch (error) {
      console.error('Error creating inspection:', error);
      setError('Fehler beim Hinzufuegen der Kontrolle.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const {
    performedAt,
    isSafeForTraffic,
    newInspectionIntervall,
    developmentalStage,
    damageLevel,
    standStability,
    breakageSafety,
    vitality,
    description,
  } = form;

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
              onChange={(event) => updateFormField('performedAt', event.target.value)}
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
              onChange={(event) => updateFormField('newInspectionIntervall', Number(event.target.value) || 0)}
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
                onChange={(event) => updateFormField('isSafeForTraffic', event.target.checked)}
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
              onChange={(event) => updateFormField('developmentalStage', event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <ScoreSlider
            id="vitality"
            label="Vitalitaet (0-5)"
            value={vitality}
            onChange={(value) => updateFormField('vitality', value)}
            disabled={isSubmitting}
            colClassName="col-md-6"
          />

          <div className="col-12">
            <div className="border rounded-3 p-3 bg-light">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold">Stabilitaet & Schaeden</span>
                <small className="text-muted">0 = keine Auffaelligkeit, 5 = kritisch</small>
              </div>
              <div className="row g-3">
                <ScoreSlider
                  id="damageLevel"
                  label="Schaedigungsgrad"
                  value={damageLevel}
                  onChange={(value) => updateFormField('damageLevel', value)}
                  disabled={isSubmitting}
                />
                <ScoreSlider
                  id="standStability"
                  label="Standfestigkeit"
                  value={standStability}
                  onChange={(value) => updateFormField('standStability', value)}
                  disabled={isSubmitting}
                />
                <ScoreSlider
                  id="breakageSafety"
                  label="Bruchsicherheit"
                  value={breakageSafety}
                  onChange={(value) => updateFormField('breakageSafety', value)}
                  disabled={isSubmitting}
                />
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
              onChange={(event) => updateFormField('description', event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <InspectionSection
            sectionKey="crown"
            title="Kronenpruefung"
            badge="Krone"
            description="Schnell erfassbare Maengel in der Krone ueber markante Checkboxen."
            notesId="crownNotes"
            notesLabel="Notizen Krone"
            notesPlaceholder="z. B. Totholz in oberer Krone, Sicherung vorhanden ..."
            state={crownInspection}
            setState={setCrownInspection}
            items={crownCheckboxes}
            isOpen={openSections.crown}
            onToggle={() => toggleSection('crown')}
            isSubmitting={isSubmitting}
          />

          <InspectionSection
            sectionKey="trunk"
            title="Stamminspektion"
            badge="Stamm"
            description="Alle Beobachtungen am Stamm markieren und dokumentieren."
            notesId="trunkNotes"
            notesLabel="Notizen Stamm"
            notesPlaceholder="z. B. Wundverschluss, Risse, Harzfluss ..."
            state={trunkInspection}
            setState={setTrunkInspection}
            items={trunkCheckboxes}
            isOpen={openSections.trunk}
            onToggle={() => toggleSection('trunk')}
            isSubmitting={isSubmitting}
          />

          <InspectionSection
            sectionKey="stemBase"
            title="Stammfuss & Wurzelbereich"
            badge="Stammfuss"
            description="Befunde am Stammfuss oder im Wurzelanlauf gezielt abhaken."
            notesId="stemBaseNotes"
            notesLabel="Notizen Stammfuss"
            notesPlaceholder="z. B. Freilegung, Wurzelraeme, Faeule ..."
            state={stemBaseInspection}
            setState={setStemBaseInspection}
            items={stemBaseCheckboxes}
            isOpen={openSections.stemBase}
            onToggle={() => toggleSection('stemBase')}
            isSubmitting={isSubmitting}
          />

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
                Bewerten Sie Stabilitaet und Schaedigungsgrad ueber die Regler und speichern Sie die Kontrolle.
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
