export interface ApiInspection {
  id: number;
  treeId: number;
  performedAt: string;
  isSafeForTraffic: boolean;
  userId?: number | null;
  newInspectionIntervall: number;
  developmentalStage: string;
  vitality: number;
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
  vitality: number;
  description: string;
  arboriculturalMeasureIds?: number[];
}
