import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function BackButton({ navigation }: any) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.goBack()}
    >
      <Ionicons name="chevron-back" size={28} color="#4CC9F0" />
      <Text style={styles.text}>Back</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    marginTop: -20,
  },
  text: {
    color: "#4CC9F0",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 4,
  },
});
