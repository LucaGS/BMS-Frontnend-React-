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
  { key: 'abioticDisturbance', label: 'Abiotische Stoerung ' },
  { key: 'dying', label: 'Absterbend ' },
  { key: 'overloadedBranchOrCrown', label: 'Ueberlastete Krone/Ast ' },
  { key: 'branchBreak', label: 'Astbruch ' },
  { key: 'branchBreakWound', label: 'Astbruchwunde ' },
  { key: 'pruningWound', label: 'Schnittwunde ' },
  { key: 'exudation', label: 'Exsudation' },
  { key: 'treeInGroup', label: 'Baum in Gruppe ' },
  { key: 'treeIsDead', label: 'Baum tot ' },
  { key: 'foreignVegetation', label: 'Fremdbewuchs ' },
  { key: 'bioticDisturbance', label: 'Biotische Stoerung ' },
  { key: 'lightningDamage', label: 'Blitzschaden ' },
  { key: 'deformed', label: 'Verformt ' },
  { key: 'compressionFork', label: 'Druckzwiesel ' },
  { key: 'dryBranches', label: 'Trockenaste ' },
  { key: 'includedBark', label: 'Eingewachsene Rinde ' },
  { key: 'oneSidedCrown', label: 'Einseitige Krone' },
  { key: 'foreignObject', label: 'Fremdkoerper ' },
  { key: 'topped', label: 'Kappung ' },
  { key: 'habitatStructure', label: 'Habitatstruktur' },
  { key: 'resinFlow', label: 'Harzfluss ' },
  { key: 'cavity', label: 'Hoehlung ' },
  { key: 'competingBranch', label: 'Konkurrenzast '},
  { key: 'competingTree', label: 'Konkurrenzbaum ' },
  { key: 'canker', label: 'Krebs ' },
  { key: 'crownSecured', label: 'Krone gesichert ' },
  { key: 'longitudinalCrack', label: 'Laengsriss ' },
  { key: 'clearanceProfile2_50m', label: 'Lichtraumprofil 2.50m ' },
  { key: 'clearanceProfile4_50m', label: 'Lichtraumprofil 4.50m ' },
  { key: 'burl', label: 'Maserknolle/Burl ' },
  { key: 'openDecay', label: 'Offene Faeule ' },
  { key: 'withoutLeaderShoot', label: 'Ohne Leittrieb ' },
  { key: 'fungalFruitingBody', label: 'Fruchtkoerper ' },
  { key: 'rubbingBranches', label: 'Reibende Aeste ' },
  { key: 'slimeFlux', label: 'Schleimfluss ' },
  { key: 'secondaryCrowns', label: 'Sekundaerkronen' },
  { key: 'woodpeckerHole', label: 'Spechthoehle ' },
  { key: 'compressionDamage', label: 'Druckschaeden ' },
  { key: 'torsionCrack', label: 'Torsionsriss' },
  { key: 'deadwood', label: 'Totholz ' },
  { key: 'widowmakerBranch', label: 'Stoererast/Widowmaker ' },
  { key: 'unfavorableCrownDevelopment', label: 'Unguenstige Kronenentwicklung ' },
  { key: 'graftPoint', label: 'Veredlungsstelle ' },
  { key: 'utilityLineConflict', label: 'Konflikt mit Leitung ' },
  { key: 'topDieback', label: 'Spitzenduerr' },
  { key: 'wound', label: 'Wunde ' },
  { key: 'woundWithCallusRidge', label: 'Wunde mit Kallusrand ' },
  { key: 'woundCallusClosed', label: 'Wunde geschlossen ' },
  { key: 'tensionFork', label: 'Zugzwiesel ' },
  { key: 'forkedCrown', label: 'Gabelkrone ' },
  { key: 'forkCrack', label: 'Zwieselriss ' },
];

