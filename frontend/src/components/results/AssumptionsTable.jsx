import { useState } from "react";

const PLAUSIBILITY_STYLES = {
  Weak: "bg-red-100 text-red-800",
  Mixed: "bg-yellow-100 text-yellow-800",
  Contested: "bg-gray-100 text-gray-700",
  Strong: "bg-green-100 text-green-800",
};

function AssumptionRow({ assumption, index }) {
  const [open, setOpen] = useState(false);
  const isStated = assumption.stated_or_unstated === "Stated";
  const plausStyle =
    PLAUSIBILITY_STYLES[assumption.plausibility] || PLAUSIBILITY_STYLES.Mixed;

  return (
    <>
      <tr
        onClick={() => setOpen(!open)}
        className={`cursor-pointer transition-colors ${
          open ? "bg-slate-50" : index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
        }`}
      >
        <td className="px-3 py-2.5 text-[13px] font-semibold font-mono text-gray-400 w-9 align-middle">
          {assumption.number}
        </td>
        <td className="px-3 py-2.5 font-body text-[13px] text-slate-900 leading-snug align-middle">
          {assumption.assumption}
          {assumption.critical && (
            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-semibold align-middle">
              KEY
            </span>
          )}
        </td>
        <td className="px-3 py-2.5 text-center align-middle">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isStated ? "bg-blue-500" : "bg-amber-400"
            }`}
          />
        </td>
        {/* Plausibility column */}
        <td className="px-3 py-2.5 text-center align-middle">
          {assumption.plausibility && (
            <span
              className={`text-[11px] px-2 py-0.5 rounded font-semibold font-body ${plausStyle}`}
            >
              {assumption.plausibility}
            </span>
          )}
        </td>
        <td className="px-3 py-2.5 text-center text-gray-400 text-sm align-middle">
          {open ? "▴" : "▾"}
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={5} className="px-3 pb-4 pt-1">
            <div className="ml-9 text-[13px] leading-relaxed text-gray-600 font-body">
              {assumption.assessment}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AssumptionsTable({ assumptions }) {
  if (!assumptions?.length) return null;

  const unstated = assumptions.filter(
    (a) => a.stated_or_unstated === "Unstated"
  ).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide border-b-2 border-gray-200 font-body text-left w-9 sticky top-0 bg-white z-[1]">
              #
            </th>
            <th className="px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide border-b-2 border-gray-200 font-body text-left sticky top-0 bg-white z-[1]">
              Assumption
            </th>
            <th
              className="px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide border-b-2 border-gray-200 font-body text-center w-[60px] sticky top-0 bg-white z-[1]"
              title="Blue = stated explicitly. Amber = unstated/implicit."
            >
              Stated
            </th>
            <th className="px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide border-b-2 border-gray-200 font-body text-center w-[80px] sticky top-0 bg-white z-[1]">
              Plausible
            </th>
            <th className="px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide border-b-2 border-gray-200 w-[30px] sticky top-0 bg-white z-[1]" />
          </tr>
        </thead>
        <tbody>
          {assumptions.map((a, i) => (
            <AssumptionRow key={a.number} assumption={a} index={i} />
          ))}
        </tbody>
      </table>
      <div className="flex gap-4 px-4 py-2.5 border-t border-gray-100 text-[11px] text-gray-400 font-body">
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1 align-middle" />{" "}
          Stated
        </span>
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1 align-middle" />{" "}
          Unstated
        </span>
        <span>
          <span className="inline-block px-1 text-[9px] bg-red-100 text-red-800 rounded font-semibold mr-1 align-middle">
            KEY
          </span>{" "}
          Load-bearing
        </span>
      </div>
    </div>
  );
}
