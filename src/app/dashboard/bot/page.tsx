"use client";

import { useState } from "react";
import { TemplateList } from "@/components/bot-control/template-list";
import { TemplateEditor } from "@/components/bot-control/template-editor";
import { KeywordBlocklist } from "@/components/bot-control/keyword-blocklist";

interface TemplateForEdit {
  id?: string;
  name: string;
  category: string;
  content: string;
}

export default function BotControlPage() {
  const [editing, setEditing] = useState<TemplateForEdit | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <h1 className="text-lg font-bold mb-6">Bot Control</h1>

      <section className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Message Templates</h2>
          <button
            onClick={() => { setEditing(null); setShowEditor(true); }}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded"
          >
            New Template
          </button>
        </div>

        {showEditor && (
          <div className="mb-4">
            <TemplateEditor
              initial={editing ?? undefined}
              onSave={() => { setShowEditor(false); setRefreshKey((k) => k + 1); }}
              onCancel={() => setShowEditor(false)}
            />
          </div>
        )}

        <TemplateList
          refreshKey={refreshKey}
          onEdit={(t) => { setEditing(t); setShowEditor(true); }}
        />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Compliance Keyword Blocklist
        </h2>
        <KeywordBlocklist />
      </section>
    </div>
  );
}
