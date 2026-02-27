export default function SeverityBar({ critical, moderate, minor }) {
  const total = critical + moderate + minor;
  if (total === 0) return null;
  const pct = (n) => ((n / total) * 100).toFixed(1);

  return (
    <div className="w-full">
      <div className="flex gap-4 mb-2 flex-wrap">
        <span className="text-[13px] text-gray-500 font-body">
          <strong className="text-red-600 text-xl font-display">{critical}</strong> Critical
        </span>
        <span className="text-[13px] text-gray-500 font-body">
          <strong className="text-amber-600 text-xl font-display">{moderate}</strong> Moderate
        </span>
        <span className="text-[13px] text-gray-500 font-body">
          <strong className="text-green-600 text-xl font-display">{minor}</strong> Minor
        </span>
      </div>
      <div className="flex h-2.5 rounded-md overflow-hidden bg-gray-100">
        <div
          className="bg-red-600 transition-[width] duration-600 ease-out"
          style={{ width: `${pct(critical)}%` }}
        />
        <div
          className="bg-amber-400 transition-[width] duration-600 ease-out"
          style={{ width: `${pct(moderate)}%` }}
        />
        <div
          className="bg-green-300 transition-[width] duration-600 ease-out"
          style={{ width: `${pct(minor)}%` }}
        />
      </div>
    </div>
  );
}
