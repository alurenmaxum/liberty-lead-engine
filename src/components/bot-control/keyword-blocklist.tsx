"use client";

import { useEffect, useState } from "react";

interface BlocklistConfig {
  blockPatterns: string[];
  flagPatterns: string[];
}

export function KeywordBlocklist() {
  const [config, setConfig] = useState<BlocklistConfig>({ blockPatterns: [], flagPatterns: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/compliance/keywords").then((r) => r.json()).then(setConfig);
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/compliance/keywords", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setSaving(false);
  }

  function updatePatterns(key: "blockPatterns" | "flagPatterns", value: string) {
    setConfig({ ...config, [key]: value.split("\n").filter(Boolean) });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-red-400 mb-1 font-semibold">Block Patterns (one per line)</label>
        <textarea
          value={config.blockPatterns.join("\n")}
          onChange={(e) => updatePatterns("blockPatterns", e.target.value)}
          rows={4}
          className="w-full bg-white/5 px-3 py-2 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500"
        />
      </div>
      <div>
        <label className="block text-xs text-amber-400 mb-1 font-semibold">Flag Patterns (one per line)</label>
        <textarea
          value={config.flagPatterns.join("\n")}
          onChange={(e) => updatePatterns("flagPatterns", e.target.value)}
          rows={4}
          className="w-full bg-white/5 px-3 py-2 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-4 py-1 rounded disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Blocklist"}
      </button>
    </div>
  );
}
