import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";

import colors from "@/constants/colors";
import { getThemeMode, subscribeTheme } from "@/store/theme";

/**
 * Returns the design tokens for the current color scheme.
 *
 * Reads the app-level theme preference from the theme store (light / dark /
 * system). When set to "system" it falls back to the device's appearance
 * setting via useColorScheme(). Subscribe to the theme store so the hook
 * triggers a re-render whenever the user changes the preference in Settings.
 */
export function useColors() {
  const systemScheme = useColorScheme();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    return subscribeTheme(() => forceUpdate((n) => n + 1));
  }, []);

  const mode = getThemeMode();
  const scheme = mode === "system" ? (systemScheme ?? "light") : mode;
  const palette =
    scheme === "dark"
      ? colors.dark
      : colors.light;

  return { ...palette, radius: colors.radius };
}
