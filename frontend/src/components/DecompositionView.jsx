import { useState } from "react";

export default function DecompositionView({ decomposition }) {
  const [open, setOpen] = useState(false);

  if (!decomposition) return null;

  return (
    <section>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-base font-semibold font-body"
        style={{ color: "var(--smtm-text-primary)" }}
      >
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`}
          style={{ color: "var(--smtm-text-muted)" }}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
        Decomposition (Stage 1)
      </button>

      {open && (
        <div className="mt-4 space-y-6 pl-6">
          {/* Central Thesis */}
          {decomposition.central_thesis && (
            <div>
              <h4 className="text-sm font-semibold mb-1 font-body" style={{ color: "var(--smtm-text-secondary)" }}>
                Central Thesis
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: "var(--smtm-decomp-text)" }}>
                {decomposition.central_thesis}
              </p>
            </div>
          )}

          {/* Key Claims */}
          {decomposition.key_claims?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 font-body" style={{ color: "var(--smtm-text-secondary)" }}>
                Key Claims
              </h4>
              <div className="space-y-3">
                {decomposition.key_claims.map((c, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-medium" style={{ color: "var(--smtm-text-primary)" }}>{c.claim}</p>
                    {c.quoted_passage && (
                      <blockquote
                        className="mt-1 border-l-3 pl-3 text-xs italic leading-relaxed"
                        style={{
                          borderColor: "var(--smtm-decomp-quote-border)",
                          color: "var(--smtm-decomp-muted)",
                        }}
                      >
                        {c.quoted_passage}
                      </blockquote>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stated Assumptions */}
          {decomposition.stated_assumptions?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 font-body" style={{ color: "var(--smtm-text-secondary)" }}>
                Explicit Assumptions
              </h4>
              <ul className="space-y-1.5">
                {decomposition.stated_assumptions.map((a, i) => (
                  <li key={i} className="text-sm leading-relaxed flex gap-2" style={{ color: "var(--smtm-decomp-text)" }}>
                    <span style={{ color: "var(--smtm-decomp-muted)" }} className="flex-shrink-0">&bull;</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Causal Chain */}
          {decomposition.causal_chain && (
            <div>
              <h4 className="text-sm font-semibold mb-1 font-body" style={{ color: "var(--smtm-text-secondary)" }}>
                Causal Chain
              </h4>
              <div className="space-y-2">
                {decomposition.causal_chain.split(/\n\n+/).map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed" style={{ color: "var(--smtm-decomp-text)" }}>{p}</p>
                ))}
              </div>
            </div>
          )}

          {/* Policy or Shock */}
          {decomposition.policy_or_shock && (
            <div>
              <h4 className="text-sm font-semibold mb-1 font-body" style={{ color: "var(--smtm-text-secondary)" }}>
                Exogenous Driver
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: "var(--smtm-decomp-text)" }}>
                {decomposition.policy_or_shock}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
