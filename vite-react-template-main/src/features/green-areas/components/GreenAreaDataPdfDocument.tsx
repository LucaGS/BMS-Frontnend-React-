import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import {
  type CrownInspectionState,
  type StemBaseInspectionState,
  type TrunkInspectionState,
  crownCheckboxes,
  stemBaseCheckboxes,
  trunkCheckboxes,
} from '@/features/inspections/forms/inspectionFormConfig';
import { hasValidCoordinates } from '@/shared/maps/leafletUtils';
import { formatCoordinateDisplay } from '@/shared/lib/coordinateFormatting';
import { formatDateDisplay } from '@/shared/lib/dateFormatting';
import type { Tree } from '@/features/trees/types';
import type { LastInspectionDetail, TreeInspectionExport } from './GreenAreaPdfDocument';
import { normalizeVitality } from '@/entities/inspection';

type GreenAreaDataPdfDocumentProps = {
  greenAreaId?: string;
  greenAreaName?: string;
  trees: TreeInspectionExport[];
  exportedAt?: Date;
};

const styles = StyleSheet.create({
  page: { padding: 22, fontFamily: 'Helvetica', fontSize: 9.5, backgroundColor: '#f3f6fa', color: '#172033' },
  header: {
    backgroundColor: '#ffffff',
    borderColor: '#d7e0ea',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  kicker: { fontSize: 8, color: '#0b6bcb', letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 },
  title: { fontSize: 17, fontWeight: 700, marginBottom: 4 },
  meta: { fontSize: 8.5, color: '#61718a', marginBottom: 2 },
  section: {
    backgroundColor: '#ffffff',
    borderColor: '#d7e0ea',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 10, color: '#61718a', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 6 },
  treeTitle: { fontSize: 13, fontWeight: 700, marginBottom: 3 },
  treeSubtitle: { fontSize: 8.5, color: '#61718a', marginBottom: 6 },
  row: { flexDirection: 'row' },
  cellHeader: {
    backgroundColor: '#f7f9fc',
    borderColor: '#d7e0ea',
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 6,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#61718a',
  },
  cell: {
    borderColor: '#d7e0ea',
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 6,
    fontSize: 8.8,
    color: '#172033',
  },
  labelCell: {
    fontFamily: 'Helvetica-Bold',
    backgroundColor: '#f7f9fc',
    color: '#3f4d63',
  },
  summaryColNumber: { width: '8%' },
  summaryColSpecies: { width: '17%' },
  summaryColLast: { width: '17%' },
  summaryColNext: { width: '16%' },
  summaryColStatus: { width: '12%' },
  summaryColVitality: { width: '14%' },
  summaryColCoords: { width: '16%' },
  metaLabel: { width: '26%' },
  metaValue: { width: '24%' },
  notesLabel: { width: '18%' },
  notesText: { width: '37%' },
  notesMarkings: { width: '45%' },
  paragraph: { fontSize: 8.8, lineHeight: 1.35 },
});

const formatNumber = (value?: number | null, fallback = '-') =>
  typeof value === 'number' && !Number.isNaN(value) ? String(value) : fallback;

const formatVitality = (value?: string | number | null) => {
  if (typeof value === 'string') {
    return value.trim() || '-';
  }
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return normalizeVitality(value);
  }
  return '-';
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return 'Keine Kontrolle';
  }
  return formatDateDisplay(value, value);
};

const formatNextInspectionDate = (value?: string | null) => {
  if (!value) {
    return 'Keine nächste Kontrolle';
  }

  return formatDateDisplay(value, 'Keine nächste Kontrolle');
};

const getCoordinatesLabel = (tree: Tree) =>
  hasValidCoordinates(tree.latitude, tree.longitude, { allowZero: false })
    ? `${formatCoordinateDisplay(tree.latitude)}, ${formatCoordinateDisplay(tree.longitude)}`
    : 'Keine Koordinaten';

const buildMeasuresList = (inspection?: LastInspectionDetail | null) => {
  if (!inspection) {
    return [] as string[];
  }
  if (inspection.arboriculturalMeasures && inspection.arboriculturalMeasures.length > 0) {
    return inspection.arboriculturalMeasures
      .map((measure) => (measure.description ? `${measure.measureName} (${measure.description})` : measure.measureName))
      .filter(Boolean);
  }
  if (inspection.arboriculturalMeasureIds && inspection.arboriculturalMeasureIds.length > 0) {
    return ['Massnahmen hinterlegt'];
  }
  return [] as string[];
};

const getActiveMarkings = <T extends Record<string, unknown>>(
  items: { key: keyof T; label: string }[],
  data?: Partial<T> | null,
) =>
  items
    .filter(({ key }) => Boolean(data?.[key]))
    .map(({ key, label }) => {
      const descriptionKey = `${String(key)}Description` as keyof T;
      const rawDescription = (data as any)?.[descriptionKey];
      const description =
        typeof rawDescription === 'string' && rawDescription.trim().length > 0 ? rawDescription.trim() : null;
      return description ? `${label} (${description})` : label;
    });

const TableRow: React.FC<{ columns: Array<{ text: string; style: any; isLabel?: boolean }>; header?: boolean }> = ({ columns, header = false }) => (
  <View style={styles.row}>
    {columns.map((column, index) => (
      <Text
        key={`${index}-${column.text}`}
        style={[
          header ? styles.cellHeader : styles.cell,
          !header && column.isLabel ? styles.labelCell : null,
          column.style,
        ]}
      >
        {column.text}
      </Text>
    ))}
  </View>
);

