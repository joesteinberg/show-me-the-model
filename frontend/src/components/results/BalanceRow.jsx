import Square from "./Square";

export default function BalanceRow({ strengths, contradictions }) {
  return (
    <div className="flex items-center gap-5 flex-wrap">
      {/* Contradictions */}
      <div className="flex items-center gap-2">
        <div className="flex items-baseline gap-1.5 min-w-[140px]">
          <span className="text-[28px] font-bold font-display leading-none" style={{ color: "var(--smtm-text-primary)" }}>
            {contradictions.length}
          </span>
          <span className="text-[13px] font-semibold font-body" style={{ color: "var(--smtm-text-secondary)" }}>
            Contradictions
          </span>
        </div>
        <div className="flex gap-[3px]">
          {contradictions.map((c, i) => (
            <Square
              key={i}
              bg="var(--smtm-sev-critical-bg)"
              border="var(--smtm-sev-critical-text)"
              tip={
                <span>
                  <span style={{ color: "var(--smtm-sev-critical-text)", fontWeight: 600 }}>
                    Contradiction
                  </span>{" "}
                  — {c.hint || c.name}
                </span>
              }
            />
          ))}
        </div>
      </div>

      <div className="w-px h-6" style={{ background: "var(--smtm-divider)" }} />

      {/* Strengths */}
      <div className="flex items-center gap-2">
        <div className="flex items-baseline gap-1.5 min-w-[100px]">
          <span className="text-[28px] font-bold font-display leading-none" style={{ color: "var(--smtm-text-primary)" }}>
            {strengths.length}
          </span>
          <span className="text-[13px] font-semibold font-body" style={{ color: "var(--smtm-text-secondary)" }}>
            Strengths
          </span>
        </div>
        <div className="flex gap-[3px]">
          {strengths.map((s, i) => (
            <Square
              key={i}
              bg="var(--smtm-plaus-reasonable-bg)"
              border="var(--smtm-plaus-reasonable-border)"
              tip={
                <span>
                  <span style={{ color: "var(--smtm-plaus-reasonable-fill)", fontWeight: 600 }}>
                    Strength
                  </span>{" "}
                  — {s.hint || s.title}
                </span>
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
