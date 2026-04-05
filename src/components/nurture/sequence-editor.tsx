"use client";

import { useState } from "react";

interface Step {
  delay: string;
  type: "template" | "ai" | "action";
  templateId?: string;
  aiPrompt?: string;
  action?: string;
}

interface SequenceEditorProps {
  initial?: { id?: string; name: string; trigger: string; steps: Step[] };
  onSave: () => void;
  onCancel: () => void;
}

export function SequenceEditor({ initial, onSave, onCancel }: SequenceEditorProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [trigger, setTrigger] = useState(initial?.trigger ?? "tier=warm");
  const [steps, setSteps] = useState<Step[]>(initial?.steps ?? []);
  const [saving, setSaving] = useState(false);

  function addStep() {
    setSteps([...steps, { delay: "2d", type: "ai", aiPrompt: "" }]);
  }

  function updateStep(index: number, updates: Partial<Step>) {
    setSteps(steps.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  }

  function removeStep(index: number) {
    setSteps(steps.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    const method = initial?.id ? "PATCH" : "POST";
    const url = initial?.id ? `/api/nurture/sequences/${initial.id}` : "/api/nurture/sequences";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, trigger, steps }),
    });
    setSaving(false);
    onSave();
  }

  return (
    <div className="bg-white/[0.03] rounded-lg p-4 space-y-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Sequence name"
        className="w-full bg-white/5 px-3 py-2 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <input
        value={trigger}
        onChange={(e) => setTrigger(e.target.value)}
        placeholder="Trigger (e.g. tier=warm)"
        className="w-full bg-white/5 px-3 py-2 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <div className="space-y-2">
        <div className="text-xs text-gray-400 uppercase tracking-wide">Steps</div>
        {steps.map((step, i) => (
          <div key={i} className="flex gap-2 items-start bg-white/[0.02] rounded p-2">
            <input
              value={step.delay}
              onChange={(e) => updateStep(i, { delay: e.target.value })}
              placeholder="2d / 12h / 30m"
              className="w-20 bg-white/5 px-2 py-1 rounded text-xs text-white"
            />
            <select
              value={step.type}
              onChange={(e) => updateStep(i, { type: e.target.value as Step["type"] })}
              className="bg-white/5 px-2 py-1 rounded text-xs text-white"
            >
              <option value="ai">AI Message</option>
              <option value="template">Template</option>
              <option value="action">Action</option>
            </select>
            {step.type === "ai" && (
              <input
                value={step.aiPrompt ?? ""}
                onChange={(e) => updateStep(i, { aiPrompt: e.target.value })}
                placeholder="Prompt for AI message"
                className="flex-1 bg-white/5 px-2 py-1 rounded text-xs text-white"
              />
            )}
            {step.type === "action" && (
              <select
                value={step.action ?? "rescore"}
                onChange={(e) => updateStep(i, { action: e.target.value })}
                className="bg-white/5 px-2 py-1 rounded text-xs text-white"
              >
                <option value="rescore">Re-score lead</option>
                <option value="escalate">Escalate to human</option>
              </select>
            )}
            <button onClick={() => removeStep(i)} className="text-red-400 hover:text-red-300 text-xs px-1">✕</button>
          </div>
        ))}
        <button onClick={addStep} className="text-xs text-blue-400 hover:text-blue-300">+ Add step</button>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-sm text-gray-400 px-3 py-1">Cancel</button>
        <button
          onClick={handleSave}
          disabled={saving || !name}
          className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-1 rounded disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
