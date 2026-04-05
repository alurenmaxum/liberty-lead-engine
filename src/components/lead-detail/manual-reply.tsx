"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ManualReply({ leadId }: { leadId: string }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const router = useRouter();

  async function handleSend() {
    if (!message.trim() || sending) return;
    setSending(true);
    await fetch(`/api/leads/${leadId}/messages/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    setMessage("");
    setSending(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2 mt-4">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && void handleSend()}
        placeholder="Send a message as Kiru…"
        className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={() => void handleSend()}
        disabled={!message.trim() || sending}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded px-4 py-2 text-sm font-medium"
      >
        {sending ? "…" : "Send"}
      </button>
    </div>
  );
}
