import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { AuthAPI } from "../../api/api"; 

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Info", "Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      
      await AsyncStorage.removeItem("CHECKIN_HISTORY");
      await AsyncStorage.removeItem("WORKOUT_HISTORY");
      await AsyncStorage.removeItem("WORKOUT_SESSIONS");
      await AsyncStorage.removeItem("LATEST_RECOVERY");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("auth_token");
    
      const res = await AuthAPI.login({
        email,
        password,
      });

      const token = res.access_token;
      if (!token) {
        throw new Error("No access token returned");
      }


      await AsyncStorage.setItem("auth_token", token);

      
      const userRes = await fetch(
        "https://equilibria-backend-g5oa.onrender.com/api/v1/auth/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!userRes.ok) {
        throw new Error("Could not fetch user info");
      }

      const user = await userRes.json();
      await AsyncStorage.setItem("user", JSON.stringify(user));

      Alert.alert("Success", "You are now logged in!");
      navigation.navigate("Tabs"); 

    } catch (err: any) {
      console.log("Login error:", err?.response?.data || err.message);

      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Login failed. Check your credentials.";

      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  
  const skipLogin = async () => {
    await AsyncStorage.setItem("auth_token", "dev-token");
    await AsyncStorage.setItem(
      "user",
      JSON.stringify({
        id: 0,
        email: "dev@test.com",
        username: "developer",
      })
    );

    navigation.reset({
      index: 0,
      routes: [{ name: "Tabs" }],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Equilibria</Text>
      <Text style={styles.subtitle}>Recover • Train • Progress</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Logging In..." : "Log In"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.forgot}>Forgot your password?</Text>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerText}>Create an Account</Text>
        </TouchableOpacity>

        {/*  Developer Mode Skip Login Button */}
        <TouchableOpacity style={styles.skipButton} onPress={skipLogin}>
          <Text style={styles.skipButtonText}>Skip Login (Developer Mode)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  logo: {
    fontSize: 40,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 1,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#9A9A9A",
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
  forgot: {
    color: "#777",
    fontSize: 14,
    textAlign: "center",
    marginTop: 14,
  },
  registerText: {
    color: "#4CC9F0",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    fontWeight: "600",
  },
  skipButton: {
    marginTop: 30,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#333",
  },
  skipButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
