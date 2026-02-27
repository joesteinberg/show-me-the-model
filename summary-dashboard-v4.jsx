import { useState } from "react";

// ─── Data ───────────────────────────────────────────────────────────────────
const assumptions = [
  { id: 1, title: "U.S. investment is permanently constrained by weak demand, not by the cost or availability of capital", stated: true, plausibility: "Weak", loadBearing: true },
  { id: 2, title: "The trade balance is fully determined by the capital account; trade policy and relative prices play no independent role", stated: false, plausibility: "Weak", loadBearing: true },
  { id: 3, title: "Exchange rate adjustments cannot offset the competitive advantage from wage suppression", stated: false, plausibility: "Mixed", loadBearing: false },
  { id: 4, title: "All forms of capital inflow are equivalent in their effects on the deficit country", stated: false, plausibility: "Weak", loadBearing: true },
  { id: 5, title: "Surplus countries' policies are the primary driver of U.S. trade deficits", stated: true, plausibility: "Mixed", loadBearing: false },
  { id: 6, title: "Household income share of GDP has declined from 65% due to trade", stated: true, plausibility: "Weak", loadBearing: false },
  { id: 7, title: "The U.S. has no effective policy instruments to manage capital inflows", stated: true, plausibility: "Weak", loadBearing: true },
  { id: 8, title: "Consumer gains from cheaper imports do not meaningfully offset manufacturing job losses", stated: false, plausibility: "Contested", loadBearing: false },
  { id: 9, title: "The balance-of-payments identity implies causation from capital flows to domestic outcomes", stated: false, plausibility: "Weak", loadBearing: false },
  { id: 10, title: "Tariffs and wage suppression are equivalent mechanisms within the accounting framework", stated: true, plausibility: "Weak", loadBearing: false },
];

const issueItems = [
  { severity: "Critical", hint: "Policy remedy contradicts 'powerlessness' premise" },
  { severity: "Critical", hint: "Dollar appreciation channel actually benefits households" },
  { severity: "Critical", hint: "Investment unresponsiveness assumed, never demonstrated" },
  { severity: "Critical", hint: "Tariff–wage-suppression equivalence fails own accounting" },
  { severity: "Moderate", hint: "65% household income figure conflates income with consumption" },
  { severity: "Moderate", hint: "Exchange rate adjustment acknowledged then ignored" },
  { severity: "Minor", hint: "China's income suppression mechanisms accurately described" },
  { severity: "Minor", hint: "Asymmetric treatment of indirect subsidies is a fair concern" },
];

const strengthItems = [
  { hint: "Unit-labor-cost framing corrects widespread misconception" },
  { hint: "Debunks 'culture of thrift' with structural income-distribution logic" },
  { hint: "Raises legitimate concern about asymmetric trade distortions" },
];

const contradictionItems = [
  { hint: "Powerlessness–Agency: can't control inflows, yet recommends refusing them" },
  { hint: "Dollar Appreciation: primary channel benefits the households it claims are harmed" },
  { hint: "Investment Circularity: weak demand is both premise and predicted consequence" },
  { hint: "Tariff Equivalence: policies said to be identical have opposite trade-balance effects" },
];

// ─── Palettes ───────────────────────────────────────────────────────────────
const PLAUS_ORDER = ["Weak", "Contested", "Mixed", "Reasonable"];
const PLAUS = {
  Weak:       { fill: "#EF4444", bg: "#FEE2E2", border: "#EF4444", text: "#991B1B" },
  Contested:  { fill: "#818CF8", bg: "#E0E7FF", border: "#818CF8", text: "#3730A3" },
  Mixed:      { fill: "#F59E0B", bg: "#FEF3C7", border: "#F59E0B", text: "#92400E" },
  Reasonable: { fill: "#34D399", bg: "#D1FAE5", border: "#34D399", text: "#065F46" },
};

const SEV = {
  Critical: { color: "#DC2626", bg: "#FEE2E2" },
  Moderate: { color: "#D97706", bg: "#FEF3C7" },
  Minor:    { color: "#16A34A", bg: "#D1FAE5" },
};

