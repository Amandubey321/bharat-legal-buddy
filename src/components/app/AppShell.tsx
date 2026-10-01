import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, Phone, Scale, Settings, X, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LANGUAGES, STATES, useSettings } from "@/lib/settings";
import { toast } from "sonner";

export const NAV = [
  { to: "/", label: "🏠 Home" },
  { to: "/ask", label: "🤖 Ask Legal AI" },
  { to: "/constitution", label: "🇮🇳 Constitution" },
  { to: "/rights", label: "⚖️ Know My Rights" },
  { to: "/laws", label: "🔎 Search Laws" },
  { to: "/analyzer", label: "📄 Document Analyzer" },
  { to: "/documents", label: "📝 Document Generator" },
  { to: "/police", label: "🚔 Police/FIR Guide" },
  { to: "/procedures", label: "🏛️ Court & Procedure Guide" },
  { to: "/authority", label: "📍 Find Authority" },
  { to: "/myths", label: "🧠 Legal Myth vs Fact" },
  { to: "/timeline", label: "📅 Case Timeline" },
  { to: "/cases", label: "📚 Case Law Search" },
  { to: "/saved", label: "🔖 Saved Answers" },
] as const;

function EmergencyStrip() {
  const items = [
    { n: "112", l: "Police / Emergency" },
    { n: "1930", l: "Cyber fraud" },
    { n: "1091", l: "Women helpline" },
    { n: "15100", l: "Free legal aid (NALSA)" },
  ];
  return (
    <div className="bg-destructive text-destructive-foreground text-xs sm:text-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 py-1.5 whitespace-nowrap">
        <span className="font-semibold">In danger or detained?</span>
        {items.map((i) => (
          <a key={i.n} href={`tel:${i.n}`} className="inline-flex items-center gap-1 rounded-full bg-destructive-foreground/15 px-2 py-0.5 hover:bg-destructive-foreground/25">
            <Phone className="h-3 w-3" /> <b>{i.n}</b> {i.l}
          </a>
        ))}
        <span className="opacity-90">or contact a qualified advocate.</span>
      </div>
    </div>
  );
}

function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const s = useSettings();
  const [key, setKey] = useState(s.groqKey);
  return (
    <Dialog open={open} onOpenChange={(o) => { if (o) setKey(s.groqKey); onOpenChange(o); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> AI settings</DialogTitle>
          <DialogDescription>
            AI answers are powered by OpenRouter, configured securely on the server. No key is needed from you.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button onClick={() => onOpenChange(false)}>OK</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const s = useSettings();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <EmergencyStrip />
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground"><Scale className="h-5 w-5" /></span>
            <span className="leading-tight">
              <span className="block font-serif text-lg font-semibold">NyayaSetu</span>
              <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">Legal rights, simply</span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Select value={s.state} onValueChange={(v) => s.update({ state: v })}>
              <SelectTrigger className="hidden h-9 w-40 md:flex" aria-label="State"><SelectValue /></SelectTrigger>
              <SelectContent>{STATES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={s.language} onValueChange={(v) => s.update({ language: v })}>
              <SelectTrigger className="h-9 w-28" aria-label="Language"><SelectValue /></SelectTrigger>
              <SelectContent>{LANGUAGES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="ghost" size="icon" aria-label="AI settings" onClick={() => setSettingsOpen(true)}><Settings className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        <nav className={`${open ? "block" : "hidden"} border-t border-border lg:block`}>
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-2 lg:flex-row lg:overflow-x-auto">
            <div className="mb-2 md:hidden">
              <Select value={s.state} onValueChange={(v) => s.update({ state: v })}>
                <SelectTrigger aria-label="State"><SelectValue /></SelectTrigger>
                <SelectContent>{STATES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                activeOptions={{ exact: n.to === "/" }}
                className="rounded-md px-3 py-1.5 text-sm whitespace-nowrap text-muted-foreground hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-secondary !text-primary font-medium" }}>
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">NyayaSetu provides general legal information, not legal advice.</p>
          <p className="mt-1">It is not a law firm and is not a substitute for a licensed advocate. Laws change and vary by state — always verify with official sources (India Code, Legislative Department, court websites). Free legal aid: NALSA 15100.</p>
        </div>
      </footer>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="border-b border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-semibold text-primary sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-3xl text-muted-foreground">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

export function VerifyNotice({ className = "" }: { className?: string }) {
  return (
    <p className={`rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-foreground ${className}`}>
      <b>Verification notice:</b> Simplified summary for information only. Check the official text before relying on it.
    </p>
  );
}
