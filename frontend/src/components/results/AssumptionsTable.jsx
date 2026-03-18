import { useState, useMemo } from "react";

const PLAUS_ORDER = ["Weak", "Contested", "Mixed", "Reasonable"];

function normPlaus(p) {
  if (p === "Strong") return "Reasonable";
  return p || "Mixed";
}

function sortByImplausibility(assumptions) {
  return [...assumptions].sort((a, b) => {
    const pA = PLAUS_ORDER.indexOf(normPlaus(a.plausibility));
    const pB = PLAUS_ORDER.indexOf(normPlaus(b.plausibility));
    if (pA !== pB) return pA - pB;
    return (b.critical ? 1 : 0) - (a.critical ? 1 : 0);
  });
}

const PLAUS_STYLE = {
  Weak: { bg: "var(--smtm-plaus-weak-bg)", color: "var(--smtm-plaus-weak-text)" },
  Contested: { bg: "var(--smtm-plaus-contested-bg)", color: "var(--smtm-plaus-contested-text)" },
  Mixed: { bg: "var(--smtm-plaus-mixed-bg)", color: "var(--smtm-plaus-mixed-text)" },
  Reasonable: { bg: "var(--smtm-plaus-reasonable-bg)", color: "var(--smtm-plaus-reasonable-text)" },
  Strong: { bg: "var(--smtm-plaus-reasonable-bg)", color: "var(--smtm-plaus-reasonable-text)" },
};