const GreenAreaDataPdfDocument: React.FC<GreenAreaDataPdfDocumentProps> = ({
  greenAreaName,
  trees,
  exportedAt,
}) => {
  const generatedAt = exportedAt ? new Date(exportedAt) : new Date();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Baumdaten Export</Text>
          <Text style={styles.title}>{greenAreaName ?? 'Unbenannt'}</Text>
          <Text style={styles.meta}>Exportiert am {formatDateDisplay(generatedAt)}</Text>
        </View>

        {trees.map((entry) => {
          const inspection = entry.inspection;
          const measures = buildMeasuresList(inspection);
          const noteRows: Array<[string, string, string]> = inspection
            ? [
                ['Krone', inspection.crownInspection?.notes ?? '', getActiveMarkings<CrownInspectionState>(crownCheckboxes, inspection.crownInspection).join(', ') || 'Keine Auffälligkeiten markiert.'],
                ['Stamm', inspection.trunkInspection?.notes ?? '', getActiveMarkings<TrunkInspectionState>(trunkCheckboxes, inspection.trunkInspection).join(', ') || 'Keine Auffälligkeiten markiert.'],
                ['Stammfuß und Wurzelbereich', inspection.stemBaseInspection?.notes ?? '', getActiveMarkings<StemBaseInspectionState>(stemBaseCheckboxes, inspection.stemBaseInspection).join(', ') || 'Keine Auffälligkeiten markiert.'],
              ]
            : [];

          return (
            <View key={entry.tree.id} style={styles.section} wrap={false}>
              <Text style={styles.treeTitle}>Baum {formatNumber(entry.tree.number)} | {entry.tree.species || 'Unbekannte Art'}</Text>
              <Text style={styles.treeSubtitle}>Kompakte Detailansicht</Text>

              <TableRow
                columns={[
                  { text: 'Baumnummer', style: styles.metaLabel, isLabel: true },
                  { text: formatNumber(entry.tree.number), style: styles.metaValue },
                  { text: 'Koordinaten', style: styles.metaLabel, isLabel: true },
                  { text: getCoordinatesLabel(entry.tree), style: styles.metaValue },
                ]}
              />
              <TableRow
                columns={[
                  { text: 'Letzte Kontrolle', style: styles.metaLabel, isLabel: true },
                  { text: inspection ? formatDateTime(inspection.performedAt) : 'Keine Kontrolle', style: styles.metaValue },
                  { text: 'Nächste Kontrolle', style: styles.metaLabel, isLabel: true },
                  { text: formatNextInspectionDate(entry.tree.nextInspection), style: styles.metaValue },
                ]}
              />
              <TableRow
                columns={[
                  { text: 'Verkehrssicherheit', style: styles.metaLabel, isLabel: true },
                  { text: inspection ? (inspection.isSafeForTraffic ? 'Verkehrssicher' : 'Nicht verkehrssicher') : 'Keine Kontrolle', style: styles.metaValue },
                  { text: 'Vitalität', style: styles.metaLabel, isLabel: true },
                  { text: inspection ? formatVitality(inspection.vitality) : '-', style: styles.metaValue },
                ]}
              />
              <TableRow
                columns={[
                  { text: 'Entwicklungsstadium', style: styles.metaLabel, isLabel: true },
                  { text: inspection?.developmentalStage || '-', style: styles.metaValue },
                  { text: 'Intervall', style: styles.metaLabel, isLabel: true },
                  { text: inspection ? `${formatNumber(inspection.newInspectionIntervall)} Monate` : '-', style: styles.metaValue },
                ]}
              />
              <TableRow
                columns={[
                  { text: 'Sicherheitserwartung', style: styles.metaLabel, isLabel: true },
                  { text: entry.tree.trafficSafetyExpectation || '-', style: { width: '74%' } },
                ]}
              />
              <TableRow
                columns={[
                  { text: 'Beschreibung', style: styles.metaLabel, isLabel: true },
                  { text: inspection?.description?.trim() ? inspection.description : 'Keine Beschreibung erfasst.', style: { width: '74%' } },
                ]}
              />

              <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Pflegemassnahmen</Text>
              {measures.length > 0 ? (
                measures.map((measure, index) => (
                  <TableRow
                    key={`${index}-${measure}`}
                    columns={[
                      { text: String(index + 1), style: { width: '12%' }, isLabel: true },
                      { text: measure, style: { width: '88%' } },
                    ]}
                  />
                ))
              ) : (
                <TableRow
                  columns={[
                    { text: '1', style: { width: '12%' }, isLabel: true },
                    { text: 'Keine Pflegemassnahmen erfasst.', style: { width: '88%' } },
                  ]}
                />
              )}

              <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Befundübersicht</Text>
              <TableRow
                header
                columns={[
                  { text: 'Bereich', style: styles.notesLabel },
                  { text: 'Markierungen', style: styles.notesMarkings },
                  { text: 'Notizen', style: styles.notesText },
                ]}
              />
              {noteRows.length > 0 ? (
                noteRows.map(([area, notes, markings]) => (
                  <TableRow
                    key={area}
                    columns={[
                      { text: area, style: styles.notesLabel, isLabel: true },
                      { text: markings, style: styles.notesMarkings },
                      { text: notes && String(notes).trim() ? String(notes) : 'Keine Notizen erfasst.', style: styles.notesText },
                    ]}
                  />
                ))
              ) : (
                <TableRow
                  columns={[
                    { text: 'Kontrolle', style: styles.notesLabel, isLabel: true },
                    { text: '-', style: styles.notesMarkings },
                    { text: 'Keine Kontrolle vorhanden.', style: styles.notesText },
                  ]}
                />
              )}
            </View>
          );
        })}
      </Page>
    </Document>
  );
};

export default GreenAreaDataPdfDocument;
