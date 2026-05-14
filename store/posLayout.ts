import AsyncStorage from "@react-native-async-storage/async-storage";

export type PosViewMode = "grid3" | "grid4" | "gridflat" | "list" | "listslim";

const STORAGE_KEY = "@ipos_view_mode";

let _mode: PosViewMode = "grid3";
const _subs = new Set<() => void>();

export function getPosViewMode(): PosViewMode {
  return _mode;
}

export function setPosViewMode(m: PosViewMode): void {
  _mode = m;
  AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {});
  _subs.forEach(fn => fn());
}

export function subscribePosViewMode(fn: () => void): () => void {
  _subs.add(fn);
  return () => _subs.delete(fn);
}

export async function loadPosViewMode(): Promise<void> {
  try {
    const v = await AsyncStorage.getItem(STORAGE_KEY);
    if (v) {
      _mode = v as PosViewMode;
      _subs.forEach(fn => fn());
    }
  } catch {}
}
