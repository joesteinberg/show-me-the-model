import Square from "./Square";

export default function BalanceRow({ strengths, contradictions }) {
  return (
    <div className="flex items-center gap-5 flex-wrap">
      {/* Strengths */}
      <div className="flex items-center gap-2">
        <div className="flex items-baseline gap-1.5 min-w-[100px]">
          <span className="text-[28px] font-bold text-slate-900 font-display leading-none">
            {strengths.length}
          </span>
          <span className="text-[13px] font-semibold text-gray-700 font-body">
            Strengths
          </span>
        </div>
        <div className="flex gap-[3px]">
          {strengths.map((s, i) => (
            <Square
              key={i}
              bg="#D1FAE5"
              border="#86EFAC"
              tip={
                <span>
                  <span style={{ color: "#86EFAC", fontWeight: 600 }}>
                    Strength
                  </span>{" "}
                  — {s.hint || s.title}
                </span>
              }
            />
          ))}
        </div>
      </div>

      <div className="w-px h-6 bg-gray-200" />

      {/* Contradictions */}
      <div className="flex items-center gap-2">
        <div className="flex items-baseline gap-1.5 min-w-[140px]">
          <span className="text-[28px] font-bold text-slate-900 font-display leading-none">
            {contradictions.length}
          </span>
          <span className="text-[13px] font-semibold text-gray-700 font-body">
            Contradictions
          </span>
        </div>
        <div className="flex gap-[3px]">
          {contradictions.map((c, i) => (
            <Square
              key={i}
              bg="#FEE2E2"
              border="#FCA5A5"
              tip={
                <span>
                  <span style={{ color: "#FCA5A5", fontWeight: 600 }}>
                    Contradiction
                  </span>{" "}
                  — {c.hint || c.name}
                </span>
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
