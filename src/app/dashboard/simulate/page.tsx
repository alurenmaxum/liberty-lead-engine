"use client";

import { useState, FormEvent } from "react";

interface IntakeResult {
  leadId: string;
  conversationId: string;
  stage: string;
  tier: string;
  outgoingMessages: string[];
}

export default function SimulatePage() {
  const [from, setFrom] = useState("+27820000001");
  const [text, setText] = useState("");
  const [profileName, setProfileName] = useState("");
  const [result, setResult] = useState<IntakeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/simulate/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, text, profileName: profileName || undefined }),
      });
      const data: unknown = await res.json();
      if (!res.ok) {
        setError(JSON.stringify(data));
      } else {
        setResult(data as IntakeResult);
        setText("");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-lg font-semibold">Simulate Intake</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Phone (from)</label>
          <input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Profile name (optional)</label>
          <input
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Message</label>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            placeholder="e.g. 1"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded px-4 py-2 text-sm font-medium"
        >
          {loading ? "Sending…" : "Send"}
        </button>
      </form>

      {error && (
        <div className="bg-red-900 text-red-300 rounded p-3 text-sm">{error}</div>
      )}

      {result && (
        <div className="bg-gray-900 rounded-lg p-4 space-y-3">
          <div className="text-xs text-gray-500 space-y-1">
            <div>Lead: {result.leadId}</div>
            <div>Stage: {result.stage} | Tier: {result.tier}</div>
          </div>
          {result.outgoingMessages.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-gray-400 uppercase tracking-wide">Bot replies</div>
              {result.outgoingMessages.map((msg, i) => (
                <div
                  key={i}
                  className="bg-blue-900 text-blue-100 rounded-lg px-3 py-2 text-sm whitespace-pre-wrap"
                >
                  {msg}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
