import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

// ----------------------------
// CHART CONFIG
// ----------------------------
const chartConfig = {
  backgroundColor: "#1A1A1A",
  backgroundGradientFrom: "#1A1A1A",
  backgroundGradientTo: "#1A1A1A",
  decimalPlaces: 1,
  color: () => "#4CC9F0",
  labelColor: () => "#888",
  propsForBackgroundLines: {
    strokeDasharray: "6",
    stroke: "#333",
  },
  propsForDots: {
    r: "5",
    strokeWidth: "2",
    stroke: "#4CC9F0",
  },
};

const WEEK_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export default function WeeklyInsightsScreen({ navigation }: any) {
  const [weeklyScores, setWeeklyScores] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [weeklyVolume, setWeeklyVolume] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [weeklyAvg, setWeeklyAvg] = useState<number | null>(null);
  const [pendingSync, setPendingSync] = useState<number>(0);

  // ----------------------------
  // LOAD HISTORY FROM STORAGE
  // ----------------------------
  const loadData = async () => {
    try {
      // ----- LOAD CHECK-IN HISTORY -----
      const rawCheckins = await AsyncStorage.getItem("CHECKIN_HISTORY");
      const checkins = rawCheckins ? JSON.parse(rawCheckins) : [];
      const last7Checkins = checkins.slice(0, 7);

      const scores = last7Checkins.map((item: any) => item.recoveryScore);

      while (scores.length < 7) scores.push(0);

      // Prevent Infinity / NaN crash
      const safeScores = scores.map((v: number) => (isFinite(v) ? v : 0));


      setWeeklyScores(safeScores.reverse());

      if (last7Checkins.length > 0) {
        const avg =
          last7Checkins.reduce(
            (sum: number, x: any) => sum + x.recoveryScore,
            0
          ) / last7Checkins.length;

        setWeeklyAvg(Number(avg.toFixed(1)));
      }

      // ----- LOAD WORKOUT HISTORY -----
      const rawWorkouts = await AsyncStorage.getItem("WORKOUT_HISTORY");
      const workouts = rawWorkouts ? JSON.parse(rawWorkouts) : [];
      const last7Workouts = workouts.slice(0, 7);

      const volume = last7Workouts.map((w: any) => w.totalVolume);

      while (volume.length < 7) volume.push(0);

      const safeVolume = volume.map((v: number) => (isFinite(v) ? v : 0));


      setWeeklyVolume(safeVolume.reverse());

      // ----- SYNC PENDING COUNT -----
      let pending = 0;
      pending += checkins.filter((c: any) => !c.synced).length;
      pending += workouts.filter((w: any) => !w.synced).length;

      setPendingSync(pending);
    } catch (e) {
      console.log("Weekly Insights load error:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* BACK BUTTON */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      {/* HEADER */}
      <Text style={styles.header}>Weekly Insights</Text>
      <Text style={styles.subheader}>Your 7-day performance summary</Text>

      {/* SYNC STATUS */}
      <View style={styles.syncCard}>
        <Text style={styles.syncTitle}>Sync Status</Text>
        {pendingSync > 0 ? (
          <Text style={styles.syncPending}>⏳ Pending Sync: {pendingSync} entries</Text>
        ) : (
          <Text style={styles.syncGood}>✔ All data synced</Text>
        )}
      </View>

      {/* RECOVERY TREND */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recovery Trend</Text>

        <LineChart
          data={{
            labels: WEEK_LABELS,
            datasets: [{ data: weeklyScores }],
          }}
          width={screenWidth - 70}
          height={220}
          chartConfig={chartConfig}
          bezier
          withInnerLines
          fromZero
          style={styles.chart}
        />

        <Text style={styles.statTitle}>
          Avg Recovery: {weeklyAvg ?? "--"}/10
        </Text>

        <Text style={styles.statSubtitle}>
          {weeklyAvg === null
            ? "Not enough data — complete more check-ins."
            : weeklyAvg >= 7
            ? "Good weekly recovery — keep it up."
            : "Recovery slightly low — monitor fatigue."}
        </Text>
      </View>

      {/* TRAINING VOLUME */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Training Volume (Sets)</Text>

        <BarChart
          data={{
            labels: WEEK_LABELS,
            datasets: [{ data: weeklyVolume }],
          }}
          width={screenWidth - 70}
          height={220}
          chartConfig={chartConfig}
          fromZero
          withInnerLines
          yAxisLabel=""     // ← REQUIRED FIX
          yAxisSuffix=""    // ← REQUIRED FIX
          style={styles.chart}
        />

        <Text style={styles.statTitle}>
          Weekly Volume: {weeklyVolume.reduce((a, b) => a + b, 0)} sets
        </Text>

        <Text style={styles.statWarning}>
          {weeklyVolume.reduce((a, b) => a + b, 0) > 80
            ? "⚠️ High volume — risk of overtraining."
            : "Healthy training volume this week."}
        </Text>
      </View>

      {/* SUMMARY */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Summary</Text>

        <Text style={styles.summaryPoint}>
          • Last Score: {weeklyScores[6] ?? "--"}/10
        </Text>
        <Text style={styles.summaryPoint}>
          • Average Recovery: {weeklyAvg ?? "--"}/10
        </Text>
        <Text style={styles.summaryPoint}>
          • Total Volume: {weeklyVolume.reduce((a, b) => a + b, 0)} sets
        </Text>
      </View>
    </ScrollView>
  );
}

// ----------------------------
// STYLES
// ----------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 10,
  },

  backButtonText: {
    color: "#4CC9F0",
    fontSize: 18,
    fontWeight: "600",
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
    textAlign: "center",
    marginBottom: 30,
  },

  syncCard: {
    backgroundColor: "#1A1A1A",
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    marginBottom: 25,
  },

  syncTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },

  syncPending: {
    color: "#ffcc00",
    fontSize: 16,
    fontWeight: "700",
  },

  syncGood: {
    color: "#4CC9F0",
    fontSize: 16,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#1A1A1A",
    padding: 20,
    borderRadius: 18,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#222",
  },

  cardTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },

  chart: {
    borderRadius: 14,
    marginBottom: 15,
  },

  statTitle: {
    color: "#4CC9F0",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 5,
  },

  statSubtitle: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 2,
  },

  statWarning: {
    color: "#ff5555",
    fontSize: 14,
    marginTop: 5,
    fontWeight: "600",
  },

  summaryPoint: {
    color: "#ccc",
    fontSize: 15,
    marginBottom: 6,
  },
});
