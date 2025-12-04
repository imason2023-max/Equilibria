import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import DailyCheckInScreen from "../screens/DailyCheckInScreen";
import DashboardScreen from "../screens/DashboardScreen";
import SettingsScreen from "../screens/SettingsScreen"; 
import WeeklyInsightsScreen from "../screens/WeeklyInsightsScreen";
import WorkoutBuilderScreen from "../screens/WorkoutBuilderScreen";

const Tab = createBottomTabNavigator();

export default function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#111",
          borderTopColor: "#222",
          height: 60,
        },
        tabBarActiveTintColor: "#4CC9F0",
        tabBarInactiveTintColor: "#777",
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="DailyCheckIn" component={DailyCheckInScreen} />
      <Tab.Screen name="Builder" component={WorkoutBuilderScreen} />
      <Tab.Screen name="Insights" component={WeeklyInsightsScreen} />

      {/*  Add logout button here */}
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
