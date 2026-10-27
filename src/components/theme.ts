import { useColorScheme } from "react-native";

// Design tokens. Colors depend on the phone's appearance; the other scales
// do not. Components build their styles from the theme with useThemedStyles.

export type Palette = {
  background: string;
  surface: string;
  border: string;
  divider: string;
  text: string;
  muted: string;
  // Fill of primary buttons and selected chips; primaryText goes on it.
  primary: string;
  primaryText: string;
  // Text and icons in the brand color: active tab, outline buttons.
  accent: string;
  link: string;
  error: string;
  success: string;
};

const light: Palette = {
  background: "#ffffff",
  surface: "#f8fafc",
  border: "#94a3b8",
  divider: "#e2e8f0",
  text: "#0f172a",
  muted: "#475569",
  primary: "#2563eb",
  primaryText: "#ffffff",
  accent: "#2563eb",
  link: "#1d4ed8",
  error: "#b91c1c",
  success: "#166534",
};

// Text colors keep at least 4.5:1 on background and surface; border 3:1.
const dark: Palette = {
  background: "#0b1220",
  surface: "#131c2e",
  border: "#64748b",
  divider: "#1e293b",
  text: "#e2e8f0",
  muted: "#94a3b8",
  primary: "#2563eb",
  primaryText: "#ffffff",
  accent: "#60a5fa",
  link: "#60a5fa",
  error: "#f87171",
  success: "#4ade80",
};

export type AppTheme = {
  scheme: "light" | "dark";
  colors: Palette;
};

const themes: Record<AppTheme["scheme"], AppTheme> = {
  light: { scheme: "light", colors: light },
  dark: { scheme: "dark", colors: dark },
};

export const fontSize = {
  sm: 14,
  chip: 15,
  md: 16,
  lg: 18,
  xl: 20,
  x2l: 22,
  x3l: 24,
  x4l: 28,
  display: 36,
} as const;

export const lineHeight = { sm: 20, md: 24 } as const;

export const fontWeight = {
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  x2l: 24,
  x3l: 48,
} as const;

// md: buttons and inputs; lg: cards.
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;

// Minimum height of touch targets: buttons, inputs, chips.
export const touchSize = { min: 44, comfortable: 48 } as const;

// The theme objects are constants, so they are stable across renders.
export function useAppTheme(): AppTheme {
  return themes[useColorScheme() === "dark" ? "dark" : "light"];
}

// Styles are created once per factory and theme and shared by every
// component instance, so a long list does not rebuild them per row.
// `factory` must be a module-level function returning StyleSheet.create(...).
const styleCache = new WeakMap<object, Map<AppTheme, unknown>>();

export function useThemedStyles<T>(factory: (theme: AppTheme) => T): T {
  const theme = useAppTheme();
  let byTheme = styleCache.get(factory);
  if (!byTheme) {
    byTheme = new Map();
    styleCache.set(factory, byTheme);
  }
  if (!byTheme.has(theme)) byTheme.set(theme, factory(theme));
  return byTheme.get(theme) as T;
}
