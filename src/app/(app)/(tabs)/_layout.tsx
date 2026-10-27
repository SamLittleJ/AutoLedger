import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";

import { useAppTheme } from "@/components/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

function tabIcon(name: IconName) {
  // The tab bar passes our string tint colors; Ionicons' type is narrower
  // than React Native's ColorValue.
  return function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} size={size} color={color as string} />;
  };
}

export default function TabsLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.primary }}>
      <Tabs.Screen
        name="index"
        options={{ title: "Rezumat", tabBarIcon: tabIcon("speedometer-outline") }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: "Istoric", tabBarIcon: tabIcon("list-outline") }}
      />
      <Tabs.Screen
        name="vehicle"
        options={{ title: "Mașina mea", tabBarIcon: tabIcon("car-outline") }}
      />
    </Tabs>
  );
}
