import { useState, useEffect } from "react";
import SummaryDashboard from "./results/SummaryDashboard";
import SectionHeader from "./results/SectionHeader";
import AssumptionsTable from "./results/AssumptionsTable";
import ContradictionCard from "./results/ContradictionCard";
import SideNav from "./results/SideNav";
import AnnotationCard from "./AnnotationCard";
import DecompositionView from "./DecompositionView";
import ThemeSwitcher from "./ThemeSwitcher";
import { useTheme } from "../context/ThemeContext";

function Prose({ text }) {
  if (!text) return null;
  const paragraphs = text.split(/\n\n+/);
  return (
    <div className="space-y-3">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-sm leading-relaxed font-body" style={{ color: "var(--smtm-text-secondary)" }}>
          {p.split(/(Annotation \d+|Strength \d+)/g).map((part, j) =>
            /^(Annotation|Strength) \d+$/.test(part) ? (
              <strong key={j} style={{ color: "var(--smtm-text-primary)" }}>
                {part}
              </strong>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
        </p>
      ))}
    </div>
  );
}

function ShareBox({ analysisId }) {
  const [copied, setCopied] = useState(null);
  const shareUrl = `${window.location.origin}/#/results/${analysisId}`;

  const copy = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div
      className="rounded-lg px-4 py-3 flex flex-wrap items-center gap-3 text-sm"
      style={{ background: "var(--smtm-share-bg)" }}
    >
      <span className="text-xs font-medium shrink-0" style={{ color: "var(--smtm-share-label)" }}>
        Share this analysis
      </span>
      <button
        onClick={() => copy(analysisId, "id")}
        className="px-2.5 py-1 rounded font-mono text-xs transition-colors cursor-pointer"
        style={{
          background: "var(--smtm-share-id-bg)",
          color: "var(--smtm-share-id-text)",
        }}
        title="Copy analysis ID"
      >
        {copied === "id" ? "Copied!" : analysisId}
      </button>
      <button
        onClick={() => copy(shareUrl, "link")}
        className="px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
        style={{
          background: "var(--smtm-btn-primary-bg)",
          color: "var(--smtm-btn-primary-text)",
        }}
      >
        {copied === "link" ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}

export default function ResultsView({ result, analysisId, onReset }) {
  const { synthesis, merged_annotations, decomposition, metadata } = result;
  const [activeSection, setActiveSection] = useState("overview");
  useTheme(); // subscribe so logo rerenders aren't needed (transparent logo)

  const annotations = merged_annotations?.annotations || [];
  const strengths = merged_annotations?.strengths || [];
  const assumptions = synthesis?.key_assumptions || [];
  const contradictions = synthesis?.internal_consistency;
  const contradictionsArray = Array.isArray(contradictions)
    ? contradictions
    : [];

  const criticalAnnotations = annotations.filter(
    (a) => a.severity === "Critical"
  );
  const moderateAnnotations = annotations.filter(
    (a) => a.severity === "Moderate"
  );
  const minorAnnotations = annotations.filter((a) => a.severity === "Minor");

  // Intersection observer for sidebar active state
  useEffect(() => {
    const sectionIds = [
      "overview",
      "assumptions",
      "annotations",
      "contradictions",
      "strengths",
      "alternative",
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );
        if (visible.length > 0) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen font-body" style={{ background: "var(--smtm-bg-page)" }}>
      {/* Header */}
      <header
        className="px-6 py-5 sticky top-0 z-50 border-b"
        style={{
          background: "var(--smtm-bg-header)",
          borderColor: "var(--smtm-border-default)",
        }}
      >
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <span
            className="font-display font-700 text-2xl tracking-tight cursor-pointer"
            style={{ color: "var(--smtm-title-primary)" }}
            onClick={onReset}
          >
            Show Me the Model
          </span>
          <div className="flex items-center gap-2">
            <ThemeSwitcher compact />
            <button
              onClick={onReset}
              className="px-5 py-2 rounded-lg border text-[13px] cursor-pointer font-body font-medium transition-all"
              style={{
                background: "var(--smtm-btn-secondary-bg)",
                borderColor: "var(--smtm-btn-secondary-border)",
                color: "var(--smtm-btn-secondary-text)",
              }}
            >
              ← Analyze another
            </button>
          </div>
        </div>
        {analysisId && (
          <div className="max-w-[1100px] mx-auto mt-3">
            <ShareBox analysisId={analysisId} />
          </div>
        )}
      </header>

      {/* Layout: sidebar + main */}
      <div className="max-w-[1100px] mx-auto flex gap-8 px-6 pt-6 pb-20">
        {/* Sidebar — hidden on mobile */}
        <aside className="w-[180px] shrink-0 hidden lg:block">
          <SideNav activeSection={activeSection} />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 max-w-[840px]">
          {/* === OVERVIEW === */}
          <section id="overview" className="scroll-mt-20">
            {/* Article title */}
            <div className="mb-5">
              <h1
                className="text-[28px] font-bold font-display tracking-tight leading-tight m-0"
                style={{ color: "var(--smtm-text-primary)" }}
              >
                {metadata?.essay_title
                  ? <>Analysis: &ldquo;{metadata.essay_title}&rdquo;</>
                  : "Analysis Results"}
              </h1>
              {metadata?.essay_author && (
                <p className="mt-1.5 mb-0 text-sm font-body" style={{ color: "var(--smtm-text-secondary)" }}>
                  by {metadata.essay_author}
                  {metadata.essay_source && <> · {metadata.essay_source}</>}
                </p>
              )}
              <p className="mt-1 mb-0 text-xs font-body" style={{ color: "var(--smtm-text-muted)" }}>
                {metadata?.source_url ? (
                  <a
                    href={metadata.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                    style={{ color: "var(--smtm-interactive)" }}
                  >
                    View original ↗
                  </a>
                ) : metadata?.input_mode === "pdf" ? (
                  "Source: user-supplied PDF"
                ) : metadata?.input_mode === "text" ? (
                  "Source: user-supplied text"
                ) : null}
              </p>
            </div>

            <SummaryDashboard
              annotations={annotations}
              assumptions={assumptions}
              strengths={strengths}
              contradictions={contradictionsArray}
            />

            {/* Bottom Line */}
            {synthesis?.bottom_line && (
              <div
                className="mt-4 rounded-xl px-6 py-5 relative overflow-hidden"
                style={{ background: "var(--smtm-bl-bg)" }}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-[5px]"
                  style={{
                    background: `linear-gradient(to bottom, var(--smtm-bl-grad-from), var(--smtm-bl-grad-to))`,
                  }}
                />
                <div
                  className="text-[11px] font-bold uppercase tracking-[1.5px] mb-2.5 font-body"
                  style={{ color: "var(--smtm-bl-label)" }}
                >
                  Bottom Line
                </div>
                <p
                  className="m-0 text-[15px] leading-[1.75] font-display"
                  style={{ color: "var(--smtm-bl-text)" }}
                >
                  {synthesis.bottom_line}
                </p>
              </div>
            )}

            {/* Central Claim — compact */}
            {synthesis?.central_claim_summary && (
              <div
                className="mt-4 px-4 py-3.5 rounded-lg border"
                style={{
                  background: "var(--smtm-bg-surface)",
                  borderColor: "var(--smtm-border-default)",
                }}
              >
                <div
                  className="text-[11px] font-bold uppercase tracking-wider mb-1.5 font-body"
                  style={{ color: "var(--smtm-text-muted)" }}
                >
                  Central Claim
                </div>
                <p
                  className="m-0 text-[13.5px] leading-relaxed font-body"
                  style={{ color: "var(--smtm-text-secondary)" }}
                >
                  {synthesis.central_claim_summary}
                </p>
              </div>
            )}
          </section>

          {/* === ASSUMPTIONS === */}
          {assumptions.length > 0 && (
            <section id="assumptions" className="mt-10 scroll-mt-20">
              <SectionHeader
                title="Key Assumptions"
                subtitle={`${assumptions.length} assumptions identified · ${
                  assumptions.filter(
                    (a) => a.stated_or_unstated === "Unstated"
                  ).length
                } implicit`}
                icon="⚙"
              />
              <AssumptionsTable assumptions={assumptions} />
            </section>
          )}

          {/* === ANNOTATIONS === */}
          {annotations.length > 0 && (
            <section id="annotations" className="mt-10 scroll-mt-20">
              <SectionHeader
                title="Annotations"
                subtitle={`${annotations.length} issues identified across the essay`}
                icon="◆"
              />

              {/* Critical */}
              {criticalAnnotations.length > 0 && (
                <>
                  <div
                    className="text-[13px] font-bold py-2 font-body flex items-center gap-2 border-b mb-2.5"
                    style={{
                      color: "var(--smtm-sev-critical-text)",
                      borderColor: "var(--smtm-sev-critical-border)",
                      borderBottomWidth: 1,
                      borderBottomStyle: "solid",
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ background: "var(--smtm-sev-critical-border)" }}
                    />
                    Critical Issues ({criticalAnnotations.length})
                  </div>
                  {criticalAnnotations.map((a) => (
                    <AnnotationCard
                      key={a.number}
                      annotation={a}
                    />
                  ))}
                </>
              )}

              {/* Moderate */}
              {moderateAnnotations.length > 0 && (
                <>
                  <div
                    className="text-[13px] font-bold py-2 font-body flex items-center gap-2 border-b mb-2.5 mt-5"
                    style={{
                      color: "var(--smtm-sev-moderate-text)",
                      borderColor: "var(--smtm-sev-moderate-border)",
                      borderBottomWidth: 1,
                      borderBottomStyle: "solid",
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ background: "var(--smtm-sev-moderate-border)" }}
                    />
                    Moderate Issues ({moderateAnnotations.length})
                  </div>
                  {moderateAnnotations.map((a) => (
                    <AnnotationCard key={a.number} annotation={a} />
                  ))}
                </>
              )}

              {/* Minor */}
              {minorAnnotations.length > 0 && (
                <>
                  <div
                    className="text-[13px] font-bold py-2 font-body flex items-center gap-2 border-b mb-2.5 mt-5"
                    style={{
                      color: "var(--smtm-sev-minor-text)",
                      borderColor: "var(--smtm-sev-minor-border)",
                      borderBottomWidth: 1,
                      borderBottomStyle: "solid",
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ background: "var(--smtm-sev-minor-border)" }}
                    />
                    Minor / Positive Notes ({minorAnnotations.length})
                  </div>
                  {minorAnnotations.map((a) => (
                    <AnnotationCard key={a.number} annotation={a} />
                  ))}
                </>
              )}
            </section>
          )}

          {/* === CONTRADICTIONS === */}
          <section id="contradictions" className="mt-10 scroll-mt-20">
            <SectionHeader
              title="Internal Contradictions"
              subtitle="Named patterns where the essay's own logic conflicts"
              icon="⚡"
            />
            {contradictionsArray.length > 0 ? (
              contradictionsArray.map((c, i) => (
                <ContradictionCard key={i} contradiction={c} />
              ))
            ) : typeof contradictions === "string" ? (
              <div
                className="rounded-xl p-5 border"
                style={{
                  background: "var(--smtm-contra-bg)",
                  borderColor: "var(--smtm-contra-border)",
                }}
              >
                <Prose text={contradictions} />
              </div>
            ) : (
              <p className="text-sm font-body" style={{ color: "var(--smtm-text-muted)" }}>
                No internal contradictions identified.
              </p>
            )}
          </section>

          {/* === STRENGTHS === */}
          {(strengths.length > 0 || synthesis?.what_the_essay_gets_right) && (
            <section id="strengths" className="mt-10 scroll-mt-20">
              <SectionHeader
                title="What the Essay Gets Right"
                subtitle={
                  strengths.length > 0
                    ? `${strengths.length} substantive contributions recognized`
                    : undefined
                }
                icon="✓"
              />
              {strengths.length > 0 ? (
                <div
                  className="rounded-xl border p-0.5"
                  style={{
                    background: "var(--smtm-strength-bg)",
                    borderColor: "var(--smtm-strength-border)",
                  }}
                >
                  {strengths.map((s, i) => (
                    <div
                      key={i}
                      className="px-5 py-4"
                      style={{
                        borderBottom: i < strengths.length - 1
                          ? `1px solid var(--smtm-strength-divider)`
                          : "none",
                      }}
                    >
                      <div
                        className="text-[15px] font-semibold font-display mb-1.5"
                        style={{ color: "var(--smtm-strength-title)" }}
                      >
                        {s.title}
                      </div>
                      <p className="m-0 text-[13.5px] leading-relaxed font-body" style={{ color: "var(--smtm-text-secondary)" }}>
                        {s.explanation}
                      </p>
                      {s.conditionality && (
                        <p className="mt-2 text-xs italic font-body" style={{ color: "var(--smtm-text-muted)" }}>
                          {s.conditionality}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Prose text={synthesis.what_the_essay_gets_right} />
              )}
            </section>
          )}

          {/* === RIGOROUS ALTERNATIVE === */}
          {synthesis?.rigorous_alternative && (
            <section id="alternative" className="mt-10 scroll-mt-20">
              <SectionHeader
                title="Rigorous Alternative"
                subtitle="How an economist would approach the same question"
                icon="↗"
              />
              <div
                className="rounded-xl px-7 py-6 relative border"
                style={{
                  background: `linear-gradient(135deg, var(--smtm-alt-from), var(--smtm-alt-to))`,
                  borderColor: "var(--smtm-alt-border)",
                }}
              >
                <div
                  className="absolute right-5 top-4 text-[40px] font-display"
                  style={{ opacity: 0.08, color: "var(--smtm-accent-purple)" }}
                >
                  ∂
                </div>
                <Prose text={synthesis.rigorous_alternative} />
              </div>
            </section>
          )}

          {/* === DECOMPOSITION === */}
          <div className="mt-10">
            <DecompositionView decomposition={decomposition} />
          </div>

          <div className="h-15" />
        </main>
      </div>
    </div>
  );
}
