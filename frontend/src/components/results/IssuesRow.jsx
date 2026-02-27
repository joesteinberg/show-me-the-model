import Square from "./Square";

const SEV = {
  Critical: { color: "#DC2626", bg: "#FEE2E2", tipColor: "#FCA5A5" },
  Moderate: { color: "#D97706", bg: "#FEF3C7", tipColor: "#FCD34D" },
  Minor: { color: "#16A34A", bg: "#D1FAE5", tipColor: "#86EFAC" },
};

const ORDER = ["Critical", "Moderate", "Minor"];

export default function IssuesRow({ annotations }) {
  if (!annotations?.length) {
    return (
      <div className="flex items-baseline gap-1.5">
        <span className="text-[28px] font-bold text-slate-900 font-display leading-none">0</span>
        <span className="text-[13px] font-semibold text-gray-700 font-body">Issues</span>
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
        <span className="text-[28px] font-bold text-slate-900 font-display leading-none">
          {annotations.length}
        </span>
        <span className="text-[13px] font-semibold text-gray-700 font-body">Issues</span>
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
                  border={`${s.color}30`}
                  borderTop={`3px solid ${s.color}`}
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
      <div className="flex gap-2.5 text-[11px] text-gray-500 font-body ml-auto">
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
