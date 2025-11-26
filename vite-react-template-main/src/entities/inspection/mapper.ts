import type { ApiInspection, Inspection } from './model';

export const mapInspectionFromApi = (inspection: ApiInspection): Inspection => ({
  id: inspection.id,
  treeId: inspection.treeId,
  performedAt: inspection.performedAt ?? (inspection as any).date ?? '',
  isSafeForTraffic:
    typeof inspection.isSafeForTraffic === 'boolean'
      ? inspection.isSafeForTraffic
      : Boolean((inspection as any).trafficSafe),
  userId: inspection.userId ?? null,
  newInspectionIntervall: inspection.newInspectionIntervall ?? 0,
  developmentalStage: inspection.developmentalStage ?? '',
  damageLevel: inspection.damageLevel ?? 0,
  standStability: inspection.standStability ?? 0,
  breakageSafety: inspection.breakageSafety ?? 0,
  vitality: inspection.vitality ?? 0,
  description: inspection.description ?? '',
});

export const mapInspectionsFromApi = (inspections: ApiInspection[]): Inspection[] =>
  inspections.map(mapInspectionFromApi);
