import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export const LANGUAGES = [
  "English", "Hindi", "Bengali", "Marathi", "Tamil", "Telugu", "Gujarati",
  "Kannada", "Malayalam", "Odia", "Punjabi", "Assamese",
] as const;

export const STATES = [
  "All India", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman & Nicobar Islands", "Chandigarh", "Dadra & Nagar Haveli and Daman & Diu", "Delhi",
  "Jammu & Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

type Settings = { language: string; state: string; groqKey: string };
type Ctx = Settings & { update: (p: Partial<Settings>) => void };

const SettingsContext = createContext<Ctx | null>(null);
const KEY = "nyayasetu.settings";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Settings>({ language: "Hindi", state: "All India", groqKey: "" });
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setS((p) => ({ ...p, ...JSON.parse(raw) }));
    } catch {}
  }, []);
  const update = (p: Partial<Settings>) =>
    setS((prev) => {
      const next = { ...prev, ...p };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  return <SettingsContext.Provider value={{ ...s, update }}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const c = useContext(SettingsContext);
  if (!c) throw new Error("useSettings outside provider");
  return c;
}

/* ---------- Saved answers ---------- */
export type SavedAnswer = { id: string; question: string; answer: string; savedAt: string; state: string; language: string };
const SKEY = "nyayasetu.saved";
export function getSaved(): SavedAnswer[] {
  try { return JSON.parse(localStorage.getItem(SKEY) || "[]"); } catch { return []; }
}
export function saveAnswer(a: Omit<SavedAnswer, "id" | "savedAt">) {
  const list = getSaved();
  list.unshift({ ...a, id: `${Date.now()}`, savedAt: new Date().toISOString() });
  localStorage.setItem(SKEY, JSON.stringify(list.slice(0, 200)));
}
export function deleteSaved(id: string) {
  localStorage.setItem(SKEY, JSON.stringify(getSaved().filter((x) => x.id !== id)));
}

export const HIGH_RISK = /\b(arrest|arrested|custody|detain|detained|remand|bail|police station|fir against|lock ?up|accused|warrant|raid|beaten|torture|giraft|hirasat|गिरफ्तार|हिरासत|जमानत)\b/i;

export function indianKanoon(q: string) {
  return `https://indiankanoon.org/search/?formInput=${encodeURIComponent(q)}`;
}
