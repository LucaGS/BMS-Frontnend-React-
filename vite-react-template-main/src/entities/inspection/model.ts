export const VITALITY_OPTIONS = [
  '1 - Ohne Schadensmerkmale',
  '2 - Schwach geschaedigt, kraenkelnd',
  '3 - Mittelstark geschaedigt, krank',
  '4 - Stark geschaedigt, sehr krank',
  '5 - Abgestorben',
] as const;

export type VitalityOption = (typeof VITALITY_OPTIONS)[number];
export const DEFAULT_VITALITY_OPTION: VitalityOption = VITALITY_OPTIONS[0];

export const normalizeVitality = (value: unknown): VitalityOption => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) {
      const exactMatch = VITALITY_OPTIONS.find((option) => option.toLowerCase() === trimmed.toLowerCase());
      if (exactMatch) {
        return exactMatch;
      }

      const leadingDigit = trimmed.match(/^([1-5])/);
      if (leadingDigit) {
        const index = Number(leadingDigit[1]) - 1;
        return VITALITY_OPTIONS[index] ?? DEFAULT_VITALITY_OPTION;
      }
    }
  }

  if (typeof value === 'number' && !Number.isNaN(value)) {
    const bounded = Math.min(5, Math.max(1, Math.round(value)));
    return VITALITY_OPTIONS[bounded - 1] ?? DEFAULT_VITALITY_OPTION;
  }

  return DEFAULT_VITALITY_OPTION;
};

export interface ApiInspection {
  id: number;
  treeId: number;
  performedAt: string;
  isSafeForTraffic: boolean;
  userId?: number | null;
  newInspectionIntervall: number;
  developmentalStage: string;
  vitality: string | number | null;
  description: string;
  arboriculturalMeasureIds?: number[];
}

export interface Inspection {
  id: number;
  treeId: number;
  performedAt: string;
  isSafeForTraffic: boolean;
  userId?: number | null;
  newInspectionIntervall: number;
  developmentalStage: string;
  vitality: VitalityOption;
  description: string;
  arboriculturalMeasureIds?: number[];
}
