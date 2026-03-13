import IssuesRow from "./IssuesRow";
import AssumptionsMatrix from "./AssumptionsMatrix";
import BalanceRow from "./BalanceRow";

function Divider() {
  return <div className="h-px my-3.5" style={{ background: "var(--smtm-divider)" }} />;
}

export default function SummaryDashboard({
  annotations,
  assumptions,
  strengths,
  contradictions,
}) {
  return (
    <div
      className="rounded-[14px] px-6 py-5 border"
      style={{
        background: "var(--smtm-bg-surface)",
        borderColor: "var(--smtm-border-default)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
      }}
    >
      <AssumptionsMatrix assumptions={assumptions} />
      <Divider />
      <IssuesRow annotations={annotations} />
      <Divider />
      <BalanceRow strengths={strengths} contradictions={contradictions} />
    </div>
  );
}
