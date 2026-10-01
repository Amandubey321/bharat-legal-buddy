import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AlertTriangle, Bookmark, ExternalLink, Loader2, Send, Square, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/app/AppShell";
import { CopyButton } from "@/components/app/CopyButton";
import { HIGH_RISK, indianKanoon, saveAnswer, useSettings } from "@/lib/settings";
import { streamChat } from "@/lib/stream-chat";

export const Route = createFileRoute("/ask")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => (typeof s['q'] === "string" ? { q: s['q'] as string } : {}),
  head: () => ({
    meta: [
      { title: "Ask AI — Indian legal questions answered | NyayaSetu" },
      { name: "description", content: "Ask questions about Indian law in simple language and get answers with Act, section and Article references." },
      { property: "og:title", content: "Ask AI about Indian law — NyayaSetu" },
      { property: "og:description", content: "AI legal Q&A for BNS, BNSS, Constitution, consumer, cyber and labour laws." },
    ],
  }),
  component: AskPage,
});

type Msg = { role: "user" | "assistant"; content: string; provider?: string };

const CHIPS = ["How to file a Zero FIR?", "Rights during police questioning", "Consumer complaint for defective phone", "How to apply for anticipatory bail?", "File RTI for my pension status", "Fake loan app harassment"];

function AskPage() {
  const { q } = Route.useSearch();
  const s = useSettings();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const started = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs]);
  useEffect(() => {
    if (q && !started.current) { started.current = true; void send(q); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const history: Msg[] = [...msgs, { role: "user", content: text.trim() }];
    setMsgs([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    const ctrl = new AbortController();
    abort.current = ctrl;
    try {
      await streamChat({
        messages: history.map(({ role, content }) => ({ role, content })),
        language: s.language, state: s.state, groqKey: s.groqKey || undefined, signal: ctrl.signal,
        onProvider: (p) => setMsgs((m) => m.map((x, i) => (i === m.length - 1 ? { ...x, provider: p } : x))),
        onDelta: (t) => setMsgs((m) => m.map((x, i) => (i === m.length - 1 ? { ...x, content: x.content + t } : x))),
      });
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        setMsgs((m) => m.map((x, i) => (i === m.length - 1 ? { ...x, content: x.content + "\n\n_[Stopped]_" } : x)));
      } else {
        const msg = (e as Error).message;
        toast.error(msg);
        setMsgs((m) => m.map((x, i) => (i === m.length - 1 ? { ...x, content: `⚠️ ${msg}` } : x)));
      }
    } finally {
      setBusy(false);
      abort.current = null;
    }
  }

  const lastUser = [...msgs].reverse().find((m) => m.role === "user")?.content ?? "";
  const risky = HIGH_RISK.test(lastUser);

  return (
    <div>
      <PageHeader title="Ask AI" subtitle={`Answers in ${s.language} · Jurisdiction: ${s.state}. Legal information only — not legal advice.`} />
      <div className="mx-auto max-w-4xl px-4 py-6">
        {risky && (
          <div className="mb-4 flex gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
            <div><b>This looks like a criminal or custody matter.</b> Please contact a licensed advocate immediately. Free legal aid: <a className="underline" href="tel:15100">NALSA 15100</a>. In an emergency call <a className="underline" href="tel:112">112</a>.</div>
          </div>
        )}

        {msgs.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center">
            <p className="font-serif text-lg">What legal question do you have?</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {CHIPS.map((c) => <button key={c} onClick={() => send(c)} className="rounded-full border border-border px-3 py-1.5 text-sm hover:border-accent hover:bg-accent/10">{c}</button>)}
            </div>
          </div>
        )}

        <div className="space-y-5">
          {msgs.map((m, i) => m.role === "user" ? (
            <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-primary-foreground">{m.content}</div>
          ) : (
            <article key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              {m.content ? (
                <div className="prose-legal text-[15px]"><ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown></div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Researching the law…</div>
              )}
              {m.content && !(busy && i === msgs.length - 1) && (
                <>
                  <p className="mt-4 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-xs">
                    <b>Verify before relying:</b> AI can make mistakes. Check cited sections on official sources (India Code, Legislative Dept.) — jurisdiction: {s.state}.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <CopyButton text={m.content} />
                    <Button size="sm" variant="outline" onClick={() => { saveAnswer({ question: msgs[i - 1]?.content ?? "", answer: m.content, state: s.state, language: s.language }); toast.success("Saved"); }}>
                      <Bookmark className="h-4 w-4" /> Save
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={indianKanoon(msgs[i - 1]?.content ?? "")} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Search case law</a>
                    </Button>
                    {m.provider && <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground"><Zap className="h-3 w-3" /> {m.provider}</span>}
                  </div>
                </>
              )}
            </article>
          ))}
          <div ref={endRef} />
        </div>

        <form className="sticky bottom-3 mt-6 flex gap-2 rounded-xl border border-border bg-card p-2 shadow-lg" onSubmit={(e) => { e.preventDefault(); void send(input); }}>
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={2} placeholder="Describe your situation in any language…" className="min-h-0 resize-none border-0 shadow-none focus-visible:ring-0"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); } }} />
          {busy ? (
            <Button type="button" variant="outline" onClick={() => abort.current?.abort()} aria-label="Stop"><Square className="h-4 w-4" /></Button>
          ) : (
            <Button type="submit" disabled={!input.trim()} aria-label="Send"><Send className="h-4 w-4" /></Button>
          )}
        </form>
      </div>
    </div>
  );
}
