import { Stack } from "expo-router";

export const unstable_settings = { anchor: "(tabs)" };

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="expense/new"
        options={{ title: "Cheltuială nouă", headerBackTitle: "Înapoi" }}
      />
    </Stack>
  );
}
