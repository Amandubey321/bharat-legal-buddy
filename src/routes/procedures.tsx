import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/AppShell";
import { ProcedureList } from "@/components/app/ProcedureList";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/procedures")({
  head: () => ({
    meta: [
      { title: "Court & Procedure Guide — consumer forum, RTI, DV | NyayaSetu" },
      { name: "description", content: "Step-by-step guides for consumer complaints, RTI applications and appeals, and domestic violence protection in India." },
      { property: "og:title", content: "Court & Procedure Guide — NyayaSetu" },
      { property: "og:description", content: "Clear steps for courts, forums and government procedures." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => {
    const s = useSettings();
    return (
      <div>
        <PageHeader title="🏛️ Court & Procedure Guide" subtitle={`Consumer forum, RTI and protection orders. Procedures may differ by state (${s.state}).`} />
        <div className="mx-auto max-w-4xl px-4 py-6"><ProcedureList slugs={["consumer-complaint", "rti", "domestic-violence"]} /></div>
      </div>
    );
  },
});
