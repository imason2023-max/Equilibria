import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BackButton from "../components/BackButton";

export default function WorkoutDetailsScreen({ navigation, route }: any) {
  const { workout } = route.params;

  return (
    <ScrollView style={styles.container}>
      <BackButton navigation={navigation} />

      <Text style={styles.header}>Workout Details</Text>

      <Text style={styles.date}>
        {new Date(workout.timestamp).toLocaleString()}
      </Text>

      {workout.exercises.map((ex: any, i: number) => (
        <View key={i} style={styles.exerciseCard}>
          <Text style={styles.exerciseName}>{ex.name}</Text>
          <Text style={styles.exerciseDetail}>Sets: {ex.sets}</Text>
          <Text style={styles.exerciseDetail}>Reps: {ex.reps}</Text>
          <Text style={styles.exerciseDetail}>Weight: {ex.weight}</Text>
        </View>
      ))}

      {/* LOG SESSION BUTTON */}
      <TouchableOpacity
        style={styles.logButton}
        onPress={() => navigation.navigate("LogWorkoutSession", { workout })}
      >
        <Text style={styles.logButtonText}>Log Workout Session</Text>
      </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 10,
  },
  date: {
    color: "#888",
    marginBottom: 20,
  },
  exerciseCard: {
    backgroundColor: "#1A1A1A",
    padding: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 15,
  },
  exerciseName: {
    color: "#4CC9F0",
    fontSize: 18,
    fontWeight: "700",
  },
  exerciseDetail: {
    color: "#ccc",
    marginTop: 4,
  },

  logButton: {
    backgroundColor: "#4CC9F0",
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 25,
  },
  logButtonText: {
    textAlign: "center",
    color: "#000",
    fontSize: 18,
    fontWeight: "700",
  },
});
