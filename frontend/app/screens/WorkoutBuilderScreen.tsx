import AsyncStorage from "@react-native-async-storage/async-storage";
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

import { GestureHandlerRootView } from "react-native-gesture-handler";

import DraggableFlatList, {
    RenderItemParams,
    ScaleDecorator,
} from "react-native-draggable-flatlist";

import { WorkoutAPI } from "../../api/api";
import BackButton from "../components/BackButton";


type TemplateName =
  | "Push Day"
  | "Pull Day"
  | "Leg Day"
  | "Upper Body"
  | "Lower Body"
  | "Full Body";


const templates: Record<TemplateName, string[]> = {
  "Push Day": [
    "Incline Press",
    "Shoulder Press",
    "JM Press",
    "Chest Flies",
    "Lateral Raises",
    "Tricep Extensions",
  ],
  "Pull Day": [
    "T-Bar Row",
    "Lat Pulldown",
    "Sagittal Row",
    "Reverse Cable Curl",
    "Preacher Curl",
  ],
  "Leg Day": [
    "Leg Extensions",
    "Lying Hamstring Curl",
    "Squat Pattern",
    "SLDLs",
    "Adductors",
    "Abductors",
    "Calf Raises",
  ],
  "Upper Body": [
    "Chest Press",
    "Shoulder Press",
    "Tricep Extension",
    "Upper Back Row",
    "Lat Row",
    "Bicep Curl",
  ],
  "Lower Body": ["Hamstring Curl", "Squat Pattern", "Leg Extensions", "Adductors", "Calves", "Abs"],
  "Full Body": [
    "Upper Back Row",
    "Lat Pulldown",
    "Sagittal Row",
    "Bicep Curl",
    "Shoulder Press",
    "Lateral Raise",
    "Hyperextension",
    "Low to High Fly",
    "Pec Flies",
    "JM Press",
    "Tricep Extensions",
    "Leg Extension",
    "Hamstring Curl",
    "Squat Pattern",
    "Adductors",
    "Abductors",
    "Calf Raises",
  ],
};


