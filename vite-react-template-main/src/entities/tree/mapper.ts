import type { ApiCreateTree, ApiTree, NewTree, Tree } from './model';

export const mapTreeFromApi = (tree: ApiTree): Tree => ({
  userId: tree.userId ?? null,
  id: tree.id,
  greenAreaId: tree.greenAreaId,
  number: tree.number,
  species: tree.species ?? null,
  lastInspectionId: tree.lastInspectionId ?? null,
  longitude: tree.longitude ?? null,
  latitude: tree.latitude ?? null,
  treeSizeMeters: tree.treeSizeMeters ?? null,
  crownDiameterMeters: tree.crownDiameterMeters ?? null,
  crownAttachmentHeightMeters: tree.crownAttachmentHeightMeters ?? null,
  numberOfTrunks: tree.numberOfTrunks ?? null,
  trunkInclination: tree.trunkInclination ?? null,
});

export const mapTreesFromApi = (trees: ApiTree[]): Tree[] => trees.map(mapTreeFromApi);

export const mapTreeToApiPayload = (tree: NewTree): ApiCreateTree => ({
  greenAreaId: tree.greenAreaId,
  number: tree.number,
  species: tree.species,
  longitude: tree.longitude,
  latitude: tree.latitude,
  treeSizeMeters: tree.treeSizeMeters,
  crownDiameterMeters: tree.crownDiameterMeters,
  crownAttachmentHeightMeters: tree.crownAttachmentHeightMeters,
  numberOfTrunks: tree.numberOfTrunks,
  trunkInclination: tree.trunkInclination,
});
