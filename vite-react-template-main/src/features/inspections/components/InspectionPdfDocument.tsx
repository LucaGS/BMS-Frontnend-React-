import React from 'react';
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { type Inspection } from '@/features/inspections';
import {
  type CrownInspectionState,
  type StemBaseInspectionState,
  type TrunkInspectionState,
  crownCheckboxes,
  stemBaseCheckboxes,
  trunkCheckboxes,
} from '@/features/inspections/forms/inspectionFormConfig';
import type { Tree } from '@/features/trees/types';
import { hasValidCoordinates } from '@/shared/maps/leafletUtils';
import { normalizeVitality } from '@/entities/inspection';
import { formatCoordinateDisplay } from '@/shared/lib/coordinateFormatting';
import { formatDateDisplay } from '@/shared/lib/dateFormatting';

export type InspectionDetail = Inspection & {
  crownInspection?: Partial<CrownInspectionState> | null;
  trunkInspection?: Partial<TrunkInspectionState> | null;
  stemBaseInspection?: Partial<StemBaseInspectionState> | null;
};

const styles = StyleSheet.create({
  page: { padding: 22, fontSize: 9.5, fontFamily: 'Helvetica', color: '#172033', backgroundColor: '#f3f6fa' },
  header: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d7e0ea',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  kicker: { fontSize: 8, color: '#0b6bcb', letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 },
  title: { fontSize: 17, fontWeight: 700, marginBottom: 4 },
  meta: { fontSize: 8.5, color: '#61718a' },
  section: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d7e0ea',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 10, color: '#61718a', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 6 },
  row: { flexDirection: 'row' },
  cellHeader: {
    backgroundColor: '#f7f9fc',
    borderWidth: 1,
    borderColor: '#d7e0ea',
    paddingVertical: 5,
    paddingHorizontal: 6,
    fontSize: 8,
    fontWeight: 700,
    color: '#61718a',
  },
  cell: {
    borderWidth: 1,
    borderColor: '#d7e0ea',
    paddingVertical: 5,
    paddingHorizontal: 6,
    fontSize: 8.8,
    color: '#172033',
  },
  labelCol: { width: '26%' },
  valueCol: { width: '24%' },
  wideValueCol: { width: '74%' },
  notesLabel: { width: '18%' },
  notesText: { width: '37%' },
  notesMarkings: { width: '45%' },
  mapImage: { width: '100%', height: 200, borderRadius: 10 },
  smallText: { fontSize: 8.5, color: '#61718a', marginTop: 6 },
});

const toDateLabel = (value: string) => formatDateDisplay(value, value);

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

const TableRow: React.FC<{ columns: Array<{ text: string; style: any }>; header?: boolean }> = ({ columns, header = false }) => (
  <View style={styles.row}>
    {columns.map((column, index) => (
      <Text key={`${index}-${column.text}`} style={[header ? styles.cellHeader : styles.cell, column.style]}>
        {column.text}
      </Text>
    ))}
  </View>
);

type InspectionPdfDocumentProps = {
  inspection: InspectionDetail;
  title: string;
  tree?: Tree | null;
  mapImage?: string | null;
  measures?: { id: number; measureName: string; description?: string | null }[];
};

