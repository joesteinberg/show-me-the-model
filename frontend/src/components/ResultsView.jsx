import { useState, useEffect } from "react";
import SummaryDashboard from "./results/SummaryDashboard";
import SectionHeader from "./results/SectionHeader";
import AssumptionsTable from "./results/AssumptionsTable";
import ContradictionCard from "./results/ContradictionCard";
import SideNav from "./results/SideNav";
import AnnotationCard from "./AnnotationCard";
import DecompositionView from "./DecompositionView";

function Prose({ text }) {
  if (!text) return null;
  const paragraphs = text.split(/\n\n+/);
  return (
    <div className="space-y-3">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-sm leading-relaxed text-gray-700 font-body">
          {p.split(/(Annotation \d+|Strength \d+)/g).map((part, j) =>
            /^(Annotation|Strength) \d+$/.test(part) ? (
              <strong key={j} className="text-gray-900">
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
    <div className="bg-slate-800 rounded-lg px-4 py-3 flex flex-wrap items-center gap-3 text-sm">
      <span className="text-slate-400 text-xs font-medium shrink-0">Share this analysis</span>
      <button
        onClick={() => copy(analysisId, "id")}
        className="px-2.5 py-1 rounded bg-slate-700 text-slate-200 font-mono text-xs hover:bg-slate-600 transition-colors cursor-pointer"
        title="Copy analysis ID"
      >
        {copied === "id" ? "Copied!" : analysisId}
      </button>
      <button
        onClick={() => copy(shareUrl, "link")}
        className="px-2.5 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-colors cursor-pointer"
      >
        {copied === "link" ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}

export default function ResultsView({ result, analysisId, onReset }) {
  const { synthesis, merged_annotations, decomposition, metadata } = result;
  const [activeSection, setActiveSection] = useState("overview");

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
      "strengths",
      "assumptions",
      "annotations",
      "contradictions",
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
    <div className="min-h-screen bg-slate-50 font-body">
      {/* Dark header */}
      <header className="bg-slate-900 px-6 py-5 sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-slate-50 font-display tracking-tight">
              Show Me the Model
            </div>
            <div className="text-xs text-slate-500 font-body mt-0.5">
              Rigorous structural analysis of economic arguments
            </div>
          </div>
          <button
            onClick={onReset}
            className="px-5 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-[13px] cursor-pointer font-body font-medium transition-all hover:bg-slate-700"
          >
            ← Analyze another
          </button>
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
          {/* ═══ OVERVIEW ═══ */}
          <section id="overview" className="scroll-mt-20">
            {/* Article title */}
            <div className="mb-5">
              <h1 className="text-[28px] font-bold text-slate-900 font-display tracking-tight leading-tight m-0">
                {metadata?.essay_title
                  ? <>Analysis: &ldquo;{metadata.essay_title}&rdquo;</>
                  : "Analysis Results"}
              </h1>
              {metadata?.essay_author && (
                <p className="mt-1.5 mb-0 text-sm text-slate-600 font-body">
                  by {metadata.essay_author}
                  {metadata.essay_source && <> · {metadata.essay_source}</>}
                </p>
              )}
              <p className="mt-1 mb-0 text-xs text-slate-400 font-body">
                {metadata?.source_url ? (
                  <a
                    href={metadata.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 underline"
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
              <div className="mt-4 bg-slate-900 rounded-xl px-6 py-5 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-gradient-to-b from-blue-500 to-violet-500" />
                <div className="text-[11px] font-bold text-blue-400 uppercase tracking-[1.5px] mb-2.5 font-body">
                  Bottom Line
                </div>
                <p className="m-0 text-[15px] leading-[1.75] text-slate-300 font-display">
                  {synthesis.bottom_line}
                </p>
              </div>
            )}

            {/* Central Claim — compact */}
            {synthesis?.central_claim_summary && (
              <div className="mt-4 px-4 py-3.5 bg-white rounded-lg border border-gray-200">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 font-body">
                  Central Claim
                </div>
                <p className="m-0 text-[13.5px] leading-relaxed text-gray-700 font-body">
                  {synthesis.central_claim_summary}
                </p>
              </div>
            )}
          </section>

          {/* ═══ STRENGTHS ═══ */}
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
                <div className="bg-green-50 rounded-xl border border-green-200 p-0.5">
                  {strengths.map((s, i) => (
                    <div
                      key={i}
                      className={`px-5 py-4 ${
                        i < strengths.length - 1
                          ? "border-b border-green-200"
                          : ""
                      }`}
                    >
                      <div className="text-[15px] font-semibold text-green-800 font-display mb-1.5">
                        {s.title}
                      </div>
                      <p className="m-0 text-[13.5px] leading-relaxed text-gray-700 font-body">
                        {s.explanation}
                      </p>
                      {s.conditionality && (
                        <p className="mt-2 text-xs text-gray-500 italic font-body">
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

          {/* ═══ ASSUMPTIONS ═══ */}
          {assumptions.length > 0 && (
            <section id="assumptions" className="mt-10 scroll-mt-20">
              <SectionHeader
                title="Key Assumptions"
                subtitle={`${assumptions.length} assumptions identified · ${
                  assumptions.filter(
                    (a) => a.stated_or_unstated === "Unstated"
                  ).length
                } unstated`}
                icon="⚙"
              />
              <AssumptionsTable assumptions={assumptions} />
            </section>
          )}

          {/* ═══ ANNOTATIONS ═══ */}
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
                  <div className="text-[13px] font-bold text-red-800 py-2 font-body flex items-center gap-2 border-b border-red-200 mb-2.5">
                    <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                    Critical Issues ({criticalAnnotations.length})
                  </div>
                  {criticalAnnotations.map((a, i) => (
                    <AnnotationCard
                      key={a.number}
                      annotation={a}
                      defaultOpen={i === 0}
                    />
                  ))}
                </>
              )}

              {/* Moderate */}
              {moderateAnnotations.length > 0 && (
                <>
                  <div className="text-[13px] font-bold text-amber-800 py-2 font-body flex items-center gap-2 border-b border-amber-200 mb-2.5 mt-5">
                    <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />
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
                  <div className="text-[13px] font-bold text-green-800 py-2 font-body flex items-center gap-2 border-b border-green-200 mb-2.5 mt-5">
                    <span className="w-2 h-2 rounded-full bg-green-600 inline-block" />
                    Minor / Positive Notes ({minorAnnotations.length})
                  </div>
                  {minorAnnotations.map((a) => (
                    <AnnotationCard key={a.number} annotation={a} />
                  ))}
                </>
              )}
            </section>
          )}

          {/* ═══ CONTRADICTIONS ═══ */}
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
              /* Fallback for old prose format */
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                <Prose text={contradictions} />
              </div>
            ) : (
              <p className="text-sm text-gray-500 font-body">
                No internal contradictions identified.
              </p>
            )}
          </section>

          {/* ═══ RIGOROUS ALTERNATIVE ═══ */}
          {synthesis?.rigorous_alternative && (
            <section id="alternative" className="mt-10 scroll-mt-20">
              <SectionHeader
                title="Rigorous Alternative"
                subtitle="How an economist would approach the same question"
                icon="↗"
              />
              <div className="bg-gradient-to-br from-blue-50 to-violet-50 rounded-xl border border-indigo-200 px-7 py-6 relative">
                <div className="absolute right-5 top-4 text-[40px] opacity-[0.08] font-display">
                  ∂
                </div>
                <Prose text={synthesis.rigorous_alternative} />
              </div>
            </section>
          )}

          {/* ═══ DECOMPOSITION ═══ */}
          <div className="mt-10">
            <DecompositionView decomposition={decomposition} />
          </div>

          <div className="h-15" />
        </main>
      </div>
    </div>
  );
}
