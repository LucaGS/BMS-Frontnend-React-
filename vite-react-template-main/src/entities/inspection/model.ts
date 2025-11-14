export interface ApiInspection {
  id: number;
  treeId: number;
  date: string;
  trafficSafe: boolean;
  userId?: number | null;
}

export interface Inspection {
  id: number;
  treeId: number;
  date: string;
  trafficSafe: boolean;
  userId?: number | null;
}
