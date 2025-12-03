import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

import TabsNavigator from "./TabsNavigator";

import WorkoutDetailsScreen from "../screens/WorkoutDetailsScreen";
import WorkoutHistoryScreen from "../screens/WorkoutHistoryScreen";

import LogWorkoutSessionScreen from "../screens/LogWorkoutSessionScreen";
import WorkoutSessionDetailsScreen from "../screens/WorkoutSessionDetailsScreen";
import WorkoutSessionHistoryScreen from "../screens/WorkoutSessionHistoryScreen"; // ✅ MISSING BEFORE

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      {/* AUTH */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />

      {/* MAIN TABS APP */}
      <Stack.Screen name="Tabs" component={TabsNavigator} />

      {/* WORKOUT HISTORY */}
      <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} />
      <Stack.Screen name="WorkoutDetails" component={WorkoutDetailsScreen} />

      {/* WORKOUT SESSION LOGGING */}
      <Stack.Screen name="LogWorkoutSession" component={LogWorkoutSessionScreen} />

      {/* WORKOUT SESSION HISTORY (FIXED!) */}
      <Stack.Screen
        name="WorkoutSessionHistory"
        component={WorkoutSessionHistoryScreen}
      />

      {/* WORKOUT SESSION DETAILS */}
      <Stack.Screen
        name="WorkoutSessionDetails"
        component={WorkoutSessionDetailsScreen}
      />

    </Stack.Navigator>
  );
}
