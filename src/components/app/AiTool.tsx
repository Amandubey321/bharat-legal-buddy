import { useRef, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bookmark, Download, Loader2, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VerifyNotice } from "@/components/app/AppShell";
import { CopyButton, downloadText } from "@/components/app/CopyButton";
import { saveAnswer, HIGH_RISK, useSettings } from "@/lib/settings";
import { streamChat } from "@/lib/stream-chat";

type Mode = "analyze" | "authority" | "timeline";

export function AiTool({ mode, placeholder, chips, buildPrompt, extra }: {
  mode: Mode; placeholder: string; chips: string[];
  buildPrompt: (input: string, state: string) => string; extra?: ReactNode;
}) {
  const s = useSettings();
  const [input, setInput] = useState("");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const ctrl = useRef<AbortController | null>(null);

  async function run(text = input) {
    if (!text.trim()) { toast.error("Please type or paste something first."); return; }
    ctrl.current = new AbortController();
    setBusy(true); setOut("");
    try {
      await streamChat({
        mode, language: s.language, state: s.state, groqKey: s.groqKey || undefined,
        signal: ctrl.current.signal,
        messages: [{ role: "user", content: buildPrompt(text.trim(), s.state) }],
        onDelta: (d) => setOut((p) => p + d),
      });
    } catch (e) {
      if ((e as Error).name !== "AbortError") toast.error((e as Error).message);
    } finally { setBusy(false); }
  }

  const risky = HIGH_RISK.test(input + out);
  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-6">
      {extra}
      <div className="rounded-xl border border-border bg-card p-4">
        <Textarea rows={mode === "analyze" ? 8 : 4} value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholder} />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {busy
            ? <Button variant="outline" onClick={() => ctrl.current?.abort()}><Square className="mr-1 h-4 w-4" /> Stop</Button>
            : <Button onClick={() => run()}>Get answer</Button>}
          <span className="text-xs text-muted-foreground">State: {s.state} · {s.language}</span>
        </div>
        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((c) => (
              <button key={c} onClick={() => { setInput(c); void run(c); }} disabled={busy}
                className="rounded-full border border-border bg-background px-3 py-1 text-sm hover:border-accent">{c}</button>
            ))}
          </div>
        )}
      </div>

      {risky && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm">
          <b>High-risk matter.</b> Contact a licensed advocate or free legal aid (NALSA 15100) immediately. Emergency: 112.
        </div>
      )}

      {(out || busy) && (
        <div className="rounded-xl border border-border bg-card p-5">
          {busy && !out && <p className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Thinking…</p>}
          <div className="prose-legal text-[15px]"><ReactMarkdown remarkPlugins={[remarkGfm]}>{out}</ReactMarkdown></div>
          {!busy && out && (
            <>
              <VerifyNotice className="mt-4" />
              <div className="mt-3 flex flex-wrap gap-2">
                <CopyButton text={out} />
                <Button variant="outline" size="sm" onClick={() => downloadText(`nyayasetu-${mode}.txt`, out)}><Download className="mr-1 h-4 w-4" /> Download</Button>
                <Button variant="outline" size="sm" onClick={() => { saveAnswer({ question: input || mode, answer: out, state: s.state, language: s.language }); toast.success("Saved"); }}><Bookmark className="mr-1 h-4 w-4" /> Save</Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
