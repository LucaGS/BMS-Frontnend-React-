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
import { InspectionSection } from './InspectionFormSections';
import type { ArboriculturalMeasure } from '@/entities/arboriculturalMeasure';
import { mapMeasuresFromApi } from '@/entities/arboriculturalMeasure';
import { normalizeVitality, VITALITY_OPTIONS } from '@/entities/inspection';
import { authFetch } from '@/shared/lib/auth';

type InspectionFormProps = {
  treeId: number;
  onInspectionCreated?: () => void;
};

const createInitialOpenSections = (): OpenSectionsState => ({
  crown: false,
  trunk: false,
  stemBase: false,
});

const InspectionForm: React.FC<InspectionFormProps> = ({ treeId, onInspectionCreated }) => {
  const [form, setForm] = useState<FormFields>(createInitialFormFields());
  const [crownInspection, setCrownInspection] = useState<CrownInspectionState>(createInitialCrownInspection());
  const [trunkInspection, setTrunkInspection] = useState<TrunkInspectionState>(createInitialTrunkInspection());
  const [stemBaseInspection, setStemBaseInspection] = useState<StemBaseInspectionState>(createInitialStemBaseInspection());
  const [openSections, setOpenSections] = useState<OpenSectionsState>(createInitialOpenSections());
  const [measures, setMeasures] = useState<ArboriculturalMeasure[]>([]);
  const [selectedMeasureIds, setSelectedMeasureIds] = useState<number[]>([]);
  const [measuresLoading, setMeasuresLoading] = useState(false);
  const [measuresError, setMeasuresError] = useState<string | null>(null);
  const [newMeasure, setNewMeasure] = useState<{ name: string; description: string }>({ name: '', description: '' });
  const [isCreatingMeasure, setIsCreatingMeasure] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [stepError, setStepError] = useState<string | null>(null);
  const [canSubmitOnStepThree, setCanSubmitOnStepThree] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState<'tree' | 'global' | null>(null);
  const [prefillMessage, setPrefillMessage] = useState<string | null>(null);
  const [prefillError, setPrefillError] = useState<string | null>(null);

  useEffect(() => {
    if (currentStep !== 3) {
      setCanSubmitOnStepThree(false);
      return;
    }

    // Prevent accidental submit on the same tap that switches from step 2 to step 3.
    const timer = window.setTimeout(() => {
      setCanSubmitOnStepThree(true);
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [currentStep]);

  useEffect(() => {
    const loadMeasures = async () => {
      setMeasuresLoading(true);
      setMeasuresError(null);
      try {
        const response = await authFetch(`${API_BASE_URL}/api/ArboriculturalMeasures/GetAll`);
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
    setOpenSections(createInitialOpenSections());
    setSelectedMeasureIds([]);
    setCurrentStep(1);
    setStepError(null);
    setPrefillMessage(null);
    setPrefillError(null);
  };

  const toDateTimeLocalValue = (value: string | null | undefined): string => {
    if (!value) {
      return '';
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    const timezoneOffset = parsedDate.getTimezoneOffset();
    const localDate = new Date(parsedDate.getTime() - timezoneOffset * 60_000);
    return localDate.toISOString().slice(0, 16);
  };

  const getMostRecentInspection = (inspections: any[]): any | null => {
    if (!Array.isArray(inspections) || inspections.length === 0) {
      return null;
    }

    return [...inspections].sort((a, b) => {
      const dateA = new Date(a?.performedAt ?? a?.date ?? 0).getTime();
      const dateB = new Date(b?.performedAt ?? b?.date ?? 0).getTime();
      if (dateA !== dateB) {
        return dateB - dateA;
      }

      const idA = typeof a?.id === 'number' ? a.id : 0;
      const idB = typeof b?.id === 'number' ? b.id : 0;
      return idB - idA;
    })[0];
  };

  const mergeSectionFromInspection = <T extends { notes: string }>(
    inspectionSection: unknown,
    createInitialState: () => T,
    setSectionState: React.Dispatch<React.SetStateAction<T>>,
  ) => {
    const initialState = createInitialState();
    const source = (inspectionSection ?? {}) as Record<string, unknown>;
    const mergedState = { ...initialState } as Record<string, unknown>;

    Object.keys(initialState).forEach((key) => {
      const initialValue = (initialState as Record<string, unknown>)[key];
      const nextValue = source[key];

      if (typeof initialValue === 'boolean') {
        mergedState[key] = typeof nextValue === 'boolean' ? nextValue : initialValue;
        return;
      }

      if (typeof initialValue === 'string') {
        mergedState[key] = typeof nextValue === 'string' ? nextValue : initialValue;
      }
    });

    setSectionState(mergedState as T);
  };

  const hasSectionContent = (section: Record<string, unknown>): boolean =>
    Object.entries(section).some(([key, value]) => {
      if (key === 'notes' || key.endsWith('Description')) {
        return typeof value === 'string' && value.trim().length > 0;
      }
      return value === true;
    });

  const applyInspectionPrefill = (inspectionData: any, sourceLabel: string) => {
    const crown = inspectionData?.crownInspection ?? inspectionData?.crown ?? {};
    const trunk = inspectionData?.trunkInspection ?? inspectionData?.trunk ?? {};
    const stemBase = inspectionData?.stemBaseInspection ?? inspectionData?.stemBase ?? inspectionData?.root ?? {};

    setForm((prev) => ({
      ...prev,
      performedAt: toDateTimeLocalValue(inspectionData?.performedAt ?? inspectionData?.date) || prev.performedAt,
      isSafeForTraffic:
        typeof inspectionData?.isSafeForTraffic === 'boolean'
          ? inspectionData.isSafeForTraffic
          : prev.isSafeForTraffic,
      newInspectionIntervall:
        typeof inspectionData?.newInspectionIntervall === 'number'
          ? inspectionData.newInspectionIntervall
          : prev.newInspectionIntervall,
      developmentalStage:
        typeof inspectionData?.developmentalStage === 'string'
          ? inspectionData.developmentalStage
          : prev.developmentalStage,
      vitality: normalizeVitality(inspectionData?.vitality),
      description: typeof inspectionData?.description === 'string' ? inspectionData.description : prev.description,
    }));

    mergeSectionFromInspection(crown, createInitialCrownInspection, setCrownInspection);
    mergeSectionFromInspection(trunk, createInitialTrunkInspection, setTrunkInspection);
    mergeSectionFromInspection(stemBase, createInitialStemBaseInspection, setStemBaseInspection);

    if (Array.isArray(inspectionData?.arboriculturalMeasureIds)) {
      setSelectedMeasureIds(inspectionData.arboriculturalMeasureIds.filter((id: unknown) => typeof id === 'number'));
    }

    const crownHasData = hasSectionContent(crown as Record<string, unknown>);
    const trunkHasData = hasSectionContent(trunk as Record<string, unknown>);
    const stemBaseHasData = hasSectionContent(stemBase as Record<string, unknown>);
    setOpenSections({
      crown: crownHasData,
      trunk: trunkHasData,
      stemBase: stemBaseHasData,
    });

    setCurrentStep(1);
    setStepError(null);
    setPrefillError(null);
    setPrefillMessage(`Daten wurden aus ${sourceLabel} übernommen.`);
  };

  const fetchInspectionDetailsById = async (id: number): Promise<any | null> => {
    const response = await authFetch(`${API_BASE_URL}/api/Inspections/${id}`);
    if (!response.ok) {
      return null;
    }
    return response.json();
  };

  const handlePrefillFromTreeLatest = async () => {
    setPrefillLoading('tree');
    setPrefillError(null);
    setPrefillMessage(null);

    try {
      const listResponse = await authFetch(`${API_BASE_URL}/api/Inspections/ByTreeId/${treeId}`);
      if (!listResponse.ok) {
        throw new Error('Tree inspections unavailable');
      }

      const listData = await listResponse.json();
      const latestInspection = getMostRecentInspection(Array.isArray(listData) ? listData : []);
      if (!latestInspection) {
        setPrefillError('Für diesen Baum ist noch keine Kontrolle vorhanden.');
        return;
      }

      const detailedInspection =
        typeof latestInspection.id === 'number'
          ? (await fetchInspectionDetailsById(latestInspection.id)) ?? latestInspection
          : latestInspection;

      applyInspectionPrefill(detailedInspection, 'der letzten Kontrolle dieses Baums');
    } catch (prefillLoadError) {
      console.error('Error prefilling from latest tree inspection:', prefillLoadError);
      setPrefillError('Die letzte Baumkontrolle konnte nicht geladen werden.');
    } finally {
      setPrefillLoading(null);
    }
  };

  const handlePrefillFromGlobalLatest = async () => {
    setPrefillLoading('global');
    setPrefillError(null);
    setPrefillMessage(null);

    try {
      let latestInspection: any | null = null;

      const latestResponse = await authFetch(`${API_BASE_URL}/api/Inspections/GetLastCreatedInspection`);
      if (latestResponse.ok) {
        latestInspection = await latestResponse.json();
      }

      if (!latestInspection) {
        const allResponse = await authFetch(`${API_BASE_URL}/api/Inspections/GetAll`);
        if (!allResponse.ok) {
          throw new Error('Global inspections unavailable');
        }
        const allData = await allResponse.json();
        latestInspection = getMostRecentInspection(Array.isArray(allData) ? allData : []);
      }

      if (!latestInspection) {
        setPrefillError('Es ist noch keine Kontrolle vorhanden.');
        return;
      }

      const detailedInspection =
        typeof latestInspection.id === 'number'
          ? (await fetchInspectionDetailsById(latestInspection.id)) ?? latestInspection
          : latestInspection;

      applyInspectionPrefill(detailedInspection, 'der insgesamt letzten Kontrolle');
    } catch (prefillLoadError) {
      console.error('Error prefilling from latest global inspection:', prefillLoadError);
      setPrefillError('Die insgesamt letzte Kontrolle konnte nicht geladen werden.');
    } finally {
      setPrefillLoading(null);
    }
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

    if (currentStep !== 3 || !canSubmitOnStepThree) {
      setCurrentStep(3);
      setStepError('Bitte Angaben in Schritt 3 prüfen und dann speichern.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setStepError(null);

    try {
      const payload = buildPayload();
      const requestUrl = `${API_BASE_URL}/api/Inspections/Create`;

      const response = await authFetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create inspection');
      }

      onInspectionCreated?.();
      alert('Kontrolle erfolgreich hinzugefügt');
      resetForm();
    } catch (error) {
      console.error('Error creating inspection:', error);
      setError('Fehler beim Hinzufügen der Kontrolle.');
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

  const canGoNextFromStepOne = performedAt.trim().length > 0;

  const stepLabel =
    currentStep === 1 ? 'Basisdaten' : currentStep === 2 ? 'Befunde' : 'Massnahmen';

  const handleNextStep = () => {
    if (currentStep === 1 && !canGoNextFromStepOne) {
      setStepError('Bitte zuerst ein Kontrolldatum erfassen.');
      return;
    }

    setStepError(null);
    setCurrentStep((prev) => (prev === 3 ? prev : ((prev + 1) as 1 | 2 | 3)));
  };

  const handlePreviousStep = () => {
    setStepError(null);
    setCurrentStep((prev) => (prev === 1 ? prev : ((prev - 1) as 1 | 2 | 3)));
  };

  return (
    <form onSubmit={handleSubmit} className="card shadow-sm border-0 mt-3 inspection-form">
      <div className="card-body">
        <div className="border rounded-3 p-3 bg-light mb-3">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
            <div>
              <div className="fw-semibold">Daten übernehmen</div>
              <small className="text-muted">
                Wähle aus, ob Werte aus der letzten Baumkontrolle oder der insgesamt letzten Kontrolle übernommen werden sollen.
              </small>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={handlePrefillFromTreeLatest}
                disabled={isSubmitting || prefillLoading !== null}
              >
                {prefillLoading === 'tree' ? 'Lade...' : 'Letzte Kontrolle dieses Baums'}
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={handlePrefillFromGlobalLatest}
                disabled={isSubmitting || prefillLoading !== null}
              >
                {prefillLoading === 'global' ? 'Lade...' : 'Insgesamt letzte Kontrolle'}
              </button>
            </div>
          </div>
          {prefillMessage && <div className="text-success small mt-2">{prefillMessage}</div>}
          {prefillError && <div className="text-danger small mt-2">{prefillError}</div>}
        </div>

        <div className="inspection-stepper mb-3" role="tablist" aria-label="Schritte Kontrolle erfassen">
          <button
            type="button"
            className={`inspection-stepper__step${currentStep === 1 ? ' inspection-stepper__step--active' : ''}`}
            onClick={() => setCurrentStep(1)}
          >
            1 Basis
          </button>
          <button
            type="button"
            className={`inspection-stepper__step${currentStep === 2 ? ' inspection-stepper__step--active' : ''}`}
            onClick={() => setCurrentStep(2)}
          >
            2 Befunde
          </button>
          <button
            type="button"
            className={`inspection-stepper__step${currentStep === 3 ? ' inspection-stepper__step--active' : ''}`}
            onClick={() => setCurrentStep(3)}
          >
            3 Abschluss
          </button>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="text-muted small">Schritt {currentStep} von 3</div>
          <span className="badge text-bg-light border">{stepLabel}</span>
        </div>

        <div className="row g-3">
          {currentStep === 1 && (
            <>
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
            {!canGoNextFromStepOne && (
              <small className="text-danger d-block mt-1">Kontrolldatum ist erforderlich.</small>
            )}
            <small className="text-muted">Wann wurde die Kontrolle durchgeführt?</small>
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
            <small className="text-muted">Nächste Kontrolle empfohlen in ... Tagen.</small>
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

          <div className="col-md-6">
            <label htmlFor="vitality" className="form-label">
              Vitalität
            </label>
            <select
              className="form-select"
              id="vitality"
              value={vitality}
              onChange={(event) => updateFormField('vitality', event.target.value as FormFields['vitality'])}
              disabled={isSubmitting}
            >
              {VITALITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <small className="text-muted">Vitalität anhand von fünf Stufen wählen.</small>
          </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <InspectionSection
                sectionKey="crown"
                title="Kronen"
                badge="Krone"
                description="Schnell erfassbare Mängel in der Krone über markante Checkboxen."
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
                title="Stamm"
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
                notesPlaceholder="z. B. Freilegung, Wurzelräume, Fäule ..."
                state={stemBaseInspection}
                setState={setStemBaseInspection}
                items={stemBaseCheckboxes}
                isOpen={openSections.stemBase}
                onToggle={() => toggleSection('stemBase')}
                isSubmitting={isSubmitting}
              />
            </>
          )}

          {currentStep === 3 && (
            <>

          <div className="col-12">
            <div className="border rounded-3 p-3 bg-light">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div className="fw-semibold">Baumpflegerische Massnahmen</div>
                  <small className="text-muted">Mehrere Maßnahmen wählen oder neue erfassen.</small>
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
                          const response = await authFetch(`${API_BASE_URL}/api/ArboriculturalMeasures/Create`, {
                            method: 'POST',
                            headers: {
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
                          const reload = await authFetch(`${API_BASE_URL}/api/ArboriculturalMeasures/GetAll`);
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
              placeholder="Anmerkungen zu Schäden, empfohlenen Maßnahmen oder Standortmerkmalen"
              value={description}
              onChange={(event) => updateFormField('description', event.target.value)}
              disabled={isSubmitting}
            />
          </div>
            </>
          )}

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
                Vitalität und Befunde auswählen und anschließend die Kontrolle speichern.
              </small>
            </div>
          )}

          {stepError && (
            <div className="col-12">
              <div className="alert alert-warning py-2 mb-0" role="alert">
                {stepError}
              </div>
            </div>
          )}

          <div className="col-12">
            <div className="inspection-form__actions d-flex justify-content-between align-items-center gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handlePreviousStep}
                disabled={currentStep === 1 || isSubmitting}
              >
                Zurück
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNextStep}
                  disabled={isSubmitting}
                >
                  Weiter
                </button>
              ) : (
                <button type="submit" className="btn btn-success" disabled={isSubmitting || !canSubmitOnStepThree}>
                  {isSubmitting ? 'Wird gespeichert...' : 'Kontrolle speichern'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default InspectionForm;
