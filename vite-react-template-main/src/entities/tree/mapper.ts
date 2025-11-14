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
});

export const mapTreesFromApi = (trees: ApiTree[]): Tree[] => trees.map(mapTreeFromApi);

export const mapTreeToApiPayload = (tree: NewTree): ApiCreateTree => ({
  userId: tree.userId ?? null,
  greenAreaId: tree.greenAreaId,
  number: tree.number,
  species: tree.species ?? null,
  lastInspectionId: tree.lastInspectionId ?? null,
  longitude: tree.longitude ?? null,
  latitude: tree.latitude ?? null,
});
