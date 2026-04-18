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
import { getNextInspectionDaysLabel, getNextInspectionStatus } from '@/features/trees/utils/nextInspection';
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
  centerLabel?: string;
};

const styles = StyleSheet.create({
  page: { padding: 26, fontFamily: 'Helvetica', backgroundColor: '#eef3f8', color: '#10203a' },
  header: {
    backgroundColor: '#f6f9fc',
    borderRadius: 24,
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  kicker: { fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase', color: '#0b6bcb', fontWeight: 700, marginBottom: 6 },
  title: { fontSize: 20, marginBottom: 6, fontWeight: 700, color: '#10203a' },
  meta: { fontSize: 10, color: '#5d6b82', marginBottom: 4 },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 11, marginBottom: 8, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#5d6b82' },
  card: {
    backgroundColor: '#fdfefe',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#ffffff',
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardTitle: { fontSize: 14, fontWeight: 700, color: '#10203a' },
  pillGroup: { alignItems: 'flex-end' },
  pill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    fontSize: 9,
    fontWeight: 700,
    color: '#10203a',
    marginBottom: 6,
    borderWidth: 1,
  },
  pillSuccess: { backgroundColor: '#ecfdf3', borderColor: '#bbf7d0', color: '#166534' },
  pillDanger: { backgroundColor: '#fef2f2', borderColor: '#fecdd3', color: '#991b1b' },
  pillNeutral: { backgroundColor: '#eef2ff', borderColor: '#c7d2fe', color: '#3730a3' },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4, justifyContent: 'space-between' },
  metaItem: {
    width: '48.5%',
    marginBottom: 8,
    backgroundColor: '#f6f9fc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e6edf5',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  metaLabel: { fontSize: 8, color: '#5d6b82', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  metaValue: { fontSize: 11, color: '#10203a', fontWeight: 600, lineHeight: 15 },
  paragraph: { fontSize: 10, lineHeight: 15, color: '#10203a' },
  divider: { height: 1, backgroundColor: '#dbe5f0', marginVertical: 10 },
  smallLabel: { fontSize: 9, color: '#5d6b82', lineHeight: 13 },
  subSection: {
    marginBottom: 8,
    backgroundColor: '#f6f9fc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e6edf5',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  chipText: { fontSize: 9, color: '#312e81' },
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

const getCoordinatesLabel = (tree: Tree) =>
  hasValidCoordinates(tree.latitude, tree.longitude, { allowZero: false })
    ? `${formatCoordinateDisplay(tree.latitude)}, ${formatCoordinateDisplay(tree.longitude)}`
    : 'Keine Koordinaten';

const buildMeasuresLabel = (inspection?: LastInspectionDetail | null) => {
  if (!inspection) {
    return [];
  }
  if (inspection.arboriculturalMeasures && inspection.arboriculturalMeasures.length > 0) {
    return inspection.arboriculturalMeasures.map((measure) =>
      measure.description ? `${measure.measureName} (${measure.description})` : measure.measureName,
    );
  }
  if (inspection.arboriculturalMeasureIds && inspection.arboriculturalMeasureIds.length > 0) {
    return ['Massnahme hinterlegt'];
  }
  return [];
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

const buildSafetyPillStyle = (inspection?: LastInspectionDetail | null) => {
  if (!inspection) return styles.pillNeutral;
  return inspection.isSafeForTraffic ? styles.pillSuccess : styles.pillDanger;
};

const buildSafetyLabel = (inspection?: LastInspectionDetail | null) => {
  if (!inspection) return 'Keine Kontrolle';
  return inspection.isSafeForTraffic ? 'Verkehrssicher' : 'Nicht verkehrssicher';
};

const GreenAreaDataPdfDocument: React.FC<GreenAreaDataPdfDocumentProps> = ({
  greenAreaName,
  trees,
  exportedAt,
  centerLabel,
}) => {
  const generatedAt = exportedAt ? new Date(exportedAt) : new Date();

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.kicker}>Baumdaten Export</Text>
          <Text style={styles.title}>Grünfläche {greenAreaName ?? 'Unbenannt'}</Text>
          <Text style={styles.meta}>Erstellt am {formatDateDisplay(generatedAt)} | Bäume: {trees.length}</Text>
          {centerLabel ? <Text style={styles.meta}>Mittelpunkt: {centerLabel}</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Baumdetails</Text>
        </View>

        {trees.map((entry) => {
          const inspection = entry.inspection;
          const nextStatus = getNextInspectionStatus(entry.tree.nextInspection);
          const measures = buildMeasuresLabel(inspection);
          const sectionData = inspection
            ? [
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
                  title: 'Stammfuß & Wurzelbereich',
                  notes: inspection.stemBaseInspection?.notes,
                  markings: getActiveMarkings<StemBaseInspectionState>(stemBaseCheckboxes, inspection.stemBaseInspection),
                },
              ]
            : [];

          return (
            <View key={entry.tree.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>
                    Baum {formatNumber(entry.tree.number)} | {entry.tree.species || 'Unbekannte Art'}
                  </Text>
                </View>
                <View style={styles.pillGroup}>
                  <Text style={[styles.pill, buildSafetyPillStyle(inspection)]}>{buildSafetyLabel(inspection)}</Text>
                  <Text style={[styles.pill, styles.pillNeutral]}>
                    {getNextInspectionDaysLabel(nextStatus)}
                  </Text>
                </View>
              </View>

              <View style={styles.metaGrid}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Koordinaten</Text>
                  <Text style={styles.metaValue}>{getCoordinatesLabel(entry.tree)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Höhe (m)</Text>
                  <Text style={styles.metaValue}>{formatNumber(entry.tree.treeSizeMeters)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Kronendurchmesser (m)</Text>
                  <Text style={styles.metaValue}>{formatNumber(entry.tree.crownDiameterMeters)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Stammanzahl</Text>
                  <Text style={styles.metaValue}>{formatNumber(entry.tree.numberOfTrunks)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Stammdurchmesser 1</Text>
                  <Text style={styles.metaValue}>{formatNumber(entry.tree.trunkDiameter1)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Stammdurchmesser 2</Text>
                  <Text style={styles.metaValue}>{formatNumber(entry.tree.trunkDiameter2)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Stammdurchmesser 3</Text>
                  <Text style={styles.metaValue}>{formatNumber(entry.tree.trunkDiameter3)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Nächste Kontrolle (Tage)</Text>
                  <Text style={styles.metaValue}>{getNextInspectionDaysLabel(nextStatus)}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {inspection ? (
                <>
                  <View style={styles.metaGrid}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Kontrollzeitpunkt</Text>
                      <Text style={styles.metaValue}>{formatDateTime(inspection.performedAt)}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Intervall (Monate)</Text>
                      <Text style={styles.metaValue}>{formatNumber(inspection.newInspectionIntervall)}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Entwicklungsstadium</Text>
                      <Text style={styles.metaValue}>{inspection.developmentalStage || '-'}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Vitalität</Text>
                      <Text style={styles.metaValue}>{formatVitality(inspection.vitality)}</Text>
                    </View>
                  </View>
                  <View style={{ marginBottom: 6 }}>
                    <Text style={styles.metaLabel}>Beschreibung</Text>
                    <Text style={styles.paragraph}>
                      {inspection.description?.trim() ? inspection.description : 'Keine Beschreibung erfasst.'}
                    </Text>
                  </View>
                  <View style={{ marginBottom: 6 }}>
                    <Text style={styles.metaLabel}>Massnahmen</Text>
                    {measures.length ? (
                      <View style={styles.chipRow}>
                        {measures.map((measure) => (
                          <View key={measure} style={styles.chip}>
                            <Text style={styles.chipText}>{measure}</Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.paragraph}>Keine Massnahmen hinterlegt.</Text>
                    )}
                  </View>

                  <View style={{ marginBottom: 2 }}>
                    <Text style={styles.metaLabel}>Notizen & Markierungen</Text>
                    {sectionData.map((section) => (
                      <View key={section.title} style={styles.subSection}>
                        <Text style={styles.metaValue}>{section.title}</Text>
                        <Text style={styles.smallLabel}>
                          {section.notes?.trim() ? section.notes : 'Keine Notizen erfasst.'}
                        </Text>
                        {section.markings.length ? (
                          <View style={styles.chipRow}>
                            {section.markings.map(({ label, description }) => {
                              const value = description ? `${label} (${description})` : label;
                              return (
                                <View key={`${section.title}-${value}`} style={styles.chip}>
                                  <Text style={styles.chipText}>{value}</Text>
                                </View>
                              );
                            })}
                          </View>
                        ) : (
                          <Text style={styles.smallLabel}>Keine Auffälligkeiten markiert.</Text>
                        )}
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <Text style={styles.smallLabel}>Keine Kontrolle vorhanden.</Text>
              )}

            </View>
          );
        })}
      </Page>
    </Document>
  );
};

export default GreenAreaDataPdfDocument;
