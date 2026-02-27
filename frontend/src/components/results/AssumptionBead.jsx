import Tip from "../ui/Tip";

const PLAUS = {
  Weak: { fill: "#EF4444", bg: "#FEE2E2", border: "#EF4444" },
  Contested: { fill: "#818CF8", bg: "#E0E7FF", border: "#818CF8" },
  Mixed: { fill: "#F59E0B", bg: "#FEF3C7", border: "#F59E0B" },
  Reasonable: { fill: "#34D399", bg: "#D1FAE5", border: "#34D399" },
};

export default function AssumptionBead({ assumption, dim }) {
  const plausibility = assumption.plausibility || "Mixed";
  const p = PLAUS[plausibility] || PLAUS.Mixed;
  const filled = assumption.critical;
  const stated = assumption.stated_or_unstated === "Stated";
  const id = assumption.number;

  return (
    <Tip
      text={
        <span>
          <span style={{ fontWeight: 600 }}>#{id}:</span>{" "}
          {assumption.assumption}
          <br />
          <span style={{ opacity: 0.6 }}>
            {stated ? "Explicit" : "Implicit"} · {plausibility}
            {assumption.critical ? " · Critical" : ""}
          </span>
        </span>
      }
    >
      <span
        className="inline-block rounded-[5px] cursor-default transition-opacity duration-150"
        style={{
          width: 22,
          height: 22,
          background: filled ? p.fill : p.bg,
          border: `2.5px solid ${p.border}`,
          opacity: dim ? 0.18 : 1,
          boxShadow: filled ? `0 1px 4px ${p.fill}50` : "none",
        }}
      />
    </Tip>
  );
}
