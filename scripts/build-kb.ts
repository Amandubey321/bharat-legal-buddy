// Generates the offline legal knowledge base (src/data/kb/*.json) from curated data in src/data/legal.ts.
// Run: bun scripts/build-kb.ts   — No network access is used. Unknown values are "DATA_NOT_AVAILABLE".
import { mkdirSync, writeFileSync } from "node:fs";
import { CONSTITUTION, LAWS, RIGHTS, PROCEDURES, CASES, SOURCES } from "../src/data/legal";

const NA = "DATA_NOT_AVAILABLE";
const VERIFIED = "2026-10-01";
const OUT = "src/data/kb";
mkdirSync(OUT, { recursive: true });
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const kw = (...s: (string | undefined)[]) =>
  [...new Set(s.filter(Boolean).join(" ").toLowerCase().split(/[^a-z0-9\u0900-\u097f]+/).filter((w) => w.length > 2))];

// Act metadata. Dates only where certain; status distinguishes current vs repealed law.
const ACTS: Record<string, { name: string; status: "current" | "repealed" | "current_verify"; effective_date: string; replaces?: string; replaced_by?: string; note?: string }> = {
  BNS: { name: "Bharatiya Nyaya Sanhita, 2023", status: "current", effective_date: "2024-07-01", replaces: "IPC" },
  BNSS: { name: "Bharatiya Nagarik Suraksha Sanhita, 2023", status: "current", effective_date: "2024-07-01", replaces: "CrPC" },
  BSA: { name: "Bharatiya Sakshya Adhiniyam, 2023", status: "current", effective_date: "2024-07-01", replaces: "IEA" },
  IPC: { name: "Indian Penal Code, 1860", status: "repealed", effective_date: "1862-01-01", replaced_by: "BNS", note: "Still applies to offences committed before 1 July 2024." },
  CrPC: { name: "Code of Criminal Procedure, 1973", status: "repealed", effective_date: "1974-04-01", replaced_by: "BNSS", note: "May still govern proceedings pending before 1 July 2024." },
  IEA: { name: "Indian Evidence Act, 1872", status: "repealed", effective_date: "1872-09-01", replaced_by: "BSA" },
  CPA: { name: "Consumer Protection Act, 2019", status: "current", effective_date: "2020-07-20", replaces: "CPA1986" },
  CPA1986: { name: "Consumer Protection Act, 1986", status: "repealed", effective_date: NA, replaced_by: "CPA" },
  RTI: { name: "Right to Information Act, 2005", status: "current", effective_date: "2005-10-12" },
  "IT Act": { name: "Information Technology Act, 2000", status: "current", effective_date: "2000-10-17" },
  "MV Act": { name: "Motor Vehicles Act, 1988", status: "current", effective_date: NA, note: "Amended substantially in 2019." },
  "MW Act": { name: "Minimum Wages Act, 1948", status: "current_verify", effective_date: NA, note: "Subsumed by the Code on Wages, 2019 — verify notification status." },
  "PW Act": { name: "Payment of Wages Act, 1936", status: "current_verify", effective_date: NA, note: "Subsumed by the Code on Wages, 2019 — verify notification status." },
  EPF: { name: "Employees' Provident Funds Act, 1952", status: "current_verify", effective_date: NA, note: "Subsumed by the Code on Social Security, 2020 — verify notification status." },
  Gratuity: { name: "Payment of Gratuity Act, 1972", status: "current_verify", effective_date: NA, note: "Subsumed by the Code on Social Security, 2020 — verify notification status." },
  "MB Act": { name: "Maternity Benefit Act, 1961", status: "current_verify", effective_date: NA, note: "Subsumed by the Code on Social Security, 2020 — verify notification status." },
  "ID Act": { name: "Industrial Disputes Act, 1947", status: "current_verify", effective_date: NA, note: "Subsumed by the Industrial Relations Code, 2020 — verify notification status." },
  POCSO: { name: "Protection of Children from Sexual Offences Act, 2012", status: "current", effective_date: NA },
  PWDVA: { name: "Protection of Women from Domestic Violence Act, 2005", status: "current", effective_date: "2006-10-26" },
  POSH: { name: "Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013", status: "current", effective_date: NA },
  "DP Act": { name: "Dowry Prohibition Act, 1961", status: "current", effective_date: NA },
  HMA: { name: "Hindu Marriage Act, 1955", status: "current", effective_date: NA },
  SMA: { name: "Special Marriage Act, 1954", status: "current", effective_date: NA },
  TPA: { name: "Transfer of Property Act, 1882", status: "current", effective_date: NA },
  "SC/ST Act": { name: "Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act, 1989", status: "current", effective_date: NA },
};

