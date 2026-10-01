import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/AppShell";
import { AiTool } from "@/components/app/AiTool";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Case Timeline — how long will my case take? | NyayaSetu" },
      { name: "description", content: "See the typical stages, legal time limits and delays for criminal cases, consumer complaints, cheque bounce, divorce, RTI and more in India." },
      { property: "og:title", content: "Case Timeline Explainer — NyayaSetu" },
      { property: "og:description", content: "Understand each stage of your case and typical timelines." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div>
      <PageHeader title="📅 Case Timeline" subtitle="Pick or describe your case to see its typical stages, legal deadlines and what causes delays. Real timelines vary a lot by court and state." />
      <AiTool mode="timeline"
        placeholder="e.g. Cheque bounce case — what are the stages and how long does it take?"
        chips={["Cheque bounce case", "Consumer complaint", "Criminal case after FIR", "Mutual consent divorce", "RTI application & appeals", "Bail application", "Property / civil suit", "Domestic violence case"]}
        buildPrompt={(t, st) => `State/UT: ${st}. Explain the stages and typical timeline for: ${t}`} />
    </div>
  ),
});
