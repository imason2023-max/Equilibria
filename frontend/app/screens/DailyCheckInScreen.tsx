import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { RecoveryAPI, WearableAPI } from "../../api/api";
import BackButton from "../components/BackButton";

export default function DailyCheckInScreen({ navigation }: any) {
  const [sleep, setSleep] = useState("");
  const [hrv, setHrv] = useState("");
  const [soreness, setSoreness] = useState(5);
  const [energy, setEnergy] = useState(5);

  // ------------------------------------
  // CALCULATE LOCAL RECOVERY SCORE
  // ------------------------------------
  const calculateRecovery = () => {
    const s = parseFloat(sleep);
    const h = parseFloat(hrv);

    if (isNaN(s) || s <= 0) {
      Alert.alert("Missing Input", "Please enter valid sleep hours.");
      return null;
    }

    if (isNaN(h) || h <= 0) {
      Alert.alert("Missing Input", "Please enter valid HRV (ms).");
      return null;
    }

    const score =
      0.4 * (s / 10) * 10 +
      0.3 * (10 - soreness) +
      0.3 * energy +
      (h / 100) * 2;

    return Math.min(10, Math.max(1, Math.round(score)));
  };

  // ------------------------------------
  // SAVE LOCALLY (OFFLINE SUPPORT)
  // ------------------------------------
  const saveCheckIn = async (entry: any) => {
    try {
      const existing = await AsyncStorage.getItem("CHECKIN_HISTORY");
      let history = existing ? JSON.parse(existing) : [];

      history.unshift(entry);
      await AsyncStorage.setItem("CHECKIN_HISTORY", JSON.stringify(history));
    } catch (err) {
      console.log("Error saving check-in:", err);
    }
  };

  // ------------------------------------
  // SYNC WEARABLE → BACKEND
  // ------------------------------------
  const handleSyncWearable = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        Alert.alert("Login Required", "You must be logged in to sync data.");
        return;
      }

      // Fake test payload (works with backend today)
      const payload = {
        source: "apple_health",
        measurement_date: new Date().toISOString(),
        hrv_rmssd: 55,
        hrv_sdnn: 70,
        resting_heart_rate: 58,
        avg_heart_rate: 82,
        sleep_duration_minutes: 420,
        deep_sleep_minutes: 90,
        rem_sleep_minutes: 110,
        steps: 5400,
        active_calories: 350,
        raw_data: {},
      };

      const res = await WearableAPI.sync(payload, token);

      Alert.alert("Wearable Synced", "Your wearable data was uploaded.");
      console.log("Wearable sync result:", res);

    } catch (err: any) {
      console.log("Wearable sync failed:", err?.response?.data || err);
      Alert.alert("Sync Error", "Unable to sync wearable data.");
    }
  };

  // ------------------------------------
  // SUBMIT CHECK-IN → BACKEND + LOCAL
  // ------------------------------------
  const handleSubmit = async () => {
    const score = calculateRecovery();
    if (score === null) return;

    const payload = {
      sleep_hours: parseFloat(sleep),
      sleep_quality: 0,
      soreness_level: soreness,
      energy_level: energy,
      stress_level: 0,
    };

    let entry = {
      ...payload,
      recoveryScore: score,
      timestamp: new Date().toISOString(),
      synced: false,
    };

    // Save offline immediately
    await saveCheckIn(entry);

    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (token) {
        // POST /recovery/log
        const res = await RecoveryAPI.log(payload, token);

        entry.synced = true;
        entry.recoveryScore = res.recovery_score ?? score;

        // Update local history with synced entry
        const historyStr = await AsyncStorage.getItem("CHECKIN_HISTORY");
        const history = historyStr ? JSON.parse(historyStr) : [];
        history[0] = entry;
        await AsyncStorage.setItem("CHECKIN_HISTORY", JSON.stringify(history));

        // Fetch backend REAL latest recovery
        try {
          const latest = await RecoveryAPI.latest(token);
          await AsyncStorage.setItem("LATEST_RECOVERY", JSON.stringify(latest));

          entry.recoveryScore = latest.recovery_score;
        } catch (err) {
          console.log("Failed to fetch latest:", err);
        }
      }
    } catch (err: any) {
      console.log("Recovery sync failed:", err?.response?.data || err);
    }

    navigation.navigate("Dashboard", { recoveryScore: entry.recoveryScore });
  };

  // ------------------------------------
  // UI
  // ------------------------------------
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      <BackButton navigation={navigation} />

      <Text style={styles.header}>Daily Check-In</Text>
      <Text style={styles.subheader}>How did your body feel today?</Text>

      {/* Sleep */}
      <View style={styles.card}>
        <Text style={styles.label}>Sleep Hours</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 7.5"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={sleep}
          onChangeText={setSleep}
        />
      </View>

      {/* HRV */}
      <View style={styles.card}>
        <Text style={styles.label}>HRV (ms)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 62"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={hrv}
          onChangeText={setHrv}
        />

        <TouchableOpacity
          style={styles.syncButton}
          onPress={handleSyncWearable}
        >
          <Text style={styles.syncButtonText}>Sync from Wearable</Text>
        </TouchableOpacity>
      </View>

      {/* Soreness */}
      <View style={styles.card}>
        <Text style={styles.label}>Soreness Level</Text>
        <Text style={styles.valueText}>{soreness}/10</Text>

        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={0}
          maximumValue={10}
          step={1}
          minimumTrackTintColor="#4CC9F0"
          maximumTrackTintColor="#555"
          thumbTintColor="#4CC9F0"
          value={soreness}
          onValueChange={setSoreness}
        />
      </View>

      {/* Energy */}
      <View style={styles.card}>
        <Text style={styles.label}>Energy Level</Text>
        <Text style={styles.valueText}>{energy}/10</Text>

        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={0}
          maximumValue={10}
          step={1}
          minimumTrackTintColor="#4CC9F0"
          maximumTrackTintColor="#555"
          thumbTintColor="#4CC9F0"
          value={energy}
          onValueChange={setEnergy}
        />
      </View>

      {/* Submit */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Check-In</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

// ------------------------------------
// STYLES
// ------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    paddingHorizontal: 25,
    paddingTop: 60,
  },
  header: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
  },
  subheader: {
    color: "#888",
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1A1A1A",
    padding: 20,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  label: { color: "#fff", fontSize: 18, fontWeight: "600" },
  valueText: {
    color: "#4CC9F0",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "right",
  },
  input: {
    backgroundColor: "#111",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    borderColor: "#333",
    borderWidth: 1,
    fontSize: 16,
  },
  syncButton: {
    marginTop: 12,
    paddingVertical: 12,
    backgroundColor: "#333",
    borderRadius: 10,
  },
  syncButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#4CC9F0",
    paddingVertical: 18,
    borderRadius: 14,
    marginTop: 10,
  },
  buttonText: {
    textAlign: "center",
    color: "#000",
    fontSize: 18,
    fontWeight: "700",
  },
});
