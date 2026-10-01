import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/AppShell";
import { ProcedureList } from "@/components/app/ProcedureList";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/police")({
  head: () => ({
    meta: [
      { title: "Police & FIR Guide — e-FIR, Zero FIR, arrest rights | NyayaSetu" },
      { name: "description", content: "How to file an FIR, e-FIR or Zero FIR, what to do on arrest, reporting cyber fraud and handling traffic challans in India." },
      { property: "og:title", content: "Police & FIR Guide — NyayaSetu" },
      { property: "og:description", content: "Step-by-step help with police, FIRs and arrest." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => {
    const s = useSettings();
    return (
      <div>
        <PageHeader title="🚔 Police / FIR Guide" subtitle={`FIR, arrest, cyber fraud and traffic police. Police procedures differ by state (${s.state}). Emergency: 112.`} />
        <div className="mx-auto max-w-4xl px-4 py-6"><ProcedureList slugs={["e-fir", "arrest", "cyber-fraud", "traffic-challan"]} /></div>
      </div>
    );
  },
});
