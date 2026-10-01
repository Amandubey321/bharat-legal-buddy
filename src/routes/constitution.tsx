import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink, MessageSquare, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHeader, VerifyNotice } from "@/components/app/AppShell";
import { CopyButton } from "@/components/app/CopyButton";
import { CONSTITUTION, SOURCES } from "@/data/legal";
import { indianKanoon } from "@/lib/settings";

export const Route = createFileRoute("/constitution")({
  head: () => ({
    meta: [
      { title: "Constitution of India — Fundamental Rights explained | NyayaSetu" },
      { name: "description", content: "Search key Articles of the Constitution of India — Articles 14, 19, 21, 22, 32 and more — explained in simple words." },
      { property: "og:title", content: "Constitution of India, simply explained — NyayaSetu" },
      { property: "og:description", content: "Searchable Fundamental Rights, Directive Principles and Duties." },
    ],
  }),
  component: ConstitutionPage,
});

function ConstitutionPage() {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = q.toLowerCase().trim();
    if (!t) return CONSTITUTION;
    return CONSTITUTION.filter((a) => `${a.no} ${a.title} ${a.text} ${a.part} ${a.keywords ?? ""}`.toLowerCase().includes(t));
  }, [q]);
  return (
    <div>
      <PageHeader title="Constitution of India" subtitle="Key Articles in simple language. Search by number or topic (e.g. 21, arrest, equality).">
        <div className="relative mt-5 max-w-xl">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Articles…" className="h-10 bg-card pl-9" />
        </div>
      </PageHeader>
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-6">
        <VerifyNotice />
        {list.map((a) => {
          const cite = a.no === "Preamble" ? "Preamble, Constitution of India" : `Article ${a.no}, Constitution of India`;
          return (
            <article key={a.no} className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{a.part}</div>
              <h2 className="mt-1 text-xl font-semibold"><span className="text-accent">{a.no === "Preamble" ? "" : `Art. ${a.no} · `}</span>{a.title}</h2>
              <p className="mt-2 leading-relaxed">{a.text}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <CopyButton text={cite} label="Copy citation" />
                <Link to="/ask" search={{ q: `Explain ${cite} in simple words with examples` }} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"><MessageSquare className="h-4 w-4" /> Explain more</Link>
                <a href={SOURCES.constitution} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"><ExternalLink className="h-4 w-4" /> Official text</a>
                <a href={indianKanoon(cite)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"><ExternalLink className="h-4 w-4" /> Related judgments</a>
              </div>
            </article>
          );
        })}
        {list.length === 0 && <p className="text-muted-foreground">No Article matched. Try <Link to="/ask" search={{ q }} className="underline">asking the AI</Link>.</p>}
      </div>
    </div>
  );
}
