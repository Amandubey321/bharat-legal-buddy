import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/app/AppShell";
import { CopyButton, downloadText } from "@/components/app/CopyButton";
import { TEMPLATES } from "@/data/templates";
import { useSettings } from "@/lib/settings";
import { streamChat } from "@/lib/stream-chat";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Legal Document Drafts — RTI, complaint, legal notice | NyayaSetu" },
      { name: "description", content: "Create RTI applications (Section 6(1)), police complaints, consumer complaints, legal notices and cyber fraud complaints. Copy or download." },
      { property: "og:title", content: "Draft RTI, complaints and legal notices — NyayaSetu" },
      { property: "og:description", content: "Free legal draft templates for Indian citizens." },
    ],
  }),
  component: DocumentsPage,
});

const DISCLAIMER = "\n\n---\nDISCLAIMER: This draft was generated for general information only and is not legal advice. Review the facts and get it checked by a licensed advocate before use.";

function DocumentsPage() {
  const s = useSettings();
  const [slug, setSlug] = useState(TEMPLATES[0].slug);
  const [values, setValues] = useState<Record<string, string>>({});
  const [aiText, setAiText] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const t = TEMPLATES.find((x) => x.slug === slug)!;
  const base = t.build(values);
  const draft = aiText ?? base;

  async function improve() {
    setBusy(true); setAiText("");
    try {
      await streamChat({
        mode: "draft", language: s.language, state: s.state, groqKey: s.groqKey || undefined,
        messages: [{ role: "user", content: `Improve this ${t.title} (jurisdiction: ${s.state}). Write it in ${s.language === "English" ? "English" : `${s.language} (keep legal references in English)`}:\n\n${base}` }],
        onDelta: (d) => setAiText((p) => (p ?? "") + d),
      });
    } catch (e) {
      toast.error((e as Error).message); setAiText(null);
    } finally { setBusy(false); }
  }

  return (
    <div>
      <PageHeader title="Documents" subtitle="Fill in the details to build a draft. Optionally polish it with AI. Always review with an advocate before sending." />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-5 flex flex-wrap gap-2">
          {TEMPLATES.map((x) => (
            <button key={x.slug} onClick={() => { setSlug(x.slug); setValues({}); setAiText(null); }}
              className={`rounded-full border px-3 py-1.5 text-sm ${slug === x.slug ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-accent"}`}>{x.title}</button>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            <div>
              <h2 className="text-xl font-semibold">{t.title}</h2>
              <p className="text-sm text-muted-foreground">{t.description}</p>
            </div>
            {t.fields.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label htmlFor={f.key}>{f.label}</Label>
                {f.multiline ? (
                  <Textarea id={f.key} rows={3} value={values[f.key] ?? ""} onChange={(e) => { setValues({ ...values, [f.key]: e.target.value }); setAiText(null); }} />
                ) : (
                  <Input id={f.key} value={values[f.key] ?? ""} onChange={(e) => { setValues({ ...values, [f.key]: e.target.value }); setAiText(null); }} />
                )}
              </div>
            ))}
            <Button onClick={improve} disabled={busy} className="w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Polish with AI
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="font-medium">Preview {aiText !== null && <span className="text-xs text-accent">(AI-polished)</span>}</span>
              <div className="ml-auto flex gap-2">
                {aiText !== null && !busy && <Button size="sm" variant="ghost" onClick={() => setAiText(null)}>Reset</Button>}
                <CopyButton text={draft + DISCLAIMER} />
                <Button size="sm" variant="outline" onClick={() => downloadText(`${t.slug}-draft.txt`, draft + DISCLAIMER)}><Download className="h-4 w-4" /> Download</Button>
              </div>
            </div>
            <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-4 font-serif text-[15px] leading-relaxed">{draft}</pre>
            <p className="mt-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs">
              <b>Disclaimer:</b> This is a template for information only, not legal advice. Placeholders in [brackets] must be completed. Get it reviewed by a licensed advocate before sending.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
