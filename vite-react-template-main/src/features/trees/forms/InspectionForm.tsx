import React, { useState } from 'react';
import { API_BASE_URL } from '@/shared/config/appConfig';

type InspectionFormProps = {
  treeId: number;
  onInspectionCreated?: () => void;
};

type CrownInspectionState = {
  notes: string;
  abioticDisturbance: boolean;
  dying: boolean;
  overloadedBranchOrCrown: boolean;
  branchBreak: boolean;
  branchBreakWound: boolean;
  pruningWound: boolean;
  exudation: boolean;
  treeInGroup: boolean;
  treeIsDead: boolean;
  foreignVegetation: boolean;
  bioticDisturbance: boolean;
  lightningDamage: boolean;
  deformed: boolean;
  compressionFork: boolean;
  dryBranches: boolean;
  includedBark: boolean;
  oneSidedCrown: boolean;
  foreignObject: boolean;
  topped: boolean;
  habitatStructure: boolean;
  resinFlow: boolean;
  cavity: boolean;
  competingBranch: boolean;
  competingTree: boolean;
  canker: boolean;
  crownSecured: boolean;
  longitudinalCrack: boolean;
  clearanceProfile2_50m: boolean;
  clearanceProfile4_50m: boolean;
  burl: boolean;
  openDecay: boolean;
  withoutLeaderShoot: boolean;
  fungalFruitingBody: boolean;
  rubbingBranches: boolean;
  slimeFlux: boolean;
  secondaryCrowns: boolean;
  woodpeckerHole: boolean;
  compressionDamage: boolean;
  torsionCrack: boolean;
  deadwood: boolean;
  widowmakerBranch: boolean;
  unfavorableCrownDevelopment: boolean;
  graftPoint: boolean;
  utilityLineConflict: boolean;
  topDieback: boolean;
  wound: boolean;
  woundWithCallusRidge: boolean;
  woundCallusClosed: boolean;
  tensionFork: boolean;
  forkedCrown: boolean;
  forkCrack: boolean;
};

type TrunkInspectionState = {
  notes: string;
  abioticDisturbance: boolean;
  branchBreakWound: boolean;
  pruningWound: boolean;
  exudation: boolean;
  treeRemoved: boolean;
  bulgeOrSwelling: boolean;
  foreignVegetation: boolean;
  bioticDisturbance: boolean;
  lightningDamage: boolean;
  leavesBrokenOff: boolean;
  deformed: boolean;
  spiralGrain: boolean;
  compressionFork: boolean;
  includedBark: boolean;
  foreignObject: boolean;
  topped: boolean;
  habitatStructures: boolean;
  resinFlow: boolean;
  cavity: boolean;
  canker: boolean;
  longitudinalCrack: boolean;
  mowingDamage: boolean;
  burl: boolean;
  openDecay: boolean;
  fungalFruitingBody: boolean;
  leaning: boolean;
  slimeFlux: boolean;
  secondaryRadialGrowthMissing: boolean;
  woodpeckerHole: boolean;
  compressionDamage: boolean;
  torsionCrack: boolean;
  deadwood: boolean;
  widowmakerBranch: boolean;
  graftPoint: boolean;
  supplyShadow: boolean;
  wobbles: boolean;
  wound: boolean;
  woundCallusRidge: boolean;
  woundCallusClosed: boolean;
  tensionFork: boolean;
  forkedTrunk: boolean;
  forkCrack: boolean;
};

type StemBaseInspectionState = {
  notes: string;
  excavation: boolean;
  adventitiousRootFormation: boolean;
  exudation: boolean;
  structuresAtStemBase: boolean;
  structuresNearTree: boolean;
  bulgeOrSwelling: boolean;
  foreignVegetation: boolean;
  boreDust: boolean;
  bottleneck: boolean;
  foreignObject: boolean;
  habitatStructures: boolean;
  treeOnSlope: boolean;
  resinFlow: boolean;
  cavity: boolean;
  canker: boolean;
  openDecay: boolean;
  fungalFruitingBody: boolean;
  slimeFlux: boolean;
  stemBaseThickened: boolean;
  compressionDamage: boolean;
  overfilled: boolean;
  graftPoint: boolean;
  girdlingRoot: boolean;
  rootDamage: boolean;
};

type ToggleField<T extends { notes: string }> = { key: Exclude<keyof T, 'notes'>; label: string };

