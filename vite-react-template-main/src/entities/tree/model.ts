export interface ApiTree {
  userId?: number | null;
  id: number;
  greenAreaId: number;
  number: number;
  species?: string | null;
  lastInspectionId?: number | null;
  longitude?: number | null;
  latitude?: number | null;
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
