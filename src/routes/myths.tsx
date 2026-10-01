import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MessageSquare, XCircle } from "lucide-react";
import { PageHeader, VerifyNotice } from "@/components/app/AppShell";

export const Route = createFileRoute("/myths")({
  head: () => ({
    meta: [
      { title: "Legal Myth vs Fact — common legal misconceptions in India | NyayaSetu" },
      { name: "description", content: "Busting common myths about FIRs, arrest, women's rights, consumer complaints, RTI and traffic police in India — with law references." },
      { property: "og:title", content: "Legal Myth vs Fact — NyayaSetu" },
      { property: "og:description", content: "What people believe vs what the law actually says." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MythsPage,
});

const MYTHS = [
  { myth: "Police can refuse to file an FIR if the crime happened in another area.", fact: "You can file a Zero FIR at any police station; it is transferred to the correct station.", ref: "BNSS 2023 — Section 173" },
  { myth: "You can only file a complaint by going to the police station.", fact: "Many states allow e-FIR / online complaints; for e-FIR you generally sign at the station within 3 days.", ref: "BNSS 2023 — Section 173(1)" },
  { myth: "Police can keep you in custody as long as they want.", fact: "An arrested person must be produced before a Magistrate within 24 hours (excluding travel time).", ref: "Constitution — Article 22(2); BNSS — Section 58" },
  { myth: "A confession made to the police can be used to convict you.", fact: "A confession made to a police officer is generally not admissible as evidence against the accused.", ref: "BSA 2023 — Section 23" },
  { myth: "Only rich people can afford a lawyer.", fact: "Free legal aid is available for women, children, SC/ST, persons in custody, low-income people and others.", ref: "Constitution — Article 39A; Legal Services Authorities Act 1987 · NALSA 15100" },
  { myth: "You must give a reason when filing an RTI.", fact: "An RTI applicant does not need to give any reason for requesting information.", ref: "RTI Act 2005 — Section 6(2)" },
  { myth: "Consumer complaints need a lawyer and a lot of money.", fact: "You can file yourself, online on e-Daakhil; fees are nil or small for lower-value claims.", ref: "Consumer Protection Act 2019" },
  { myth: "Original driving licence and RC papers must always be carried.", fact: "Documents stored in DigiLocker or mParivahan are generally accepted as valid.", ref: "MoRTH advisory under Motor Vehicles Act / IT Act" },
  { myth: "Sexual harassment at work can only be reported to the police.", fact: "Workplaces with 10+ employees must have an Internal Committee; others can approach the Local Committee.", ref: "POSH Act 2013 — Sections 4 & 6" },
  { myth: "A woman's statement must be recorded only at the police station.", fact: "In many cases a woman's statement can be recorded at her residence or a place of her choice.", ref: "BNSS 2023 (verify specific section)" },
  { myth: "Domestic violence means only physical beating.", fact: "It also covers emotional, verbal, sexual and economic abuse.", ref: "PWDVA 2005 — Section 3" },
  { myth: "A cheque bounce is just a civil matter.", fact: "Dishonour of a cheque for insufficient funds can be a criminal offence after notice.", ref: "Negotiable Instruments Act 1881 — Section 138" },
];

function MythsPage() {
  return (
    <div>
      <PageHeader title="🧠 Legal Myth vs Fact" subtitle="Common things people believe about the law in India — and what the law actually says." />
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-6">
        <VerifyNotice />
        {MYTHS.map((m) => (
          <div key={m.myth} className="rounded-xl border border-border bg-card p-5">
            <p className="flex gap-2 text-[15px]"><XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" /><span><b>Myth:</b> {m.myth}</span></p>
            <p className="mt-2 flex gap-2 text-[15px]"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><span><b>Fact:</b> {m.fact}</span></p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded bg-muted px-2 py-1">{m.ref}</span>
              <Link to="/ask" search={{ q: `Is this true? "${m.myth}"` }} className="inline-flex items-center gap-1 text-primary underline"><MessageSquare className="h-3 w-3" /> Ask AI more</Link>
            </div>
          </div>
        ))}
        <Link to="/ask" search={{ q: "Is this legal belief true: " }} className="block rounded-xl border border-dashed border-border p-4 text-center text-sm hover:bg-muted">Heard something else? Ask the AI to check a myth →</Link>
      </div>
    </div>
  );
}
