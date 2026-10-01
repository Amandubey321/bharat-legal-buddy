import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/AppShell";
import { AiTool } from "@/components/app/AiTool";

export const Route = createFileRoute("/authority")({
  head: () => ({
    meta: [
      { title: "Find the Right Authority — where to complain in India | NyayaSetu" },
      { name: "description", content: "Find which police station, cyber cell, consumer commission, labour office, RTI officer or legal aid authority handles your problem in your state." },
      { property: "og:title", content: "Find Authority — NyayaSetu" },
      { property: "og:description", content: "Know exactly where to go with your legal problem." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div>
      <PageHeader title="📍 Find Authority" subtitle="Describe your problem — get the right office, forum, portal and escalation path for your state (choose your state at the top)." />
      <AiTool mode="authority"
        placeholder="e.g. My employer hasn't paid my salary for 3 months"
        chips={["Salary not paid by employer", "Online shopping refund refused", "UPI / bank fraud", "Landlord not returning deposit", "Government office ignoring my application", "Harassment at workplace", "Pension not received", "Police not registering complaint"]}
        buildPrompt={(t, st) => `State/UT: ${st}. My problem: ${t}\nWhich authority should I approach?`} />
      <div className="mx-auto max-w-4xl px-4 pb-6 text-sm text-muted-foreground">
        Useful official portals: <a className="underline" href="https://cybercrime.gov.in" target="_blank" rel="noreferrer">cybercrime.gov.in</a> · <a className="underline" href="https://edaakhil.nic.in" target="_blank" rel="noreferrer">e-Daakhil (consumer)</a> · <a className="underline" href="https://rtionline.gov.in" target="_blank" rel="noreferrer">rtionline.gov.in</a> · <a className="underline" href="https://pgportal.gov.in" target="_blank" rel="noreferrer">CPGRAMS</a> · <a className="underline" href="https://nalsa.gov.in" target="_blank" rel="noreferrer">NALSA legal aid</a>
      </div>
    </div>
  ),
});
