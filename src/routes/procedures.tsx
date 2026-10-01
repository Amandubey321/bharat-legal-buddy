import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ExternalLink, MessageSquare } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageHeader } from "@/components/app/AppShell";
import { PROCEDURES } from "@/data/legal";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/procedures")({
  head: () => ({
    meta: [
      { title: "Legal Procedures — e-FIR, arrest, consumer complaint, RTI | NyayaSetu" },
      { name: "description", content: "Step-by-step guides: filing e-FIR or Zero FIR, what to do on arrest, consumer complaints, cyber fraud, RTI and traffic challans." },
      { property: "og:title", content: "Step-by-step legal procedures in India — NyayaSetu" },
      { property: "og:description", content: "Clear steps for common legal situations." },
    ],
  }),
  component: ProceduresPage,
});

function ProceduresPage() {
  const s = useSettings();
  return (
    <div>
      <PageHeader title="Legal Procedures" subtitle={`Step-by-step guidance. Procedures can differ by state — currently showing general steps (${s.state}).`} />
      <div className="mx-auto max-w-4xl px-4 py-6">
        <Accordion type="single" collapsible defaultValue="e-fir" className="space-y-3">
          {PROCEDURES.map((p) => (
            <AccordionItem key={p.slug} value={p.slug} className="rounded-xl border border-border bg-card px-5">
              <AccordionTrigger className="text-left">
                <div>
                  <div className="font-serif text-lg font-semibold">{p.title}</div>
                  <div className="text-sm font-normal text-muted-foreground">{p.summary}</div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {p.highRisk && (
                  <div className="mb-4 flex gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" /> High-risk situation — contact a licensed advocate or legal aid (15100) as soon as possible.
                  </div>
                )}
                <ol className="space-y-3">
                  {p.steps.map((st, i) => (
                    <li key={i} className="flex gap-3 text-[15px]">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">{i + 1}</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.links.map((l) => (
                    <a key={l.url} href={l.url} target={l.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"><ExternalLink className="h-4 w-4" />{l.label}</a>
                  ))}
                  <Link to="/ask" search={{ q: `${p.title} — specific steps for ${s.state}` }} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"><MessageSquare className="h-4 w-4" /> Steps for my state</Link>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
