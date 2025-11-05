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

