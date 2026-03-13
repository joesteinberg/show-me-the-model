function AssumptionBadge({ type }) {
  const isStated = type === "Stated";
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        background: isStated ? "var(--smtm-issue-pill-bg)" : "var(--smtm-plaus-mixed-bg)",
        color: isStated ? "var(--smtm-issue-pill-text)" : "var(--smtm-plaus-mixed-text)",
      }}
    >
      {isStated ? "Explicit" : "Implicit"}
    </span>
  );
}

function Prose({ text }) {
  if (!text) return null;
  const paragraphs = text.split(/\n\n+/);
  return (
    <div className="space-y-3">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-sm leading-relaxed" style={{ color: "var(--smtm-text-secondary)" }}>
          {p.split(/(Annotation \d+|Strength \d+)/g).map((part, j) =>
            /^(Annotation|Strength) \d+$/.test(part) ? (
              <strong key={j} style={{ color: "var(--smtm-text-primary)" }}>{part}</strong>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
        </p>
      ))}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h3 className="text-base font-semibold mb-3 font-display" style={{ color: "var(--smtm-text-primary)" }}>{title}</h3>
      {children}
    </section>
  );
}

export default function SynthesisSection({ synthesis }) {
  if (!synthesis) return null;

  return (
    <div className="space-y-8">
      {synthesis.central_claim_summary && (
        <Section title="Central Claim">
          <Prose text={synthesis.central_claim_summary} />
        </Section>
      )}

      {synthesis.key_assumptions?.length > 0 && (
        <Section title="Key Assumptions">
          <div className="space-y-4">
            {synthesis.key_assumptions.map((a) => (
              <div
                key={a.number}
                className="rounded-md border p-4"
                style={{
                  background: "var(--smtm-bg-surface)",
                  borderColor: "var(--smtm-border-default)",
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 text-xs font-mono mt-0.5" style={{ color: "var(--smtm-text-muted)" }}>
                    {a.number}.
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium" style={{ color: "var(--smtm-text-primary)" }}>
                        {a.assumption}
                      </p>
                    </div>
                    <div className="mb-2">
                      <AssumptionBadge type={a.stated_or_unstated} />
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--smtm-text-secondary)" }}>
                      {a.assessment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {synthesis.what_the_essay_gets_right && (
        <Section title="What the Essay Gets Right">
          <Prose text={synthesis.what_the_essay_gets_right} />
        </Section>
      )}

      {synthesis.internal_consistency && (
        <Section title="Internal Consistency">
          <Prose text={synthesis.internal_consistency} />
        </Section>
      )}

      {synthesis.rigorous_alternative && (
        <Section title="Rigorous Alternative">
          <Prose text={synthesis.rigorous_alternative} />
        </Section>
      )}
    </div>
  );
}
