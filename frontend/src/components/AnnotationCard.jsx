import { useState } from "react";

const SEVERITY = {
  Critical: {
    border: "#DC2626",
    bg: "#FEF2F2",
    badge: "bg-red-600 text-white",
  },
  Moderate: {
    border: "#D97706",
    bg: "#FFFBEB",
    badge: "bg-amber-600 text-white",
  },
  Minor: {
    border: "#16A34A",
    bg: "#F0FDF4",
    badge: "bg-gray-200 text-gray-700",
  },
};

const ISSUE_TYPE_LABELS = {
  IDENTITY_VIOLATION: "Identity Violation",
  INTERNAL_CONTRADICTION: "Contradiction",
  PARTIAL_EQUILIBRIUM: "Partial Equilibrium",
  COMPOSITION_FALLACY: "Composition Fallacy",
  EXOG_ENDO_CONFUSION: "Exog/Endo Confusion",
  MISSING_AGENT: "Missing Agent",
  MISSING_MECHANISM: "Missing Mechanism",
  LUCAS_CRITIQUE: "Lucas Critique",
};

export default function AnnotationCard({ annotation, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const {
    number,
    title,
    severity,
    issue_types,
    quoted_passage,
    explanation,
    dig_deeper,
    source_passes,
  } = annotation;

  const sev = SEVERITY[severity] || SEVERITY.Minor;

  return (
    <div
      className="rounded-r-lg mb-2.5 transition-all duration-200 overflow-hidden"
      style={{
        borderLeft: `4px solid ${sev.border}`,
        border: `1px solid ${open ? sev.border + "40" : "#E5E7EB"}`,
        borderLeftWidth: 4,
        borderLeftColor: sev.border,
        background: open ? sev.bg : "#fff",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-start gap-2.5 w-full p-3.5 bg-transparent border-none cursor-pointer text-left"
      >
        <span className="text-[13px] font-bold text-gray-400 font-mono min-w-[24px] pt-0.5">
          #{number}
        </span>
        <span
          className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide font-body shrink-0 ${sev.badge}`}
        >
          {severity}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-900 leading-snug font-body">
            {title}
          </div>
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            {issue_types?.map((t) => (
              <span
                key={t}
                className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-body"
              >
                {ISSUE_TYPE_LABELS[t] || t}
              </span>
            ))}
          </div>
        </div>
        <span
          className={`text-lg text-gray-400 transition-transform duration-200 shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 ml-[50px] space-y-3.5">
          {quoted_passage && (
            <blockquote
              className="m-0 px-4 py-3 rounded-r-md italic text-[13.5px] leading-relaxed text-gray-700 font-display"
              style={{
                borderLeft: `3px solid ${sev.border}40`,
                background: `${sev.border}08`,
              }}
            >
              {quoted_passage}
            </blockquote>
          )}

          {explanation && (
            <div className="space-y-2">
              {explanation.split(/\n\n+/).map((p, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed text-gray-700 font-body"
                >
                  {p}
                </p>
              ))}
            </div>
          )}

          {dig_deeper && (
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700 font-body">
                Dig Deeper
              </summary>
              <div className="mt-2 p-3 bg-slate-50 rounded-md space-y-2">
                {dig_deeper.split(/\n\n+/).map((p, i) => (
                  <p
                    key={i}
                    className="text-sm leading-relaxed text-gray-600 font-body"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </details>
          )}

          {source_passes?.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {source_passes.map((s) => (
                <span
                  key={s}
                  className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-400 font-body"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
