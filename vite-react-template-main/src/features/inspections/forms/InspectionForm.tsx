import React, { useEffect, useState } from 'react';
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
  DEVELOPMENTAL_STAGE_OPTIONS,
  stemBaseCheckboxes,
  trunkCheckboxes,
} from './inspectionFormConfig';
import { InspectionSection, ScoreSlider } from './InspectionFormSections';
import type { ArboriculturalMeasure } from '@/entities/arboriculturalMeasure';
import { mapMeasuresFromApi } from '@/entities/arboriculturalMeasure';

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
  const [measures, setMeasures] = useState<ArboriculturalMeasure[]>([]);
  const [selectedMeasureIds, setSelectedMeasureIds] = useState<number[]>([]);
  const [measuresLoading, setMeasuresLoading] = useState(false);
  const [measuresError, setMeasuresError] = useState<string | null>(null);
  const [newMeasure, setNewMeasure] = useState<{ name: string; description: string }>({ name: '', description: '' });
  const [isCreatingMeasure, setIsCreatingMeasure] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMeasures = async () => {
      setMeasuresLoading(true);
      setMeasuresError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/ArboriculturalMeasures/GetAll`, {
          headers: {
            Authorization: `bearer ${localStorage.getItem('token') || ''}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to load measures');
        }
        const data = await response.json();
        setMeasures(mapMeasuresFromApi(data));
      } catch (loadError) {
        console.error('Error loading measures:', loadError);
        setMeasuresError('Massnahmen konnten nicht geladen werden.');
      } finally {
        setMeasuresLoading(false);
      }
    };
    loadMeasures();
  }, []);

  const updateFormField = <K extends keyof FormFields>(key: K, value: FormFields[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleSection = (key: keyof OpenSectionsState) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const resetForm = () => {
    setForm(createInitialFormFields());
    setCrownInspection(createInitialCrownInspection());
    setTrunkInspection(createInitialTrunkInspection());
    setStemBaseInspection(createInitialStemBaseInspection());
    setSelectedMeasureIds([]);
  };

  const buildPayload = () => ({
    treeId,
    ...form,
    developmentalStage: form.developmentalStage.trim(),
    description: form.description.trim(),
    crownInspection: { ...crownInspection, notes: crownInspection.notes.trim() },
    trunkInspection: { ...trunkInspection, notes: trunkInspection.notes.trim() },
    stemBaseInspection: { ...stemBaseInspection, notes: stemBaseInspection.notes.trim() },
    arboriculturalMeasureIds: selectedMeasureIds,
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
              Kontrollintervall (Monate)
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
            <select
              className="form-select"
              id="developmentalStage"
              value={developmentalStage}
              onChange={(event) => updateFormField('developmentalStage', event.target.value)}
              disabled={isSubmitting}
            >
              {DEVELOPMENTAL_STAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
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
                <div>
                  <div className="fw-semibold">Baumpflegerische Massnahmen</div>
                  <small className="text-muted">Mehrere Massnahmen waehlen oder neue erfassen.</small>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success"
                  onClick={async () => {
                    setIsCreatingMeasure(true);
                  }}
                  disabled={isSubmitting}
                >
                  + Neue Massnahme
                </button>
              </div>
              {measuresError && <div className="alert alert-danger py-2 mb-2">{measuresError}</div>}
              {measuresLoading ? (
                <p className="text-muted small mb-0">Massnahmen werden geladen...</p>
              ) : (
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-2">
                  {measures.map((measure) => {
                    const checked = selectedMeasureIds.includes(measure.id);
                    return (
                      <div className="col" key={measure.id}>
                        <label className="border rounded-3 p-2 d-block h-100">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`measure-${measure.id}`}
                              checked={checked}
                              onChange={(e) => {
                                setSelectedMeasureIds((prev) =>
                                  e.target.checked ? Array.from(new Set([...prev, measure.id])) : prev.filter((id) => id !== measure.id),
                                );
                              }}
                              disabled={isSubmitting}
                            />
                            <span className="ms-2 fw-semibold">{measure.measureName}</span>
                          </div>
                          {measure.description ? (
                            <div className="text-muted small mt-1">{measure.description}</div>
                          ) : (
                            <div className="text-muted small mt-1">Keine Beschreibung</div>
                          )}
                        </label>
                      </div>
                    );
                  })}
                  {measures.length === 0 && <div className="col text-muted small">Keine Massnahmen vorhanden.</div>}
                </div>
              )}

              {isCreatingMeasure && (
                <div className="mt-3 border-top pt-3">
                  <div className="fw-semibold mb-2">Neue Massnahme anlegen</div>
                  <div className="row g-2">
                    <div className="col-12 col-md-5">
                      <label htmlFor="newMeasureName" className="form-label small">
                        Name *
                      </label>
                      <input
                        id="newMeasureName"
                        className="form-control form-control-sm"
                        value={newMeasure.name}
                        onChange={(e) => setNewMeasure((prev) => ({ ...prev, name: e.target.value }))}
                        maxLength={120}
                        disabled={isSubmitting}
                        placeholder="z. B. Kronensicherung"
                        required
                      />
                    </div>
                    <div className="col-12 col-md-7">
                      <label htmlFor="newMeasureDescription" className="form-label small">
                        Beschreibung (optional)
                      </label>
                      <input
                        id="newMeasureDescription"
                        className="form-control form-control-sm"
                        value={newMeasure.description}
                        onChange={(e) => setNewMeasure((prev) => ({ ...prev, description: e.target.value }))}
                        maxLength={300}
                        disabled={isSubmitting}
                        placeholder="Kurzbeschreibung"
                      />
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-success"
                      disabled={isSubmitting || !newMeasure.name.trim()}
                      onClick={async () => {
                        try {
                          setIsSubmitting(true);
                          const response = await fetch(`${API_BASE_URL}/api/ArboriculturalMeasures/Create`, {
                            method: 'POST',
                            headers: {
                              Authorization: `bearer ${localStorage.getItem('token') || ''}`,
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              measureName: newMeasure.name.trim(),
                              description: newMeasure.description.trim(),
                            }),
                          });
                          if (!response.ok) {
                            throw new Error('Create measure failed');
                          }
                          setNewMeasure({ name: '', description: '' });
                          setIsCreatingMeasure(false);
                          // Reload measures and select the new one
                          setMeasuresLoading(true);
                          const reload = await fetch(`${API_BASE_URL}/api/ArboriculturalMeasures/GetAll`, {
                            headers: { Authorization: `bearer ${localStorage.getItem('token') || ''}` },
                          });
                          if (!reload.ok) {
                            throw new Error('Reload measures failed');
                          }
                          const data = await reload.json();
                          const mapped = mapMeasuresFromApi(data);
                          setMeasures(mapped);
                          if (mapped.length > 0) {
                            const newest = mapped[mapped.length - 1];
                            setSelectedMeasureIds((prev) => Array.from(new Set([...prev, newest.id])));
                          }
                        } catch (createError) {
                          console.error('Error creating measure:', createError);
                          setMeasuresError('Massnahme konnte nicht angelegt werden.');
                        } finally {
                          setIsSubmitting(false);
                          setMeasuresLoading(false);
                        }
                      }}
                    >
                      Speichern
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => {
                        setIsCreatingMeasure(false);
                        setNewMeasure({ name: '', description: '' });
                      }}
                      disabled={isSubmitting}
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
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
