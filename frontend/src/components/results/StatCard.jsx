export default function StatCard({ value, label, color }) {
  return (
    <div className="flex flex-col items-center px-4 py-3 bg-white rounded-lg border border-gray-200 min-w-[80px] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <span
        className="text-[28px] font-bold font-display leading-none"
        style={{ color }}
      >
        {value}
      </span>
      <span className="text-[11px] text-gray-500 mt-1 font-body uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}
