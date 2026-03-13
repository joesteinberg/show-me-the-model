import { useState } from "react";

export default function ContradictionCard({ contradiction }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-lg px-4 py-3.5 mb-2.5 border"
      style={{
        background: "var(--smtm-contra-bg)",
        borderColor: "var(--smtm-contra-border)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 w-full bg-transparent border-none cursor-pointer text-left p-0"
      >
        <span className="text-base">⚡</span>
        <span
          className="flex-1 text-[15px] font-bold font-display"
          style={{ color: "var(--smtm-contra-title)" }}
        >
          {contradiction.name}
        </span>
        <div className="flex gap-1 shrink-0">
          {contradiction.annotation_refs?.map((r) => (
            <span
              key={r}
              className="text-[11px] px-1.5 py-0.5 rounded font-mono"
              style={{
                background: "var(--smtm-ref-badge-bg)",
                color: "var(--smtm-ref-badge-text)",
              }}
            >
              #{r}
            </span>
          ))}
        </div>
        <span
          className={`text-base transition-transform duration-200 shrink-0 ${
            open ? "rotate-180" : ""
          }`}
          style={{ color: "var(--smtm-contra-chevron)" }}
        >
          ▾
        </span>
      </button>
      {open && (
        <p
          className="mt-3 ml-[26px] text-[13.5px] leading-relaxed font-body"
          style={{ color: "var(--smtm-contra-text)" }}
        >
          {contradiction.summary}
        </p>
      )}
    </div>
  );
}
