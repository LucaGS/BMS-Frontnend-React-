export interface ApiInspection {
  id: number;
  treeId: number;
  performedAt: string;
  isSafeForTraffic: boolean;
  userId?: number | null;
  newInspectionIntervall: number;
  developmentalStage: string;
  damageLevel: number;
  standStability: number;
  breakageSafety: number;
  vitality: number;
  description: string;
}

export interface Inspection {
  id: number;
  treeId: number;
  performedAt: string;
  isSafeForTraffic: boolean;
  userId?: number | null;
  newInspectionIntervall: number;
  developmentalStage: string;
  damageLevel: number;
  standStability: number;
  breakageSafety: number;
  vitality: number;
  description: string;
}
