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
  page: { padding: 26, fontSize: 10, fontFamily: 'Helvetica', color: '#10203a', backgroundColor: '#eef3f8' },
  header: {
    marginBottom: 16,
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: '#f6f9fc',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  label: { fontSize: 9, color: '#0b6bcb', marginBottom: 4, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 700 },
  title: { fontSize: 20, marginBottom: 8, color: '#10203a', fontWeight: 700 },
  badge: {
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 999,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  badgeSafe: { backgroundColor: '#ecfdf3', borderColor: '#bbf7d0' },
  badgeDanger: { backgroundColor: '#fef2f2', borderColor: '#fecdd3' },
  badgeText: { fontSize: 10 },
  section: {
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#fdfefe',
  },
  sectionTitle: { fontSize: 11, marginBottom: 10, color: '#5d6b82', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  infoItem: {
    width: '48.5%',
    marginRight: '1.5%',
    marginBottom: 8,
    backgroundColor: '#f6f9fc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e6edf5',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  infoLabel: { fontSize: 8, color: '#5d6b82', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 },
  infoValue: { fontSize: 11, lineHeight: 15, color: '#10203a', fontWeight: 600 },
  paragraph: { fontSize: 10, lineHeight: 15, marginBottom: 8, color: '#10203a' },
  mapImage: { width: '100%', height: 220, marginTop: 8, borderRadius: 18 },
  subSection: {
    marginBottom: 10,
    backgroundColor: '#f6f9fc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e6edf5',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  subSectionTitle: { fontSize: 11, marginBottom: 6, color: '#10203a', fontWeight: 700 },
  bulletList: { marginLeft: 8, marginTop: 4 },
  bullet: { fontSize: 10, lineHeight: 15, color: '#10203a' },
  muted: { fontSize: 9, color: '#5d6b82', marginTop: 4 },
});

const toDateLabel = (value: string) => {
  return formatDateDisplay(value, value);
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

const formatVitality = (value?: string | number | null) => {
  if (typeof value === 'string') {
    return value.trim() || '-';
  }
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return normalizeVitality(value);
  }
  return '-';
};

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
    ['Vitalität', formatVitality(inspection.vitality)],
  ];

  const coordinateLabel = tree
    ? hasValidCoordinates(tree.latitude, tree.longitude, { allowZero: false })
      ? `${formatCoordinateDisplay(tree.latitude)}, ${formatCoordinateDisplay(tree.longitude)}`
      : 'Keine Koordinaten'
    : null;

  const treeFields: Array<[string, string]> = tree
    ? [
        ['Baumnummer', formatNumber(tree.number)],
        ['Art', tree.species || 'Unbekannte Art'],
        ['Koordinaten', coordinateLabel ?? 'Keine Angabe'],
        ['Baumhöhe (m)', formatNumber(tree.treeSizeMeters)],
        ['Kronendurchmesser (m)', formatNumber(tree.crownDiameterMeters)],
        ['Anzahl Stämme', formatNumber(tree.numberOfTrunks)],
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
          <Text style={styles.label}>Kontrollexport</Text>
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
                <Text style={styles.paragraph}>Keine Auffälligkeiten markiert.</Text>
              )}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default InspectionPdfDocument;
