"use client";

import { useState } from "react";
import { SequenceList } from "@/components/nurture/sequence-list";
import { SequenceEditor } from "@/components/nurture/sequence-editor";
import { EnrollmentList } from "@/components/nurture/enrollment-list";

interface SequenceForEdit {
  id?: string;
  name: string;
  trigger: string;
  steps: { delay: string; type: "template" | "ai" | "action"; templateId?: string; aiPrompt?: string; action?: string }[];
}

export default function NurturePage() {
  const [editing, setEditing] = useState<SequenceForEdit | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <h1 className="text-lg font-bold mb-6">Nurture Sequences</h1>

      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Sequences</h2>
        <button
          onClick={() => { setEditing(null); setShowEditor(true); }}
          className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded"
        >
          New Sequence
        </button>
      </div>

      {showEditor && (
        <div className="mb-4">
          <SequenceEditor
            initial={editing ?? undefined}
            onSave={() => { setShowEditor(false); setRefreshKey((k) => k + 1); }}
            onCancel={() => setShowEditor(false)}
          />
        </div>
      )}

      <SequenceList
        refreshKey={refreshKey}
        onEdit={(s) => {
          setEditing({ ...s, steps: s.steps as SequenceForEdit["steps"] });
          setShowEditor(true);
        }}
      />

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Active Enrollments</h2>
        <EnrollmentList />
      </div>
    </div>
  );
}
