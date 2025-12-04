import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import BackButton from "../components/BackButton";

export default function WorkoutSessionDetailsScreen({ navigation, route }: any) {

  
  if (!route?.params?.sessionId) {
    return (
      <View style={styles.container}>
        <BackButton navigation={navigation} />
        <Text style={styles.loading}>No session selected.</Text>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.doneText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  
  const { sessionId } = route.params;

  const [session, setSession] = useState<any>(null);

  const loadSession = async () => {
    const raw = await AsyncStorage.getItem("WORKOUT_SESSIONS");
    const history = raw ? JSON.parse(raw) : [];

    const found = history.find((s: any) => s.id === sessionId);
    setSession(found);
  };

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  if (!session) {
    return (
      <View style={styles.container}>
        <BackButton navigation={navigation} />
        <Text style={styles.loading}>Loading session...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <BackButton navigation={navigation} />

      <Text style={styles.header}>Workout Session</Text>
      <Text style={styles.subheader}>
        {new Date(session.timestamp).toLocaleString()}
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Duration</Text>
        <Text style={styles.value}>{session.duration_minutes} minutes</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Exercises Completed</Text>

        {session.exercises_completed.map((name: string, index: number) => (
          <Text key={index} style={styles.exercise}>
            • {name}
          </Text>
        ))}
      </View>

      {session.notes ? (
        <View style={styles.card}>
          <Text style={styles.label}>Notes</Text>
          <Text style={styles.value}>{session.notes}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.label}>Sync Status</Text>

        <Text style={[styles.value, { color: session.synced ? "#4CC9F0" : "orange" }]}>
          {session.synced ? "✔ Synced" : "⏳ Pending Sync"}
        </Text>
      </View>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.doneButton}>
        <Text style={styles.doneText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    paddingHorizontal: 25,
    paddingTop: 50,
  },
  header: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "700",
    marginBottom: 5,
  },
  subheader: {
    color: "#888",
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#1A1A1A",
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 20,
  },
  label: {
    color: "#4CC9F0",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  value: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
  },
  exercise: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 6,
  },
  doneButton: {
    backgroundColor: "#4CC9F0",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 40,
    marginTop: 15,
  },
  doneText: {
    textAlign: "center",
    color: "#000",
    fontSize: 18,
    fontWeight: "700",
  },
  loading: {
    color: "#888",
    fontSize: 18,
    marginTop: 50,
    textAlign: "center",
  },
});
