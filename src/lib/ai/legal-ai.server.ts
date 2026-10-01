import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

export type ChatBody = {
  messages: { role: "user" | "assistant"; content: string }[];
  language: string;
  state: string;
  mode?: "qa" | "draft" | "analyze" | "authority" | "timeline";
  groqKey?: string;
  attachment?: { name: string; mediaType: string; data: string };
};

const EXTRA_TASKS: Record<string, string> = {
  analyze: `TASK: Analyse the legal document the user provided (pasted text or attached file). Format (markdown):
## What this document is
## Key parties, dates, amounts
## Main obligations / demands
## Red flags or risky clauses
## Deadlines you must not miss
## What you can do next
## Relevant law (only if highly confident; else say "the relevant provision")
If the document is unreadable or not legal, say so. Never assume facts not in the document. End with: "_This is general legal information, not legal advice. Get the document reviewed by an advocate._"`,
  authority: `TASK: Tell the user which authority/office/forum to approach for their issue in their state. Format (markdown):
## Where to go first
## If that doesn't work (escalation)
## Online portals & helplines (only official ones you are sure of, e.g. cybercrime.gov.in, edaakhil.nic.in, rtionline.gov.in, pgportal.gov.in, ncw.nic.in, nalsa.gov.in; Police 112, Cyber 1930, Women 1091/181, Consumer 1915, Childline 1098, Legal aid 15100)
## Documents to carry
Never invent addresses, phone numbers or officer names; tell the user to find the nearest office via the official state website. End with: "_This is general legal information, not legal advice._"`,
  timeline: `TASK: Explain the typical stages and timeline of the user's case/process in India. Format (markdown):
## Stages (numbered, each with what happens and a typical time range using "generally/usually")
## Legal time limits (limitation periods, statutory deadlines — only if highly confident, else say verify)
## What can cause delays
## Tips to move faster
State clearly that real timelines vary widely by court, state and case. Never guarantee time or outcome. End with: "_This is general legal information, not legal advice._"`,
};

function systemPrompt(b: ChatBody) {
  return `You are "NyayaSetu", an AI legal-information assistant for citizens of India. You are NOT a lawyer and must never claim to be one.

Jurisdiction context: India; user's state/UT: ${b.state || "not specified"}. Mention when procedure may differ by state.
Respond in: ${b.language}. Use simple, plain words. Keep legal terms (e.g. "FIR", "bail") and section numbers in English in brackets where helpful.

Current criminal laws (in force since 1 July 2024): Bharatiya Nyaya Sanhita 2023 (BNS, replaced IPC), Bharatiya Nagarik Suraksha Sanhita 2023 (BNSS, replaced CrPC), Bharatiya Sakshya Adhiniyam 2023 (BSA, replaced Evidence Act). Use these for current matters; mention old IPC/CrPC equivalents only if you are certain.

STRICT CITATION RULES:
- Cite an Article/Section/Act ONLY if you are highly confident it is correct. If unsure, say "the relevant provision" and advise verifying — never guess a number.
- NEVER invent case names, citations, years, or judgments. Only mention very well-known Supreme Court judgments you are certain about. Otherwise say no specific judgment is cited.
- Never guarantee an outcome. Use "generally", "usually", "may".

${b.mode && EXTRA_TASKS[b.mode] ? EXTRA_TASKS[b.mode] : b.mode === "draft"
    ? "TASK: Improve the user's legal draft. Keep its structure, fill clear language, keep placeholders in [BRACKETS] where facts are missing. Output only the improved draft text followed by a one-line note: 'Draft for information only — get it reviewed by an advocate before sending.'"
    : `FORMAT (markdown):
## Short answer
2–4 sentences.
## Your rights
bullets
## What you can do (steps)
numbered steps, include helplines/portals where relevant (Police 112, Cyber fraud 1930 / cybercrime.gov.in, Women helpline 1091/181, Consumer helpline 1915, RTI online rtionline.gov.in).
## Legal references
bullets in the form "**Act — Section/Article X**: one-line meaning". Add "(verify)" if any doubt.
## When to consult an advocate
If the matter involves arrest, custody, criminal charges, violence, or deadlines, strongly urge contacting a licensed advocate or free legal aid (NALSA helpline 15100 / District Legal Services Authority).

End with: "_This is general legal information, not legal advice._"`}`;
}

/** Streams plain text from OpenRouter using the server-held OPENROUTER_API_KEY. */
export async function handleLegalChat(request: Request): Promise<Response> {
  let body: ChatBody;
  try {
    body = (await request.json()) as ChatBody;
  } catch {
    return new Response("Invalid request", { status: 400 });
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response("No question provided", { status: 400 });
  }
  const apiKey = process.env["OPENROUTER_API_KEY"];
  if (!apiKey) {
    return new Response("AI is not configured on the server.", { status: 500 });
  }
  if (body.attachment?.data) {
    return new Response("File upload is not supported. Please paste the document text instead.", { status: 415 });
  }
  const messages: ModelMessage[] = body.messages
    .slice(-12)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 8000) }));
  const system = systemPrompt(body);

  const encoder = new TextEncoder();

  async function* fromOpenRouter(key: string) {
    const or = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: key,
      headers: { "X-Title": "NyayaSetu" },
    });
    const r = streamText({
      model: or.chat("openrouter/free"),
      system,
      messages,
      maxRetries: 0,
      maxOutputTokens: 4000,
      onError: ({ error }) => { if (!isAbort(error) && !request.signal.aborted) console.error("OpenRouter stream error:", error); },
      abortSignal: request.signal,
    });
    for await (const part of r.fullStream) {
      if (part.type === "error") throw part.error;
      if (part.type === "text-delta") yield part.text;
    }
  }
  const fromGroq = fromOpenRouter;
  const groqKey = apiKey;

  const provider = "OpenRouter";

  // Pre-fetch the first chunk so key/API errors surface before headers are sent.
  const iter: AsyncGenerator<string> = fromGroq(groqKey);
  let first: IteratorResult<string>;
  try {
    first = await iter.next();
  } catch (err) {
    // The user pressed Stop or left the page — not an error.
    if (isAbort(err) || request.signal.aborted) return new Response(null, { status: 499 });
    return errorResponse(err);
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (!first.done) controller.enqueue(encoder.encode(first.value));
        for (;;) {
          const n = await iter.next();
          if (n.done) break;
          controller.enqueue(encoder.encode(n.value));
        }
        controller.close();
      } catch (e) {
        if (isAbort(e) || request.signal.aborted) {
          try { controller.close(); } catch { /* already closed */ }
          return;
        }
        controller.enqueue(encoder.encode("\n\n_[The answer was interrupted. Please try again.]_"));
        console.error(e);
        controller.close();
      }
    },
    cancel() {
      void iter.return(undefined);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Provider": provider,
    },
  });
}

function isAbort(err: unknown) {
  const e = err as { name?: string; cause?: { name?: string } } | null;
  return e?.name === "AbortError" || e?.cause?.name === "AbortError";
}

function errorResponse(err: unknown) {
  const status = (err as { statusCode?: number })?.statusCode ?? 500;
  console.error("OpenRouter error:", err);
  const msg =
    status === 401 || status === 403
      ? "The OpenRouter API key was rejected. Please check the saved key."
      : status === 402
        ? "OpenRouter credits are exhausted. Add credits at openrouter.ai."
        : status === 429
          ? "Rate limit reached. Please wait a moment and try again."
          : status === 413
            ? "Your message is too long. Please shorten it and try again."
            : "The AI is unavailable right now. Please try again.";
  return new Response(msg, { status: [401, 402, 403, 413, 429].includes(status) ? status : 500 });
}