const partCategory = (part: string) =>
  part.includes("Part III") ? "Fundamental Rights" : part.includes("Part IVA") ? "Fundamental Duties" : part.includes("Part IV") ? "Directive Principles" : "Constitution";

const record = (r: Partial<Record<string, unknown>>) => ({
  id: NA, category: NA, law_name: NA, article_or_section: NA, title: NA,
  legal_text: NA, simple_explanation: NA, simple_explanation_hi: NA, applicable_situation: NA,
  jurisdiction: "India (Central)", punishment_or_remedy: NA, related_sections: [] as string[],
  status: "current", source: SOURCES.indiaCode, effective_date: NA, last_verified_date: VERIFIED,
  keywords: [] as string[], ...r,
});

// constitution.json — legal_text left DATA_NOT_AVAILABLE: our entries are plain summaries, not verbatim text.
const constitution = CONSTITUTION.map((a) => record({
  id: `const-art-${slug(a.no)}`, category: partCategory(a.part), law_name: "Constitution of India",
  article_or_section: a.no === "Preamble" ? "Preamble" : `Article ${a.no}`, title: a.title, part: a.part,
  simple_explanation: a.text, source: SOURCES.constitution, effective_date: "1950-01-26",
  punishment_or_remedy: partCategory(a.part) === "Fundamental Rights" ? "Enforceable via writ under Article 32 (Supreme Court) or Article 226 (High Court)." : partCategory(a.part) === "Directive Principles" ? "Not enforceable by courts (Article 37)." : NA,
  related_sections: partCategory(a.part) === "Fundamental Rights" ? ["const-art-32", "const-art-226"] : [],
  keywords: kw(a.title, a.keywords, a.part),
}));

const sections = LAWS.map((l) => {
  const meta = ACTS[l.short];
  return record({
    id: `${slug(l.short)}-s-${slug(l.section)}`, category: l.category, law_name: l.act, act_code: l.short,
    article_or_section: `Section ${l.section}`, title: l.title, simple_explanation: l.text,
    status: meta?.status ?? "current", effective_date: meta?.effective_date ?? NA,
    replaces: meta?.replaces ? ACTS[meta.replaces].name : undefined,
    source: SOURCES.indiaCode, keywords: kw(l.title, l.category, l.short, l.text),
  });
});
// link sections of the same act + category
for (const s of sections) s.related_sections = sections.filter((o) => o !== s && o.law_name === s.law_name && o.category === s.category).map((o) => o.id).slice(0, 6);

const laws = Object.entries(ACTS).map(([code, a]) => ({
  id: `act-${slug(code)}`, code, law_name: a.name, status: a.status, effective_date: a.effective_date,
  replaces: a.replaces ? `act-${slug(a.replaces)}` : null, replaced_by: a.replaced_by ? `act-${slug(a.replaced_by)}` : null,
  note: a.note ?? null, jurisdiction: "India (Central)", source: SOURCES.indiaCode, last_verified_date: VERIFIED,
  section_ids: sections.filter((s) => s.act_code === code).map((s) => s.id),
}));

const rights = RIGHTS.map((r) => ({
  id: `right-${r.slug}`, category: r.name, summary: r.summary, rights: r.rights, simple_explanation_hi: NA,
  related_sections: sections.filter((s) => s.category === r.lawCategory).map((s) => s.id),
  sample_questions: r.queries, jurisdiction: "India (Central); state procedures may differ", last_verified_date: VERIFIED,
  keywords: kw(r.name, r.summary, ...r.rights),
}));

const procedures = PROCEDURES.map((p) => ({
  id: `proc-${p.slug}`, title: p.title, summary: p.summary, steps: p.steps, links: p.links, high_risk: !!p.highRisk,
  simple_explanation_hi: NA, jurisdiction: "India (Central); state portals and practice vary", last_verified_date: VERIFIED,
  keywords: kw(p.title, p.summary),
}));

const case_laws = CASES.map((c) => ({
  id: `case-${slug(c.name)}-${c.year}`, case_name: c.name, year: c.year, court: c.court, topic: c.topic,
  holding_summary: c.holding, citation: NA, bench: NA, decision_date: NA,
  source: `https://indiankanoon.org/search/?formInput=${encodeURIComponent(c.name)}`, last_verified_date: VERIFIED,
  keywords: kw(c.name, c.topic, c.holding),
}));

