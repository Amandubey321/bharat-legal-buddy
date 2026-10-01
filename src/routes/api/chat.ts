import { createFileRoute } from "@tanstack/react-router";
import { handleLegalChat } from "@/lib/ai/legal-ai.server";

export const Route = createFileRoute("/api/chat")({
  server: { handlers: { POST: ({ request }) => handleLegalChat(request) } },
});
