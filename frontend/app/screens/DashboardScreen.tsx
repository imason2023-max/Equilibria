import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { RecoveryAPI } from "../../api/api";

export default function DashboardScreen({ navigation, route }: any) {
  const [todayScore, setTodayScore] = useState<number | null>(null);
  const [recommendation, setRecommendation] = useState<string>("--");
  const [pendingSync, setPendingSync] = useState<number>(0);


  const [weeklyAvg, setWeeklyAvg] = useState("--");
  const [weeklyWorkouts, setWeeklyWorkouts] = useState("--");
  const [weeklyRestDays, setWeeklyRestDays] = useState("--");

 
  const [overtrainingRisk, setOvertrainingRisk] = useState("--");

  const getRecommendation = (score: number) => {
    if (score >= 8) return "High Recovery – Train Hard 💪";
    if (score >= 5) return "Moderate Recovery – Normal Training";
    return "Low Recovery – Light Training or Rest 💤";
  };

  const loadBackendRecovery = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) return false;

      const res = await RecoveryAPI.latest(token);

      if (res?.recovery_score !== undefined) {
        setTodayScore(res.recovery_score);
        setRecommendation(
          res.recommended_intensity || getRecommendation(res.recovery_score)
        );
        return true;
      }

      return false;
    } catch (err) {
      console.log("Backend recovery fetch failed:", err);
      return false;
    }
  };

  const loadLocalRecovery = async () => {
    const historyStr = await AsyncStorage.getItem("CHECKIN_HISTORY");
    if (!historyStr) return;

    const history = JSON.parse(historyStr);
    if (history.length > 0) {
      const last = history[0];
      setTodayScore(last.recoveryScore);
      setRecommendation(getRecommendation(last.recoveryScore));
    }
  };

  // ⭐ WEEKLY SUMMARY + OVERTRAINING RISK (Option A added)
  const loadWeeklySummary = async () => {
    try {
      const historyStr = await AsyncStorage.getItem("CHECKIN_HISTORY");
      if (!historyStr) return;

      const checks = JSON.parse(historyStr);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const thisWeek = checks.filter((e: any) => {
        return new Date(e.timestamp) >= weekAgo;
      });

     
      if (thisWeek.length > 0) {
        const avg =
          thisWeek.reduce((sum: number, e: any) => sum + e.recoveryScore, 0) /
          thisWeek.length;

        setWeeklyAvg(avg.toFixed(1));

      
        let risk = "--";

        const wStr = await AsyncStorage.getItem("WORKOUT_HISTORY");
        let workoutsThisWeek = 0;

        if (wStr) {
          const workouts = JSON.parse(wStr);
          workoutsThisWeek = workouts.filter(
            (w: any) => new Date(w.timestamp) >= weekAgo
          ).length;
        }

        if (avg < 5 && workoutsThisWeek >= 2) {
          risk = "High Risk 🚨";
        } else if (avg < 7 && workoutsThisWeek >= 2) {
          risk = "Medium Risk ⚠️";
        } else {
          risk = "Low Risk ✅";
        }

        setOvertrainingRisk(risk);
      } else {
        setWeeklyAvg("--");
        setOvertrainingRisk("--");
      }

     
      const workoutStr = await AsyncStorage.getItem("WORKOUT_HISTORY");
      if (workoutStr) {
        const workouts = JSON.parse(workoutStr);
        const weekWorkouts = workouts.filter(
          (w: any) => new Date(w.timestamp) >= weekAgo
        );
        setWeeklyWorkouts(weekWorkouts.length.toString());
      } else {
        setWeeklyWorkouts("0");
      }

      
      const daysSet = new Set(
        thisWeek.map((e: any) => new Date(e.timestamp).toDateString())
      );

      const rest = 7 - daysSet.size;
      setWeeklyRestDays(rest.toString());
    } catch (err) {
      console.log("Error loading weekly summary:", err);
    }
  };

  const loadDashboard = async () => {
    try {
      const backendWorked = await loadBackendRecovery();

      if (!backendWorked) {
        await loadLocalRecovery();
      }

      let pending = 0;

      const checkRaw = await AsyncStorage.getItem("CHECKIN_HISTORY");
      if (checkRaw) {
        const checks = JSON.parse(checkRaw);
        pending += checks.filter((x: any) => !x.synced).length;
      }

      const workoutRaw = await AsyncStorage.getItem("WORKOUT_HISTORY");
      if (workoutRaw) {
        const workouts = JSON.parse(workoutRaw);
        pending += workouts.filter((x: any) => !x.synced).length;
      }

      setPendingSync(pending);

     
      await loadWeeklySummary();
    } catch (err) {
      console.log("Error loading dashboard:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadDashboard);
    return unsubscribe;
  }, [navigation, route?.params?.recoveryScore]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>Welcome Back</Text>
      <Text style={styles.subheader}>Your Recovery Overview</Text>

      {/* SYNC STATUS */}
      <View style={styles.syncCard}>
        <Text style={styles.syncTitle}>Sync Status</Text>

        {pendingSync > 0 ? (
          <Text style={styles.syncPending}>
            ⏳ Pending Sync: {pendingSync} entries
          </Text>
        ) : (
          <Text style={styles.syncGood}>✔ All data synced</Text>
        )}
      </View>

      {/* TODAY SCORE */}
      <View style={styles.recoveryCard}>
        <Text style={styles.recoveryLabel}>Today's Recovery Score</Text>

        <Text style={styles.recoveryValue}>
          {todayScore !== null ? todayScore : "--"}
        </Text>

        <Text style={styles.recoveryStatus}>
          {todayScore !== null ? "Updated" : "Complete Check-In"}
        </Text>
      </View>

      {/* TODAY RECOMMENDATION */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Recommendation</Text>
        <Text style={styles.cardValue}>
          {todayScore !== null ? recommendation : "--"}
        </Text>

        <Text style={styles.cardSubtitle}>
          {todayScore !== null
            ? "Based on your latest recovery score."
            : "Complete a check-in to see your plan."}
        </Text>
      </View>

      {/* WEEKLY SUMMARY */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>This Week’s Summary</Text>
        <Text style={styles.cardSubtitle}>Avg Recovery: {weeklyAvg}</Text>
        <Text style={styles.cardSubtitle}>
          Workouts Logged: {weeklyWorkouts}
        </Text>
        <Text style={styles.cardSubtitle}>Rest Days: {weeklyRestDays}</Text>
      </View>

      {/* ⭐ OVERTRAINING RISK (option A) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Overtraining Risk</Text>
        <Text style={styles.cardValue}>{overtrainingRisk}</Text>

        <Text style={styles.cardSubtitle}>
          {overtrainingRisk === "--"
            ? "Complete a check-in to see status."
            : "Based on recovery & training load."}
        </Text>
      </View>

      {/* WEARABLE */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Wearable Sync Status</Text>
        <Text style={[styles.cardSubtitle, { color: "red" }]}>
          Not Connected
        </Text>
      </View>

      {/* BUTTONS */}
      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => navigation.navigate("WorkoutHistory")}
      >
        <Text style={styles.buttonSecondaryText}>Workout History</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => navigation.navigate("WorkoutSessionHistory")}
      >
        <Text style={styles.buttonSecondaryText}>Workout Sessions</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

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
    marginBottom: 5,
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
  recoveryCard: {
    backgroundColor: "#1A1A1A",
    padding: 25,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    marginBottom: 30,
    alignItems: "center",
  },
  recoveryLabel: {
    color: "#aaa",
    fontSize: 16,
    marginBottom: 10,
  },
  recoveryValue: {
    color: "#4CC9F0",
    fontSize: 60,
    fontWeight: "800",
    marginBottom: 10,
  },
  recoveryStatus: {
    color: "#888",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#1A1A1A",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    marginBottom: 20,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  cardValue: {
    color: "#4CC9F0",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardSubtitle: {
    color: "#888",
    fontSize: 14,
  },
  buttonSecondary: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  buttonSecondaryText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
});
