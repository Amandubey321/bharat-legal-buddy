export async function streamChat(opts: {
  messages: { role: "user" | "assistant"; content: string }[];
  language: string; state: string; groqKey?: string; mode?: "qa" | "draft";
  signal?: AbortSignal; onDelta: (t: string) => void; onProvider?: (p: string) => void;
}) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: opts.messages, language: opts.language, state: opts.state, groqKey: opts.groqKey, mode: opts.mode }),
    signal: opts.signal,
  });
  if (!res.ok || !res.body) throw new Error((await res.text()) || "Request failed");
  opts.onProvider?.(res.headers.get("X-Provider") ?? "");
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    opts.onDelta(dec.decode(value, { stream: true }));
  }
}
