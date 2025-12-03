import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import BackButton from "../components/BackButton";

export default function WorkoutHistoryScreen({ navigation }: any) {
  const [workouts, setWorkouts] = useState<any[]>([]);

  const loadWorkouts = async () => {
    try {
      const raw = await AsyncStorage.getItem("WORKOUT_HISTORY");
      const history = raw ? JSON.parse(raw) : [];
      setWorkouts(history);
    } catch (err) {
      console.log("Error loading workout history:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadWorkouts);
    return unsubscribe;
  }, [navigation]);

  return (
    <ScrollView style={styles.container}>
      <BackButton navigation={navigation} />

      <Text style={styles.header}>Workout History</Text>
      <Text style={styles.subheader}>View your past training sessions</Text>

      {workouts.length === 0 && (
        <Text style={styles.emptyText}>No workouts logged yet.</Text>
      )}

      {workouts.map((workout, index) => (
        <View key={index} style={styles.card}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={styles.cardTitle}>
              Workout #{workouts.length - index}
            </Text>
            <Text style={styles.syncStatus}>
              {workout.synced ? "🟢 Synced" : "🟡 Pending"}
            </Text>
          </View>

          <Text style={styles.cardSubtitle}>
            {new Date(workout.timestamp).toLocaleString()}
          </Text>

          <Text style={styles.detailText}>
            Exercises: {workout.exercises.length}
          </Text>
          <Text style={styles.detailText}>
            Total Volume: {workout.totalVolume} sets
          </Text>

          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => navigation.navigate("WorkoutDetails", { workout })}
          >
            <Text style={styles.detailButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      ))}
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
  emptyText: {
    color: "#555",
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
  },
  card: {
    backgroundColor: "#1A1A1A",
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 20,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  cardSubtitle: {
    color: "#aaa",
    marginBottom: 10,
  },
  detailText: {
    color: "#ccc",
    fontSize: 16,
    marginTop: 5,
  },
  syncStatus: {
    color: "#4CC9F0",
    fontWeight: "700",
  },
  detailButton: {
    marginTop: 15,
    backgroundColor: "#4CC9F0",
    paddingVertical: 12,
    borderRadius: 12,
  },
  detailButtonText: {
    textAlign: "center",
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },
});
