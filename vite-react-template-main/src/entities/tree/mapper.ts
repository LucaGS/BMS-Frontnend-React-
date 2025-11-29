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
  numberOfTrunks: tree.numberOfTrunks ?? null,
  trunkDiameter1: tree.trunkDiameter1 ?? null,
  trunkDiameter2: tree.trunkDiameter2 ?? null,
  trunkDiameter3: tree.trunkDiameter3 ?? null,
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
  numberOfTrunks: tree.numberOfTrunks,
  trunkDiameter1: tree.trunkDiameter1,
  trunkDiameter2: tree.trunkDiameter2,
  trunkDiameter3: tree.trunkDiameter3,
});
