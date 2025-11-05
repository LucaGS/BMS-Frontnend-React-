import type { ApiInspection, Inspection } from './model';

export const mapInspectionFromApi = (inspection: ApiInspection): Inspection => ({
  id: inspection.id,
  treeId: inspection.baumId,
  date: inspection.datum,
  trafficSafe: inspection.verkehrssicher,
  userId: inspection.userId ?? null,
});

export const mapInspectionsFromApi = (inspections: ApiInspection[]): Inspection[] =>
  inspections.map(mapInspectionFromApi);

