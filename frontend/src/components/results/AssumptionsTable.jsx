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
        <td className="px-3 py-2.5 text-[13px] font-semibold font-mono w-9 align-middle" style={{ color: "var(--smtm-text-muted)" }}>
          {assumption.number}
        </td>
        <td
          className="px-3 py-2.5 font-body text-[13px] leading-snug align-middle"
          style={{
            color: "var(--smtm-text-primary)",
            fontWeight: assumption.critical ? 600 : 400,
          }}
        >
          {assumption.assumption}
        </td>
        <td className="px-3 py-2.5 text-center align-middle">
          <span
            className="text-[11px] font-semibold font-body"
            style={{
              color: isStated ? "var(--smtm-plaus-reasonable-text)" : "var(--smtm-plaus-weak-text)",
            }}
          >
            {isStated ? "Yes" : "No"}
          </span>
        </td>
        <td className="px-3 py-2.5 text-center align-middle">
          {assumption.plausibility && (
            <span
              className="text-[11px] px-2 py-0.5 rounded font-semibold font-body"
              style={{ background: ps.bg, color: ps.color }}
            >
              {plaus}
            </span>
          )}
        </td>
        <td className="px-3 py-2.5 text-center text-sm align-middle" style={{ color: "var(--smtm-text-muted)" }}>
          {open ? "▴" : "▾"}
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={5} className="px-3 pb-4 pt-1">
            <div className="ml-9 text-[13px] leading-relaxed font-body" style={{ color: "var(--smtm-text-secondary)" }}>
              {assumption.assessment}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AssumptionsTable({ assumptions }) {
  if (!assumptions?.length) return null;

  const sorted = useMemo(() => sortByImplausibility(assumptions), [assumptions]);

  const thStyle = {
    color: "var(--smtm-text-muted)",
    borderBottom: "2px solid var(--smtm-border-default)",
    background: "var(--smtm-bg-surface)",
  };

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: "var(--smtm-bg-surface)", borderColor: "var(--smtm-border-default)" }}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide font-body text-left w-9 sticky top-0 z-[1]" style={thStyle}>
              #
            </th>
            <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide font-body text-left sticky top-0 z-[1]" style={thStyle}>
              Assumption
            </th>
            <th
              className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide font-body text-center w-[60px] sticky top-0 z-[1]"
              style={thStyle}
              title="Whether the assumption is explicitly stated in the essay"
            >
              Explicit
            </th>
            <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide font-body text-center w-[80px] sticky top-0 z-[1]" style={thStyle}>
              Plausible
            </th>
            <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide w-[30px] sticky top-0 z-[1]" style={thStyle} />
          </tr>
        </thead>
        <tbody>
          {sorted.map((a, i) => (
            <AssumptionRow key={a.number} assumption={a} index={i} />
          ))}
        </tbody>
      </table>
      <div
        className="flex gap-4 px-4 py-2.5 text-[11px] font-body"
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
    </div>
  );
}