const crownCheckboxes: ToggleField<CrownInspectionState>[] = [
  { key: 'abioticDisturbance', label: 'Abiotische Stoerung (Krone)' },
  { key: 'dying', label: 'Absterbend (Krone)' },
  { key: 'overloadedBranchOrCrown', label: 'Ueberlastete Krone/Ast (Krone)' },
  { key: 'branchBreak', label: 'Astbruch (Krone)' },
  { key: 'branchBreakWound', label: 'Astbruchwunde (Krone)' },
  { key: 'pruningWound', label: 'Schnittwunde (Krone)' },
  { key: 'exudation', label: 'Exsudation (Krone)' },
  { key: 'treeInGroup', label: 'Baum in Gruppe (Krone)' },
  { key: 'treeIsDead', label: 'Baum tot (Krone)' },
  { key: 'foreignVegetation', label: 'Fremdbewuchs (Krone)' },
  { key: 'bioticDisturbance', label: 'Biotische Stoerung (Krone)' },
  { key: 'lightningDamage', label: 'Blitzschaden (Krone)' },
  { key: 'deformed', label: 'Verformt (Krone)' },
  { key: 'compressionFork', label: 'Druckzwiesel (Krone)' },
  { key: 'dryBranches', label: 'Trockenaste (Krone)' },
  { key: 'includedBark', label: 'Eingewachsene Rinde (Krone)' },
  { key: 'oneSidedCrown', label: 'Einseitige Krone (Krone)' },
  { key: 'foreignObject', label: 'Fremdkoerper (Krone)' },
  { key: 'topped', label: 'Kappung (Krone)' },
  { key: 'habitatStructure', label: 'Habitatstruktur (Krone)' },
  { key: 'resinFlow', label: 'Harzfluss (Krone)' },
  { key: 'cavity', label: 'Hoehlung (Krone)' },
  { key: 'competingBranch', label: 'Konkurrenzast (Krone)' },
  { key: 'competingTree', label: 'Konkurrenzbaum (Krone)' },
  { key: 'canker', label: 'Krebs (Krone)' },
  { key: 'crownSecured', label: 'Krone gesichert (Krone)' },
  { key: 'longitudinalCrack', label: 'Laengsriss (Krone)' },
  { key: 'clearanceProfile2_50m', label: 'Lichtraumprofil 2.50m (Krone)' },
  { key: 'clearanceProfile4_50m', label: 'Lichtraumprofil 4.50m (Krone)' },
  { key: 'burl', label: 'Maserknolle/Burl (Krone)' },
  { key: 'openDecay', label: 'Offene Faeule (Krone)' },
  { key: 'withoutLeaderShoot', label: 'Ohne Leittrieb (Krone)' },
  { key: 'fungalFruitingBody', label: 'Fruchtkoerper (Krone)' },
  { key: 'rubbingBranches', label: 'Reibende Aeste (Krone)' },
  { key: 'slimeFlux', label: 'Schleimfluss (Krone)' },
  { key: 'secondaryCrowns', label: 'Sekundaerkronen (Krone)' },
  { key: 'woodpeckerHole', label: 'Spechthoehle (Krone)' },
  { key: 'compressionDamage', label: 'Druckschaeden (Krone)' },
  { key: 'torsionCrack', label: 'Torsionsriss (Krone)' },
  { key: 'deadwood', label: 'Totholz (Krone)' },
  { key: 'widowmakerBranch', label: 'Stoererast/Widowmaker (Krone)' },
  { key: 'unfavorableCrownDevelopment', label: 'Unguenstige Kronenentwicklung (Krone)' },
  { key: 'graftPoint', label: 'Veredlungsstelle (Krone)' },
  { key: 'utilityLineConflict', label: 'Konflikt mit Leitung (Krone)' },
  { key: 'topDieback', label: 'Spitzenduerr (Krone)' },
  { key: 'wound', label: 'Wunde (Krone)' },
  { key: 'woundWithCallusRidge', label: 'Wunde mit Kallusrand (Krone)' },
  { key: 'woundCallusClosed', label: 'Wunde geschlossen (Krone)' },
  { key: 'tensionFork', label: 'Zugzwiesel (Krone)' },
  { key: 'forkedCrown', label: 'Gabelkrone (Krone)' },
  { key: 'forkCrack', label: 'Zwieselriss (Krone)' },
];

