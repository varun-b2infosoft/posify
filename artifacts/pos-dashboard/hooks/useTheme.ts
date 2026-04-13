import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";

import {
  getThemeMode,
  setThemeMode,
  subscribeTheme,
  ThemeMode,
} from "@/store/theme";

/**
 * Exposes the current theme preference and a setter. Use in Settings to
 * render the Light / Dark / System segment control.
 */
export function useTheme() {
  const systemScheme = useColorScheme();
  const [mode, setLocalMode] = useState<ThemeMode>(getThemeMode);

  useEffect(() => {
    return subscribeTheme(() => setLocalMode(getThemeMode()));
  }, []);

  const effectiveScheme =
    mode === "system" ? (systemScheme ?? "light") : mode;

  return { mode, setMode: setThemeMode, effectiveScheme };
}
