import { useRef, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bookmark, Download, Loader2, Paperclip, Square, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VerifyNotice } from "@/components/app/AppShell";
import { CopyButton, downloadText } from "@/components/app/CopyButton";
import { saveAnswer, HIGH_RISK, useSettings } from "@/lib/settings";
import { streamChat } from "@/lib/stream-chat";

type Mode = "analyze" | "authority" | "timeline";
type Att = { name: string; mediaType: string; data: string };

export function AiTool({ mode, placeholder, chips, allowFile, buildPrompt, extra }: {
  mode: Mode; placeholder: string; chips: string[]; allowFile?: boolean;
  buildPrompt: (input: string, state: string) => string; extra?: ReactNode;
}) {
  const s = useSettings();
  const [input, setInput] = useState("");
  const [att, setAtt] = useState<Att | null>(null);
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const ctrl = useRef<AbortController | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile(f: File | undefined) {
    if (!f) return;
    if (!/^(application\/pdf|image\/(png|jpeg|webp))$/.test(f.type)) { toast.error("Use a PDF, JPG, PNG or WEBP file."); return; }
    if (f.size > 10 * 1024 * 1024) { toast.error("File too large (max 10 MB)."); return; }
    const r = new FileReader();
    r.onload = () => setAtt({ name: f.name, mediaType: f.type, data: String(r.result) });
    r.readAsDataURL(f);
  }

  async function run(text = input) {
    if (!text.trim() && !att) { toast.error("Please type or attach something first."); return; }
    ctrl.current = new AbortController();
    setBusy(true); setOut("");
    try {
      await streamChat({
        mode, language: s.language, state: s.state, groqKey: s.groqKey || undefined, attachment: att ?? undefined,
        signal: ctrl.current.signal,
        messages: [{ role: "user", content: buildPrompt(text.trim() || "(see attached document)", s.state) }],
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
        <Textarea rows={allowFile ? 8 : 4} value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholder} />
        {att && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-md bg-muted px-2 py-1 text-sm">
            <Paperclip className="h-4 w-4" />{att.name}
            <button aria-label="Remove file" onClick={() => setAtt(null)}><X className="h-4 w-4" /></button>
          </div>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {busy
            ? <Button variant="outline" onClick={() => ctrl.current?.abort()}><Square className="mr-1 h-4 w-4" /> Stop</Button>
            : <Button onClick={() => run()}>Get answer</Button>}
          {allowFile && (
            <>
              <input ref={fileRef} type="file" accept="application/pdf,image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = ""; }} />
              <Button variant="outline" onClick={() => fileRef.current?.click()}><Paperclip className="mr-1 h-4 w-4" /> Upload PDF / photo</Button>
            </>
          )}
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
        {allowFile && <p className="mt-2 text-xs text-muted-foreground">Files are sent only for this analysis and are not stored. Remove personal details you don't want to share.</p>}
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
                <Button variant="outline" size="sm" onClick={() => { saveAnswer({ question: input || att?.name || mode, answer: out, state: s.state, language: s.language }); toast.success("Saved"); }}><Bookmark className="mr-1 h-4 w-4" /> Save</Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
