import { useEffect, useState } from "react";
import {
  AccentId,
  getAccentId,
  setAccentId,
  subscribeAccent,
} from "@/store/themeColor";

export function useThemeColor() {
  const [accentId, setLocal] = useState<AccentId>(getAccentId);

  useEffect(() => {
    return subscribeAccent(() => setLocal(getAccentId()));
  }, []);

  return { accentId, setAccentId };
}
