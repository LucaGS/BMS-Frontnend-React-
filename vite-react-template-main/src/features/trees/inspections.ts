export interface ApiInspection {
  id: number;
  baumId: number;
  datum: string;
  verkehrssicher: boolean;
  userId?: number | null;
}

export interface Inspection {
  id: number;
  treeId: number;
  date: string;
  trafficSafe: boolean;
  userId?: number | null;
}

export const mapInspectionFromApi = (inspection: ApiInspection): Inspection => ({
  id: inspection.id,
  treeId: inspection.baumId,
  date: inspection.datum,
  trafficSafe: inspection.verkehrssicher,
  userId: inspection.userId ?? null,
});

export const mapInspectionsFromApi = (inspections: ApiInspection[]): Inspection[] =>
  inspections.map(mapInspectionFromApi);

