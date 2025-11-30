export interface ApiTree {
  userId?: number | null;
  id: number;
  greenAreaId: number;
  number: number;
  species?: string | null;
  lastInspectionId?: number | null;
  nextInspection?: string | null;
  longitude?: number | null;
  latitude?: number | null;
  treeSizeMeters?: number | null;
  crownDiameterMeters?: number | null;
  numberOfTrunks?: number | null;
  trunkDiameter1?: number | null;
  trunkDiameter2?: number | null;
  trunkDiameter3?: number | null;
}

export interface Tree {
  userId?: number | null;
  id: number;
  greenAreaId: number;
  number: number;
  species?: string | null;
  lastInspectionId?: number | null;
  nextInspection?: string | null;
  longitude?: number | null;
  latitude?: number | null;
  treeSizeMeters?: number | null;
  crownDiameterMeters?: number | null;
  numberOfTrunks?: number | null;
  trunkDiameter1?: number | null;
  trunkDiameter2?: number | null;
  trunkDiameter3?: number | null;
}

export interface ApiCreateTree {
  greenAreaId: number;
  number: number;
  species: string;
  longitude: number;
  latitude: number;
  treeSizeMeters: number;
  crownDiameterMeters: number;
  numberOfTrunks: number;
  trunkDiameter1: number;
  trunkDiameter2: number;
  trunkDiameter3: number;
}

export interface NewTree extends ApiCreateTree {}
