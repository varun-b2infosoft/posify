export type AccentId =
  | "indigo" | "violet" | "blue" | "sky"
  | "teal"   | "green"  | "rose" | "amber" | "orange";

export interface AccentOption {
  id:    AccentId;
  name:  string;
  light: string;
  dark:  string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  { id: "indigo", name: "Indigo", light: "#4F46E5", dark: "#6366F1" },
  { id: "violet", name: "Violet", light: "#7C3AED", dark: "#8B5CF6" },
  { id: "blue",   name: "Blue",   light: "#2563EB", dark: "#3B82F6" },
  { id: "sky",    name: "Sky",    light: "#0284C7", dark: "#0EA5E9" },
  { id: "teal",   name: "Teal",   light: "#0D9488", dark: "#14B8A6" },
  { id: "green",  name: "Green",  light: "#16A34A", dark: "#22C55E" },
  { id: "rose",   name: "Rose",   light: "#E11D48", dark: "#FB7185" },
  { id: "amber",  name: "Amber",  light: "#D97706", dark: "#FBBF24" },
  { id: "orange", name: "Orange", light: "#EA580C", dark: "#FB923C" },
];

let _accentId: AccentId = "indigo";
const _listeners: Array<() => void> = [];

export function getAccentId(): AccentId { return _accentId; }
export function getAccentOption(): AccentOption {
  return ACCENT_OPTIONS.find(a => a.id === _accentId) ?? ACCENT_OPTIONS[0];
}
export function setAccentId(id: AccentId): void {
  _accentId = id;
  _listeners.forEach(fn => fn());
}
export function subscribeAccent(fn: () => void): () => void {
  _listeners.push(fn);
  return () => {
    const i = _listeners.indexOf(fn);
    if (i !== -1) _listeners.splice(i, 1);
  };
}
