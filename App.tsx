import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import BirthInputScreen, { BirthFormResult } from "./screens/BirthInputScreen";
import ChartScreen from "./screens/ChartScreen";
import { BirthChart, calculateBirthChart } from "./lib/astrology/chart";

type ViewState =
  | { screen: "input" }
  | { screen: "chart"; name: string; chart: BirthChart };

export default function App() {
  const [view, setView] = useState<ViewState>({ screen: "input" });

  function handleSubmit({ name, input }: BirthFormResult) {
    const chart = calculateBirthChart(input);
    setView({ screen: "chart", name, chart });
  }

  return (
    <SafeAreaView style={styles.container}>
      {view.screen === "input" ? (
        <BirthInputScreen onSubmit={handleSubmit} />
      ) : (
        <ChartScreen name={view.name} chart={view.chart} onBack={() => setView({ screen: "input" })} />
      )}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
