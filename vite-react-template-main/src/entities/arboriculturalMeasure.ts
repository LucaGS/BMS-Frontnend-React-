export interface ArboriculturalMeasure {
  id: number;
  measureName: string;
  description?: string | null;
}

export const mapMeasureFromApi = (measure: any): ArboriculturalMeasure => ({
  id: Number(measure?.id) || 0,
  measureName: measure?.measureName ?? measure?.name ?? '',
  description: measure?.description ?? null,
});

export const mapMeasuresFromApi = (measures: any[]): ArboriculturalMeasure[] =>
  Array.isArray(measures) ? measures.map(mapMeasureFromApi) : [];