/* ── Mobile card layout ── */
function AssumptionCard({ assumption, index }) {
  const [open, setOpen] = useState(false);
  const isStated = assumption.stated_or_unstated === "Stated";
  const plaus = normPlaus(assumption.plausibility);
  const ps = PLAUS_STYLE[plaus] || PLAUS_STYLE.Mixed;

  return (
    <div
      onClick={() => setOpen(!open)}
      className="cursor-pointer px-3.5 py-3 transition-colors"
      style={{
        background: open
          ? "var(--smtm-bg-surface-raised)"
          : index % 2 === 0
          ? "var(--smtm-bg-surface)"
          : "var(--smtm-legend-bg)",
        borderBottom: "1px solid var(--smtm-border-subtle)",
      }}
    >
      <div className="flex items-start gap-2">
        <span className="text-[13px] font-semibold font-mono shrink-0 pt-0.5" style={{ color: "var(--smtm-text-muted)" }}>
          {assumption.number}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className="m-0 font-body text-[13px] leading-snug"
            style={{
              color: "var(--smtm-text-primary)",
              fontWeight: assumption.critical ? 600 : 400,
            }}
          >
            {assumption.assumption}
          </p>
          <div className="flex items-center gap-2.5 mt-1.5">
            <span
              className="text-[11px] font-semibold font-body"
              style={{
                color: isStated ? "var(--smtm-plaus-reasonable-text)" : "var(--smtm-plaus-weak-text)",
              }}
            >
              {isStated ? "Explicit" : "Implicit"}
            </span>
            {assumption.plausibility && (
              <span
                className="text-[11px] px-2 py-0.5 rounded font-semibold font-body"
                style={{ background: ps.bg, color: ps.color }}
              >
                {plaus}
              </span>
            )}
          </div>
        </div>
        <span className="text-sm shrink-0 pt-0.5" style={{ color: "var(--smtm-text-muted)" }}>
          {open ? "▴" : "▾"}
        </span>
      </div>
      {open && (
        <div className="mt-2.5 ml-6 space-y-2">
          <div
            className="text-[13px] leading-relaxed font-body"
            style={{ color: "var(--smtm-text-secondary)", textAlign: "justify", hyphens: "auto" }}
          >
            {assumption.assessment}
          </div>
          {assumption.hinge && (
            <div
              className="rounded-md px-3 py-2 text-[12px] leading-relaxed font-body"
              style={{
                background: "var(--smtm-bg-surface-raised)",
                color: "var(--smtm-text-muted)",
              }}
            >
              <strong style={{ color: "var(--smtm-text-primary)" }}>Hinge:</strong>{" "}
              {assumption.hinge}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Desktop table row ── */
function AssumptionRow({ assumption, index }) {
  const [open, setOpen] = useState(false);
  const isStated = assumption.stated_or_unstated === "Stated";
  const plaus = normPlaus(assumption.plausibility);
  const ps = PLAUS_STYLE[plaus] || PLAUS_STYLE.Mixed;

  return (
    <>
      <tr
        onClick={() => setOpen(!open)}
        className="cursor-pointer transition-colors"
        style={{
          background: open
            ? "var(--smtm-bg-surface-raised)"
            : index % 2 === 0
            ? "var(--smtm-bg-surface)"
            : "var(--smtm-legend-bg)",
        }}
      >
        <td className="px-2.5 py-2.5 text-[13px] font-semibold font-mono w-8 align-middle" style={{ color: "var(--smtm-text-muted)" }}>
          {assumption.number}
        </td>
        <td
          className="px-2.5 py-2.5 font-body text-[13px] leading-snug align-middle"
          style={{
            color: "var(--smtm-text-primary)",
            fontWeight: assumption.critical ? 600 : 400,
          }}
        >
          {assumption.assumption}
        </td>
        <td className="px-1.5 py-2.5 text-center align-middle w-12">
          <span
            className="text-[11px] font-semibold font-body"
            style={{
              color: isStated ? "var(--smtm-plaus-reasonable-text)" : "var(--smtm-plaus-weak-text)",
            }}
          >
            {isStated ? "Yes" : "No"}
          </span>
        </td>
        <td className="px-1.5 py-2.5 text-center align-middle w-20">
          {assumption.plausibility && (
            <span
              className="text-[11px] px-1.5 py-0.5 rounded font-semibold font-body whitespace-nowrap"
              style={{ background: ps.bg, color: ps.color }}
            >
              {plaus}
            </span>
          )}
        </td>
        <td className="px-2 py-2.5 text-center text-sm align-middle w-7" style={{ color: "var(--smtm-text-muted)" }}>
          {open ? "▴" : "▾"}
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={5} className="px-2.5 pb-4 pt-1">
            <div className="ml-8 space-y-2">
              <div
                className="text-[13px] leading-relaxed font-body"
                style={{ color: "var(--smtm-text-secondary)", textAlign: "justify", hyphens: "auto" }}
              >
                {assumption.assessment}
              </div>
              {assumption.hinge && (
                <div
                  className="rounded-md px-3 py-2 text-[12px] leading-relaxed font-body"
                  style={{
                    background: "var(--smtm-bg-surface-raised)",
                    color: "var(--smtm-text-muted)",
                  }}
                >
                  <strong style={{ color: "var(--smtm-text-primary)" }}>Hinge:</strong>{" "}
                  {assumption.hinge}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AssumptionsTable({ assumptions }) {
  const sorted = useMemo(() => sortByImplausibility(assumptions ?? []), [assumptions]);

  if (!assumptions?.length) return null;

  const thStyle = {
    color: "var(--smtm-text-muted)",
    borderBottom: "2px solid var(--smtm-border-default)",
    background: "var(--smtm-bg-surface)",
  };

  const legend = (
    <div
      className="flex gap-4 px-4 py-2.5 text-[11px] font-body flex-wrap"
      style={{
        borderTop: "1px solid var(--smtm-border-subtle)",
        color: "var(--smtm-text-muted)",
      }}
    >
      <span>
        <span className="font-semibold mr-1 align-middle" style={{ color: "var(--smtm-plaus-reasonable-text)" }}>Yes</span>{" "}
        = Explicit
      </span>
      <span>
        <span className="font-semibold mr-1 align-middle" style={{ color: "var(--smtm-plaus-weak-text)" }}>No</span>{" "}
        = Implicit
      </span>
      <span>
        <span className="font-semibold mr-1 align-middle">Bold</span>{" "}
        = Critical
      </span>
    </div>
  );

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: "var(--smtm-bg-surface)", borderColor: "var(--smtm-border-default)" }}>
      {/* Desktop table — hidden on small screens */}
      <div className="hidden md:block">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wide font-body text-left w-8 sticky top-0 z-[1]" style={thStyle}>
                #
              </th>
              <th className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wide font-body text-left sticky top-0 z-[1]" style={thStyle}>
                Assumption
              </th>
              <th
                className="px-1.5 py-2 text-[11px] font-semibold uppercase tracking-wide font-body text-center w-12 sticky top-0 z-[1]"
                style={thStyle}
                title="Whether the assumption is explicitly stated in the essay"
              >
                Explicit
              </th>
              <th className="px-1.5 py-2 text-[11px] font-semibold uppercase tracking-wide font-body text-center w-20 sticky top-0 z-[1]" style={thStyle}>
                Plausible
              </th>
              <th className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wide w-7 sticky top-0 z-[1]" style={thStyle} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((a, i) => (
              <AssumptionRow key={a.number} assumption={a} index={i} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list — shown on small screens */}
      <div className="md:hidden">
        {sorted.map((a, i) => (
          <AssumptionCard key={a.number} assumption={a} index={i} />
        ))}
      </div>

      {legend}
    </div>
  );
}