const trunkCheckboxes: ToggleField<TrunkInspectionState>[] = [
  { key: 'abioticDisturbance', label: 'Abiotische Stoerung (Stamm)' },
  { key: 'branchBreakWound', label: 'Astbruchwunde (Stamm)' },
  { key: 'pruningWound', label: 'Schnittwunde (Stamm)' },
  { key: 'exudation', label: 'Exsudation (Stamm)' },
  { key: 'treeRemoved', label: 'Baum entfernt (Stamm)' },
  { key: 'bulgeOrSwelling', label: 'Beule/Schwellung (Stamm)' },
  { key: 'foreignVegetation', label: 'Fremdbewuchs (Stamm)' },
  { key: 'bioticDisturbance', label: 'Biotische Stoerung (Stamm)' },
  { key: 'lightningDamage', label: 'Blitzschaden (Stamm)' },
  { key: 'leavesBrokenOff', label: 'Blatt-/Nadelbruch (Stamm)' },
  { key: 'deformed', label: 'Verformt (Stamm)' },
  { key: 'spiralGrain', label: 'Drehwuchs (Stamm)' },
  { key: 'compressionFork', label: 'Druckzwiesel (Stamm)' },
  { key: 'includedBark', label: 'Eingewachsene Rinde (Stamm)' },
  { key: 'foreignObject', label: 'Fremdkoerper (Stamm)' },
  { key: 'topped', label: 'Kappung (Stamm)' },
  { key: 'habitatStructures', label: 'Habitatstrukturen (Stamm)' },
  { key: 'resinFlow', label: 'Harzfluss (Stamm)' },
  { key: 'cavity', label: 'Hoehlung (Stamm)' },
  { key: 'canker', label: 'Krebs (Stamm)' },
  { key: 'longitudinalCrack', label: 'Laengsriss (Stamm)' },
  { key: 'mowingDamage', label: 'Mahdschaeden (Stamm)' },
  { key: 'burl', label: 'Maserknolle/Burl (Stamm)' },
  { key: 'openDecay', label: 'Offene Faeule (Stamm)' },
  { key: 'fungalFruitingBody', label: 'Fruchtkoerper (Stamm)' },
  { key: 'leaning', label: 'Geneigt (Stamm)' },
  { key: 'slimeFlux', label: 'Schleimfluss (Stamm)' },
  { key: 'secondaryRadialGrowthMissing', label: 'Sekundaeres Dickenwachstum fehlt (Stamm)' },
  { key: 'woodpeckerHole', label: 'Spechthoehle (Stamm)' },
  { key: 'compressionDamage', label: 'Druckschaeden (Stamm)' },
  { key: 'torsionCrack', label: 'Torsionsriss (Stamm)' },
  { key: 'deadwood', label: 'Totholz (Stamm)' },
  { key: 'widowmakerBranch', label: 'Stoererast/Widowmaker (Stamm)' },
  { key: 'graftPoint', label: 'Veredlungsstelle (Stamm)' },
  { key: 'supplyShadow', label: 'Versorgungsschatten (Stamm)' },
  { key: 'wobbles', label: 'Wackelt (Stamm)' },
  { key: 'wound', label: 'Wunde (Stamm)' },
  { key: 'woundCallusRidge', label: 'Wunde mit Kallusrand (Stamm)' },
  { key: 'woundCallusClosed', label: 'Wunde geschlossen (Stamm)' },
  { key: 'tensionFork', label: 'Zugzwiesel (Stamm)' },
  { key: 'forkedTrunk', label: 'Gabelstamm (Stamm)' },
  { key: 'forkCrack', label: 'Zwieselriss (Stamm)' },
];

const stemBaseCheckboxes: ToggleField<StemBaseInspectionState>[] = [
  { key: 'excavation', label: 'Freilegung (Stammfuss)' },
  { key: 'adventitiousRootFormation', label: 'Adventivwurzelbildung (Stammfuss)' },
  { key: 'exudation', label: 'Exsudation (Stammfuss)' },
  { key: 'structuresAtStemBase', label: 'Strukturen am Stammfuss (Stammfuss)' },
  { key: 'structuresNearTree', label: 'Strukturen in der Naehe (Stammfuss)' },
  { key: 'bulgeOrSwelling', label: 'Beule/Schwellung (Stammfuss)' },
  { key: 'foreignVegetation', label: 'Fremdbewuchs (Stammfuss)' },
  { key: 'boreDust', label: 'Bohrmehl (Stammfuss)' },
  { key: 'bottleneck', label: 'Engstelle (Stammfuss)' },
  { key: 'foreignObject', label: 'Fremdkoerper (Stammfuss)' },
  { key: 'habitatStructures', label: 'Habitatstrukturen (Stammfuss)' },
  { key: 'treeOnSlope', label: 'Baum am Hang (Stammfuss)' },
  { key: 'resinFlow', label: 'Harzfluss (Stammfuss)' },
  { key: 'cavity', label: 'Hoehlung (Stammfuss)' },
  { key: 'canker', label: 'Krebs (Stammfuss)' },
  { key: 'openDecay', label: 'Offene Faeule (Stammfuss)' },
  { key: 'fungalFruitingBody', label: 'Fruchtkoerper (Stammfuss)' },
  { key: 'slimeFlux', label: 'Schleimfluss (Stammfuss)' },
  { key: 'stemBaseThickened', label: 'Stammfuss verdickt (Stammfuss)' },
  { key: 'compressionDamage', label: 'Druckschaeden (Stammfuss)' },
  { key: 'overfilled', label: 'Aufgefuellt (Stammfuss)' },
  { key: 'graftPoint', label: 'Veredlungsstelle (Stammfuss)' },
  { key: 'girdlingRoot', label: 'Wuergewurzel (Stammfuss)' },
  { key: 'rootDamage', label: 'Wurzelschaeden (Stammfuss)' },
];

