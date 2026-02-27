import { useState, useRef, useEffect } from "react";

// ─── Data ───────────────────────────────────────────────────────────────────
const analysisData = {
  title: "Bad Trade",
  source: "American Compass",
  author: "Michael Pettis",
  stats: {
    annotations: 8,
    critical: 4,
    moderate: 2,
    minor: 2,
    unstatedAssumptions: 6,
    statedAssumptions: 4,
    strengths: 3,
    contradictions: 4,
  },
  bottomLine:
    "The essay asks a genuinely important question — can countries that compete through wage suppression rather than productivity growth harm the global economy? — and provides a framework that contains real insights about unit labor costs, savings rates as income distribution, and the asymmetric treatment of trade distortions. But its central prediction — that the U.S. is trapped in a doom loop of forced savings decline manifesting as unemployment, debt, or fiscal deficits — rests on the untested assumption that U.S. investment is permanently unresponsive to capital inflows (Annotation 3), is undermined by the essay's own acknowledgment that the primary transmission channel (dollar appreciation) benefits most American households (Annotation 2), and collapses into internal contradiction when the essay simultaneously claims the U.S. cannot control capital inflows and recommends that it unilaterally stop absorbing them (Annotation 1).",
  centralClaim:
    "When countries achieve international competitiveness by suppressing household wages and income relative to productivity — rather than by raising productivity itself — they generate excess savings that are exported to trading partners like the United States, depressing global demand and forcing deficit countries into higher unemployment, household debt, or fiscal deficits. The U.S. should therefore lead reform of the global trade regime by restricting persistent surpluses or unilaterally refusing to absorb the world's excess savings.",
  strengths: [
    {
      title: "Unit-Labor-Cost Framing Is Correct and Pedagogically Valuable",
      text: "The t-shirt factory example — showing that $1-per-hour Chinese labor is not actually 'cheap' if it is only one-twentieth as productive as $20-per-hour American labor — effectively demolishes a misconception that pervades popular trade debates. What matters for competitiveness is not the absolute wage level but the wage relative to productivity.",
    },
    {
      title: "Debunking the 'Culture of Thrift' Narrative",
      text: "The structural argument — that aggregate savings rates are mechanically determined by how income is distributed across sectors with different propensities to consume — is sound and well-grounded in national income accounting. What looks like cultural virtue in high-saving countries is often the predictable arithmetic consequence of policies that suppress household income.",
    },
    {
      title: "Asymmetric Treatment of Trade Distortions",
      text: "The essay raises a legitimate and underweighted concern. Economists and the WTO have well-developed tools for identifying explicit tariffs and subsidies but are much less equipped to address implicit subsidies embedded in labor market institutions, environmental standards, and financial repression.",
    },
  ],
  assumptions: [
    { id: 1, title: "U.S. investment is permanently constrained by weak demand, not by the cost or availability of capital", stated: true, plausible: "Weak", critical: true },
    { id: 2, title: "The trade balance is fully determined by the capital account; trade policy and relative prices play no independent role", stated: false, plausible: "Weak", critical: true },
    { id: 3, title: "Exchange rate adjustments cannot offset the competitive advantage from wage suppression", stated: false, plausible: "Mixed", critical: false },
    { id: 4, title: "All forms of capital inflow are equivalent in their effects on the deficit country", stated: false, plausible: "Weak", critical: true },
    { id: 5, title: "Surplus countries' policies are the primary driver of U.S. trade deficits", stated: true, plausible: "Mixed", critical: false },
    { id: 6, title: "Household income share of GDP in the U.S. has declined from 65% to current levels due to trade", stated: true, plausible: "Weak", critical: false },
    { id: 7, title: "The U.S. has no effective policy instruments to manage capital inflows", stated: true, plausible: "Weak", critical: true },
    { id: 8, title: "Consumer gains from cheaper imports do not meaningfully offset manufacturing job losses", stated: false, plausible: "Contested", critical: false },
    { id: 9, title: "The balance-of-payments identity implies causation from capital flows to domestic outcomes", stated: false, plausible: "Weak", critical: false },
    { id: 10, title: "Tariffs and wage suppression are equivalent mechanisms within the accounting framework", stated: true, plausible: "Weak", critical: false },
  ],
  contradictions: [
    {
      name: "The Powerlessness–Agency Paradox",
      refs: [1],
      summary:
        "The essay spends several paragraphs establishing that the U.S. has 'little to no control' over capital inflows, then recommends that the U.S. 'unilaterally refuse to continue playing its role of absorber of last resort.' These two positions are mutually exclusive within the essay's own framework.",
    },
    {
      name: "The Dollar Appreciation Paradox",
      refs: [2],
      summary:
        "The essay's central harm narrative claims surplus countries export their demand deficiency to the U.S., making Americans worse off. But when tracing the primary transmission mechanism, the author describes a process — dollar appreciation transferring income from manufacturers to households — that benefits most Americans. The essay never reconciles these two effects.",
    },
    {
      name: "The Investment Circularity",
      refs: [3],
      summary:
        "The causal chain runs: surplus-country wage suppression → weak global demand → U.S. investment constrained by weak demand → capital inflows cannot raise investment → savings must fall. But 'weak U.S. demand' appears both as a premise and as a consequence, and the author's own adjustment channels — lower interest rates, asset price appreciation — are the mechanisms through which investment responds to cheaper capital.",
    },
    {
      name: "The Tariff Equivalence Paradox",
      refs: [4],
      summary:
        "The essay claims tariffs, wage suppression, currency depreciation, and interest rate repression all 'do exactly the same thing.' But within the essay's own accounting framework, wage suppression in a surplus country reduces domestic consumption and increases net exports, while a tariff by a deficit country reduces imports. The equivalence claim is essential to the essay's rhetorical structure but does not survive its own balance-of-payments accounting.",
    },
  ],
  annotations: [
    {
      id: 1,
      severity: "Critical",
      types: ["Contradiction", "Exog/Endo Confusion"],
      title: "U.S. 'Powerlessness' Over Capital Inflows Contradicts the Policy Remedy",
      quote: "A country, like the United States, with open capital markets, high-quality governance, and a flexible financial system, has little to no control over the extent of net capital inflows… Either Washington should pioneer new trade agreements that directly restrict the ability of countries to run large and persistent surpluses, much as John Maynard Keynes proposed during the Bretton Woods conference, or it should unilaterally refuse to continue playing its role of absorber of last resort of global excess savings and instead force its own trade and capital flows into balance.",
      explanation:
        "The essay's policy architecture collapses under the weight of its own premises. The author establishes that the U.S. has 'little to no control' over capital inflows — foreign central banks, oligarchs, and fund managers are 'determined to convert that savings into American assets.' Yet in the very next section, the essay recommends the U.S. 'unilaterally refuse to continue playing its role of absorber of last resort.' A reader who accepts the essay's premises cannot also accept its prescription. The deeper problem is that the 'no control' framing treats a behavioral response as a structural constant — a textbook Lucas Critique error.",
    },
    {
      id: 2,
      severity: "Critical",
      types: ["Contradiction", "Partial Equilibrium"],
      title: "Dollar Appreciation Helps U.S. Households — The Essay's Own Mechanism Undermines Its Harm Narrative",
      quote: "If foreign capital inflows cause the U.S. dollar to strengthen, for example, the stronger dollar effectively transfers income from manufacturers (net exporters) to households (net importers), and so raises the consumption share of GDP.",
      explanation:
        "The essay's central harm story is that wage-suppressing surplus countries export their demand deficiency to the United States, making Americans worse off. But when the author explains the primary transmission mechanism, he describes a process that makes most American households better off. The essay lists both as if they point in the same direction, when the author's own logic says they point in opposite directions. This is not a minor omission: the entire policy case rests on the claim that absorption is unambiguously harmful.",
    },
    {
      id: 3,
      severity: "Critical",
      types: ["Circular Reasoning", "Exog/Endo Confusion"],
      title: "Investment Unresponsiveness Is Assumed, Not Demonstrated — The Load-Bearing Assumption",
      quote: "Because it is demand that is the constraint, not savings, any increase in savings caused by the capital inflows must result in a reduction in some other form of savings.",
      explanation:
        "This is the single most important assumption in the entire essay and it receives the least justification. If even a fraction of capital inflows finances new investment (as greenfield FDI demonstrably does), the accounting identity no longer forces all adjustment onto savings. The post-2017 investment response to tax reform and the post-2022 surge driven by industrial policy suggest investment is not purely demand-constrained.",
    },
    {
      id: 4,
      severity: "Critical",
      types: ["False Equivalence"],
      title: "Tariffs and Wage Suppression Are Not Equivalent Within the Essay's Own Framework",
      quote: "It is strange, then, that economists complain about the distorting effect of tariffs and other direct trade interventions while ignoring all the other indirect mechanisms that do exactly the same thing.",
      explanation:
        "The essay's rhetorical centerpiece is the claim that tariffs, wage suppression, currency depreciation, and interest rate repression all 'do exactly the same thing' — transfer income from households to producers. But within the essay's own accounting framework, these policies have opposite effects on the trade balance. The equivalence claim is essential to the essay's complaint that economists are inconsistent for opposing tariffs while ignoring indirect subsidies, but the equivalence does not survive the essay's own balance-of-payments accounting.",
    },
    {
      id: 5,
      severity: "Moderate",
      types: ["Quantitative Gap"],
      title: "Household Income Share Figure Appears to Conflate Income with Consumption",
      quote: "China repressed interest rates on household savings, imposed residency restrictions that severely weakened the bargaining power of migrant workers, and gradually dismantled the so-called 'iron rice bowl' of lifetime job security, forcing down the share of GDP retained by Chinese households from roughly 65% in the mid-1980s to just over 50% by 2010.",
      explanation:
        "The direction is correct and well-documented, but the starting figure of 65% appears to conflate household income with household consumption. Most estimates place the mid-1980s household income share closer to 55–60%. The essay would actually have a stronger case citing the consumption share, which fell more dramatically.",
    },
    {
      id: 6,
      severity: "Moderate",
      types: ["Partial Equilibrium"],
      title: "Exchange Rate Adjustment Is Acknowledged But Then Ignored",
      quote: "",
      explanation:
        "The essay correctly notes that capital inflows appreciate the dollar, but then holds trading-partner prices, exchange rates, and interest rates fixed while analyzing the surplus country's wage suppression. It never applies the symmetric logic — a persistent surplus puts upward pressure on the surplus country's currency, which automatically erodes its cost advantage over time. By selectively invoking price adjustment on the U.S. side while suppressing it on the surplus-country side, the essay overstates how durable the 'bad competitiveness' mechanism is.",
    },
    {
      id: 7,
      severity: "Minor",
      types: ["institutional_accuracy"],
      title: "China's Household Income Suppression Is Accurately Described",
      quote: "China repressed interest rates on household savings, imposed residency restrictions that severely weakened the bargaining power of migrant workers, and gradually dismantled the so-called 'iron rice bowl' of lifetime job security...",
      explanation:
        "The institutional description of how China suppressed household income relative to GDP is accurate and well-documented. Financial repression, the hukou residency system, and the dismantling of the iron rice bowl all genuinely contributed to the decline in China's household income share. The essay correctly identifies a deeper structural mechanism: the suppression of household purchasing power through interlocking policies.",
    },
    {
      id: 8,
      severity: "Minor",
      types: ["Legitimate Concern"],
      title: "Tariffs and Indirect Subsidies as Symmetric Mechanisms",
      quote: "It is strange, then, that economists complain about the distorting effect of tariffs and other direct trade interventions while ignoring all the other indirect mechanisms that do exactly the same thing.",
      explanation:
        "The essay raises a genuinely legitimate concern about the asymmetric treatment of trade interventions in mainstream economic analysis and in trade law. The inclusion of labor and environmental chapters in modern trade agreements (USMCA, CPTPP) reflects a belated recognition that the playing field is not level when countries compete partly through the suppression of worker welfare. The essay overstates the case somewhat — not all differences in labor market institutions constitute 'bad competitiveness' — but the core concern is real.",
    },
  ],
  rigorousAlternative: [
    "An economist approaching the same question — 'Can wage suppression in surplus countries harm the global economy and the United States in particular?' — would start by specifying the shock precisely. The shock is a policy-induced reduction in the household income share of GDP in a large trading partner, holding productivity constant.",
    "The first step would be to identify the key parameters the answer depends on. How elastic is the surplus country's exchange rate to the incipient trade surplus? How elastic is U.S. investment to the cost of capital? How elastic is U.S. labor reallocation?",
    "The second step would be to check the adding-up constraints. The balance-of-payments identity is an accounting constraint, not a behavioral theory. A more complete analysis would model investment, savings, and the exchange rate as jointly determined.",
    "The third step would be to distinguish between different types of surplus countries and different types of capital flows. Germany's surplus operates through the eurozone's common currency; China's surplus in the 2000s operated through active reserve accumulation; Japan's surplus reflects demographic factors.",
    "Finally, the policy analysis would need to specify instruments and their costs. Capital controls reduce the liquidity and depth of U.S. financial markets. The question is not whether the current system has costs — it clearly does — but whether the proposed alternatives have lower costs on net.",
  ],
};