const T = (term: string, hi: string, en: string, hi_def: string) => ({ id: `term-${slug(term)}`, term, term_hi: hi, definition: en, definition_hi: hi_def, keywords: kw(term, en) });
const legal_terms = [
  T("FIR", "प्रथम सूचना रिपोर्ट", "First Information Report — the first written record by police of a cognizable offence.", "संज्ञेय अपराध की पुलिस द्वारा दर्ज पहली लिखित सूचना।"),
  T("Zero FIR", "ज़ीरो एफआईआर", "An FIR registered at any police station regardless of where the offence occurred, later transferred.", "किसी भी थाने में दर्ज एफआईआर, चाहे अपराध कहीं भी हुआ हो; बाद में संबंधित थाने को भेजी जाती है।"),
  T("Cognizable offence", "संज्ञेय अपराध", "An offence where police can register an FIR and arrest without a warrant.", "ऐसा अपराध जिसमें पुलिस बिना वारंट गिरफ्तार कर सकती है और एफआईआर दर्ज करती है।"),
  T("Non-cognizable offence", "असंज्ञेय अपराध", "An offence where police need a Magistrate's permission to investigate.", "ऐसा अपराध जिसकी जाँच के लिए पुलिस को मजिस्ट्रेट की अनुमति चाहिए।"),
  T("Bail", "जमानत", "Release of an accused from custody, usually on a bond or surety, pending trial.", "मुकदमे के दौरान आरोपी को बॉन्ड या ज़मानतदार पर हिरासत से रिहा करना।"),
  T("Anticipatory bail", "अग्रिम जमानत", "Bail granted in anticipation of arrest for a non-bailable offence.", "गैर-जमानती अपराध में गिरफ्तारी से पहले ली जाने वाली जमानत।"),
  T("Bailable offence", "जमानती अपराध", "An offence in which bail is a right.", "ऐसा अपराध जिसमें जमानत अधिकार के रूप में मिलती है।"),
  T("Non-bailable offence", "गैर-जमानती अपराध", "An offence in which bail is at the court's discretion.", "ऐसा अपराध जिसमें जमानत अदालत के विवेक पर है।"),
  T("Charge sheet", "आरोप पत्र", "Police report filed in court after investigation, listing evidence against the accused.", "जाँच के बाद अदालत में दायर पुलिस रिपोर्ट।"),
  T("Remand", "रिमांड", "Order by a Magistrate sending an accused to police or judicial custody.", "मजिस्ट्रेट का आदेश जिससे आरोपी पुलिस या न्यायिक हिरासत में भेजा जाता है।"),
  T("Summons", "समन", "A court order requiring a person to appear.", "अदालत में हाज़िर होने का आदेश।"),
  T("Warrant", "वारंट", "A court order authorising arrest or search.", "गिरफ्तारी या तलाशी का अदालती आदेश।"),
  T("Affidavit", "शपथ पत्र", "A written statement confirmed on oath.", "शपथ पर दिया गया लिखित बयान।"),
  T("Writ", "रिट", "A formal order by the Supreme Court or a High Court to enforce rights (habeas corpus, mandamus, etc.).", "अधिकार लागू कराने के लिए सुप्रीम कोर्ट/हाईकोर्ट का आदेश।"),
  T("Habeas corpus", "बंदी प्रत्यक्षीकरण", "Writ to produce a detained person before court.", "हिरासत में लिए व्यक्ति को अदालत के सामने पेश करने की रिट।"),
  T("PIL", "जनहित याचिका", "Public Interest Litigation — a case filed for the public good.", "जनता के हित में दायर याचिका।"),
  T("Plaintiff", "वादी", "The person who files a civil suit.", "दीवानी मुकदमा दायर करने वाला।"),
  T("Defendant", "प्रतिवादी", "The person against whom a civil suit is filed.", "जिसके विरुद्ध मुकदमा दायर हो।"),
  T("Legal notice", "कानूनी नोटिस", "A formal written demand sent before starting legal action.", "मुकदमे से पहले भेजी जाने वाली औपचारिक लिखित माँग।"),
  T("Limitation period", "परिसीमा अवधि", "The time limit within which a case must be filed.", "वह समय सीमा जिसके भीतर मुकदमा दायर करना होता है।"),
  T("Cross-examination", "जिरह", "Questioning of a witness by the opposing side.", "विपक्ष द्वारा गवाह से पूछताछ।"),
  T("Acquittal", "दोषमुक्ति", "A court finding that the accused is not guilty.", "अदालत द्वारा आरोपी को निर्दोष ठहराना।"),
  T("Conviction", "दोषसिद्धि", "A court finding that the accused is guilty.", "अदालत द्वारा आरोपी को दोषी ठहराना।"),
  T("Advocate", "अधिवक्ता", "A lawyer enrolled with a State Bar Council, entitled to practise.", "बार काउंसिल में पंजीकृत वकील।"),
  T("Legal aid", "विधिक सहायता", "Free legal services for eligible persons through Legal Services Authorities.", "पात्र लोगों को विधिक सेवा प्राधिकरण से मुफ्त कानूनी मदद।"),
];