export default function WorkoutBuilderScreen({ navigation }: any) {
  const exerciseLibrary = Array.from(new Set(Object.values(templates).flat()));

  const [selectedExercises, setSelectedExercises] = useState<
    { name: string; sets: string; reps: string; weight: string }[]
  >([]);

  const addExercise = (exercise: string) => {
    setSelectedExercises((prev) => [
      ...prev,
      { name: exercise, sets: "3", reps: "10", weight: "0" },
    ]);
  };

  const loadTemplate = (templateName: TemplateName) => {
    setSelectedExercises(
      templates[templateName].map((ex) => ({
        name: ex,
        sets: "3",
        reps: "10",
        weight: "0",
      }))
    );
  };

  const updateExercise = (
    index: number,
    field: "sets" | "reps" | "weight",
    value: string
  ) => {
    setSelectedExercises((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const removeExercise = (index: number) =>
    setSelectedExercises((prev) => prev.filter((_, i) => i !== index));

  const clearWorkout = () => setSelectedExercises([]);

 
  const saveWorkout = async () => {
    if (selectedExercises.length === 0) {
      Alert.alert("Empty Workout", "Add at least one exercise.");
      return;
    }

    const localWorkout = {
      id: Date.now(),
      exercises: selectedExercises,
      totalVolume: selectedExercises.reduce((t, ex) => {
        const sets = parseInt(ex.sets) || 0;
        const reps = parseInt(ex.reps) || 0;
        return t + sets * reps;
      }, 0),
      timestamp: new Date().toISOString(),
      synced: false,
    };

    try {
      
      const userStr = await AsyncStorage.getItem("user"); 
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id ?? "default";

      const key = `WORKOUT_HISTORY_${userId}`; 

      const existing = await AsyncStorage.getItem(key);
      const history = existing ? JSON.parse(existing) : [];

      history.unshift(localWorkout);
      await AsyncStorage.setItem(key, JSON.stringify(history));
    } catch (err) {
      console.log("Local error: ", err);
    }

    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (token) {
        const payload = {
          name: "Custom Workout",
          description: "",
          workout_type: "custom",
          is_template: false,
          exercises: selectedExercises.map((ex) => ex.name),
        };

        const backendRes = await WorkoutAPI.create(payload, token);

        
        const userStr = await AsyncStorage.getItem("user"); // <-- FIXED
        const user = userStr ? JSON.parse(userStr) : null;
        const userId = user?.id ?? "default";
        const key = `WORKOUT_HISTORY_${userId}`;

        const existing = await AsyncStorage.getItem(key);
        const history = existing ? JSON.parse(existing) : [];

        history[0].synced = true;
        history[0].backend_id = backendRes.id;

        await AsyncStorage.setItem(key, JSON.stringify(history));

        Alert.alert("Success", "Workout synced with backend!");
      } else {
        Alert.alert("Saved Locally", "Workout stored offline.");
      }
    } catch (err) {
      console.log("Sync error:", err);
      Alert.alert("Saved Offline", "Could not sync to server.");
    }

    navigation.goBack();
  };

  
  
  const renderExercise = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<{
    name: string;
    sets: string;
    reps: string;
    weight: string;
  }>) => {
    const index = getIndex() ?? 0;

    return (
      <ScaleDecorator>
        <View
          style={[
            styles.selectedItem,
            isActive && { backgroundColor: "#222" },
          ]}
        >
          <View style={styles.exerciseHeader}>
            <Text style={styles.selectedText}>
              {index + 1}. {item.name}
            </Text>

            <TouchableOpacity onLongPress={drag}>
              <Text style={styles.dragHandle}>☰</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => removeExercise(index)}>
              <Text style={styles.removeButton}>Remove</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>Sets</Text>
              <TextInput
                style={styles.smallInput}
                keyboardType="numeric"
                value={item.sets}
                onChangeText={(v) => updateExercise(index, "sets", v)}
              />
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>Reps</Text>
              <TextInput
                style={styles.smallInput}
                keyboardType="numeric"
                value={item.reps}
                onChangeText={(v) => updateExercise(index, "reps", v)}
              />
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>Weight</Text>
              <TextInput
                style={styles.smallInput}
                keyboardType="numeric"
                value={item.weight}
                onChangeText={(v) => updateExercise(index, "weight", v)}
              />
            </View>
          </View>
        </View>
      </ScaleDecorator>
    );
  };

  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <BackButton navigation={navigation} />

        <ScrollView
          style={{ flexGrow: 0, maxHeight: 380 }}
          nestedScrollEnabled={false}
        >
          <Text style={styles.header}>Workout Builder</Text>
          <Text style={styles.subheader}>
            Build your custom training session
          </Text>

          {/* TEMPLATES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Workout Templates</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {(Object.keys(templates) as TemplateName[]).map((template) => (
                <TouchableOpacity
                  key={template}
                  style={styles.templateButton}
                  onPress={() => loadTemplate(template)}
                >
                  <Text style={styles.templateButtonText}>{template}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* EXERCISE LIBRARY */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exercise Library</Text>

            {exerciseLibrary.map((exercise, index) => (
              <TouchableOpacity
                key={index}
                style={styles.exerciseItem}
                onPress={() => addExercise(exercise)}
              >
                <Text style={styles.exerciseText}>{exercise}</Text>
                <Text style={styles.addButton}>+</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* DRAGGABLE LIST BELOW */}
        <View style={{ flex: 1 }}>
          <DraggableFlatList
            data={selectedExercises}
            keyExtractor={(item, index) => index.toString()}
            onDragEnd={({ data }) => setSelectedExercises(data)}
            renderItem={renderExercise}
          />
        </View>

        {/* Buttons */}
        <View style={{ paddingVertical: 20 }}>
          <TouchableOpacity style={styles.saveButton} onPress={saveWorkout}>
            <Text style={styles.saveButtonText}>Save Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearButton} onPress={clearWorkout}>
            <Text style={styles.clearButtonText}>Clear Workout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
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
  section: { marginBottom: 20 },
  sectionTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },
  templateButton: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
    marginRight: 10,
    marginBottom: 10,
  },
  templateButtonText: {
    color: "#4CC9F0",
    fontWeight: "600",
  },
  exerciseItem: {
    backgroundColor: "#1A1A1A",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  exerciseText: { color: "#fff", fontSize: 18 },
  addButton: { color: "#4CC9F0", fontSize: 24, fontWeight: "700" },
  selectedItem: {
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 10,
    borderColor: "#333",
    borderWidth: 1,
    marginBottom: 20,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  selectedText: {
    color: "#4CC9F0",
    fontSize: 18,
    fontWeight: "600",
  },
  dragHandle: {
    color: "#777",
    fontSize: 26,
    paddingHorizontal: 10,
  },
  removeButton: { color: "#FF5555", fontWeight: "600" },
  inputRow: { flexDirection: "row", justifyContent: "space-between" },
  inputBlock: { width: "30%" },
  inputLabel: { color: "#888", marginBottom: 5 },
  smallInput: {
    backgroundColor: "#1A1A1A",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    borderColor: "#333",
    borderWidth: 1,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#4CC9F0",
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  saveButtonText: {
    textAlign: "center",
    color: "#000",
    fontSize: 18,
    fontWeight: "700",
  },
  clearButton: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#444",
  },
  clearButtonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
