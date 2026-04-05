"use client";

import { useEffect, useState } from "react";

interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
  approvalStatus: string;
}

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-gray-600/20 text-gray-400",
  PENDING: "bg-amber-600/20 text-amber-400",
  APPROVED: "bg-emerald-600/20 text-emerald-400",
  REJECTED: "bg-red-600/20 text-red-400",
};

export function TemplateList({ onEdit, refreshKey }: { onEdit: (t: Template) => void; refreshKey: number }) {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    fetch("/api/templates").then((r) => r.json()).then(setTemplates);
  }, [refreshKey]);

  async function handleApprove(id: string, action: "approve" | "reject") {
    await fetch(`/api/templates/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const updated = await fetch("/api/templates").then((r) => r.json()) as Template[];
    setTemplates(updated);
  }

  return (
    <div className="space-y-2">
      {templates.map((t) => (
        <div key={t.id} className="flex items-center justify-between bg-white/[0.03] rounded-lg p-3">
          <div>
            <div className="text-sm font-medium text-white">{t.name}</div>
            <div className="text-xs text-gray-500">{t.category} · {t.content.slice(0, 60)}...</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[t.approvalStatus] ?? ""}`}>
              {t.approvalStatus}
            </span>
            {t.approvalStatus !== "APPROVED" && (
              <button onClick={() => handleApprove(t.id, "approve")} className="text-xs text-emerald-400 hover:text-emerald-300">
                Approve
              </button>
            )}
            <button onClick={() => onEdit(t)} className="text-xs text-blue-400 hover:text-blue-300">Edit</button>
          </div>
        </div>
      ))}
      {templates.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">No templates yet</p>
      )}
    </div>
  );
}
