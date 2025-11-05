export interface ApiTree {
  userid?: number | null;
  id: number;
  gruenFlaechenId: number;
  nummer: number;
  art?: string | null;
  letzteKontrolleID?: number | null;
  laengengrad?: number | null;
  breitengrad?: number | null;
}

export interface Tree {
  userId?: number | null;
  id: number;
  greenAreaId: number;
  number: number;
  species?: string | null;
  lastInspectionId?: number | null;
  longitude?: number | null;
  latitude?: number | null;
}

export interface NewTree {
  userId?: number | null;
  greenAreaId: number;
  number: number;
  species?: string | null;
  lastInspectionId?: number | null;
  longitude?: number | null;
  latitude?: number | null;
}

export type ApiCreateTree = Omit<ApiTree, 'id'>;