// ─── Tooltip ────────────────────────────────────────────────────────────────
function Tip({ children, text }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState(null);

  const handleEnter = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ left: r.left + r.width / 2, top: r.top });
    setShow(true);
  };

  return (
    <span
      onMouseEnter={handleEnter}
      onMouseLeave={() => setShow(false)}
      style={{ position: "relative", display: "inline-flex" }}
    >
      {children}
      {show && pos && (
        <span style={{
          position: "fixed",
          left: Math.max(8, Math.min(pos.left - 150, window.innerWidth - 308)),
          top: pos.top - 8, transform: "translateY(-100%)",
          zIndex: 999, background: "#0F172A", color: "#E2E8F0",
          fontSize: 12, lineHeight: 1.45, padding: "7px 11px", borderRadius: 7,
          width: 300, fontFamily: "'IBM Plex Sans', sans-serif",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)", pointerEvents: "none",
          fontWeight: 400,
        }}>{text}</span>
      )}
    </span>
  );
}

// ─── Generic Square Bead ────────────────────────────────────────────────────
function Square({ bg, border, borderTop, shadow, tip, dim }) {
  return (
    <Tip text={tip}>
      <span style={{
        display: "inline-block", width: 22, height: 22, borderRadius: 5,
        background: bg, border: `2px solid ${border}`,
        borderTop: borderTop || `2px solid ${border}`,
        opacity: dim ? 0.18 : 1,
        transition: "opacity 0.15s ease",
        cursor: "default",
        boxShadow: shadow || "none",
      }} />
    </Tip>
  );
}

// ─── Assumption Bead ────────────────────────────────────────────────────────
function AssumptionBead({ a, dim }) {
  const p = PLAUS[a.plausibility];
  const filled = a.loadBearing;
  return (
    <Tip text={
      <span>
        <span style={{ fontWeight: 600 }}>#{a.id}:</span> {a.title}<br />
        <span style={{ opacity: 0.6 }}>
          {a.stated ? "Explicit" : "Implicit"} · {a.plausibility}
          {a.loadBearing ? " · Load-bearing" : ""}
        </span>
      </span>
    }>
      <span style={{
        display: "inline-block", width: 22, height: 22, borderRadius: 5,
        background: filled ? p.fill : p.bg,
        border: `2.5px solid ${p.border}`,
        opacity: dim ? 0.18 : 1,
        transition: "opacity 0.15s ease",
        cursor: "default",
        boxShadow: filled ? `0 1px 4px ${p.fill}50` : "none",
      }} />
    </Tip>
  );
}

