import type { ApiCreateTree, ApiTree, NewTree, Tree } from './model';

export const mapTreeFromApi = (tree: ApiTree): Tree => ({
  userId: tree.userid ?? null,
  id: tree.id,
  greenAreaId: tree.gruenFlaechenId,
  number: tree.nummer,
  species: tree.art ?? null,
  lastInspectionId: tree.letzteKontrolleID ?? null,
  longitude: tree.laengengrad ?? null,
  latitude: tree.breitengrad ?? null,
});

export const mapTreesFromApi = (trees: ApiTree[]): Tree[] => trees.map(mapTreeFromApi);

export const mapTreeToApiPayload = (tree: NewTree): ApiCreateTree => ({
  userid: tree.userId ?? null,
  gruenFlaechenId: tree.greenAreaId,
  nummer: tree.number,
  art: tree.species ?? null,
  letzteKontrolleID: tree.lastInspectionId ?? null,
  laengengrad: tree.longitude ?? null,
  breitengrad: tree.latitude ?? null,
});
