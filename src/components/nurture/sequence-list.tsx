"use client";

import { useEffect, useState } from "react";

interface Sequence {
  id: string;
  name: string;
  trigger: string;
  active: boolean;
  steps: unknown[];
  _count: { enrollments: number };
}

export function SequenceList({ onEdit, refreshKey }: { onEdit: (s: Sequence) => void; refreshKey: number }) {
  const [sequences, setSequences] = useState<Sequence[]>([]);

  useEffect(() => {
    fetch("/api/nurture/sequences").then((r) => r.json()).then(setSequences);
  }, [refreshKey]);

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/nurture/sequences/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    setSequences((prev) => prev.map((s) => (s.id === id ? { ...s, active: !active } : s)));
  }

  return (
    <div className="space-y-2">
      {sequences.map((s) => (
        <div key={s.id} className="flex items-center justify-between bg-white/[0.03] rounded-lg p-3">
          <div>
            <div className="text-sm font-medium text-white">{s.name}</div>
            <div className="text-xs text-gray-500">
              Trigger: {s.trigger} · {s.steps.length} steps · {s._count.enrollments} enrolled
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleActive(s.id, s.active)}
              className={`text-xs px-2 py-0.5 rounded-full ${s.active ? "bg-emerald-600/20 text-emerald-400" : "bg-gray-600/20 text-gray-400"}`}
            >
              {s.active ? "Active" : "Paused"}
            </button>
            <button onClick={() => onEdit(s)} className="text-xs text-blue-400 hover:text-blue-300">Edit</button>
          </div>
        </div>
      ))}
      {sequences.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">No nurture sequences yet</p>
      )}
    </div>
  );
}
