import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity
} from "react-native";
import BackButton from "../components/BackButton";

export default function WorkoutSessionHistoryScreen({ navigation }: any) {
  const [sessions, setSessions] = useState<any[]>([]);

  const loadSessions = async () => {
    const raw = await AsyncStorage.getItem("WORKOUT_SESSIONS");
    const history = raw ? JSON.parse(raw) : [];

   
    history.sort(
      (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    setSessions(history);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadSessions);
    return unsubscribe;
  }, [navigation]);

  return (
    <ScrollView style={styles.container}>
      <BackButton navigation={navigation} />

      <Text style={styles.header}>Workout Sessions</Text>

      {sessions.length === 0 && (
        <Text style={styles.empty}>No sessions logged yet.</Text>
      )}

      {sessions.map((s, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          onPress={() =>
            navigation.navigate("WorkoutSessionDetails", {
              sessionId: s.id,
            })
          }
        >
          <Text style={styles.title}>
            Session • {new Date(s.timestamp).toLocaleDateString()}
          </Text>

          <Text style={styles.subtitle}>
            Duration: {s.duration_minutes} min
          </Text>

          <Text style={styles.subtitle}>
            Completed: {s.exercises_completed.length} exercises
          </Text>

          <Text
            style={[
              styles.syncStatus,
              { color: s.synced ? "#4CC9F0" : "#ffcc00" },
            ]}
          >
            {s.synced ? "Synced ✓" : "Pending Sync ⏳"}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    padding: 20,
    paddingTop: 60,
  },
  header: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 20,
  },
  empty: {
    color: "#777",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    backgroundColor: "#1A1A1A",
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 18,
  },
  title: {
    color: "#4CC9F0",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  subtitle: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 3,
  },
  syncStatus: {
    fontSize: 13,
    marginTop: 8,
    fontWeight: "700",
  },
});
