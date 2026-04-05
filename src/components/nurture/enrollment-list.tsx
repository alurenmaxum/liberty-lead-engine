"use client";

import { useEffect, useState } from "react";

interface Enrollment {
  id: string;
  status: string;
  currentStep: number;
  createdAt: string;
  lead: { id: string; firstName: string | null; phone: string };
  sequence: { name: string; steps: unknown[] };
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-emerald-600/20 text-emerald-400",
  PAUSED: "bg-amber-600/20 text-amber-400",
  COMPLETED: "bg-blue-600/20 text-blue-400",
  EXITED: "bg-gray-600/20 text-gray-400",
};

export function EnrollmentList() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    fetch("/api/nurture/enrollments").then((r) => r.json()).then(setEnrollments);
  }, []);

  return (
    <div className="space-y-2">
      {enrollments.map((e) => (
        <div key={e.id} className="flex items-center justify-between bg-white/[0.03] rounded-lg p-3">
          <div>
            <div className="text-sm font-medium text-white">
              {e.lead.firstName ?? e.lead.phone} → {e.sequence.name}
            </div>
            <div className="text-xs text-gray-500">
              Step {e.currentStep + 1} of {e.sequence.steps.length} · Started{" "}
              {new Date(e.createdAt).toLocaleDateString("en-ZA")}
            </div>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[e.status] ?? ""}`}>
            {e.status}
          </span>
        </div>
      ))}
      {enrollments.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">No active enrollments</p>
      )}
    </div>
  );
}
