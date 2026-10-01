import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/AppShell";
import { CopyButton, downloadText } from "@/components/app/CopyButton";
import { deleteSaved, getSaved, type SavedAnswer } from "@/lib/settings";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved Answers | NyayaSetu" },
      { name: "description", content: "Your saved legal answers, stored privately in this browser." },
      { property: "og:title", content: "Saved Answers — NyayaSetu" },
      { property: "og:description", content: "Revisit legal answers you saved." },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const [items, setItems] = useState<SavedAnswer[]>([]);
  useEffect(() => setItems(getSaved()), []);
  return (
    <div>
      <PageHeader title="Saved Answers" subtitle="Stored privately on this device only." />
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-6">
        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
            Nothing saved yet. <Link to="/ask" className="underline">Ask a question</Link> and tap "Save".
          </div>
        )}
        {items.map((a) => (
          <details key={a.id} className="rounded-xl border border-border bg-card p-5">
            <summary className="cursor-pointer">
              <span className="font-serif text-lg font-semibold">{a.question}</span>
              <span className="block text-xs text-muted-foreground">{new Date(a.savedAt).toLocaleString("en-IN")} · {a.state} · {a.language}</span>
            </summary>
            <div className="prose-legal mt-4 text-[15px]"><ReactMarkdown remarkPlugins={[remarkGfm]}>{a.answer}</ReactMarkdown></div>
            <div className="mt-4 flex gap-2">
              <CopyButton text={a.answer} />
              <Button size="sm" variant="outline" onClick={() => downloadText("legal-answer.txt", `Q: ${a.question}\n\n${a.answer}`)}><Download className="h-4 w-4" /> Download</Button>
              <Button size="sm" variant="ghost" className="ml-auto text-destructive" onClick={() => { deleteSaved(a.id); setItems(getSaved()); }}><Trash2 className="h-4 w-4" /> Delete</Button>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