const InspectionPdfDocument: React.FC<InspectionPdfDocumentProps> = ({
  inspection,
  tree,
  mapImage,
  measures = [],
  title,
}) => {
  const coordinateLabel = tree
    ? hasValidCoordinates(tree.latitude, tree.longitude, { allowZero: false })
      ? `${formatCoordinateDisplay(tree.latitude)}, ${formatCoordinateDisplay(tree.longitude)}`
      : 'Keine Koordinaten'
    : null;

  const measureList = measures.filter((measure) => (inspection.arboriculturalMeasureIds ?? []).includes(measure.id));

  const noteRows: Array<[string, string | null | undefined, string]> = [
    ['Krone', inspection.crownInspection?.notes, getActiveMarkings<CrownInspectionState>(crownCheckboxes, inspection.crownInspection).join(', ') || 'Keine Auffälligkeiten markiert.'],
    ['Stamm', inspection.trunkInspection?.notes, getActiveMarkings<TrunkInspectionState>(trunkCheckboxes, inspection.trunkInspection).join(', ') || 'Keine Auffälligkeiten markiert.'],
    ['Stammfuss und Wurzelbereich', inspection.stemBaseInspection?.notes, getActiveMarkings<StemBaseInspectionState>(stemBaseCheckboxes, inspection.stemBaseInspection).join(', ') || 'Keine Auffälligkeiten markiert.'],
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Kontrollexport</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.meta}>
            {inspection.isSafeForTraffic ? 'Verkehrssicher' : 'Nicht verkehrssicher'} | {toDateLabel(inspection.performedAt)}
          </Text>
        </View>

        {tree ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Baum</Text>
            <TableRow
              columns={[
                { text: 'Baumnummer', style: styles.labelCol },
                { text: formatNumber(tree.number), style: styles.valueCol },
                { text: 'Art', style: styles.labelCol },
                { text: tree.species || 'Unbekannte Art', style: styles.valueCol },
              ]}
            />
            <TableRow
              columns={[
                { text: 'Koordinaten', style: styles.labelCol },
                { text: coordinateLabel ?? 'Keine Angabe', style: styles.valueCol },
                { text: 'Anzahl Stämme', style: styles.labelCol },
                { text: formatNumber(tree.numberOfTrunks), style: styles.valueCol },
              ]}
            />
            <TableRow
              columns={[
                { text: 'Baumhöhe', style: styles.labelCol },
                { text: `${formatNumber(tree.treeSizeMeters)} m`, style: styles.valueCol },
                { text: 'Kronendurchmesser', style: styles.labelCol },
                { text: `${formatNumber(tree.crownDiameterMeters)} m`, style: styles.valueCol },
              ]}
            />
            <TableRow
              columns={[
                { text: 'Stammdurchmesser 1', style: styles.labelCol },
                { text: formatNumber(tree.trunkDiameter1), style: styles.valueCol },
                { text: 'Stammdurchmesser 2', style: styles.labelCol },
                { text: formatNumber(tree.trunkDiameter2), style: styles.valueCol },
              ]}
            />
            <TableRow
              columns={[
                { text: 'Stammdurchmesser 3', style: styles.labelCol },
                { text: formatNumber(tree.trunkDiameter3), style: styles.valueCol },
              ]}
            />
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kontrolle</Text>
          <TableRow
            columns={[
              { text: 'Datum', style: styles.labelCol },
              { text: toDateLabel(inspection.performedAt), style: styles.valueCol },
              { text: 'Verkehrssicherheit', style: styles.labelCol },
              { text: inspection.isSafeForTraffic ? 'Verkehrssicher' : 'Nicht verkehrssicher', style: styles.valueCol },
            ]}
          />
          <TableRow
            columns={[
              { text: 'Intervall', style: styles.labelCol },
              { text: `${formatNumber(inspection.newInspectionIntervall)} Tage`, style: styles.valueCol },
              { text: 'Entwicklungsstadium', style: styles.labelCol },
              { text: inspection.developmentalStage || '-', style: styles.valueCol },
            ]}
          />
          <TableRow
            columns={[
              { text: 'Vitalität', style: styles.labelCol },
              { text: formatVitality(inspection.vitality), style: styles.valueCol },
            ]}
          />
          <TableRow
            columns={[
              { text: 'Beschreibung', style: styles.labelCol },
              { text: inspection.description?.trim() ? inspection.description : 'Keine Beschreibung erfasst.', style: styles.wideValueCol },
            ]}
          />
        </View>

        {measureList.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pflegemassnahmen</Text>
            <TableRow
              header
              columns={[
                { text: 'Maßnahme', style: styles.labelCol },
                { text: 'Beschreibung', style: styles.wideValueCol },
              ]}
            />
            {measureList.map((measure) => (
              <TableRow
                key={measure.id}
                columns={[
                  { text: measure.measureName, style: styles.labelCol },
                  { text: measure.description?.trim() ? measure.description : 'Keine Beschreibung vorhanden.', style: styles.wideValueCol },
                ]}
              />
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Befundübersicht</Text>
          <TableRow
            header
            columns={[
              { text: 'Bereich', style: styles.notesLabel },
              { text: 'Notizen', style: styles.notesText },
              { text: 'Markierungen', style: styles.notesMarkings },
            ]}
          />
          {noteRows.map(([area, notes, markings]) => (
            <TableRow
              key={area}
              columns={[
                { text: area, style: styles.notesLabel },
                { text: notes?.trim() ? notes : 'Keine Notizen erfasst.', style: styles.notesText },
                { text: markings, style: styles.notesMarkings },
              ]}
            />
          ))}
        </View>

        {mapImage ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Karte</Text>
            <Image src={mapImage} style={styles.mapImage} />
            {coordinateLabel ? <Text style={styles.smallText}>Koordinaten: {coordinateLabel}</Text> : null}
          </View>
        ) : null}
      </Page>
    </Document>
  );
};

export default InspectionPdfDocument;
