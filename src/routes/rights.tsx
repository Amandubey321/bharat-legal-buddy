import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { PageHeader, VerifyNotice } from "@/components/app/AppShell";
import { RightsIcon } from "@/components/app/RightsIcon";
import { LAWS, RIGHTS } from "@/data/legal";

export const Route = createFileRoute("/rights")({
  head: () => ({
    meta: [
      { title: "Know Your Rights — Police, arrest, bail, consumer & more | NyayaSetu" },
      { name: "description", content: "Simple guide to your legal rights in India: FIR, arrest, bail, cybercrime, consumer, labour, tenancy, women & child rights, RTI and traffic." },
      { property: "og:title", content: "Know Your Rights in India — NyayaSetu" },
      { property: "og:description", content: "Your rights in common legal situations, with law references." },
    ],
  }),
  component: RightsPage,
});

function RightsPage() {
  return (
    <div>
      <PageHeader title="Know Your Rights" subtitle="Quick, plain-language rights for common situations. Tap a question to ask the AI about your case." />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {RIGHTS.map((r) => <a key={r.slug} href={`#${r.slug}`} className="rounded-full border border-border bg-card px-3 py-1 text-sm hover:border-accent">{r.name}</a>)}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {RIGHTS.map((r) => {
            const laws = LAWS.filter((l) => l.category === r.lawCategory);
            return (
              <section key={r.slug} id={r.slug} className="scroll-mt-32 rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent/15"><RightsIcon name={r.icon} className="h-5 w-5 text-accent" /></span>
                  <h2 className="text-xl font-semibold">{r.name}</h2>
                </div>
                <ul className="mt-4 space-y-2 text-[15px]">
                  {r.rights.map((x) => <li key={x} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{x}</li>)}
                </ul>
                {laws.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {laws.map((l) => <span key={l.short + l.section} className="rounded border border-border bg-muted px-2 py-0.5 text-xs font-medium">{l.short} §{l.section}</span>)}
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {r.queries.map((q) => (
                    <Link key={q} to="/ask" search={{ q }} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs hover:bg-accent/20"><MessageSquare className="h-3 w-3" />{q}</Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
        <VerifyNotice className="mt-6" />
      </div>
    </div>
  );
}
