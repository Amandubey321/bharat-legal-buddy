import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink, MessageSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/app/AppShell";
import { CopyButton } from "@/components/app/CopyButton";
import { CASES } from "@/data/legal";
import { indianKanoon } from "@/lib/settings";

export const Route = createFileRoute("/cases")({
  head: () => ({
    meta: [
      { title: "Case Search — Landmark Supreme Court judgments | NyayaSetu" },
      { name: "description", content: "Browse landmark Supreme Court of India judgments on arrest, bail, FIR, privacy and equality, and search full case law on Indian Kanoon." },
      { property: "og:title", content: "Landmark Indian judgments — NyayaSetu" },
      { property: "og:description", content: "Search Supreme Court and High Court case law." },
    ],
  }),
  component: CasesPage,
});

function CasesPage() {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = q.toLowerCase().trim();
    return CASES.filter((c) => !t || `${c.name} ${c.topic} ${c.holding} ${c.year}`.toLowerCase().includes(t));
  }, [q]);
  return (
    <div>
      <PageHeader title="Case Search" subtitle="Curated landmark judgments, plus a full search of Supreme Court and High Court decisions on Indian Kanoon (external).">
        <form className="mt-5 flex max-w-2xl gap-2" onSubmit={(e) => { e.preventDefault(); if (q.trim()) window.open(indianKanoon(q), "_blank"); }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. anticipatory bail, privacy, FIR registration" className="h-10 bg-card pl-9" />
          </div>
          <Button type="submit" disabled={!q.trim()}><ExternalLink className="h-4 w-4" /> Search all case law</Button>
        </form>
      </PageHeader>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <p className="mb-4 text-sm text-muted-foreground">Summaries are simplified. Read the full judgment before relying on it.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((c) => {
            const cite = `${c.name} (${c.year}), ${c.court} of India`;
            return (
              <article key={c.name} className="rounded-xl border border-border bg-card p-5">
                <div className="flex justify-between text-xs text-muted-foreground"><span className="rounded bg-secondary px-2 py-0.5 font-medium text-foreground">{c.topic}</span><span>{c.court} · {c.year}</span></div>
                <h2 className="mt-2 text-lg font-semibold italic">{c.name}</h2>
                <p className="mt-1 text-[15px]">{c.holding}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <CopyButton text={cite} label="Copy citation" />
                  <a href={indianKanoon(c.name)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"><ExternalLink className="h-4 w-4" /> Full judgment</a>
                  <Link to="/ask" search={{ q: `Explain the judgment ${c.name} (${c.year}) and how it helps citizens` }} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"><MessageSquare className="h-4 w-4" /> Explain</Link>
                </div>
              </article>
            );
          })}
        </div>
        {list.length === 0 && <p className="text-muted-foreground">No curated case matches — use "Search all case law" above.</p>}
      </div>
    </div>
  );
}
