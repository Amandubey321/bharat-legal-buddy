<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- AI legal Q&A streams plain text from the `/api/chat` server route (`src/lib/ai/legal-ai.server.ts`): user-supplied Groq key first, Lovable AI fallback — keeps provider keys server-side and lets fallback happen before headers are sent.
- Reference content (Constitution, laws, cases, procedures, templates) is curated static data in `src/data/` linking to official/public sources — avoids fabricated citations.
- User settings (language, state, Groq key) and saved answers live in browser localStorage — no accounts yet.
- Offline knowledge base JSON (`src/data/kb/*.json`) is generated from `src/data/legal.ts` by `bun ./scripts/build-kb.ts`; edit the source data, not the JSON — keeps one source of truth, unknowns marked DATA_NOT_AVAILABLE.
