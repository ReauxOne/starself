import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BirthChart, PlanetPosition } from "../lib/astrology/chart";
import { formatDegree } from "../lib/astrology/format";

interface Props {
  name: string;
  chart: BirthChart;
  onBack: () => void;
}

function findPlanet(chart: BirthChart, body: PlanetPosition["body"]): PlanetPosition {
  const found = chart.planets.find((p) => p.body === body);
  if (!found) throw new Error(`Missing planet: ${body}`);
  return found;
}

export default function ChartScreen({ name, chart, onBack }: Props) {
  const sun = findPlanet(chart, "Sun");
  const moon = findPlanet(chart, "Moon");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>{"< Back"}</Text>
      </Pressable>

      <Text style={styles.title}>{name}</Text>

      <View style={styles.headline}>
        <HeadlineItem label="Sun" value={sun.sign} />
        <HeadlineItem label="Moon" value={moon.sign} />
        <HeadlineItem label="Rising" value={chart.ascendant.sign} />
      </View>

      <Text style={styles.sectionTitle}>Planets</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeaderRow]}>
          <Text style={[styles.cell, styles.headerCell, styles.cellPlanet]}>Planet</Text>
          <Text style={[styles.cell, styles.headerCell, styles.cellSign]}>Sign</Text>
          <Text style={[styles.cell, styles.headerCell, styles.cellDegree]}>Degree</Text>
          <Text style={[styles.cell, styles.headerCell, styles.cellHouse]}>House</Text>
        </View>
        {chart.planets.map((p) => (
          <View key={p.body} style={styles.tableRow}>
            <Text style={[styles.cell, styles.cellPlanet]}>{p.body}</Text>
            <Text style={[styles.cell, styles.cellSign]}>{p.sign}</Text>
            <Text style={[styles.cell, styles.cellDegree]}>{formatDegree(p.degreeInSign)}</Text>
            <Text style={[styles.cell, styles.cellHouse]}>{p.house}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Ascendant</Text>
      <Text style={styles.ascendantText}>
        {chart.ascendant.sign} {formatDegree(chart.ascendant.degreeInSign)}
      </Text>

      <Text style={styles.footnote}>
        Houses shown are whole-sign houses. Planetary positions are geocentric ecliptic
        longitudes computed from a modern ephemeris.
      </Text>
    </ScrollView>
  );
}

function HeadlineItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.headlineItem}>
      <Text style={styles.headlineLabel}>{label}</Text>
      <Text style={styles.headlineValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60, paddingBottom: 60 },
  backButton: { marginBottom: 12 },
  backButtonText: { color: "#4b3b8f", fontSize: 16, fontWeight: "600" },
  title: { fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 20 },
  headline: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f4f1fb",
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 28,
  },
  headlineItem: { alignItems: "center" },
  headlineLabel: { fontSize: 12, color: "#666", marginBottom: 4 },
  headlineValue: { fontSize: 16, fontWeight: "700", color: "#4b3b8f" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10, marginTop: 8 },
  table: { borderWidth: 1, borderColor: "#eee", borderRadius: 8, overflow: "hidden" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee" },
  tableHeaderRow: { backgroundColor: "#f8f8f8" },
  cell: { paddingVertical: 10, paddingHorizontal: 8, fontSize: 14 },
  headerCell: { fontWeight: "700", color: "#333" },
  cellPlanet: { flex: 1.2 },
  cellSign: { flex: 1.3 },
  cellDegree: { flex: 1 },
  cellHouse: { flex: 0.7, textAlign: "right" },
  ascendantText: { fontSize: 16, marginBottom: 20 },
  footnote: { fontSize: 12, color: "#999", marginTop: 12, lineHeight: 18 },
});
