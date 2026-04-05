"use client";

interface DateRangePickerProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <label className="text-gray-400">From</label>
      <input
        type="date"
        value={from}
        onChange={(e) => onChange(e.target.value, to)}
        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-100"
      />
      <label className="text-gray-400">To</label>
      <input
        type="date"
        value={to}
        onChange={(e) => onChange(from, e.target.value)}
        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-100"
      />
    </div>
  );
}
