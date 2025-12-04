import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SettingsScreen({ navigation }: any) {

  const handleLogout = async () => {
    try {
      
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("user_profile");

      Alert.alert("Logged Out", "You have been logged out.");

      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });

    } catch (e) {
      console.log("Logout error:", e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    color: "#fff",
    marginBottom: 40,
    fontWeight: "700",
  },
  logoutButton: {
    backgroundColor: "#ff4444",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
