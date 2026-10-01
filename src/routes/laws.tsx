import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink, MessageSquare, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHeader, VerifyNotice } from "@/components/app/AppShell";
import { CopyButton } from "@/components/app/CopyButton";
import { LAWS, SOURCES } from "@/data/legal";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/laws")({
  head: () => ({
    meta: [
      { title: "Indian Laws — BNS, BNSS, BSA, IT Act, Consumer & RTI | NyayaSetu" },
      { name: "description", content: "Search important sections of BNS, BNSS, BSA, IT Act, Consumer Protection Act, RTI Act, POSH and labour laws in simple language." },
      { property: "og:title", content: "Search Indian laws — NyayaSetu" },
      { property: "og:description", content: "Key sections of central laws explained simply." },
    ],
  }),
  component: LawsPage,
});

function LawsPage() {
  const s = useSettings();
  const [q, setQ] = useState("");
  const [act, setAct] = useState("All");
  const acts = ["All", ...Array.from(new Set(LAWS.map((l) => l.short)))];
  const list = useMemo(() => {
    const t = q.toLowerCase().trim();
    return LAWS.filter((l) => (act === "All" || l.short === act) && (!t || `${l.act} ${l.short} ${l.section} ${l.title} ${l.text} ${l.category}`.toLowerCase().includes(t)));
  }, [q, act]);
  return (
    <div>
      <PageHeader title="Laws" subtitle="Important sections of central laws. State laws (rent control, police acts, etc.) vary — ask the AI with your state selected.">
        <div className="relative mt-5 max-w-xl">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search e.g. FIR, cheating, 66C, bail…" className="h-10 bg-card pl-9" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {acts.map((a) => (
            <button key={a} onClick={() => setAct(a)} className={`rounded-full border px-3 py-1 text-sm ${act === a ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-accent"}`}>{a}</button>
          ))}
        </div>
      </PageHeader>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <VerifyNotice className="mb-4" />
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((l) => {
            const cite = `Section ${l.section}, ${l.act}`;
            return (
              <article key={l.short + l.section} className="flex flex-col rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="rounded bg-primary px-2 py-0.5 font-semibold text-primary-foreground">{l.short} §{l.section}</span>
                  <span className="text-muted-foreground">{l.category} · Central law</span>
                </div>
                <h2 className="mt-2 text-lg font-semibold">{l.title}</h2>
                <p className="mt-1 flex-1 text-[15px] leading-relaxed">{l.text}</p>
                <p className="mt-2 text-xs text-muted-foreground">{l.act}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <CopyButton text={cite} label="Copy citation" />
                  <Link to="/ask" search={{ q: `Explain ${cite} simply. I am in ${s.state}.` }} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"><MessageSquare className="h-4 w-4" /> Explain</Link>
                  <a href={SOURCES.indiaCode} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"><ExternalLink className="h-4 w-4" /> India Code</a>
                </div>
              </article>
            );
          })}
        </div>
        {list.length === 0 && <p className="text-muted-foreground">Nothing found. <Link to="/ask" search={{ q }} className="underline">Ask the AI instead</Link>.</p>}
      </div>
    </div>
  );
}
