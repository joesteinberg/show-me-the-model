import { useState } from "react";
import AssumptionBead from "./AssumptionBead";

const PLAUS_ORDER = ["Weak", "Contested", "Mixed", "Reasonable"];
const PLAUS = {
  Weak: { fill: "var(--smtm-plaus-weak-fill)", bg: "var(--smtm-plaus-weak-bg)", border: "var(--smtm-plaus-weak-border)", text: "var(--smtm-plaus-weak-text)" },
  Contested: { fill: "var(--smtm-plaus-contested-fill)", bg: "var(--smtm-plaus-contested-bg)", border: "var(--smtm-plaus-contested-border)", text: "var(--smtm-plaus-contested-text)" },
  Mixed: { fill: "var(--smtm-plaus-mixed-fill)", bg: "var(--smtm-plaus-mixed-bg)", border: "var(--smtm-plaus-mixed-border)", text: "var(--smtm-plaus-mixed-text)" },
  Reasonable: { fill: "var(--smtm-plaus-reasonable-fill)", bg: "var(--smtm-plaus-reasonable-bg)", border: "var(--smtm-plaus-reasonable-border)", text: "var(--smtm-plaus-reasonable-text)" },
};

function normPlaus(p) {
  if (p === "Strong") return "Reasonable";
  return p || "Mixed";
}

const sortFn = (a, b) => {
  const pA = normPlaus(a.plausibility);
  const pB = normPlaus(b.plausibility);
  const p = PLAUS_ORDER.indexOf(pA) - PLAUS_ORDER.indexOf(pB);
  if (p !== 0) return p;
  return (b.critical ? 1 : 0) - (a.critical ? 1 : 0);
};

export default function AssumptionsMatrix({ assumptions }) {
  const [filter, setFilter] = useState(null);

  if (!assumptions?.length) {
    return (
      <div className="flex items-baseline gap-1.5">
        <span className="text-[28px] font-bold font-display leading-none" style={{ color: "var(--smtm-text-primary)" }}>0</span>
        <span className="text-[13px] font-semibold font-body" style={{ color: "var(--smtm-text-secondary)" }}>Assumptions</span>
      </div>
    );
  }

  const explicit = [...assumptions.filter((a) => a.stated_or_unstated === "Stated")].sort(sortFn);
  const implicit = [...assumptions.filter((a) => a.stated_or_unstated !== "Stated")].sort(sortFn);

  const isDim = (a) => {
    if (filter === null) return false;
    if (filter === "critical") return !a.critical;
    if (filter === "explicit") return a.stated_or_unstated !== "Stated";
    if (filter === "implicit") return a.stated_or_unstated === "Stated";
    return normPlaus(a.plausibility) !== filter;
  };

  const toggle = (v) => setFilter((f) => (f === v ? null : v));

  const critical = assumptions.filter((a) => a.critical);
  const criticalWeak = critical.filter((a) => normPlaus(a.plausibility) === "Weak").length;
  let insight = "";
  if (critical.length > 0 && criticalWeak === critical.length) {
    insight = "Every critical assumption is rated Weak.";
  } else if (criticalWeak > 1) {
    insight = `${criticalWeak} of ${critical.length} critical assumptions are rated Weak.`;
  }

  return (
    <div>
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-[28px] font-bold font-display leading-none" style={{ color: "var(--smtm-text-primary)" }}>
          {assumptions.length}
        </span>
        <span className="text-[13px] font-semibold font-body" style={{ color: "var(--smtm-text-secondary)" }}>Assumptions</span>
      </div>

      <div
        className="rounded-lg p-3.5 border"
        style={{
          background: "var(--smtm-legend-bg)",
          borderColor: "var(--smtm-legend-border)",
        }}
      >
        {/* Explicit row */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <button
            onClick={() => toggle("explicit")}
            className="text-[11px] font-semibold w-14 text-right shrink-0 bg-transparent border-none cursor-pointer p-0 font-body"
            style={{
              color: filter === "explicit" ? "var(--smtm-explicit-active)" : "var(--smtm-explicit-color)",
              textDecoration: filter === "explicit" ? "underline" : "none",
            }}
          >
            Explicit
          </button>
          <div className="w-px h-[22px] shrink-0" style={{ background: "var(--smtm-legend-divider)" }} />
          <div className="flex gap-1.5 flex-wrap">
            {explicit.map((a) => (
              <AssumptionBead key={a.number} assumption={a} dim={isDim(a)} />
            ))}
          </div>
        </div>

        {/* Implicit row */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => toggle("implicit")}
            className="text-[11px] font-semibold w-14 text-right shrink-0 bg-transparent border-none cursor-pointer p-0 font-body"
            style={{
              color: filter === "implicit" ? "var(--smtm-implicit-active)" : "var(--smtm-implicit-color)",
              textDecoration: filter === "implicit" ? "underline" : "none",
            }}
          >
            Implicit
          </button>
          <div className="w-px h-[22px] shrink-0" style={{ background: "var(--smtm-legend-divider)" }} />
          <div className="flex gap-1.5 flex-wrap">
            {implicit.map((a) => (
              <AssumptionBead key={a.number} assumption={a} dim={isDim(a)} />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div
          className="mt-3 pt-2.5 flex items-center justify-between flex-wrap gap-1.5"
          style={{ borderTop: "1px solid var(--smtm-legend-border)" }}
        >
          <div className="flex gap-2 items-center flex-wrap">
            {PLAUS_ORDER.map((key) => {
              const p = PLAUS[key];
              const active = filter === key;
              const exists = assumptions.some(
                (a) => normPlaus(a.plausibility) === key
              );
              return (
                <button
                  key={key}
                  onClick={() => exists && toggle(key)}
                  className="flex items-center gap-1 text-[11px] font-body bg-transparent border-none p-[2px_4px] rounded"
                  style={{
                    color: active ? p.text : "var(--smtm-legend-inactive)",
                    cursor: exists ? "pointer" : "default",
                    fontWeight: active ? 700 : 400,
                    opacity: exists ? 1 : 0.4,
                  }}
                >
                  <span
                    className="w-3 h-3 rounded-[3px] transition-all duration-[120ms]"
                    style={{
                      background: active ? p.fill : p.bg,
                      border: `2px solid ${p.border}`,
                    }}
                  />
                  {key}
                </button>
              );
            })}

            <span className="w-px h-3.5 mx-0.5" style={{ background: "var(--smtm-legend-divider)" }} />

            <button
              onClick={() => toggle("critical")}
              className="flex items-center gap-1 text-[11px] font-body bg-transparent border-none p-[2px_4px] rounded cursor-pointer"
              style={{
                color: filter === "critical" ? "var(--smtm-text-primary)" : "var(--smtm-legend-inactive)",
                fontWeight: filter === "critical" ? 700 : 400,
              }}
            >
              <span className="w-3 h-3 rounded-[3px]" style={{ background: "var(--smtm-legend-critical-fill)" }} />
              Filled = critical
            </button>
          </div>

          {insight && (
            <span className="text-[11px] font-body italic" style={{ color: "var(--smtm-insight-text)" }}>
              {insight}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
