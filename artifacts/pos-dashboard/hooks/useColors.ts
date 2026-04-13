import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";

import colors from "@/constants/colors";
import { getThemeMode, subscribeTheme } from "@/store/theme";
import { getAccentOption, subscribeAccent } from "@/store/themeColor";

export function useColors() {
  const systemScheme = useColorScheme();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const u1 = subscribeTheme(()  => forceUpdate(n => n + 1));
    const u2 = subscribeAccent(() => forceUpdate(n => n + 1));
    return () => { u1(); u2(); };
  }, []);

  const mode   = getThemeMode();
  const scheme = mode === "system" ? (systemScheme ?? "light") : mode;
  const palette = scheme === "dark" ? colors.dark : colors.light;

  const accent = getAccentOption();
  const accentColor = scheme === "dark" ? accent.dark : accent.light;

  return {
    ...palette,
    radius:    colors.radius,
    primary:   accentColor,
    tint:      accentColor,
    accent:    accentColor,
    headerBg:  scheme === "dark" ? colors.dark.headerBg : accentColor,
    secondary: accentColor + "18",
    secondaryForeground: accentColor,
  };
}
