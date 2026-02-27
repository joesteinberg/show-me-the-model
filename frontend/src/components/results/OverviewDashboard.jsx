import SeverityBar from "./SeverityBar";
import StatCard from "./StatCard";

export default function OverviewDashboard({ annotations, strengths, contradictions }) {
  const items = annotations?.annotations || [];
  const strengthsList = annotations?.strengths || [];

  const critical = items.filter((a) => a.severity === "Critical").length;
  const moderate = items.filter((a) => a.severity === "Moderate").length;
  const minor = items.filter((a) => a.severity === "Minor").length;

  const contradictionCount = Array.isArray(contradictions)
    ? contradictions.length
    : 0;
  const unstated = strengths?.key_assumptions
    ? strengths.key_assumptions.filter((a) => a.stated_or_unstated === "Unstated").length
    : 0;

  return (
    <div className="flex gap-3 flex-wrap items-end mb-5">
      <div className="flex-1 min-w-[260px]">
        <SeverityBar critical={critical} moderate={moderate} minor={minor} />
      </div>
      <div className="flex gap-2 flex-wrap">
        <StatCard value={items.length} label="Issues" color="#DC2626" />
        <StatCard value={unstated} label="Unstated" color="#D97706" />
        <StatCard
          value={strengthsList.length}
          label="Strengths"
          color="#16A34A"
        />
        <StatCard
          value={contradictionCount}
          label="Contradictions"
          color="#7C3AED"
        />
      </div>
    </div>
  );
}