const getDefaultPerformedAt = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

const createInitialCrownInspection = (): CrownInspectionState => ({
  notes: '',
  abioticDisturbance: false,
  dying: false,
  overloadedBranchOrCrown: false,
  branchBreak: false,
  branchBreakWound: false,
  pruningWound: false,
  exudation: false,
  treeInGroup: false,
  treeIsDead: false,
  foreignVegetation: false,
  bioticDisturbance: false,
  lightningDamage: false,
  deformed: false,
  compressionFork: false,
  dryBranches: false,
  includedBark: false,
  oneSidedCrown: false,
  foreignObject: false,
  topped: false,
  habitatStructure: false,
  resinFlow: false,
  cavity: false,
  competingBranch: false,
  competingTree: false,
  canker: false,
  crownSecured: false,
  longitudinalCrack: false,
  clearanceProfile2_50m: false,
  clearanceProfile4_50m: false,
  burl: false,
  openDecay: false,
  withoutLeaderShoot: false,
  fungalFruitingBody: false,
  rubbingBranches: false,
  slimeFlux: false,
  secondaryCrowns: false,
  woodpeckerHole: false,
  compressionDamage: false,
  torsionCrack: false,
  deadwood: false,
  widowmakerBranch: false,
  unfavorableCrownDevelopment: false,
  graftPoint: false,
  utilityLineConflict: false,
  topDieback: false,
  wound: false,
  woundWithCallusRidge: false,
  woundCallusClosed: false,
  tensionFork: false,
  forkedCrown: false,
  forkCrack: false,
});

const createInitialTrunkInspection = (): TrunkInspectionState => ({
  notes: '',
  abioticDisturbance: false,
  branchBreakWound: false,
  pruningWound: false,
  exudation: false,
  treeRemoved: false,
  bulgeOrSwelling: false,
  foreignVegetation: false,
  bioticDisturbance: false,
  lightningDamage: false,
  leavesBrokenOff: false,
  deformed: false,
  spiralGrain: false,
  compressionFork: false,
  includedBark: false,
  foreignObject: false,
  topped: false,
  habitatStructures: false,
  resinFlow: false,
  cavity: false,
  canker: false,
  longitudinalCrack: false,
  mowingDamage: false,
  burl: false,
  openDecay: false,
  fungalFruitingBody: false,
  leaning: false,
  slimeFlux: false,
  secondaryRadialGrowthMissing: false,
  woodpeckerHole: false,
  compressionDamage: false,
  torsionCrack: false,
  deadwood: false,
  widowmakerBranch: false,
  graftPoint: false,
  supplyShadow: false,
  wobbles: false,
  wound: false,
  woundCallusRidge: false,
  woundCallusClosed: false,
  tensionFork: false,
  forkedTrunk: false,
  forkCrack: false,
});

