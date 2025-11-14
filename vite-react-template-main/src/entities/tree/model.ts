export interface ApiTree {
  userId?: number | null;
  id: number;
  greenAreaId: number;
  number: number;
  species?: string | null;
  lastInspectionId?: number | null;
  longitude?: number | null;
  latitude?: number | null;
  treeSizeMeters?: number | null;
  crownDiameterMeters?: number | null;
  crownAttachmentHeightMeters?: number | null;
  numberOfTrunks?: number | null;
  trunkInclination?: number | null;
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
  treeSizeMeters?: number | null;
  crownDiameterMeters?: number | null;
  crownAttachmentHeightMeters?: number | null;
  numberOfTrunks?: number | null;
  trunkInclination?: number | null;
}

export interface ApiCreateTree {
  greenAreaId: number;
  number: number;
  species: string;
  longitude: number;
  latitude: number;
  treeSizeMeters: number;
  crownDiameterMeters: number;
  crownAttachmentHeightMeters: number;
  numberOfTrunks: number;
  trunkInclination: number;
}

export interface NewTree extends ApiCreateTree {}
