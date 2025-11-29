type StringKeys<T> = Extract<keyof T, string>;
type DescriptionKey<T> = T extends Record<string, unknown> ? `${StringKeys<T>}Description` : never;
type ToggleableKey<T> = Exclude<keyof T, 'notes' | DescriptionKey<T>>;

export type ToggleField<T extends { notes: string }> = { key: ToggleableKey<T>; label: string };

type CrownInspectionFlags = {
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

type TrunkInspectionFlags = {
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

type StemBaseInspectionFlags = {
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

type WithDescriptions<T extends Record<string, boolean>> = T & {
  [K in StringKeys<T> as `${K}Description`]: string;
};

export type CrownInspectionState = { notes: string } & WithDescriptions<CrownInspectionFlags>;
export type TrunkInspectionState = { notes: string } & WithDescriptions<TrunkInspectionFlags>;
export type StemBaseInspectionState = { notes: string } & WithDescriptions<StemBaseInspectionFlags>;

const createInitialWithDescriptions = <T extends Record<string, boolean>>(flags: T): WithDescriptions<T> => {
  const descriptions = {} as { [K in StringKeys<T> as `${K}Description`]: string };
  (Object.keys(flags) as Array<StringKeys<T>>).forEach((key) => {
    (descriptions as Record<string, string>)[`${key}Description`] = '';
  });

  return {
    ...flags,
    ...descriptions,
  } as WithDescriptions<T>;
};

const CROWN_FLAGS: CrownInspectionFlags = {
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
};

const TRUNK_FLAGS: TrunkInspectionFlags = {
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
};

const STEM_BASE_FLAGS: StemBaseInspectionFlags = {
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
};

export type FormFields = {
  performedAt: string;
  isSafeForTraffic: boolean;
  newInspectionIntervall: number;
  developmentalStage: string;
  vitality: number;
  description: string;
};

export type OpenSectionsState = { crown: boolean; trunk: boolean; stemBase: boolean };

export const crownCheckboxes: ToggleField<CrownInspectionState>[] = [
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

export const trunkCheckboxes: ToggleField<TrunkInspectionState>[] = [
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

export const stemBaseCheckboxes: ToggleField<StemBaseInspectionState>[] = [
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

export const DEFAULT_RATING = 0;
export const DEFAULT_INSPECTION_INTERVAL = 12;
export const DEVELOPMENTAL_STAGE_OPTIONS = ['Jugendphase', 'Reifungsphase', 'Alterungsphase'] as const;

export const createInitialFormFields = (): FormFields => ({
  performedAt: getDefaultPerformedAt(),
  isSafeForTraffic: true,
  newInspectionIntervall: DEFAULT_INSPECTION_INTERVAL,
  developmentalStage: DEVELOPMENTAL_STAGE_OPTIONS[0],
  vitality: DEFAULT_RATING,
  description: '',
});

export const createInitialCrownInspection = (): CrownInspectionState => ({
  notes: '',
  ...createInitialWithDescriptions(CROWN_FLAGS),
});

export const createInitialTrunkInspection = (): TrunkInspectionState => ({
  notes: '',
  ...createInitialWithDescriptions(TRUNK_FLAGS),
});

export const createInitialStemBaseInspection = (): StemBaseInspectionState => ({
  notes: '',
  ...createInitialWithDescriptions(STEM_BASE_FLAGS),
});
