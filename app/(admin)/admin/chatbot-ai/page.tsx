import { AdminShell } from "@/components/admin/shell";
import { ChatbotAiClient } from "./chatbot-ai-client";

export const dynamic = "force-dynamic";

export default function AdminChatbotAiPage() {
  return (
    <AdminShell>
      <ChatbotAiClient />
    </AdminShell>
  );
}
