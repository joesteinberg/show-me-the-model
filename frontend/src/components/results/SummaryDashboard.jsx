import IssuesRow from "./IssuesRow";
import AssumptionsMatrix from "./AssumptionsMatrix";
import BalanceRow from "./BalanceRow";

function Divider() {
  return <div className="h-px bg-gray-200 my-3.5" />;
}

export default function SummaryDashboard({
  annotations,
  assumptions,
  strengths,
  contradictions,
}) {
  return (
    <div className="bg-white rounded-[14px] px-6 py-5 border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.02)]">
      <IssuesRow annotations={annotations} />
      <Divider />
      <AssumptionsMatrix assumptions={assumptions} />
      <Divider />
      <BalanceRow strengths={strengths} contradictions={contradictions} />
    </div>
  );
}
