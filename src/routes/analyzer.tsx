import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/AppShell";
import { AiTool } from "@/components/app/AiTool";

export const Route = createFileRoute("/analyzer")({
  head: () => ({
    meta: [
      { title: "Legal Document Analyzer — notices, agreements, FIRs | NyayaSetu" },
      { name: "description", content: "Paste text or upload a PDF/photo of a legal notice, rent agreement, FIR or contract and get a plain-language summary, red flags and deadlines." },
      { property: "og:title", content: "AI Legal Document Analyzer — NyayaSetu" },
      { property: "og:description", content: "Understand any legal document in simple Hindi or English." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div>
      <PageHeader title="📄 Document Analyzer" subtitle="Paste the text or upload a PDF / photo of a legal notice, agreement, FIR, court order or contract. Get a simple explanation, red flags and deadlines." />
      <AiTool mode="analyze" allowFile chips={[]}
        placeholder="Paste document text here (or upload a PDF / photo below)…"
        buildPrompt={(t, st) => `State: ${st}. Analyse this document:\n\n${t}`} />
    </div>
  ),
});
