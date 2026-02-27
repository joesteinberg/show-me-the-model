import { useState } from "react";
import AssumptionBead from "./AssumptionBead";

const PLAUS_ORDER = ["Weak", "Contested", "Mixed", "Reasonable"];
const PLAUS = {
  Weak: { fill: "#EF4444", bg: "#FEE2E2", border: "#EF4444", text: "#991B1B" },
  Contested: { fill: "#818CF8", bg: "#E0E7FF", border: "#818CF8", text: "#3730A3" },
  Mixed: { fill: "#F59E0B", bg: "#FEF3C7", border: "#F59E0B", text: "#92400E" },
  Reasonable: { fill: "#34D399", bg: "#D1FAE5", border: "#34D399", text: "#065F46" },
};

const sortFn = (a, b) => {
  const pA = a.plausibility || "Mixed";
  const pB = b.plausibility || "Mixed";
  const p = PLAUS_ORDER.indexOf(pA) - PLAUS_ORDER.indexOf(pB);
  if (p !== 0) return p;
  return (b.critical ? 1 : 0) - (a.critical ? 1 : 0);
};

export default function AssumptionsMatrix({ assumptions }) {
  const [filter, setFilter] = useState(null);

  if (!assumptions?.length) {
    return (
      <div className="flex items-baseline gap-1.5">
        <span className="text-[28px] font-bold text-slate-900 font-display leading-none">0</span>
        <span className="text-[13px] font-semibold text-gray-700 font-body">Assumptions</span>
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
    return (a.plausibility || "Mixed") !== filter;
  };

  const toggle = (v) => setFilter((f) => (f === v ? null : v));

  const critical = assumptions.filter((a) => a.critical);
  const criticalWeak = critical.filter((a) => (a.plausibility || "Mixed") === "Weak").length;
  let insight = "";
  if (critical.length > 0 && criticalWeak === critical.length) {
    insight = "Every critical assumption is rated Weak.";
  } else if (criticalWeak > 1) {
    insight = `${criticalWeak} of ${critical.length} critical assumptions are rated Weak.`;
  }

  return (
    <div>
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-[28px] font-bold text-slate-900 font-display leading-none">
          {assumptions.length}
        </span>
        <span className="text-[13px] font-semibold text-gray-700 font-body">Assumptions</span>
      </div>

      <div className="bg-gray-50/80 rounded-lg p-3.5 border border-gray-200">
        {/* Explicit row */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <button
            onClick={() => toggle("explicit")}
            className="text-[11px] font-semibold w-14 text-right shrink-0 bg-transparent border-none cursor-pointer p-0 font-body"
            style={{
              color: filter === "explicit" ? "#1D4ED8" : "#3B82F6",
              textDecoration: filter === "explicit" ? "underline" : "none",
            }}
          >
            Explicit
          </button>
          <div className="w-px h-[22px] bg-gray-300 shrink-0" />
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
              color: filter === "implicit" ? "#B45309" : "#D97706",
              textDecoration: filter === "implicit" ? "underline" : "none",
            }}
          >
            Implicit
          </button>
          <div className="w-px h-[22px] bg-gray-300 shrink-0" />
          <div className="flex gap-1.5 flex-wrap">
            {implicit.map((a) => (
              <AssumptionBead key={a.number} assumption={a} dim={isDim(a)} />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 pt-2.5 border-t border-gray-200 flex items-center justify-between flex-wrap gap-1.5">
          <div className="flex gap-2 items-center flex-wrap">
            {PLAUS_ORDER.map((key) => {
              const p = PLAUS[key];
              const active = filter === key;
              const exists = assumptions.some(
                (a) => (a.plausibility || "Mixed") === key
              );
              return (
                <button
                  key={key}
                  onClick={() => exists && toggle(key)}
                  className="flex items-center gap-1 text-[11px] font-body bg-transparent border-none p-[2px_4px] rounded"
                  style={{
                    color: active ? p.text : "#6B7280",
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
                      boxShadow: active ? `0 0 0 2px ${p.fill}30` : "none",
                    }}
                  />
                  {key}
                </button>
              );
            })}

            <span className="w-px h-3.5 bg-gray-300 mx-0.5" />

            <button
              onClick={() => toggle("critical")}
              className="flex items-center gap-1 text-[11px] font-body bg-transparent border-none p-[2px_4px] rounded cursor-pointer"
              style={{
                color: filter === "critical" ? "#1E293B" : "#6B7280",
                fontWeight: filter === "critical" ? 700 : 400,
              }}
            >
              <span className="w-3 h-3 rounded-[3px] bg-slate-500" />
              Filled = critical
            </button>
          </div>

          {insight && (
            <span className="text-[11px] text-red-800 font-body italic">
              {insight}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