const A = (id: string, name: string, kind: string, contact: string, url: string | null, purpose: string) => ({ id, name, type: kind, contact, url, purpose, jurisdiction: "India (Central)", last_verified_date: VERIFIED });
const authorities = [
  A("auth-112", "Emergency Response Support System", "Helpline", "112", null, "Police, fire, ambulance emergencies"),
  A("auth-1930", "National Cyber Crime Helpline", "Helpline", "1930", "https://cybercrime.gov.in", "Report online financial fraud quickly"),
  A("auth-1091", "Women Helpline (Police)", "Helpline", "1091", null, "Women in distress"),
  A("auth-181", "Women Helpline", "Helpline", "181", null, "Women in distress (state-run)"),
  A("auth-1098", "Childline", "Helpline", "1098", null, "Children in need of care and protection"),
  A("auth-15100", "NALSA Legal Aid Helpline", "Helpline", "15100", "https://nalsa.gov.in", "Free legal aid"),
  A("auth-1915", "National Consumer Helpline", "Helpline", "1915", "https://consumerhelpline.gov.in", "Consumer complaints and guidance"),
  A("auth-edaakhil", "e-Daakhil (Consumer Commission e-filing)", "Portal", NA, "https://edaakhil.nic.in", "File consumer complaints online"),
  A("auth-rti", "RTI Online (Central Government)", "Portal", NA, "https://rtionline.gov.in", "File RTI applications to central public authorities"),
  A("auth-nhrc", "National Human Rights Commission", "Commission", NA, "https://nhrc.nic.in", "Human rights violations, custodial abuse"),
  A("auth-ncw", "National Commission for Women", "Commission", NA, "https://ncw.nic.in", "Complaints relating to women's rights"),
  A("auth-sci", "Supreme Court of India", "Court", NA, "https://www.sci.gov.in", "Apex court; Article 32 writs, SLPs"),
  A("auth-ecourts", "eCourts Services", "Portal", NA, "https://ecourts.gov.in", "Case status, cause lists, orders"),
];

// states.json — High Court names; state-specific data not curated is DATA_NOT_AVAILABLE.
const S = (name: string, type: "State" | "UT", hc: string) => ({ id: `state-${slug(name)}`, name, type, high_court: hc, police_portal: NA, state_laws: NA, last_verified_date: VERIFIED });
const states = [
  S("Andhra Pradesh","State","High Court of Andhra Pradesh"), S("Arunachal Pradesh","State","Gauhati High Court"), S("Assam","State","Gauhati High Court"),
  S("Bihar","State","Patna High Court"), S("Chhattisgarh","State","High Court of Chhattisgarh"), S("Goa","State","Bombay High Court"),
  S("Gujarat","State","High Court of Gujarat"), S("Haryana","State","High Court of Punjab and Haryana"), S("Himachal Pradesh","State","High Court of Himachal Pradesh"),
  S("Jharkhand","State","High Court of Jharkhand"), S("Karnataka","State","High Court of Karnataka"), S("Kerala","State","High Court of Kerala"),
  S("Madhya Pradesh","State","High Court of Madhya Pradesh"), S("Maharashtra","State","Bombay High Court"), S("Manipur","State","High Court of Manipur"),
  S("Meghalaya","State","High Court of Meghalaya"), S("Mizoram","State","Gauhati High Court"), S("Nagaland","State","Gauhati High Court"),
  S("Odisha","State","Orissa High Court"), S("Punjab","State","High Court of Punjab and Haryana"), S("Rajasthan","State","Rajasthan High Court"),
  S("Sikkim","State","High Court of Sikkim"), S("Tamil Nadu","State","Madras High Court"), S("Telangana","State","High Court for the State of Telangana"),
  S("Tripura","State","High Court of Tripura"), S("Uttar Pradesh","State","Allahabad High Court"), S("Uttarakhand","State","High Court of Uttarakhand"),
  S("West Bengal","State","Calcutta High Court"), S("Andaman and Nicobar Islands","UT","Calcutta High Court"), S("Chandigarh","UT","High Court of Punjab and Haryana"),
  S("Dadra and Nagar Haveli and Daman and Diu","UT","Bombay High Court"), S("Delhi","UT","High Court of Delhi"), S("Jammu and Kashmir","UT","High Court of Jammu & Kashmir and Ladakh"),
  S("Ladakh","UT","High Court of Jammu & Kashmir and Ladakh"), S("Lakshadweep","UT","High Court of Kerala"), S("Puducherry","UT","Madras High Court"),
];

const files = { constitution, laws, sections, rights, procedures, case_laws, legal_terms, authorities, states };
for (const [name, data] of Object.entries(files)) writeFileSync(`${OUT}/${name}.json`, JSON.stringify(data, null, 2) + "\n");
console.log(Object.entries(files).map(([n, d]) => `${n}: ${d.length}`).join("\n"));
