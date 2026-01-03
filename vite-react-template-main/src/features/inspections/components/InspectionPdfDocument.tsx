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

export type InspectionDetail = Inspection & {
  crownInspection?: Partial<CrownInspectionState> | null;
  trunkInspection?: Partial<TrunkInspectionState> | null;
  stemBaseInspection?: Partial<StemBaseInspectionState> | null;
};

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: 'Helvetica', color: '#111' },
  header: { marginBottom: 14 },
  label: { fontSize: 9, color: '#6c757d', marginBottom: 2 },
  title: { fontSize: 18, marginBottom: 6 },
  badge: {
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
    borderWidth: 1,
  },
  badgeSafe: { backgroundColor: '#e7f5ed', borderColor: '#2f9e44' },
  badgeDanger: { backgroundColor: '#fdebec', borderColor: '#c92a2a' },
  badgeText: { fontSize: 10 },
  section: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6, padding: 12, marginBottom: 12 },
  sectionTitle: { fontSize: 12, marginBottom: 8 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  infoItem: { width: '50%', paddingRight: 8, marginBottom: 8 },
  infoLabel: { fontSize: 9, color: '#6c757d', marginBottom: 2 },
  infoValue: { fontSize: 11, lineHeight: 14 },
  paragraph: { fontSize: 10, lineHeight: 14, marginBottom: 8 },
  mapImage: { width: '100%', height: 220, marginTop: 8, borderRadius: 4 },
  subSection: { marginBottom: 10 },
  subSectionTitle: { fontSize: 11, marginBottom: 4 },
  bulletList: { marginLeft: 8, marginTop: 2 },
  bullet: { fontSize: 10, lineHeight: 14 },
  muted: { fontSize: 9, color: '#6c757d', marginTop: 4 },
});

const toDateLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return value;
  }
  return date.toLocaleString();
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
      return { label, description };
    });

const formatNumber = (value?: number | null, fallback = '-') =>
  typeof value === 'number' && !Number.isNaN(value) ? String(value) : fallback;

const formatRating = (value?: number | null) =>
  typeof value === 'number' && !Number.isNaN(value) ? `${value}/5` : '-';

const formatCoordinate = (value?: number | null) =>
  typeof value === 'number' && !Number.isNaN(value) ? value.toFixed(5) : 'n/v';

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
  const inspectionFields: Array<[string, string]> = [
    ['Datum', toDateLabel(inspection.performedAt)],
    ['Verkehrssicherheit', inspection.isSafeForTraffic ? 'Verkehrssicher' : 'Nicht verkehrssicher'],
    ['Intervall (Tage)', formatNumber(inspection.newInspectionIntervall)],
    ['Entwicklungsstadium', inspection.developmentalStage || '-'],
    ['Vitalitaet', formatRating(inspection.vitality)],
  ];

  const coordinateLabel = tree
    ? hasValidCoordinates(tree.latitude, tree.longitude, { allowZero: false })
      ? `${formatCoordinate(tree.latitude)}, ${formatCoordinate(tree.longitude)}`
      : 'Keine Koordinaten'
    : null;

  const treeFields: Array<[string, string]> = tree
    ? [
        ['Baum-ID', String(tree.id)],
        ['Baumnummer', formatNumber(tree.number)],
        ['Art', tree.species || 'Unbekannte Art'],
        ['Koordinaten', coordinateLabel ?? 'Keine Angabe'],
        ['Baumhoehe (m)', formatNumber(tree.treeSizeMeters)],
        ['Kronendurchmesser (m)', formatNumber(tree.crownDiameterMeters)],
        ['Anzahl Staemme', formatNumber(tree.numberOfTrunks)],
        ['Stammdurchmesser 1', formatNumber(tree.trunkDiameter1)],
        ['Stammdurchmesser 2', formatNumber(tree.trunkDiameter2)],
        ['Stammdurchmesser 3', formatNumber(tree.trunkDiameter3)],
      ]
    : [];

  const measureList = measures.filter((m) => (inspection.arboriculturalMeasureIds ?? []).includes(m.id));

  const sections: Array<{
    title: string;
    notes?: string | null;
    markings: { label: string; description: string | null }[];
  }> = [
    {
      title: 'Krone',
      notes: inspection.crownInspection?.notes,
      markings: getActiveMarkings<CrownInspectionState>(crownCheckboxes, inspection.crownInspection),
    },
    {
      title: 'Stamm',
      notes: inspection.trunkInspection?.notes,
      markings: getActiveMarkings<TrunkInspectionState>(trunkCheckboxes, inspection.trunkInspection),
    },
    {
      title: 'Stammfuss & Wurzelbereich',
      notes: inspection.stemBaseInspection?.notes,
      markings: getActiveMarkings<StemBaseInspectionState>(stemBaseCheckboxes, inspection.stemBaseInspection),
    },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.label}>Kontrolle #{inspection.id}</Text>
          <Text style={styles.title}>{title}</Text>
          <View style={[styles.badge, inspection.isSafeForTraffic ? styles.badgeSafe : styles.badgeDanger]}>
            <Text style={styles.badgeText}>
              {inspection.isSafeForTraffic ? 'Verkehrssicher' : 'Nicht verkehrssicher'}
            </Text>
          </View>
        </View>

        {tree ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Baum</Text>
            <View style={styles.infoGrid}>
              {treeFields.map(([label, value]) => (
                <View key={label} style={styles.infoItem}>
                  <Text style={styles.infoLabel}>{label}</Text>
                  <Text style={styles.infoValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kontrolle</Text>
          <View style={styles.infoGrid}>
            {inspectionFields.map(([label, value]) => (
              <View key={label} style={styles.infoItem}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.infoLabel}>Beschreibung / Massnahmen</Text>
          <Text style={styles.paragraph}>
            {inspection.description?.trim() ? inspection.description : 'Keine Beschreibung erfasst.'}
          </Text>
        </View>

        {mapImage ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Karte</Text>
            <Image src={mapImage} style={styles.mapImage} />
            {coordinateLabel ? <Text style={styles.muted}>Koordinaten: {coordinateLabel}</Text> : null}
          </View>
        ) : null}

        {measureList.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Verknuepfte Massnahmen</Text>
            {measureList.map((measure) => (
              <View key={measure.id} style={{ marginBottom: 4 }}>
                <Text style={styles.infoValue}>{measure.measureName}</Text>
                {measure.description ? <Text style={styles.muted}>{measure.description}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          {sections.map((section) => (
            <View key={section.title} style={styles.subSection}>
              <Text style={styles.subSectionTitle}>{section.title}</Text>
              <Text style={styles.infoLabel}>Notizen</Text>
              <Text style={styles.paragraph}>
                {section.notes?.trim() ? section.notes : 'Keine Notizen erfasst.'}
              </Text>
              <Text style={styles.infoLabel}>Markierungen</Text>
              {section.markings.length > 0 ? (
                <View style={styles.bulletList}>
                  {section.markings.map(({ label, description }) => (
                    <Text key={label} style={styles.bullet}>
                      - {label}
                      {description ? ` (${description})` : ''}
                    </Text>
                  ))}
                </View>
              ) : (
                <Text style={styles.paragraph}>Keine Auffaelligkeiten markiert.</Text>
              )}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default InspectionPdfDocument;
