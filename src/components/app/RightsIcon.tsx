import { Briefcase, Car, FileSearch, HeartHandshake, Home, Lock, Scale, ShieldAlert, ShoppingBag, Siren, type LucideIcon } from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Siren, Handcuffs: Lock, Scale, ShieldAlert, ShoppingBag, Briefcase, Home, HeartHandshake, FileSearch, Car,
};

export function RightsIcon({ name, className }: { name: string; className?: string }) {
  const I = MAP[name] ?? Scale;
  return <I className={className} />;
}
