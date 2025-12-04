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
  const [weeklyScores, setWeeklyScores] = useState<number[]>([0,0,0,0,0,0,0]);
  const [weeklyVolume, setWeeklyVolume] = useState<number[]>([0,0,0,0,0,0,0]);
  const [weeklyAvg, setWeeklyAvg] = useState<number | null>(null);
  const [pendingSync, setPendingSync] = useState<number>(0);

  const loadData = async () => {
    try {
     
      const userStr = await AsyncStorage.getItem("user_profile");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id ?? "default";

      const checkinKey = `CHECKIN_HISTORY_${userId}`;
      const workoutKey = `WORKOUT_HISTORY_${userId}`;

     
      const rawCheckins = await AsyncStorage.getItem(checkinKey);
      const checkins = rawCheckins ? JSON.parse(rawCheckins) : [];

      let weekData = [0, 0, 0, 0, 0, 0, 0];

      checkins.slice(0, 7).forEach((c: any) => {
        const day = new Date(c.timestamp).getDay();
        const index = day === 0 ? 6 : day - 1; 
        weekData[index] = c.recoveryScore;
      });

      setWeeklyScores(weekData);

      
      if (checkins.length > 0) {
        const avg =
          checkins
            .slice(0, 7)
            .reduce((sum: number, c: any) => sum + c.recoveryScore, 0) /
          Math.min(7, checkins.length);

        setWeeklyAvg(Number(avg.toFixed(1)));
      }

      
      const rawWorkouts = await AsyncStorage.getItem(workoutKey);
      const workouts = rawWorkouts ? JSON.parse(rawWorkouts) : [];

      let weekVolumeData = [0, 0, 0, 0, 0, 0, 0]; 

      workouts.slice(0, 7).forEach((w: any) => {
        const day = new Date(w.timestamp).getDay(); 
        const index = day === 0 ? 6 : day - 1; 
        weekVolumeData[index] = w.totalVolume;
      });

      setWeeklyVolume(weekVolumeData);

     
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
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

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
          data={{ labels: WEEK_LABELS, datasets: [{ data: weeklyScores }] }}
          width={screenWidth - 70}
          height={220}
          chartConfig={chartConfig}
          bezier
          fromZero
          style={styles.chart}
        />

        <Text style={styles.statTitle}>Avg Recovery: {weeklyAvg ?? "--"}/10</Text>
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
          data={{ labels: WEEK_LABELS, datasets: [{ data: weeklyVolume }] }}
          width={screenWidth - 70}
          height={220}
          chartConfig={chartConfig}
          fromZero
          yAxisLabel=""
          yAxisSuffix=""
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

        <Text style={styles.summaryPoint}>• Last Score: {weeklyScores[6]}/10</Text>
        <Text style={styles.summaryPoint}>• Avg Recovery: {weeklyAvg ?? "--"}/10</Text>
        <Text style={styles.summaryPoint}>
          • Total Volume: {weeklyVolume.reduce((a, b) => a + b, 0)} sets
        </Text>
      </View>
    </ScrollView>
  );
}


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
