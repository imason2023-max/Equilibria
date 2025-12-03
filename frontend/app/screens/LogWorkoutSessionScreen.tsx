import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { WorkoutSessionAPI } from "../../api/api";
import BackButton from "../components/BackButton";

export default function LogWorkoutSessionScreen({ navigation, route }: any) {
  const workout = route.params.workout;

  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [completed, setCompleted] = useState<string[]>(
    workout.exercises.map((ex: any) => ex.name)
  );

  const toggleExercise = (name: string) => {
    setCompleted((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  // ------------------------------------------------
  // SAVE SESSION + AUTO-NAVIGATE TO DETAILS
  // ------------------------------------------------
  const saveSession = async () => {
    if (!duration) {
      Alert.alert("Missing Duration", "Please enter workout duration.");
      return;
    }

    const session = {
      id: Date.now(),
      workout_id: workout.backend_id || workout.id,
      duration_minutes: parseInt(duration),
      exercises_completed: completed,
      notes,
      timestamp: new Date().toISOString(),
      synced: false,
    };

    // 1️⃣ Save locally
    try {
      const raw = await AsyncStorage.getItem("WORKOUT_SESSIONS");
      const history = raw ? JSON.parse(raw) : [];

      history.unshift(session);
      await AsyncStorage.setItem("WORKOUT_SESSIONS", JSON.stringify(history));
    } catch (err) {
      console.log("Session local save error:", err);
    }

    // 2️⃣ Sync with backend
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (token) {
        const payload = {
          workout_id: session.workout_id,
          duration_minutes: session.duration_minutes,
          exercises_completed: session.exercises_completed,
          notes: session.notes,
        };

        const backendRes = await WorkoutSessionAPI.log(payload, token);

        // Update local entry
        const raw = await AsyncStorage.getItem("WORKOUT_SESSIONS");
        const history = raw ? JSON.parse(raw) : [];

        history[0].synced = true;
        history[0].backend_id = backendRes.id;

        await AsyncStorage.setItem("WORKOUT_SESSIONS", JSON.stringify(history));
      }
    } catch (err) {
      console.log("Session sync error:", err);
    }

    // 3️⃣ Navigate straight to DETAILS screen
    navigation.navigate("WorkoutSessionDetails", {
      sessionId: session.id,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <BackButton navigation={navigation} />

      <Text style={styles.header}>Log Workout Session</Text>
      <Text style={styles.subheader}>{workout.exercises.length} Exercises</Text>

      {/* DURATION */}
      <View style={styles.card}>
        <Text style={styles.label}>Duration (minutes)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={duration}
          onChangeText={setDuration}
          placeholder="e.g. 45"
          placeholderTextColor="#777"
        />
      </View>

      {/* NOTES */}
      <View style={styles.card}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          multiline
          value={notes}
          onChangeText={setNotes}
          placeholder="How did the workout feel?"
          placeholderTextColor="#777"
        />
      </View>

      {/* EXERCISE COMPLETION LIST */}
      <View style={styles.card}>
        <Text style={styles.label}>Exercises Completed</Text>

        {workout.exercises.map((ex: any, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.exerciseRow}
            onPress={() => toggleExercise(ex.name)}
          >
            <Text style={styles.exerciseName}>{ex.name}</Text>
            <Text style={styles.checkbox}>
              {completed.includes(ex.name) ? "☑️" : "⬜"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveSession}>
        <Text style={styles.saveButtonText}>Save Session</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ------------------------------------------------
// STYLES
// ------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    padding: 20,
    paddingTop: 60,
  },
  header: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 5,
  },
  subheader: {
    color: "#888",
    fontSize: 16,
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#1A1A1A",
    padding: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 20,
  },
  label: {
    color: "#4CC9F0",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#111",
    borderRadius: 10,
    borderColor: "#333",
    borderWidth: 1,
    padding: 12,
    color: "#fff",
    fontSize: 16,
  },
  exerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  exerciseName: {
    color: "#fff",
    fontSize: 16,
  },
  checkbox: {
    color: "#4CC9F0",
    fontSize: 20,
  },
  saveButton: {
    backgroundColor: "#4CC9F0",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  saveButtonText: {
    color: "#000",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
});
