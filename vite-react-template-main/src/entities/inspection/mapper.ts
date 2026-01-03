import { normalizeVitality, type ApiInspection, type Inspection } from './model';

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
  vitality: normalizeVitality(inspection.vitality),
  description: inspection.description ?? '',
  arboriculturalMeasureIds:
    (inspection as any).arboriculturalMeasureIds && Array.isArray((inspection as any).arboriculturalMeasureIds)
      ? ((inspection as any).arboriculturalMeasureIds as number[])
      : [],
});

export const mapInspectionsFromApi = (inspections: ApiInspection[]): Inspection[] =>
  inspections.map(mapInspectionFromApi);
