import Square from "./Square";

const SEV = {
  Critical: {
    color: "var(--smtm-sev-critical-border)",
    bg: "var(--smtm-sev-critical-bg)",
    tipColor: "var(--smtm-sev-critical-text)",
  },
  Moderate: {
    color: "var(--smtm-sev-moderate-border)",
    bg: "var(--smtm-sev-moderate-bg)",
    tipColor: "var(--smtm-sev-moderate-text)",
  },
  Minor: {
    color: "var(--smtm-sev-minor-border)",
    bg: "var(--smtm-sev-minor-bg)",
    tipColor: "var(--smtm-sev-minor-text)",
  },
};

const ORDER = ["Critical", "Moderate", "Minor"];

export default function IssuesRow({ annotations }) {
  if (!annotations?.length) {
    return (
      <div className="flex items-baseline gap-1.5">
        <span className="text-[28px] font-bold font-display leading-none" style={{ color: "var(--smtm-text-primary)" }}>0</span>
        <span className="text-[13px] font-semibold font-body" style={{ color: "var(--smtm-text-secondary)" }}>Issues</span>
      </div>
    );
  }

  const counts = {};
  annotations.forEach((a) => {
    counts[a.severity] = (counts[a.severity] || 0) + 1;
  });

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-baseline gap-1.5 min-w-[80px]">
        <span className="text-[28px] font-bold font-display leading-none" style={{ color: "var(--smtm-text-primary)" }}>
          {annotations.length}
        </span>
        <span className="text-[13px] font-semibold font-body" style={{ color: "var(--smtm-text-secondary)" }}>Issues</span>
      </div>
      <div className="flex gap-[3px] items-center">
        {ORDER.flatMap((sev) =>
          annotations
            .filter((a) => a.severity === sev)
            .map((item, idx) => {
              const s = SEV[item.severity];
              const hint = item.hint || item.title;
              return (
                <Square
                  key={`${sev}-${idx}`}
                  bg={s.bg}
                  border={s.color}
                  borderTop={s.color}
                  borderTopWidth="3px"
                  tip={
                    <span>
                      <span style={{ fontWeight: 600, color: s.tipColor }}>
                        {item.severity}
                      </span>{" "}
                      — {hint}
                    </span>
                  }
                />
              );
            })
        )}
      </div>
      <div className="flex gap-2.5 text-[11px] font-body ml-auto" style={{ color: "var(--smtm-text-muted)" }}>
        {ORDER.map((sev) => {
          const c = counts[sev] || 0;
          if (!c) return null;
          return (
            <span key={sev} className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-sm"
                style={{ background: SEV[sev].color }}
              />
              {c} {sev}
            </span>
          );
        })}
      </div>
    </div>
  );
}
