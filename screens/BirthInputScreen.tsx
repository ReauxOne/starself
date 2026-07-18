import React, { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { CITIES, City } from "../lib/astrology/cities";
import { BirthInput } from "../lib/astrology/chart";

export interface BirthFormResult {
  name: string;
  input: BirthInput;
}

interface Props {
  onSubmit: (result: BirthFormResult) => void;
}

function toUtcDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  utcOffsetHours: number
): Date {
  const localAsUtcMillis = Date.UTC(year, month - 1, day, hour, minute);
  return new Date(localAsUtcMillis - utcOffsetHours * 3600 * 1000);
}

export default function BirthInputScreen({ onSubmit }: Props) {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [utcOffset, setUtcOffset] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [manualLat, setManualLat] = useState("");
  const [manualLon, setManualLon] = useState("");
  const [error, setError] = useState<string | null>(null);

  const cityMatches = useMemo(() => {
    if (selectedCity || citySearch.trim().length === 0) return [];
    const q = citySearch.trim().toLowerCase();
    return CITIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [citySearch, selectedCity]);

  function handleSelectCity(city: City) {
    setSelectedCity(city);
    setCitySearch(`${city.name}, ${city.country}`);
    setManualLat("");
    setManualLon("");
  }

  function handleChangeCitySearch(text: string) {
    setCitySearch(text);
    if (selectedCity) setSelectedCity(null);
  }

  function handleSubmit() {
    setError(null);

    const y = parseInt(year, 10);
    const mo = parseInt(month, 10);
    const d = parseInt(day, 10);
    const h = parseInt(hour, 10);
    const mi = parseInt(minute, 10);
    const offset = parseFloat(utcOffset);

    if (!Number.isInteger(y) || y < 1900 || y > 2100) {
      setError("Enter a valid birth year (1900-2100).");
      return;
    }
    if (!Number.isInteger(mo) || mo < 1 || mo > 12) {
      setError("Enter a valid month (1-12).");
      return;
    }
    if (!Number.isInteger(d) || d < 1 || d > 31) {
      setError("Enter a valid day (1-31).");
      return;
    }
    if (!Number.isInteger(h) || h < 0 || h > 23) {
      setError("Enter a valid hour (0-23, 24-hour time).");
      return;
    }
    if (!Number.isInteger(mi) || mi < 0 || mi > 59) {
      setError("Enter a valid minute (0-59).");
      return;
    }
    if (Number.isNaN(offset) || offset < -12 || offset > 14) {
      setError("Enter the UTC offset in effect at the birth time and place (e.g. -5 for EST, 1 for CET).");
      return;
    }

    let latitude: number;
    let longitude: number;
    if (selectedCity) {
      latitude = selectedCity.latitude;
      longitude = selectedCity.longitude;
    } else {
      const lat = parseFloat(manualLat);
      const lon = parseFloat(manualLon);
      if (Number.isNaN(lat) || lat < -90 || lat > 90 || Number.isNaN(lon) || lon < -180 || lon > 180) {
        setError("Select a city or enter valid latitude (-90 to 90) and longitude (-180 to 180).");
        return;
      }
      latitude = lat;
      longitude = lon;
    }

    const dateUtc = toUtcDate(y, mo, d, h, mi, offset);
    onSubmit({ name: name.trim() || "Your Chart", input: { dateUtc, latitude, longitude } });
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>starself</Text>
        <Text style={styles.subtitle}>Enter your birth details to generate your chart</Text>

        <Text style={styles.label}>Name (optional)</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Alex" />

        <Text style={styles.label}>Birth date</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.rowInput]}
            value={year}
            onChangeText={setYear}
            placeholder="Year"
            keyboardType="number-pad"
            maxLength={4}
          />
          <TextInput
            style={[styles.input, styles.rowInput]}
            value={month}
            onChangeText={setMonth}
            placeholder="Month"
            keyboardType="number-pad"
            maxLength={2}
          />
          <TextInput
            style={[styles.input, styles.rowInput]}
            value={day}
            onChangeText={setDay}
            placeholder="Day"
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>

        <Text style={styles.label}>Birth time (24-hour, local)</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.rowInput]}
            value={hour}
            onChangeText={setHour}
            placeholder="Hour"
            keyboardType="number-pad"
            maxLength={2}
          />
          <TextInput
            style={[styles.input, styles.rowInput]}
            value={minute}
            onChangeText={setMinute}
            placeholder="Minute"
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>

        <Text style={styles.label}>UTC offset at birth (include DST if applicable)</Text>
        <TextInput
          style={styles.input}
          value={utcOffset}
          onChangeText={setUtcOffset}
          placeholder="e.g. -5 for EST, 1 for CET"
          keyboardType="numbers-and-punctuation"
        />

        <Text style={styles.label}>Birth city</Text>
        <TextInput
          style={styles.input}
          value={citySearch}
          onChangeText={handleChangeCitySearch}
          placeholder="Search for a city"
        />
        {cityMatches.length > 0 && (
          <View style={styles.dropdown}>
            <FlatList
              data={cityMatches}
              keyExtractor={(item) => `${item.name}-${item.country}`}
              renderItem={({ item }) => (
                <Pressable style={styles.dropdownItem} onPress={() => handleSelectCity(item)}>
                  <Text>
                    {item.name}, {item.country}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        )}

        {!selectedCity && (
          <>
            <Text style={styles.label}>City not listed? Enter coordinates manually</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.rowInput]}
                value={manualLat}
                onChangeText={setManualLat}
                placeholder="Latitude"
                keyboardType="numbers-and-punctuation"
              />
              <TextInput
                style={[styles.input, styles.rowInput]}
                value={manualLon}
                onChangeText={setManualLon}
                placeholder="Longitude"
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </>
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Generate Chart</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, paddingTop: 60, paddingBottom: 60 },
  title: { fontSize: 32, fontWeight: "700", textAlign: "center" },
  subtitle: { fontSize: 14, color: "#666", textAlign: "center", marginTop: 4, marginBottom: 24 },
  label: { fontSize: 13, fontWeight: "600", color: "#333", marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  row: { flexDirection: "row", gap: 8 },
  rowInput: { flex: 1 },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    backgroundColor: "#fff",
  },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  error: { color: "#c0392b", marginTop: 16, fontSize: 14 },
  button: {
    backgroundColor: "#4b3b8f",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 28,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
