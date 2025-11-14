import type { ApiInspection, Inspection } from './model';

export const mapInspectionFromApi = (inspection: ApiInspection): Inspection => ({
  id: inspection.id,
  treeId: inspection.treeId,
  date: inspection.date,
  trafficSafe: inspection.trafficSafe,
  userId: inspection.userId ?? null,
});

export const mapInspectionsFromApi = (inspections: ApiInspection[]): Inspection[] =>
  inspections.map(mapInspectionFromApi);
