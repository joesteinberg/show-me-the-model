import { useState } from "react";

const SEVERITY = {
  Critical: {
    border: "var(--smtm-sev-critical-border)",
    bg: "var(--smtm-sev-critical-bg)",
    badgeBg: "var(--smtm-sev-critical-badge-bg)",
    badgeText: "var(--smtm-sev-critical-badge-text)",
  },
  Moderate: {
    border: "var(--smtm-sev-moderate-border)",
    bg: "var(--smtm-sev-moderate-bg)",
    badgeBg: "var(--smtm-sev-moderate-badge-bg)",
    badgeText: "var(--smtm-sev-moderate-badge-text)",
  },
  Minor: {
    border: "var(--smtm-sev-minor-border)",
    bg: "var(--smtm-sev-minor-bg)",
    badgeBg: "var(--smtm-sev-minor-badge-bg)",
    badgeText: "var(--smtm-sev-minor-badge-text)",
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
  EQUILIBRIUM_MISUSE: "Equilibrium Misuse",
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
        border: `1px solid ${open ? sev.border : "var(--smtm-border-default)"}`,
        borderLeftWidth: 4,
        borderLeftColor: sev.border,
        background: open ? sev.bg : "var(--smtm-bg-surface)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-start gap-2.5 w-full p-3.5 bg-transparent border-none cursor-pointer text-left"
      >
        <span className="text-[13px] font-bold font-mono min-w-[24px] pt-0.5" style={{ color: "var(--smtm-text-muted)" }}>
          #{number}
        </span>
        <span
          className="inline-block text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide font-body shrink-0"
          style={{
            background: sev.badgeBg,
            color: sev.badgeText,
          }}
        >
          {severity}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold leading-snug font-body" style={{ color: "var(--smtm-text-primary)" }}>
            {title}
          </div>
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            {issue_types?.map((t) => (
              <span
                key={t}
                className="text-[11px] px-2 py-0.5 rounded-full font-body"
                style={{
                  background: "var(--smtm-issue-pill-bg)",
                  color: "var(--smtm-issue-pill-text)",
                }}
              >
                {ISSUE_TYPE_LABELS[t] || t}
              </span>
            ))}
          </div>
        </div>
        <span
          className={`text-lg transition-transform duration-200 shrink-0 ${
            open ? "rotate-180" : ""
          }`}
          style={{ color: "var(--smtm-text-muted)" }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 ml-[50px] space-y-3.5">
          {quoted_passage && (
            <blockquote
              className="m-0 px-4 py-3 rounded-r-md italic text-[13.5px] leading-relaxed font-display"
              style={{
                borderLeft: `3px solid ${sev.border}`,
                background: sev.bg,
                color: "var(--smtm-text-secondary)",
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
                  className="text-sm leading-relaxed font-body"
                  style={{ color: "var(--smtm-text-secondary)" }}
                >
                  {p}
                </p>
              ))}
            </div>
          )}

          {dig_deeper && (
            <details className="group">
              <summary
                className="cursor-pointer text-sm font-medium font-body"
                style={{ color: "var(--smtm-dig-label)" }}
              >
                Dig Deeper
              </summary>
              <div
                className="mt-2 p-3 rounded-md space-y-2"
                style={{ background: "var(--smtm-dig-bg)" }}
              >
                {dig_deeper.split(/\n\n+/).map((p, i) => (
                  <p
                    key={i}
                    className="text-sm leading-relaxed font-body"
                    style={{ color: "var(--smtm-text-secondary)" }}
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
                  className="text-[11px] px-2 py-0.5 rounded font-body"
                  style={{
                    background: "var(--smtm-source-badge-bg)",
                    color: "var(--smtm-source-badge-text)",
                  }}
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