// ─── Color/Style Constants ──────────────────────────────────────────────────
const SEVERITY = {
  Critical: { bg: "#FEF2F2", border: "#DC2626", text: "#991B1B", badge: "#DC2626", badgeText: "#fff" },
  Moderate: { bg: "#FFFBEB", border: "#D97706", text: "#92400E", badge: "#D97706", badgeText: "#fff" },
  Minor: { bg: "#F0FDF4", border: "#16A34A", text: "#166534", badge: "#E5E7EB", badgeText: "#374151" },
};

// ─── Components ─────────────────────────────────────────────────────────────

function SeverityBar({ stats }) {
  const total = stats.critical + stats.moderate + stats.minor;
  const pct = (n) => ((n / total) * 100).toFixed(1);
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#6B7280", fontFamily: "'IBM Plex Sans', sans-serif" }}>
          <strong style={{ color: "#DC2626", fontSize: 20, fontFamily: "'Newsreader', serif" }}>{stats.critical}</strong> Critical
        </span>
        <span style={{ fontSize: 13, color: "#6B7280", fontFamily: "'IBM Plex Sans', sans-serif" }}>
          <strong style={{ color: "#D97706", fontSize: 20, fontFamily: "'Newsreader', serif" }}>{stats.moderate}</strong> Moderate
        </span>
        <span style={{ fontSize: 13, color: "#6B7280", fontFamily: "'IBM Plex Sans', sans-serif" }}>
          <strong style={{ color: "#16A34A", fontSize: 20, fontFamily: "'Newsreader', serif" }}>{stats.minor}</strong> Minor
        </span>
      </div>
      <div style={{ display: "flex", height: 10, borderRadius: 6, overflow: "hidden", background: "#F3F4F6" }}>
        <div style={{ width: `${pct(stats.critical)}%`, background: "#DC2626", transition: "width 0.6s ease" }} />
        <div style={{ width: `${pct(stats.moderate)}%`, background: "#F59E0B", transition: "width 0.6s ease" }} />
        <div style={{ width: `${pct(stats.minor)}%`, background: "#86EFAC", transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function StatCard({ value, label, color }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 18px",
      background: "#fff", borderRadius: 10, border: "1px solid #E5E7EB", minWidth: 80,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <span style={{ fontSize: 28, fontWeight: 700, color: color || "#1E293B", fontFamily: "'Newsreader', serif", lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 11, color: "#6B7280", marginTop: 4, fontFamily: "'IBM Plex Sans', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
    </div>
  );
}

function SectionHeader({ id, title, subtitle, icon }) {
  return (
    <div id={id} style={{ marginBottom: 16, paddingTop: 24, scrollMarginTop: 80 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20, opacity: 0.8 }}>{icon}</span>
        <h2 style={{
          fontSize: 22, fontWeight: 700, color: "#0F172A", margin: 0,
          fontFamily: "'Newsreader', serif", letterSpacing: -0.3,
        }}>{title}</h2>
      </div>
      {subtitle && (
        <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0 30px", fontFamily: "'IBM Plex Sans', sans-serif" }}>{subtitle}</p>
      )}
    </div>
  );
}

function AnnotationCard({ annotation, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen || false);
  const sev = SEVERITY[annotation.severity];
  return (
    <div
      style={{
        borderLeft: `4px solid ${sev.border}`,
        borderRadius: "0 10px 10px 0",
        background: open ? sev.bg : "#fff",
        border: `1px solid ${open ? sev.border + "40" : "#E5E7EB"}`,
        borderLeftWidth: 4,
        borderLeftColor: sev.border,
        marginBottom: 10,
        transition: "all 0.2s ease",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "flex-start", gap: 10, width: "100%",
          padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{
          fontSize: 13, fontWeight: 700, color: "#9CA3AF", fontFamily: "'IBM Plex Mono', monospace",
          minWidth: 24, paddingTop: 2,
        }}>#{annotation.id}</span>
        <span style={{
          display: "inline-block", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
          background: sev.badge, color: sev.badgeText, textTransform: "uppercase", letterSpacing: 0.5,
          fontFamily: "'IBM Plex Sans', sans-serif", flexShrink: 0,
        }}>{annotation.severity}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 600, color: "#1E293B", lineHeight: 1.4,
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}>{annotation.title}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            {annotation.types.map((t) => (
              <span key={t} style={{
                fontSize: 11, padding: "1px 8px", borderRadius: 20, background: "#F1F5F9",
                color: "#64748B", fontFamily: "'IBM Plex Sans', sans-serif",
              }}>{t}</span>
            ))}
          </div>
        </div>
        <span style={{ fontSize: 18, color: "#9CA3AF", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: "0 16px 16px 50px" }}>
          {annotation.quote && (
            <blockquote style={{
              margin: "0 0 14px 0", padding: "12px 16px",
              borderLeft: `3px solid ${sev.border}40`,
              background: `${sev.border}08`,
              borderRadius: "0 6px 6px 0",
              fontStyle: "italic", fontSize: 13.5, lineHeight: 1.65, color: "#374151",
              fontFamily: "'Newsreader', serif",
            }}>
              {annotation.quote}
            </blockquote>
          )}
          <p style={{
            margin: 0, fontSize: 14, lineHeight: 1.7, color: "#374151",
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}>{annotation.explanation}</p>
        </div>
      )}
    </div>
  );
}

function ContradictionCard({ contradiction }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 10,
      padding: "14px 18px", marginBottom: 10,
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 10, width: "100%",
          background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0,
        }}
      >
        <span style={{ fontSize: 16 }}>⚡</span>
        <span style={{
          flex: 1, fontSize: 15, fontWeight: 700, color: "#9A3412",
          fontFamily: "'Newsreader', serif",
        }}>{contradiction.name}</span>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {contradiction.refs.map((r) => (
            <span key={r} style={{
              fontSize: 11, padding: "1px 6px", borderRadius: 4,
              background: "#DC2626", color: "#fff", fontFamily: "'IBM Plex Mono', monospace",
            }}>#{r}</span>
          ))}
        </div>
        <span style={{ fontSize: 16, color: "#C2410C", transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▾</span>
      </button>
      {open && (
        <p style={{
          margin: "12px 0 0 26px", fontSize: 13.5, lineHeight: 1.65, color: "#78350F",
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>{contradiction.summary}</p>
      )}
    </div>
  );
}

function AssumptionRow({ a, idx }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr
        onClick={() => setOpen(!open)}
        style={{ cursor: "pointer", background: open ? "#F8FAFC" : (idx % 2 === 0 ? "#fff" : "#FAFBFC") }}
      >
        <td style={{ ...tdStyle, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", color: "#9CA3AF", width: 36 }}>{a.id}</td>
        <td style={{ ...tdStyle, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: "#1E293B", lineHeight: 1.4 }}>
          {a.title}
          {a.critical && <span style={{ marginLeft: 6, fontSize: 10, padding: "1px 5px", borderRadius: 3, background: "#FEE2E2", color: "#991B1B", fontWeight: 600 }}>KEY</span>}
        </td>
        <td style={{ ...tdStyle, textAlign: "center" }}>
          <span style={{
            display: "inline-block", width: 8, height: 8, borderRadius: "50%",
            background: a.stated ? "#3B82F6" : "#F59E0B",
          }} />
        </td>
        <td style={{ ...tdStyle, textAlign: "center" }}>
          <span style={{
            fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 600,
            fontFamily: "'IBM Plex Sans', sans-serif",
            background: a.plausible === "Weak" ? "#FEE2E2" : a.plausible === "Mixed" ? "#FEF9C3" : "#F3F4F6",
            color: a.plausible === "Weak" ? "#991B1B" : a.plausible === "Mixed" ? "#854D0E" : "#374151",
          }}>{a.plausible}</span>
        </td>
        <td style={{ ...tdStyle, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
          {open ? "▴" : "▾"}
        </td>
      </tr>
    </>
  );
}

const tdStyle = {
  padding: "10px 12px", fontSize: 13, borderBottom: "1px solid #F1F5F9",
  verticalAlign: "middle",
};

const thStyle = {
  padding: "8px 12px", fontSize: 11, fontWeight: 600, color: "#6B7280",
  textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "2px solid #E5E7EB",
  fontFamily: "'IBM Plex Sans', sans-serif", textAlign: "left",
  position: "sticky", top: 0, background: "#fff", zIndex: 1,
};

// ─── Sidebar Nav ────────────────────────────────────────────────────────────
function SideNav({ activeSection }) {
  const sections = [
    { id: "overview", label: "Overview", icon: "◉" },
    { id: "strengths", label: "Strengths", icon: "✓" },
    { id: "assumptions", label: "Assumptions", icon: "⚙" },
    { id: "annotations", label: "Annotations", icon: "◆" },
    { id: "contradictions", label: "Contradictions", icon: "⚡" },
    { id: "alternative", label: "Rigorous Alternative", icon: "↗" },
  ];
  return (
    <nav style={{
      position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 2,
    }}>
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 12px", borderRadius: 8, textDecoration: "none",
            fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif",
            color: activeSection === s.id ? "#1E40AF" : "#6B7280",
            background: activeSection === s.id ? "#EFF6FF" : "transparent",
            fontWeight: activeSection === s.id ? 600 : 400,
            transition: "all 0.15s ease",
            borderLeft: activeSection === s.id ? "3px solid #2563EB" : "3px solid transparent",
          }}
        >
          <span style={{ fontSize: 12, width: 16, textAlign: "center", opacity: 0.7 }}>{s.icon}</span>
          {s.label}
        </a>
      ))}
    </nav>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────
export default function ShowMeTheModel() {
  const [activeSection, setActiveSection] = useState("overview");
  const mainRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );
    const sectionIds = ["overview", "strengths", "assumptions", "annotations", "contradictions", "alternative"];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const d = analysisData;
  const criticalAnnotations = d.annotations.filter((a) => a.severity === "Critical");
  const moderateAnnotations = d.annotations.filter((a) => a.severity === "Moderate");
  const minorAnnotations = d.annotations.filter((a) => a.severity === "Minor");

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,600;0,700;1,400&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* ── Header ── */}
      <header style={{
        background: "#0F172A", padding: "20px 24px", position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid #1E293B",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC", fontFamily: "'Newsreader', serif", letterSpacing: -0.3 }}>
              Show Me the Model
            </div>
            <div style={{ fontSize: 12, color: "#64748B", fontFamily: "'IBM Plex Sans', sans-serif", marginTop: 2 }}>
              Rigorous structural analysis of economic arguments
            </div>
          </div>
          <button style={{
            padding: "8px 20px", borderRadius: 8, border: "1px solid #334155",
            background: "#1E293B", color: "#E2E8F0", fontSize: 13, cursor: "pointer",
            fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 500,
            transition: "all 0.15s",
          }}>
            ← Analyze another
          </button>
        </div>
      </header>

      {/* ── Layout: Sidebar + Main ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 32, padding: "24px 24px 80px" }}>
        {/* Sidebar */}
        <aside style={{ width: 180, flexShrink: 0 }}>
          <SideNav activeSection={activeSection} />
        </aside>

        {/* Main Content */}
        <main ref={mainRef} style={{ flex: 1, minWidth: 0, maxWidth: 840 }}>

          {/* ══════ OVERVIEW ══════ */}
          <section id="overview" style={{ scrollMarginTop: 80 }}>
            {/* Article meta */}
            <div style={{ marginBottom: 20 }}>
              <h1 style={{
                fontSize: 28, fontWeight: 700, color: "#0F172A", margin: 0,
                fontFamily: "'Newsreader', serif", letterSpacing: -0.5, lineHeight: 1.2,
              }}>
                Analysis: "{d.title}"
              </h1>
              <p style={{ fontSize: 14, color: "#6B7280", margin: "6px 0 0", fontFamily: "'IBM Plex Sans', sans-serif" }}>
                by {d.author} · {d.source}
              </p>
            </div>

            {/* Stats row */}
            <div style={{
              display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-end",
            }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <SeverityBar stats={d.stats} />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <StatCard value={d.stats.annotations} label="Issues" color="#DC2626" />
                <StatCard value={d.stats.unstatedAssumptions} label="Unstated" color="#D97706" />
                <StatCard value={d.stats.strengths} label="Strengths" color="#16A34A" />
                <StatCard value={d.stats.contradictions} label="Contradictions" color="#7C3AED" />
              </div>
            </div>

            {/* Bottom Line */}
            <div style={{
              background: "#0F172A", borderRadius: 12, padding: "20px 24px",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0, width: 5,
                background: "linear-gradient(to bottom, #3B82F6, #8B5CF6)",
              }} />
              <div style={{
                fontSize: 11, fontWeight: 700, color: "#60A5FA", textTransform: "uppercase",
                letterSpacing: 1.5, marginBottom: 10, fontFamily: "'IBM Plex Sans', sans-serif",
              }}>Bottom Line</div>
              <p style={{
                margin: 0, fontSize: 15, lineHeight: 1.75, color: "#CBD5E1",
                fontFamily: "'Newsreader', serif",
              }}>{d.bottomLine}</p>
            </div>

            {/* Central Claim — compact */}
            <div style={{
              marginTop: 16, padding: "14px 18px", background: "#fff",
              borderRadius: 10, border: "1px solid #E5E7EB",
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase",
                letterSpacing: 1, marginBottom: 6, fontFamily: "'IBM Plex Sans', sans-serif",
              }}>Central Claim</div>
              <p style={{
                margin: 0, fontSize: 13.5, lineHeight: 1.65, color: "#374151",
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}>{d.centralClaim}</p>
            </div>
          </section>

          {/* ══════ STRENGTHS ══════ */}
          <section id="strengths" style={{ marginTop: 40, scrollMarginTop: 80 }}>
            <SectionHeader
              title="What the Essay Gets Right"
              subtitle={`${d.strengths.length} substantive contributions recognized`}
              icon="✓"
            />
            <div style={{
              background: "#F0FDF4", borderRadius: 12, border: "1px solid #BBF7D0",
              padding: 2,
            }}>
              {d.strengths.map((s, i) => (
                <div key={i} style={{
                  padding: "16px 20px",
                  borderBottom: i < d.strengths.length - 1 ? "1px solid #BBF7D0" : "none",
                }}>
                  <div style={{
                    fontSize: 15, fontWeight: 600, color: "#166534",
                    fontFamily: "'Newsreader', serif", marginBottom: 6,
                  }}>{s.title}</div>
                  <p style={{
                    margin: 0, fontSize: 13.5, lineHeight: 1.65, color: "#374151",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}>{s.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ══════ ASSUMPTIONS ══════ */}
          <section id="assumptions" style={{ marginTop: 40, scrollMarginTop: 80 }}>
            <SectionHeader
              title="Key Assumptions"
              subtitle={`${d.assumptions.length} assumptions identified · ${d.stats.unstatedAssumptions} unstated`}
              icon="⚙"
            />
            <div style={{
              background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB",
              overflow: "hidden",
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: 36 }}>#</th>
                    <th style={thStyle}>Assumption</th>
                    <th style={{ ...thStyle, textAlign: "center", width: 60 }}>
                      <span title="Blue = stated explicitly. Amber = unstated/implicit.">Stated</span>
                    </th>
                    <th style={{ ...thStyle, textAlign: "center", width: 80 }}>Plausible</th>
                    <th style={{ ...thStyle, width: 30 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {d.assumptions.map((a, i) => (
                    <AssumptionRow key={a.id} a={a} idx={i} />
                  ))}
                </tbody>
              </table>
              <div style={{
                display: "flex", gap: 16, padding: "10px 16px", borderTop: "1px solid #F1F5F9",
                fontSize: 11, color: "#9CA3AF", fontFamily: "'IBM Plex Sans', sans-serif",
              }}>
                <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#3B82F6", marginRight: 4, verticalAlign: "middle" }} /> Stated</span>
                <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#F59E0B", marginRight: 4, verticalAlign: "middle" }} /> Unstated</span>
                <span><span style={{ display: "inline-block", padding: "0 4px", fontSize: 9, background: "#FEE2E2", color: "#991B1B", borderRadius: 2, marginRight: 4, fontWeight: 600, verticalAlign: "middle" }}>KEY</span> Load-bearing</span>
              </div>
            </div>
          </section>

          {/* ══════ ANNOTATIONS ══════ */}
          <section id="annotations" style={{ marginTop: 40, scrollMarginTop: 80 }}>
            <SectionHeader
              title="Annotations"
              subtitle={`${d.stats.annotations} issues identified across the essay`}
              icon="◆"
            />

            {/* Critical */}
            {criticalAnnotations.length > 0 && (
              <>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: "#991B1B", padding: "8px 0",
                  fontFamily: "'IBM Plex Sans', sans-serif", display: "flex", alignItems: "center", gap: 8,
                  borderBottom: "1px solid #FECACA", marginBottom: 10,
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#DC2626", display: "inline-block" }} />
                  Critical Issues ({criticalAnnotations.length})
                </div>
                {criticalAnnotations.map((a) => (
                  <AnnotationCard key={a.id} annotation={a} defaultOpen={a.id === 1} />
                ))}
              </>
            )}

            {/* Moderate */}
            {moderateAnnotations.length > 0 && (
              <>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: "#92400E", padding: "8px 0",
                  fontFamily: "'IBM Plex Sans', sans-serif", display: "flex", alignItems: "center", gap: 8,
                  borderBottom: "1px solid #FDE68A", marginBottom: 10, marginTop: 20,
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#D97706", display: "inline-block" }} />
                  Moderate Issues ({moderateAnnotations.length})
                </div>
                {moderateAnnotations.map((a) => (
                  <AnnotationCard key={a.id} annotation={a} />
                ))}
              </>
            )}

            {/* Minor / Positive */}
            {minorAnnotations.length > 0 && (
              <>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: "#166534", padding: "8px 0",
                  fontFamily: "'IBM Plex Sans', sans-serif", display: "flex", alignItems: "center", gap: 8,
                  borderBottom: "1px solid #BBF7D0", marginBottom: 10, marginTop: 20,
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16A34A", display: "inline-block" }} />
                  Minor / Positive Notes ({minorAnnotations.length})
                </div>
                {minorAnnotations.map((a) => (
                  <AnnotationCard key={a.id} annotation={a} />
                ))}
              </>
            )}
          </section>

          {/* ══════ CONTRADICTIONS ══════ */}
          <section id="contradictions" style={{ marginTop: 40, scrollMarginTop: 80 }}>
            <SectionHeader
              title="Internal Contradictions"
              subtitle="Named patterns where the essay's own logic conflicts"
              icon="⚡"
            />
            {d.contradictions.map((c, i) => (
              <ContradictionCard key={i} contradiction={c} />
            ))}
          </section>

          {/* ══════ RIGOROUS ALTERNATIVE ══════ */}
          <section id="alternative" style={{ marginTop: 40, scrollMarginTop: 80 }}>
            <SectionHeader
              title="Rigorous Alternative"
              subtitle="How an economist would approach the same question"
              icon="↗"
            />
            <div style={{
              background: "linear-gradient(135deg, #EFF6FF, #F5F3FF)",
              borderRadius: 12, border: "1px solid #C7D2FE",
              padding: "24px 28px", position: "relative",
            }}>
              <div style={{
                position: "absolute", right: 20, top: 16, fontSize: 40, opacity: 0.08,
                fontFamily: "'Newsreader', serif",
              }}>∂</div>
              {d.rigorousAlternative.map((p, i) => (
                <p key={i} style={{
                  margin: i === 0 ? 0 : "14px 0 0",
                  fontSize: 14, lineHeight: 1.75, color: "#1E293B",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                }}>{p}</p>
              ))}
            </div>
          </section>

          {/* ── Footer spacer ── */}
          <div style={{ height: 60 }} />
        </main>
      </div>
    </div>
  );
}