const createInitialStemBaseInspection = (): StemBaseInspectionState => ({
  notes: '',
  excavation: false,
  adventitiousRootFormation: false,
  exudation: false,
  structuresAtStemBase: false,
  structuresNearTree: false,
  bulgeOrSwelling: false,
  foreignVegetation: false,
  boreDust: false,
  bottleneck: false,
  foreignObject: false,
  habitatStructures: false,
  treeOnSlope: false,
  resinFlow: false,
  cavity: false,
  canker: false,
  openDecay: false,
  fungalFruitingBody: false,
  slimeFlux: false,
  stemBaseThickened: false,
  compressionDamage: false,
  overfilled: false,
  graftPoint: false,
  girdlingRoot: false,
  rootDamage: false,
});

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
  const [crownInspection, setCrownInspection] = useState<CrownInspectionState>(createInitialCrownInspection());
  const [trunkInspection, setTrunkInspection] = useState<TrunkInspectionState>(createInitialTrunkInspection());
  const [stemBaseInspection, setStemBaseInspection] = useState<StemBaseInspectionState>(
    createInitialStemBaseInspection()
  );
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
        crownInspection: { ...crownInspection, notes: crownInspection.notes.trim() },
        trunkInspection: { ...trunkInspection, notes: trunkInspection.notes.trim() },
        stemBaseInspection: { ...stemBaseInspection, notes: stemBaseInspection.notes.trim() },
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
      setCrownInspection(createInitialCrownInspection());
      setTrunkInspection(createInitialTrunkInspection());
      setStemBaseInspection(createInitialStemBaseInspection());
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

  const renderCheckboxGrid = <T extends { notes: string }>(
    sectionId: string,
    items: ToggleField<T>[],
    state: T,
    onChange: (key: ToggleField<T>['key'], value: boolean) => void
  ) => (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-2">
      {items.map(({ key, label }) => (
        <div className="col" key={`${sectionId}-${String(key)}`}>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id={`${sectionId}-${String(key)}`}
              checked={Boolean(state[key])}
              onChange={(event) => onChange(key, event.target.checked)}
              disabled={isSubmitting}
            />
            <label className="form-check-label" htmlFor={`${sectionId}-${String(key)}`}>
              {label}
            </label>
          </div>
        </div>
      ))}
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

          <div className="col-12">
            <div className="border rounded-3 p-3 bg-light">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="fw-semibold mb-0">Kronenpruefung</p>
                  <small className="text-muted">Notizen und alle zutreffenden Befunde erfassen.</small>
                </div>
                <span className="badge bg-secondary text-uppercase">Krone</span>
              </div>
              <div className="mb-3">
                <label htmlFor="crownNotes" className="form-label">
                  Notizen Krone
                </label>
                <textarea
                  className="form-control"
                  id="crownNotes"
                  rows={2}
                  value={crownInspection.notes}
                  onChange={(event) =>
                    setCrownInspection((prev) => ({ ...prev, notes: event.target.value }))
                  }
                  disabled={isSubmitting}
                  placeholder="z. B. Totholz in oberer Krone, Sicherung vorhanden ..."
                />
              </div>
              {renderCheckboxGrid('crown', crownCheckboxes, crownInspection, (key, value) =>
                setCrownInspection((prev) => ({ ...prev, [key]: value }))
              )}
            </div>
          </div>

          <div className="col-12">
            <div className="border rounded-3 p-3 bg-light">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="fw-semibold mb-0">Stamminspektion</p>
                  <small className="text-muted">Haken setzen fuer alle Beobachtungen am Stamm.</small>
                </div>
                <span className="badge bg-secondary text-uppercase">Stamm</span>
              </div>
              <div className="mb-3">
                <label htmlFor="trunkNotes" className="form-label">
                  Notizen Stamm
                </label>
                <textarea
                  className="form-control"
                  id="trunkNotes"
                  rows={2}
                  value={trunkInspection.notes}
                  onChange={(event) =>
                    setTrunkInspection((prev) => ({ ...prev, notes: event.target.value }))
                  }
                  disabled={isSubmitting}
                  placeholder="z. B. Wundverschluss, Risse, Harzfluss ..."
                />
              </div>
              {renderCheckboxGrid('trunk', trunkCheckboxes, trunkInspection, (key, value) =>
                setTrunkInspection((prev) => ({ ...prev, [key]: value }))
              )}
            </div>
          </div>

          <div className="col-12">
            <div className="border rounded-3 p-3 bg-light">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="fw-semibold mb-0">Stammfuss & Wurzelbereich</p>
                  <small className="text-muted">Befunde am Stammfuss oder Wurzelanlauf markieren.</small>
                </div>
                <span className="badge bg-secondary text-uppercase">Stammfuss</span>
              </div>
              <div className="mb-3">
                <label htmlFor="stemBaseNotes" className="form-label">
                  Notizen Stammfuss
                </label>
                <textarea
                  className="form-control"
                  id="stemBaseNotes"
                  rows={2}
                  value={stemBaseInspection.notes}
                  onChange={(event) =>
                    setStemBaseInspection((prev) => ({ ...prev, notes: event.target.value }))
                  }
                  disabled={isSubmitting}
                  placeholder="z. B. Freilegung, Wurzelraeme, Faeule ..."
                />
              </div>
              {renderCheckboxGrid('stembase', stemBaseCheckboxes, stemBaseInspection, (key, value) =>
                setStemBaseInspection((prev) => ({ ...prev, [key]: value }))
              )}
            </div>
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
