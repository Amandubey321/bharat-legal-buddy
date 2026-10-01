import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, FileText, Gavel, MessageSquare, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RIGHTS } from "@/data/legal";
import { RightsIcon } from "@/components/app/RightsIcon";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NyayaSetu — Know your legal rights in India" },
      { name: "description", content: "Ask AI about Indian laws, Constitution, BNS, BNSS, FIR, bail, consumer and cyber rights — in simple Hindi, English and Indian languages." },
      { property: "og:title", content: "NyayaSetu — Know your legal rights in India" },
      { property: "og:description", content: "AI legal information assistant for Indian citizens with verified references." },
    ],
  }),
  component: Index,
});

const CHIPS = [
  "Police refused to file my FIR",
  "What are my rights on arrest?",
  "I lost money in UPI fraud",
  "Landlord not returning deposit",
  "Salary not paid by employer",
  "मुझे जमानत कैसे मिलेगी?",
];

function Index() {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const go = (query: string) => nav({ to: "/ask", search: { q: query } });
  return (
    <div>
      <section className="border-b border-border bg-gradient-to-b from-secondary/60 to-background">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:py-20">
          <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5" /> Updated for BNS, BNSS & BSA (2023)
          </span>
          <h1 className="mt-5 text-4xl font-semibold text-primary sm:text-6xl">Your rights, explained simply.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Ask about the Constitution, police, arrest, consumer, cyber or workplace issues — in Hindi, English or your language. With section references you can verify.
          </p>
          <form className="mx-auto mt-8 flex max-w-2xl gap-2" onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(q.trim()); }}>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Describe your situation…" className="h-12 bg-card text-base" />
            <Button type="submit" size="lg" className="h-12">Ask <ArrowRight className="h-4 w-4" /></Button>
          </form>
          <div className="mx-auto mt-4 flex max-w-3xl flex-wrap justify-center gap-2">
            {CHIPS.map((c) => (
              <button key={c} onClick={() => go(c)} className="rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-accent hover:bg-accent/10">{c}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl font-semibold">What are my rights?</h2>
        <p className="text-muted-foreground">Pick your situation.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {RIGHTS.map((r) => (
            <Link key={r.slug} to="/rights" hash={r.slug} className="group rounded-xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md">
              <RightsIcon name={r.icon} className="h-6 w-6 text-accent" />
              <div className="mt-3 font-medium">{r.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">{r.summary}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-16 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: "/ask", icon: MessageSquare, t: "Ask AI", d: "Plain-language answers with references." },
          { to: "/constitution", icon: BookOpen, t: "Constitution", d: "Fundamental Rights & key Articles." },
          { to: "/documents", icon: FileText, t: "Draft documents", d: "RTI, complaints, legal notices." },
          { to: "/cases", icon: Gavel, t: "Case search", d: "Landmark Supreme Court judgments." },
        ].map((x) => (
          <Link key={x.to} to={x.to} className="rounded-xl border border-border bg-card p-5 hover:border-primary">
            <x.icon className="h-6 w-6 text-primary" />
            <div className="mt-3 font-serif text-lg font-semibold">{x.t}</div>
            <div className="text-sm text-muted-foreground">{x.d}</div>
          </Link>
        ))}
        <div className="rounded-xl border border-border bg-primary p-5 text-primary-foreground sm:col-span-2 lg:col-span-4">
          <div className="flex items-start gap-3">
            <Search className="mt-1 h-5 w-5 shrink-0" />
            <p className="text-sm">NyayaSetu is an information tool, not a lawyer. It never guarantees outcomes. For arrest, custody or criminal matters, contact a licensed advocate or free legal aid (NALSA 15100) right away.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
