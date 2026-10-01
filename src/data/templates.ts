export type Field = { key: string; label: string; multiline?: boolean };
export type Template = { slug: string; title: string; description: string; fields: Field[]; build: (v: Record<string, string>) => string };

const f = (v: Record<string, string>, k: string, ph: string) => (v[k]?.trim() ? v[k].trim() : `[${ph}]`);
const today = () => new Date().toLocaleDateString("en-IN");

export const TEMPLATES: Template[] = [
  {
    slug: "rti",
    title: "RTI Application – Section 6(1)",
    description: "Request information from a government office.",
    fields: [
      { key: "name", label: "Your full name" }, { key: "address", label: "Your address", multiline: true },
      { key: "authority", label: "Public authority / department" }, { key: "info", label: "Information you need (one per line)", multiline: true },
      { key: "period", label: "Period covered (e.g. 2023–2025)" },
    ],
    build: (v) => `To,
The Public Information Officer,
${f(v, "authority", "Name of Public Authority & Address")}

Subject: Application under Section 6(1) of the Right to Information Act, 2005

Sir/Madam,

I, ${f(v, "name", "Your Name")}, a citizen of India, request the following information for the period ${f(v, "period", "Period")}:

${f(v, "info", "List the specific information sought").split("\n").map((l, i) => `${i + 1}. ${l}`).join("\n")}

I am paying the application fee of ₹10 (or applicable state fee) by [IPO / DD / online / cash receipt no.]. [If BPL, attach proof for exemption.]

Kindly provide the information within 30 days as per Section 7(1) of the Act.

Name: ${f(v, "name", "Your Name")}
Address: ${f(v, "address", "Your Address")}
Date: ${today()}
Signature: ______________`,
  },
  {
    slug: "police-complaint",
    title: "Police Complaint / FIR Request",
    description: "Written complaint to the Station House Officer.",
    fields: [
      { key: "name", label: "Your full name" }, { key: "address", label: "Your address & phone", multiline: true },
      { key: "station", label: "Police station" }, { key: "incident", label: "What happened (date, time, place, persons)", multiline: true },
    ],
    build: (v) => `To,
The Station House Officer,
${f(v, "station", "Police Station Name, District")}

Subject: Complaint for registration of FIR under Section 173 of the Bharatiya Nagarik Suraksha Sanhita, 2023

Sir/Madam,

I, ${f(v, "name", "Your Name")}, residing at ${f(v, "address", "Address & Phone")}, wish to report the following:

${f(v, "incident", "Describe the incident with date, time, place, people involved and witnesses")}

The above discloses a cognizable offence. I request you to register an FIR, provide me a free copy, and take necessary action.

Enclosures: [list documents / evidence]

Date: ${today()}
Signature: ______________`,
  },
  {
    slug: "consumer",
    title: "Consumer Complaint",
    description: "For the District Consumer Commission or as a notice to seller.",
    fields: [
      { key: "name", label: "Complainant name & address", multiline: true }, { key: "opposite", label: "Seller / service provider name & address", multiline: true },
      { key: "product", label: "Product / service, date & amount paid" }, { key: "issue", label: "Defect / deficiency", multiline: true },
      { key: "relief", label: "Relief sought (refund, replacement, compensation)" },
    ],
    build: (v) => `BEFORE THE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION, [DISTRICT]

Complainant: ${f(v, "name", "Name & Address")}
Versus
Opposite Party: ${f(v, "opposite", "Seller Name & Address")}

COMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019

1. The Complainant purchased/availed ${f(v, "product", "product/service, date, amount")} from the Opposite Party.
2. Facts: ${f(v, "issue", "Describe defect / deficiency in service")}
3. The Complainant approached the Opposite Party on [dates], but the grievance was not resolved.
4. This amounts to deficiency in service / unfair trade practice.
5. The complaint is within the limitation period of two years.

PRAYER: ${f(v, "relief", "Refund / replacement / compensation / costs")}

Documents: invoice, warranty, correspondence, photos.

Verification: I verify that the contents above are true to my knowledge.
Date: ${today()}            Signature of Complainant`,
  },
  {
    slug: "legal-notice",
    title: "Legal Notice (General)",
    description: "Formal demand before legal action. Best sent through an advocate.",
    fields: [
      { key: "sender", label: "Your name & address", multiline: true }, { key: "recipient", label: "Recipient name & address", multiline: true },
      { key: "facts", label: "Facts of the matter", multiline: true }, { key: "demand", label: "Your demand" }, { key: "days", label: "Days to comply (e.g. 15)" },
    ],
    build: (v) => `LEGAL NOTICE

From: ${f(v, "sender", "Your Name & Address")}
To: ${f(v, "recipient", "Recipient Name & Address")}
Date: ${today()}

Sir/Madam,

1. ${f(v, "facts", "State the facts in numbered paragraphs")}
2. Despite repeated requests, you have failed to resolve the matter.
3. You are hereby called upon to ${f(v, "demand", "state your demand")} within ${f(v, "days", "15")} days of receipt of this notice.
4. Failing this, I shall be constrained to initiate appropriate legal proceedings at your risk as to costs and consequences.

Signature: ______________`,
  },
  {
    slug: "cyber",
    title: "Cyber Fraud Complaint",
    description: "Complaint to cyber cell / bank. Also call 1930.",
    fields: [
      { key: "name", label: "Your name, phone & address", multiline: true }, { key: "txn", label: "Transaction IDs, dates, amounts", multiline: true },
      { key: "details", label: "How the fraud happened", multiline: true },
    ],
    build: (v) => `To,
The Officer In-charge, Cyber Crime Cell / The Branch Manager,
[Address]

Subject: Complaint regarding online financial fraud

I, ${f(v, "name", "Name, Phone & Address")}, report the following fraud:

Details: ${f(v, "details", "Describe how the fraud took place")}
Transactions: ${f(v, "txn", "Transaction IDs, dates and amounts")}

I have reported this on the 1930 helpline / cybercrime.gov.in vide acknowledgement no. [number]. I request you to freeze the beneficiary accounts, investigate, and help recover my money.

Enclosures: screenshots, bank statement, SMS/call logs.
Date: ${today()}
Signature: ______________`,
  },
];