export const trunkCheckboxes: ToggleField<TrunkInspectionState>[] = [
  { key: 'abioticDisturbance', label: 'Abiotische Stoerung ' },
  { key: 'branchBreakWound', label: 'Astbruchwunde ' },
  { key: 'pruningWound', label: 'Schnittwunde ' },
  { key: 'exudation', label: 'Exsudation ' },
  { key: 'treeRemoved', label: 'Baum entfernt ' },
  { key: 'bulgeOrSwelling', label: 'Beule/Schwellung ' },
  { key: 'foreignVegetation', label: 'Fremdbewuchs ' },
  { key: 'bioticDisturbance', label: 'Biotische Stoerung ' },
  { key: 'lightningDamage', label: 'Blitzschaden ' },
  { key: 'leavesBrokenOff', label: 'Blatt-/Nadelbruch ' },
  { key: 'deformed', label: 'Verformt ' },
  { key: 'spiralGrain', label: 'Drehwuchs ' },
  { key: 'compressionFork', label: 'Druckzwiesel ' },
  { key: 'includedBark', label: 'Eingewachsene Rinde ' },
  { key: 'foreignObject', label: 'Fremdkoerper ' },
  { key: 'topped', label: 'Kappung ' },
  { key: 'habitatStructures', label: 'Habitatstrukturen ' },
  { key: 'resinFlow', label: 'Harzfluss ' },
  { key: 'cavity', label: 'Hoehlung ' },
  { key: 'canker', label: 'Krebs ' },
  { key: 'longitudinalCrack', label: 'Laengsriss ' },
  { key: 'mowingDamage', label: 'Mahdschaeden ' },
  { key: 'burl', label: 'Maserknolle/Burl ' },
  { key: 'openDecay', label: 'Offene Faeule ' },
  { key: 'fungalFruitingBody', label: 'Fruchtkoerper ' },
  { key: 'leaning', label: 'Geneigt ' },
  { key: 'slimeFlux', label: 'Schleimfluss ' },
  { key: 'secondaryRadialGrowthMissing', label: 'Sekundaeres Dickenwachstum fehlt ' },
  { key: 'woodpeckerHole', label: 'Spechthoehle ' },
  { key: 'compressionDamage', label: 'Druckschaeden ' },
  { key: 'torsionCrack', label: 'Torsionsriss ' },
  { key: 'deadwood', label: 'Totholz ' },
  { key: 'widowmakerBranch', label: 'Stoererast/Widowmaker ' },
  { key: 'graftPoint', label: 'Veredlungsstelle ' },
  { key: 'supplyShadow', label: 'Versorgungsschatten ' },
  { key: 'wobbles', label: 'Wackelt ' },
  { key: 'wound', label: 'Wunde ' },
  { key: 'woundCallusRidge', label: 'Wunde mit Kallusrand ' },
  { key: 'woundCallusClosed', label: 'Wunde geschlossen ' },
  { key: 'tensionFork', label: 'Zugzwiesel ' },
  { key: 'forkedTrunk', label: 'Gabelstamm ' },
  { key: 'forkCrack', label: 'Zwieselriss ' },
];

export const stemBaseCheckboxes: ToggleField<StemBaseInspectionState>[] = [
  { key: 'excavation', label: 'Freilegung ' },
  { key: 'adventitiousRootFormation', label: 'Adventivwurzelbildung ' },
  { key: 'exudation', label: 'Exsudation ' },
  { key: 'structuresAtStemBase', label: 'Strukturen am Stammfuss ' },
  { key: 'structuresNearTree', label: 'Strukturen in der Naehe ' },
  { key: 'bulgeOrSwelling', label: 'Beule/Schwellung ' },
  { key: 'foreignVegetation', label: 'Fremdbewuchs ' },
  { key: 'boreDust', label: 'Bohrmehl ' },
  { key: 'bottleneck', label: 'Engstelle ' },
  { key: 'foreignObject', label: 'Fremdkoerper ' },
  { key: 'habitatStructures', label: 'Habitatstrukturen ' },
  { key: 'treeOnSlope', label: 'Baum am Hang ' },
  { key: 'resinFlow', label: 'Harzfluss ' },
  { key: 'cavity', label: 'Hoehlung ' },
  { key: 'canker', label: 'Krebs ' },
  { key: 'openDecay', label: 'Offene Faeule ' },
  { key: 'fungalFruitingBody', label: 'Fruchtkoerper ' },
  { key: 'slimeFlux', label: 'Schleimfluss ' },
  { key: 'stemBaseThickened', label: 'Stammfuss verdickt ' },
  { key: 'compressionDamage', label: 'Druckschaeden ' },
  { key: 'overfilled', label: 'Aufgefuellt ' },
  { key: 'graftPoint', label: 'Veredlungsstelle ' },
  { key: 'girdlingRoot', label: 'Wuergewurzel ' },
  { key: 'rootDamage', label: 'Wurzelschaeden ' },
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
