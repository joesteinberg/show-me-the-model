import { useState } from "react";

export default function ContradictionCard({ contradiction }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3.5 mb-2.5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 w-full bg-transparent border-none cursor-pointer text-left p-0"
      >
        <span className="text-base">⚡</span>
        <span className="flex-1 text-[15px] font-bold text-orange-900 font-display">
          {contradiction.name}
        </span>
        <div className="flex gap-1 shrink-0">
          {contradiction.annotation_refs?.map((r) => (
            <span
              key={r}
              className="text-[11px] px-1.5 py-0.5 rounded bg-red-600 text-white font-mono"
            >
              #{r}
            </span>
          ))}
        </div>
        <span
          className={`text-base text-orange-700 transition-transform duration-200 shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>
      {open && (
        <p className="mt-3 ml-[26px] text-[13.5px] leading-relaxed text-amber-950 font-body">
          {contradiction.summary}
        </p>
      )}
    </div>
  );
}
