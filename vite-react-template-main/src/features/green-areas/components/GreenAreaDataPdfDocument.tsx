import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { getNextInspectionStatus } from '@/features/trees/utils/nextInspection';
import { hasValidCoordinates } from '@/shared/maps/leafletUtils';
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
  page: { padding: 28, fontFamily: 'Helvetica', backgroundColor: '#f8fafc', color: '#0f172a' },
  header: { backgroundColor: '#0f172a', color: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  kicker: { fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: '#cbd5e1' },
  title: { fontSize: 18, marginBottom: 4, fontWeight: 700 },
  meta: { fontSize: 10, color: '#e2e8f0' },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 12, marginBottom: 8, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' },
  table: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  tableHeaderRow: { backgroundColor: '#e2e8f0' },
  cell: { paddingVertical: 6, paddingHorizontal: 8, fontSize: 9, flexShrink: 0 },
  cellNumber: { width: '10%', fontWeight: 700 },
  cellSpecies: { width: '24%' },
  cellCoords: { width: '24%' },
  cellSmall: { width: '14%' },
  cellStatus: { width: '18%' },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', padding: 12, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  cardTitle: { fontSize: 14, fontWeight: 700 },
  pill: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 8, fontSize: 9, fontWeight: 700, color: '#0f172a' },
  pillSuccess: { backgroundColor: '#e6f4ea', borderColor: '#16a34a', borderWidth: 1, color: '#166534' },
  pillDanger: { backgroundColor: '#fef2f2', borderColor: '#b91c1c', borderWidth: 1, color: '#991b1b' },
  pillNeutral: { backgroundColor: '#eef2ff', borderColor: '#4338ca', borderWidth: 1, color: '#312e81' },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  metaItem: { width: '50%', paddingRight: 8, marginBottom: 6 },
  metaLabel: { fontSize: 8, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.6 },
  metaValue: { fontSize: 11, color: '#0f172a', fontWeight: 500 },
  paragraph: { fontSize: 10, lineHeight: 14, color: '#0f172a' },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 8 },
  smallLabel: { fontSize: 9, color: '#475569' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  chip: { paddingVertical: 3, paddingHorizontal: 6, borderRadius: 6, backgroundColor: '#eef2ff', marginRight: 4, marginBottom: 4, borderWidth: 1, borderColor: '#cbd5e1' },
  chipText: { fontSize: 9, color: '#111827' },
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

const formatCoordinate = (value?: number | null) =>
  typeof value === 'number' && !Number.isNaN(value) ? value.toFixed(5) : 'n/v';

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return 'Keine Kontrolle';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return value;
  }
  return parsed.toLocaleString('de-DE');
};

const getCoordinatesLabel = (tree: Tree) =>
  hasValidCoordinates(tree.latitude, tree.longitude, { allowZero: false })
    ? `${formatCoordinate(tree.latitude)}, ${formatCoordinate(tree.longitude)}`
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
    return inspection.arboriculturalMeasureIds.map((id) => `Massnahme ID ${id}`);
  }
  return [];
};

const buildSafetyPillStyle = (inspection?: LastInspectionDetail | null) => {
  if (!inspection) return styles.pillNeutral;
  return inspection.isSafeForTraffic ? styles.pillSuccess : styles.pillDanger;
};

const buildSafetyLabel = (inspection?: LastInspectionDetail | null) => {
  if (!inspection) return 'Keine Kontrolle';
  return inspection.isSafeForTraffic ? 'Verkehrssicher' : 'Nicht verkehrssicher';
};

const GreenAreaDataPdfDocument: React.FC<GreenAreaDataPdfDocumentProps> = ({
  greenAreaId,
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
          <Text style={styles.title}>
            Gruenflaeche {greenAreaName ?? 'Unbenannt'}
            {greenAreaId ? ` | ${greenAreaId}` : ''}
          </Text>
          <Text style={styles.meta}>Erstellt am {generatedAt.toLocaleString('de-DE')} | Baeume: {trees.length}</Text>
          {centerLabel ? <Text style={styles.meta}>Mittelpunkt: {centerLabel}</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kurzuebersicht</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <Text style={[styles.cell, styles.cellNumber]}>Nr.</Text>
              <Text style={[styles.cell, styles.cellSpecies]}>Art</Text>
              <Text style={[styles.cell, styles.cellCoords]}>Koordinaten</Text>
              <Text style={[styles.cell, styles.cellSmall]}>Hoehe m</Text>
              <Text style={[styles.cell, styles.cellSmall]}>Krone m</Text>
              <Text style={[styles.cell, styles.cellStatus]}>Status</Text>
            </View>
            {trees.map((entry) => {
              const inspection = entry.inspection;
              const nextStatus = getNextInspectionStatus(entry.tree.nextInspection);
              const safetyLabel = inspection ? (inspection.isSafeForTraffic ? 'Verkehrssicher' : 'Nicht verkehrssicher') : 'Keine Kontrolle';
              return (
                <View key={entry.tree.id} style={styles.tableRow}>
                  <Text style={[styles.cell, styles.cellNumber]}>{formatNumber(entry.tree.number ?? entry.tree.id)}</Text>
                  <Text style={[styles.cell, styles.cellSpecies]}>{entry.tree.species || 'Unbekannte Art'}</Text>
                  <Text style={[styles.cell, styles.cellCoords]}>{getCoordinatesLabel(entry.tree)}</Text>
                  <Text style={[styles.cell, styles.cellSmall]}>{formatNumber(entry.tree.treeSizeMeters)}</Text>
                  <Text style={[styles.cell, styles.cellSmall]}>{formatNumber(entry.tree.crownDiameterMeters)}</Text>
                  <Text style={[styles.cell, styles.cellStatus]}>
                    {safetyLabel}
                    {nextStatus.hasValue ? ` | ${nextStatus.label}` : ''}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Baumdetails</Text>
        </View>

        {trees.map((entry) => {
          const inspection = entry.inspection;
          const nextStatus = getNextInspectionStatus(entry.tree.nextInspection);
          const measures = buildMeasuresLabel(inspection);

          return (
            <View key={entry.tree.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>
                    Baum {formatNumber(entry.tree.number ?? entry.tree.id)} | {entry.tree.species || 'Unbekannte Art'}
                  </Text>
                  <Text style={styles.smallLabel}>ID {entry.tree.id}</Text>
                </View>
                <View>
                  <Text style={[styles.pill, buildSafetyPillStyle(inspection)]}>{buildSafetyLabel(inspection)}</Text>
                  <Text style={[styles.pill, styles.pillNeutral]}>
                    {nextStatus.hasValue ? nextStatus.label : 'Keine naechste Kontrolle'}
                  </Text>
                </View>
              </View>

              <View style={styles.metaGrid}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Koordinaten</Text>
                  <Text style={styles.metaValue}>{getCoordinatesLabel(entry.tree)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Hoehe (m)</Text>
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
                  <Text style={styles.metaLabel}>Letzte Kontrolle ID</Text>
                  <Text style={styles.metaValue}>{entry.tree.lastInspectionId ?? '-'}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Naechste Kontrolle (Rohwert)</Text>
                  <Text style={styles.metaValue}>{entry.tree.nextInspection ?? 'Keine geplant'}</Text>
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
                      <Text style={styles.metaLabel}>Vitalitaet</Text>
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
