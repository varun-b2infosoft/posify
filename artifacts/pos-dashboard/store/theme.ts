export type ThemeMode = "light" | "dark" | "system";

let _mode: ThemeMode = "system";
const _listeners: Array<() => void> = [];

export function getThemeMode(): ThemeMode {
  return _mode;
}

export function setThemeMode(mode: ThemeMode): void {
  _mode = mode;
  _listeners.forEach((fn) => fn());
}

export function subscribeTheme(fn: () => void): () => void {
  _listeners.push(fn);
  return () => {
    const i = _listeners.indexOf(fn);
    if (i !== -1) _listeners.splice(i, 1);
  };
}