// ─── Issues Row ─────────────────────────────────────────────────────────────
function IssuesRow() {
  const counts = {};
  issueItems.forEach(a => { counts[a.severity] = (counts[a.severity] || 0) + 1; });
  const total = issueItems.length;
  const order = ["Critical", "Moderate", "Minor"];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, minWidth: 80 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: "#0F172A", fontFamily: "'Newsreader', serif", lineHeight: 1 }}>{total}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: "'IBM Plex Sans', sans-serif" }}>Issues</span>
      </div>
      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
        {order.flatMap(sev =>
          issueItems
            .map((item, idx) => ({ ...item, idx }))
            .filter(item => item.severity === sev)
            .map(item => {
              const s = SEV[item.severity];
              return (
                <Square
                  key={item.idx}
                  bg={s.bg}
                  border={`${s.color}30`}
                  borderTop={`3px solid ${s.color}`}
                  tip={<span><span style={{ fontWeight: 600, color: s.color === "#16A34A" ? "#86EFAC" : s.color === "#D97706" ? "#FCD34D" : "#FCA5A5" }}>{item.severity}</span> — {item.hint}</span>}
                />
              );
            })
        )}
      </div>
      <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#6B7280", fontFamily: "'IBM Plex Sans', sans-serif", marginLeft: "auto" }}>
        {order.map(sev => {
          const c = counts[sev] || 0;
          if (!c) return null;
          return (
            <span key={sev} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: SEV[sev].color }} />
              {c} {sev}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── Assumptions Matrix ─────────────────────────────────────────────────────
function AssumptionsMatrix() {
  const [filter, setFilter] = useState(null);

  const sortFn = (a, b) => {
    const p = PLAUS_ORDER.indexOf(a.plausibility) - PLAUS_ORDER.indexOf(b.plausibility);
    if (p !== 0) return p;
    return (b.loadBearing ? 1 : 0) - (a.loadBearing ? 1 : 0);
  };
  const explicit = [...assumptions.filter(a => a.stated)].sort(sortFn);
  const implicit = [...assumptions.filter(a => !a.stated)].sort(sortFn);

  const isDim = (a) => {
    if (filter === null) return false;
    if (filter === "loadBearing") return !a.loadBearing;
    if (filter === "explicit") return !a.stated;
    if (filter === "implicit") return a.stated;
    return a.plausibility !== filter;
  };

  const toggle = (v) => setFilter(f => f === v ? null : v);

  const loadBearing = assumptions.filter(a => a.loadBearing);
  const loadBearingWeak = loadBearing.filter(a => a.plausibility === "Weak").length;
  let insight = "";
  if (loadBearing.length > 0 && loadBearingWeak === loadBearing.length) {
    insight = "Every load-bearing assumption is rated Weak.";
  } else if (loadBearingWeak > 1) {
    insight = `${loadBearingWeak} of ${loadBearing.length} load-bearing assumptions are rated Weak.`;
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: "#0F172A", fontFamily: "'Newsreader', serif", lineHeight: 1 }}>
          {assumptions.length}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: "'IBM Plex Sans', sans-serif" }}>
          Assumptions
        </span>
      </div>

      <div style={{
        background: "#FAFBFC", borderRadius: 10, padding: "14px 16px",
        border: "1px solid #E5E7EB",
      }}>
        {/* Explicit row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <button
            onClick={() => toggle("explicit")}
            style={{
              fontSize: 11, fontWeight: 600, width: 56, textAlign: "right",
              color: filter === "explicit" ? "#1D4ED8" : "#3B82F6",
              fontFamily: "'IBM Plex Sans', sans-serif", flexShrink: 0,
              background: "none", border: "none", cursor: "pointer", padding: 0,
              textDecoration: filter === "explicit" ? "underline" : "none",
            }}
          >Explicit</button>
          <div style={{ width: 1, height: 22, background: "#E2E5E9", flexShrink: 0 }} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {explicit.map(a => <AssumptionBead key={a.id} a={a} dim={isDim(a)} />)}
          </div>
        </div>

        {/* Implicit row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => toggle("implicit")}
            style={{
              fontSize: 11, fontWeight: 600, width: 56, textAlign: "right",
              color: filter === "implicit" ? "#B45309" : "#D97706",
              fontFamily: "'IBM Plex Sans', sans-serif", flexShrink: 0,
              background: "none", border: "none", cursor: "pointer", padding: 0,
              textDecoration: filter === "implicit" ? "underline" : "none",
            }}
          >Implicit</button>
          <div style={{ width: 1, height: 22, background: "#E2E5E9", flexShrink: 0 }} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {implicit.map(a => <AssumptionBead key={a.id} a={a} dim={isDim(a)} />)}
          </div>
        </div>

        {/* Legend */}
        <div style={{
          marginTop: 12, paddingTop: 10, borderTop: "1px solid #E5E7EB",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 6,
        }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {PLAUS_ORDER.map(key => {
              const p = PLAUS[key];
              const active = filter === key;
              const exists = assumptions.some(a => a.plausibility === key);
              return (
                <button
                  key={key}
                  onClick={() => toggle(key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    fontSize: 11, color: active ? p.text : "#6B7280",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    background: "none", border: "none", cursor: "pointer", padding: "2px 4px",
                    borderRadius: 4, fontWeight: active ? 700 : 400,
                    opacity: exists ? 1 : 0.4,
                  }}
                >
                  <span style={{
                    width: 12, height: 12, borderRadius: 3,
                    background: active ? p.fill : p.bg,
                    border: `2px solid ${p.border}`,
                    boxShadow: active ? `0 0 0 2px ${p.fill}30` : "none",
                    transition: "all 0.12s",
                  }} />
                  {key}
                </button>
              );
            })}

            <span style={{ width: 1, height: 14, background: "#D1D5DB", margin: "0 2px" }} />

            <button
              onClick={() => toggle("loadBearing")}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 11, color: filter === "loadBearing" ? "#1E293B" : "#6B7280",
                fontFamily: "'IBM Plex Sans', sans-serif",
                background: "none", border: "none", cursor: "pointer", padding: "2px 4px",
                borderRadius: 4, fontWeight: filter === "loadBearing" ? 700 : 400,
              }}
            >
              <span style={{ width: 12, height: 12, borderRadius: 3, background: "#64748B" }} />
              Filled = load-bearing
            </button>
          </div>

          {insight && (
            <span style={{
              fontSize: 11, color: "#991B1B", fontFamily: "'IBM Plex Sans', sans-serif",
              fontStyle: "italic",
            }}>{insight}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Balance Row ────────────────────────────────────────────────────────────
function BalanceRow() {
  const sColor = "#16A34A";
  const sBg = "#D1FAE5";
  const sBorder = "#86EFAC";
  const cColor = "#DC2626";
  const cBg = "#FEE2E2";
  const cBorder = "#FCA5A5";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      {/* Strengths */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, minWidth: 100 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: "#0F172A", fontFamily: "'Newsreader', serif", lineHeight: 1 }}>{strengthItems.length}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: "'IBM Plex Sans', sans-serif" }}>Strengths</span>
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {strengthItems.map((s, i) => (
            <Square
              key={i}
              bg={sBg} border={sBorder}
              tip={<span><span style={{ color: "#86EFAC", fontWeight: 600 }}>Strength</span> — {s.hint}</span>}
            />
          ))}
        </div>
      </div>

      <div style={{ width: 1, height: 24, background: "#E5E7EB" }} />

      {/* Contradictions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, minWidth: 140 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: "#0F172A", fontFamily: "'Newsreader', serif", lineHeight: 1 }}>{contradictionItems.length}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: "'IBM Plex Sans', sans-serif" }}>Contradictions</span>
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {contradictionItems.map((c, i) => (
            <Square
              key={i}
              bg={cBg} border={cBorder}
              tip={<span><span style={{ color: "#FCA5A5", fontWeight: 600 }}>Contradiction</span> — {c.hint}</span>}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Divider ────────────────────────────────────────────────────────────────
function Div() { return <div style={{ height: 1, background: "#E5E7EB", margin: "14px 0" }} />; }

// ─── Main ───────────────────────────────────────────────────────────────────
export default function SummaryV4() {
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'IBM Plex Sans', sans-serif", padding: "32px 24px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,600;0,700;1,400&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0F172A", margin: 0, fontFamily: "'Newsreader', serif", letterSpacing: -0.5 }}>
            Analysis: "Bad Trade"
          </h1>
          <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>by Michael Pettis · American Compass</p>
        </div>

        <div style={{
          background: "#fff", borderRadius: 14, padding: "20px 24px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)",
        }}>
          <IssuesRow />
          <Div />
          <AssumptionsMatrix />
          <Div />
          <BalanceRow />
        </div>

        <div style={{
          background: "#0F172A", borderRadius: 12, padding: "20px 24px",
          position: "relative", overflow: "hidden", marginTop: 16,
        }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: "linear-gradient(to bottom, #3B82F6, #8B5CF6)" }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: "#60A5FA", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Bottom Line</div>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.75, color: "#CBD5E1", fontFamily: "'Newsreader', serif" }}>
            The essay asks a genuinely important question — can countries that compete through wage suppression
            rather than productivity growth harm the global economy? — and provides a framework that contains real
            insights. But its central prediction rests on the untested assumption that U.S. investment is permanently
            unresponsive to capital inflows, is undermined by the essay's own acknowledgment that dollar appreciation
            benefits most American households, and collapses into internal contradiction when the essay simultaneously
            claims the U.S. cannot control capital inflows and recommends that it unilaterally stop absorbing them.
          </p>
        </div>
      </div>
    </div>
  );
}
