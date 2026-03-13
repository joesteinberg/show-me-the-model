import Tip from "../ui/Tip";

const PLAUS = {
  Weak: {
    fill: "var(--smtm-plaus-weak-fill)",
    bg: "var(--smtm-plaus-weak-bg)",
    border: "var(--smtm-plaus-weak-border)",
  },
  Contested: {
    fill: "var(--smtm-plaus-contested-fill)",
    bg: "var(--smtm-plaus-contested-bg)",
    border: "var(--smtm-plaus-contested-border)",
  },
  Mixed: {
    fill: "var(--smtm-plaus-mixed-fill)",
    bg: "var(--smtm-plaus-mixed-bg)",
    border: "var(--smtm-plaus-mixed-border)",
  },
  Reasonable: {
    fill: "var(--smtm-plaus-reasonable-fill)",
    bg: "var(--smtm-plaus-reasonable-bg)",
    border: "var(--smtm-plaus-reasonable-border)",
  },
};

export default function AssumptionBead({ assumption, dim }) {
  const rawPlaus = assumption.plausibility || "Mixed";
  const plausibility = rawPlaus === "Strong" ? "Reasonable" : rawPlaus;
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
        }}
      />
    </Tip>
  );
}
