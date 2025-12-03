import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AuthAPI } from "../../api/api"; // <-- we will create this next

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!email || !username || !password) {
      Alert.alert("Missing Info", "Please fill out all fields.");
      return;
    }

    try {
      const res = await AuthAPI.register({ email, username, password });

      if (res?.id) {
        Alert.alert("Account Created", "You can now log in.");
        navigation.navigate("Login");
      }
    } catch (err: any) {
      Alert.alert("Registration Failed", err?.message || "Something went wrong.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Create Account</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#aaa"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginText}>Already have an account? Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  logo: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 40,
  },
  formContainer: {
    width: "100%",
  },
  input: {
    backgroundColor: "#1A1A1A",
    color: "#fff",
    padding: 16,
    marginBottom: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4CC9F0",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonText: {
    textAlign: "center",
    color: "#000",
    fontSize: 18,
    fontWeight: "700",
  },
  loginText: {
    color: "#4CC9F0",
    textAlign: "center",
    marginTop: 20,
    fontWeight: "600",
  },
});
