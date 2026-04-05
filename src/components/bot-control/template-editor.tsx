"use client";

import { useState } from "react";

interface TemplateEditorProps {
  initial?: { id?: string; name: string; category: string; content: string };
  onSave: () => void;
  onCancel: () => void;
}

export function TemplateEditor({ initial, onSave, onCancel }: TemplateEditorProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "nurture");
  const [content, setContent] = useState(initial?.content ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const method = initial?.id ? "PATCH" : "POST";
    const url = initial?.id ? `/api/templates/${initial.id}` : "/api/templates";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category, content }),
    });
    setSaving(false);
    onSave();
  }

  return (
    <div className="bg-white/[0.03] rounded-lg p-4 space-y-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Template name"
        className="w-full bg-white/5 px-3 py-2 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full bg-white/5 px-3 py-2 rounded text-sm text-white focus:outline-none"
      >
        <option value="nurture">Nurture</option>
        <option value="booking">Booking</option>
        <option value="reminder">Reminder</option>
        <option value="qualification">Qualification</option>
      </select>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Message content (use {{name}} for lead name)"
        rows={4}
        className="w-full bg-white/5 px-3 py-2 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-sm text-gray-400 hover:text-gray-200 px-3 py-1">Cancel</button>
        <button
          onClick={handleSave}
          disabled={saving || !name || !content}
          className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-1 rounded disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
